import ExcelJS from 'exceljs';
import { TrabajadorTemporal } from '../types/induccion.types';

export async function parseExcelTrabajadores(file: File): Promise<TrabajadorTemporal[]> {
    const buffer = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);
    const ws = wb.worksheets[0];
    const trabajadores: Partial<TrabajadorTemporal>[] = [];
    ws.eachRow((row, rowNum) => {
        if (rowNum === 1) return; // Skip header
        const [_, dni, nombre, apellido, empresa, email, celular] = row.values as any[];
        if (dni) trabajadores.push({
            dni: String(dni),
            nombre: String(nombre || ''),
            apellido: String(apellido || ''),
            empresa: empresa ? String(empresa) : undefined,
            email: email ? String(email) : undefined,
            celular: celular ? String(celular) : undefined
        });
    });
    return trabajadores as TrabajadorTemporal[];
}
