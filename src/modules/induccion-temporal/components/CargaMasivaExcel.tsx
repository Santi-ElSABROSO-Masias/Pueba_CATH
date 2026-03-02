import React, { useRef, useState } from 'react';
import { parseExcelTrabajadores } from '../utils/parseExcelTrabajadores';
import { useInduccion } from '../hooks/useInduccion';
import { TrabajadorTemporal } from '../types/induccion.types';

export const CargaMasivaExcel: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { registrarMasivo, loading, error } = useInduccion();
    const [previewData, setPreviewData] = useState<TrabajadorTemporal[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await parseExcelTrabajadores(file);
            setPreviewData(data);
            setSuccessMessage(null);
        } catch (err) {
            console.error('Error parsing excel', err);
            alert('Error al leer el archivo Excel. Verifique el formato.');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!previewData.length) return;
        try {
            await registrarMasivo(previewData);
            setSuccessMessage(`Se registraron exitosamente ${previewData.length} trabajadores.`);
            setPreviewData([]);
        } catch (err) {
            console.error('Error upload masivo', err);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFFN°,DNI,Nombre,Apellido,Empresa,Email,Celular\n1,12345678,Juan,Perez,TechFlow S.A.,juan@gmail.com,+51999888777";
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Plantilla_Carga_Masiva_Temporales.csv`); // Assuming easy import with CSV/ExcelJS compatibility
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Carga Masiva (Excel)</h2>
                <button
                    onClick={downloadTemplate}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Descargar Plantilla
                </button>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
            {successMessage && <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">{successMessage}</div>}

            {!previewData.length ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center">
                    <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <div className="text-slate-500 mb-4">
                        <p className="mb-1 text-lg">Seleccione un archivo Excel para cargar la data</p>
                        <p className="text-sm">El archivo debe contener DNI, Nombre, Apellido, Empresa, Email (opc) y Celular (opc)</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium shadow-sm"
                    >
                        Seleccionar Archivo
                    </button>
                </div>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm text-slate-600 font-medium">Trabajadores detectados: {previewData.length}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPreviewData([])}
                                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Registro Masivo'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">DNI</th>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Apellido</th>
                                    <th className="px-4 py-3">Empresa</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Celular</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((t, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                        <td className="px-4 py-2">{t.dni}</td>
                                        <td className="px-4 py-2">{t.nombre}</td>
                                        <td className="px-4 py-2">{t.apellido}</td>
                                        <td className="px-4 py-2">{t.empresa}</td>
                                        <td className="px-4 py-2">{t.email || '-'}</td>
                                        <td className="px-4 py-2">{t.celular || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
