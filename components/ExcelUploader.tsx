
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Training, EventUser, UserStatus } from '../types';

interface ExcelUploaderProps {
    training: Training;
    existingUsers: EventUser[];
    onImport: (users: Partial<EventUser>[]) => void;
    onClose: () => void;
}

interface ValidationStats {
    totalRows: number;
    validRows: number;
    duplicatesInFile: number;
    duplicatesInDb: number;
    capacityIssue: boolean;
    missingColumns: string[];
}

// Diccionario de equivalencias para mapeo flexible
const HEADER_MAPPINGS: Record<string, string[]> = {
    name: ['nombres y apellidos', 'nombre completo', 'apellidos y nombres', 'nombre', 'nombres', 'participante'],
    dni: ['dni', 'documento', 'nro dni', 'n dni', 'numero dni', 'id', 'identificacion'],
    email: ['email', 'correo', 'correo electronico', 'e-mail'],
    phone: ['telefono', 'celular', 'phone', 'movil', 'nro telefono', 'numero'],
    organization: ['empresa', 'compania', 'razon social', 'organizacion', 'cliente'],
    area: ['area', 'departamento', 'gerencia', 'unidad', 'seccion'],
    role: ['cargo', 'puesto', 'posicion', 'rol', 'funcion'],
    brevete: ['brevete', 'licencia', 'nro brevete', 'licencia conducir']
};

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ training, existingUsers, onImport, onClose }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [stats, setStats] = useState<ValidationStats | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        // Definimos las columnas exactas que la herramienta espera (incluyendo Brevete opcional)
        const templateHeaders = [
            'NOMBRES Y APELLIDOS', 'DNI', 'EMAIL', 'TELEFONO', 'EMPRESA', 'AREA', 'CARGO', 'BREVETE'
        ];

        // Creamos una hoja vacía solo con los encabezados
        const ws = XLSX.utils.aoa_to_sheet([templateHeaders]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Plantilla_Trabajadores");

        // Ajustar el ancho de las columnas para mejor legibilidad
        ws['!cols'] = [
            { wch: 30 }, // Nombres
            { wch: 15 }, // DNI
            { wch: 30 }, // Email
            { wch: 15 }, // Telefono
            { wch: 25 }, // Empresa
            { wch: 20 }, // Area
            { wch: 20 }, // Cargo
            { wch: 15 }, // Brevete
        ];

        XLSX.writeFile(wb, "Plantilla_Importacion_Trabajadores.xlsx");
    };

    const normalizeHeader = (header: string): string => {
        return header
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
            .trim();
    };

    const detectColumns = (headers: string[]) => {
        const map: Record<string, string> = {};
        const missing: string[] = [];

        // Buscar correspondencia para cada campo requerido
        Object.keys(HEADER_MAPPINGS).forEach(fieldKey => {
            const possibleNames = HEADER_MAPPINGS[fieldKey];
            // Buscar si alguno de los posibles nombres existe en los headers normalizados
            const foundHeader = headers.find(h => possibleNames.includes(normalizeHeader(h)));

            if (foundHeader) {
                map[fieldKey] = foundHeader;
            } else if (fieldKey !== 'brevete') { // Brevete es opcional
                missing.push(fieldKey);
            }
        });

        return { map, missing };
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsProcessing(true);
        setErrorMsg(null);
        setStats(null);
        setPreviewData([]);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Array de arrays

                if (data.length < 2) {
                    throw new Error("El archivo parece estar vacío o no tiene encabezados.");
                }

                if (data.length > 201) { // 1 header + 200 rows
                    throw new Error("Por seguridad, el máximo de filas permitidas por archivo es 200.");
                }

                const headers = (data[0] as string[]).map(h => String(h).trim());
                const rows = data.slice(1) as any[][];

                // 1. Detectar Columnas
                const { map, missing } = detectColumns(headers);

                if (missing.length > 0) {
                    throw new Error(`Faltan columnas obligatorias: ${missing.join(', ').toUpperCase()}. Por favor revise su Excel.`);
                }

                // 2. Mapear Datos
                const mappedRows: any[] = [];
                const dniSet = new Set<string>();
                let dupsInFile = 0;
                let dupsInDb = 0;

                const headerIndices: Record<string, number> = {};
                Object.keys(map).forEach(key => {
                    headerIndices[key] = headers.indexOf(map[key]);
                });

                rows.forEach((row, index) => {
                    // Ignorar filas vacías
                    if (row.length === 0) return;

                    const dniRaw = row[headerIndices['dni']];
                    if (!dniRaw) return; // Saltar si no hay DNI

                    const dni = String(dniRaw).replace(/\D/g, '').trim(); // Limpiar DNI

                    // Validar unicidad en archivo
                    if (dniSet.has(dni)) {
                        dupsInFile++;
                        return;
                    }
                    dniSet.add(dni);

                    // Validar existencia en DB
                    const exists = existingUsers.some(u => u.dni === dni && u.trainingId === training.id);
                    if (exists) {
                        dupsInDb++;
                        // Decidimos si lo agregamos o no. Para MVP, marcamos como warning pero permitimos ver en preview?
                        // Mejor NO agregar duplicados de DB para evitar ensuciar
                        return;
                    }

                    // Validar Email
                    const emailRaw = row[headerIndices['email']];
                    if (!emailRaw) {
                        throw new Error(`Fila ${index + 2}: El correo electrónico es obligatorio.`);
                    }

                    const email = String(emailRaw).trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        throw new Error(`Fila ${index + 2}: Email inválido (${email})`);
                    }

                    // Validar Teléfono
                    const phoneRaw = row[headerIndices['phone']];
                    if (!phoneRaw) {
                        throw new Error(`Fila ${index + 2}: El teléfono es obligatorio.`);
                    }
                    const phone = String(phoneRaw).trim();
                    if (phone.length < 9) {
                        throw new Error(`Fila ${index + 2}: El teléfono debe tener al menos 9 dígitos.`);
                    }
                    // Validación específica celular peruano (9 dígitos)
                    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
                    const peruMobileRegex = /^9\d{8}$/;
                    if (cleanPhone.length === 9 && !peruMobileRegex.test(cleanPhone)) {
                        // Warning o Error? Asumimos Error para consistencia con formulario individual
                        throw new Error(`Fila ${index + 2}: Celular peruano debe comenzar con 9 (${phone})`);
                    }

                    mappedRows.push({
                        name: row[headerIndices['name']],
                        dni: dni,
                        email: email,
                        phone: phone,
                        organization: row[headerIndices['organization']],
                        area: row[headerIndices['area']],
                        role: row[headerIndices['role']],
                        brevete: headerIndices['brevete'] !== undefined ? row[headerIndices['brevete']] : undefined
                    });
                });

                // 3. Validar Aforo
                const availableSeats = training.maxCapacity - existingUsers.length;
                const capacityIssue = mappedRows.length > availableSeats;

                setStats({
                    totalRows: rows.length,
                    validRows: mappedRows.length,
                    duplicatesInFile: dupsInFile,
                    duplicatesInDb: dupsInDb,
                    capacityIssue: capacityIssue,
                    missingColumns: missing
                });

                setPreviewData(mappedRows);

            } catch (err: any) {
                setErrorMsg(err.message || "Error al procesar el archivo.");
            } finally {
                setIsProcessing(false);
            }
        };
        reader.readAsBinaryString(selectedFile);
    };

    const handleConfirm = () => {
        if (!stats || stats.capacityIssue) return;
        onImport(previewData);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            <i className="fas fa-file-excel text-emerald-600"></i>
                            Importación Masiva
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Carga participantes para: <span className="text-catalina-green font-bold">{training.title}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-grow">

                    {!file ? (
                        <>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center cursor-pointer hover:border-catalina-green hover:bg-catalina-green/5 transition-all group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".xlsx, .xls, .csv"
                                    className="hidden"
                                />
                                <div className="w-16 h-16 bg-catalina-green/10 text-catalina-green rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <i className="fas fa-cloud-upload-alt text-3xl"></i>
                                </div>
                                <h3 className="font-bold text-slate-700">Haz clic o arrastra tu Excel aquí</h3>
                                <p className="text-sm text-slate-400 mt-2">Soporta .xlsx, .xls y .csv (Máx 200 filas)</p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    {['Nombres', 'DNI', 'Email', 'Empresa', 'Area', 'Cargo'].map(col => (
                                        <span key={col} className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                                            {col}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {/* Botón Descargar Plantilla movido fuera del contenedor de dropzone para evitar conflictos de clic */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownloadTemplate();
                                    }}
                                    className="inline-flex items-center gap-2 text-sm font-bold text-catalina-green hover:text-catalina-forest-green hover:underline bg-catalina-green/10 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <i className="fas fa-file-download"></i>
                                    Descargar Plantilla de Excel Modelo
                                </button>
                                <p className="text-[10px] text-slate-400 mt-1">Descarga el archivo modelo con los encabezados correctos para llenarlo.</p>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            {stats && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Total Filas</p>
                                        <p className="text-2xl font-black text-slate-800">{stats.totalRows}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <p className="text-[10px] uppercase font-bold text-emerald-600">Válidos</p>
                                        <p className="text-2xl font-black text-emerald-700">{stats.validRows}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${stats.duplicatesInDb > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200'}`}>
                                        <p className={`text-[10px] uppercase font-bold ${stats.duplicatesInDb > 0 ? 'text-amber-600' : 'text-slate-400'}`}>Duplicados (Omitidos)</p>
                                        <p className={`text-2xl font-black ${stats.duplicatesInDb > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                                            {stats.duplicatesInDb + stats.duplicatesInFile}
                                        </p>
                                    </div>
                                    <div className={`p-4 rounded-xl border ${stats.capacityIssue ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <p className={`text-[10px] uppercase font-bold ${stats.capacityIssue ? 'text-red-600' : 'text-blue-600'}`}>Estado Aforo</p>
                                        <p className={`text-lg font-bold ${stats.capacityIssue ? 'text-red-700' : 'text-blue-700'} leading-tight`}>
                                            {stats.capacityIssue ? 'EXCEDIDO' : 'OK'}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">Libres: {training.maxCapacity - existingUsers.length}</p>
                                    </div>
                                </div>
                            )}

                            {errorMsg && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                    <i className="fas fa-exclamation-circle text-xl"></i>
                                    <div>
                                        <p className="font-bold text-sm">Error de Validación</p>
                                        <p className="text-xs">{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            {stats?.capacityIssue && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                                    <i className="fas fa-hand-paper text-xl"></i>
                                    <div>
                                        <p className="font-bold text-sm">Aforo Insuficiente</p>
                                        <p className="text-xs">Estás intentando cargar {stats.validRows} personas, pero solo quedan {training.maxCapacity - existingUsers.length} cupos disponibles.</p>
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            {previewData.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-bold text-slate-700">Vista Previa (Primeros 10 registros)</h3>
                                        <span className="text-[10px] text-slate-400 italic">Verifica que las columnas coincidan correctamente</span>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 font-bold text-slate-500 border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3">DNI</th>
                                                    <th className="p-3">Nombre</th>
                                                    <th className="p-3">Email</th>
                                                    <th className="p-3">Teléfono</th>
                                                    <th className="p-3">Empresa</th>
                                                    <th className="p-3">Cargo</th>
                                                    <th className="p-3">Brevete</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {previewData.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="hover:bg-slate-50">
                                                        <td className="p-3 font-mono text-slate-600">{row.dni}</td>
                                                        <td className="p-3 font-bold text-slate-800">{row.name}</td>
                                                        <td className="p-3 text-slate-600 text-xs">{row.email}</td>
                                                        <td className="p-3 text-slate-600 text-xs">{row.phone}</td>
                                                        <td className="p-3 text-slate-600">{row.organization}</td>
                                                        <td className="p-3 text-slate-600">{row.role}</td>
                                                        <td className="p-3 text-slate-500 italic">{row.brevete || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {previewData.length > 10 && (
                                        <p className="text-center text-xs text-slate-400 mt-2">... y {previewData.length - 10} filas más</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={file ? () => setFile(null) : onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                    >
                        {file ? 'Cambiar Archivo' : 'Cancelar'}
                    </button>
                    {file && !errorMsg && !stats?.capacityIssue && stats && stats.validRows > 0 && (
                        <button
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all"
                        >
                            {isProcessing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-import"></i>}
                            Confirmar Importación ({stats.validRows})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
