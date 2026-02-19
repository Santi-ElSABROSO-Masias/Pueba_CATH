
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { Training, EventUser } from '../types';

export const generateOfficialDocument = async (training: Training, participants: EventUser[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Registro de Asistencia');

  // --- 1. Configuración de Columnas (Anchos fijos) ---
  worksheet.columns = [
    { key: 'A', width: 5 },  // N°
    { key: 'B', width: 35 }, // NOMBRES
    { key: 'C', width: 20 }, // EMPRESA
    { key: 'D', width: 15 }, // AREA
    { key: 'E', width: 20 }, // CARGO
    { key: 'F', width: 15 }, // DNI
    { key: 'G', width: 15 }, // BREVETE
    { key: 'H', width: 15 }, // FIRMA
    { key: 'I', width: 10 }, // TEORIA
    { key: 'J', width: 10 }, // PRACTICA
    { key: 'K', width: 12 }, // PROMEDIO
    { key: 'L', width: 15 }, // ESTADO
  ];

  // --- 2. Encabezado Corporativo (Filas 1-5) ---
  // Simulamos un encabezado combinando celdas
  worksheet.mergeCells('A1:B5'); // Espacio para Logo
  const logoCell = worksheet.getCell('A1');
  logoCell.value = "LOGO EMPRESA"; 
  logoCell.alignment = { vertical: 'middle', horizontal: 'center' };
  logoCell.font = { bold: true, color: { argb: 'FF999999' } };
  logoCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  worksheet.mergeCells('C1:I5'); // Título del Documento
  const titleCell = worksheet.getCell('C1');
  titleCell.value = "REGISTRO OFICIAL DE ASISTENCIA Y EVALUACIÓN";
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  titleCell.font = { name: 'Arial', size: 16, bold: true };
  titleCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  worksheet.mergeCells('J1:L2'); // Código
  worksheet.getCell('J1').value = "CÓDIGO: SIG-REG-001";
  worksheet.getCell('J1').alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getCell('J1').border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  worksheet.mergeCells('J3:L5'); // Versión
  worksheet.getCell('J3').value = "VERSIÓN: 2.0";
  worksheet.getCell('J3').alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getCell('J3').border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };


  // --- 3. Datos del Curso (Fila 6) ---
  const headerFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };
  
  worksheet.getCell('A6').value = "CAPACITACIÓN:";
  worksheet.getCell('A6').font = { bold: true };
  worksheet.mergeCells('B6:E6');
  worksheet.getCell('B6').value = training.title.toUpperCase();

  worksheet.getCell('F6').value = "FECHA:";
  worksheet.getCell('F6').font = { bold: true };
  worksheet.getCell('G6').value = training.date;

  worksheet.getCell('H6').value = "INSTRUCTOR:";
  worksheet.getCell('H6').font = { bold: true };
  worksheet.mergeCells('I6:L6');
  worksheet.getCell('I6').value = (training.instructorName || "STAFF INTERNO").toUpperCase();

  // --- 4. Encabezados de Tabla (Fila 7) ---
  const headers = [
    'N°', 'NOMBRES Y APELLIDOS', 'EMPRESA', 'ÁREA', 'CARGO', 
    'DNI', 'BREVETE', 'FIRMA', 'EVAL.\nTEÓRICA', 'EVAL.\nPRÁCTICA', 
    'PROMEDIO\nFINAL', 'ESTADO'
  ];

  const headerRow = worksheet.getRow(7);
  headerRow.values = headers;
  headerRow.height = 30;
  
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF333333' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
  });

  // --- 5. Inserción de Participantes (Fila 8+) ---
  participants.forEach((p, index) => {
    const rowIdx = 8 + index;
    const row = worksheet.getRow(rowIdx);
    
    row.getCell(1).value = index + 1;
    row.getCell(2).value = p.name.toUpperCase();
    row.getCell(3).value = p.organization.toUpperCase();
    row.getCell(4).value = p.area.toUpperCase();
    row.getCell(5).value = p.role.toUpperCase();
    row.getCell(6).value = p.dni;
    row.getCell(7).value = p.brevete || '-';
    // H (Firma) queda vacía
    // I, J (Notas) quedan vacías para llenado manual
    
    // Fórmulas
    // K = Promedio (I+J)/2
    row.getCell(11).value = { formula: `IF(COUNT(I${rowIdx}:J${rowIdx})=2, (I${rowIdx}+J${rowIdx})/2, "")` };
    
    // L = Estado
    row.getCell(12).value = { formula: `IF(K${rowIdx}="","",IF(K${rowIdx}>=14,"APROBADO","DESAPROBADO"))` };

    // Estilos de Fila
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      if (colNumber === 1 || colNumber >= 9) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  // --- 7. Generar Archivo ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Handle default import behavior for FileSaver in browser ESM
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `REGISTRO_OFICIAL_${training.title.replace(/\s+/g, '_').toUpperCase()}.xlsx`);
  
  return true;
};
