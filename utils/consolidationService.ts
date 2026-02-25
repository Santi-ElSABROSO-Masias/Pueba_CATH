
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { Training, EventUser, UserRole } from '../types';

export const generateOfficialDocument = async (training: Training, participants: EventUser[], userRole: UserRole) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Registro de Asistencia');

  // --- Definición de Columnas según Rol ---
  let columns = [
    { header: 'N°', key: 'index', width: 5 },
    { header: 'NOMBRES Y APELLIDOS', key: 'name', width: 35 },
    { header: 'EMPRESA', key: 'company', width: 20 },
    { header: 'ÁREA', key: 'area', width: 15 },
    { header: 'CARGO', key: 'role', width: 20 },
    { header: 'DNI', key: 'dni', width: 15 },
    { header: 'BREVETE', key: 'brevete', width: 15 },
  ];

  if (userRole === 'super_admin') {
    columns.push({ header: 'APROBADO', key: 'approved', width: 15 });
  } else if (userRole === 'super_super_admin') {
    columns.push(
      { header: 'FIRMA', key: 'signature', width: 15 },
      { header: 'EVAL.\nTEÓRICA', key: 'theory', width: 10 },
      { header: 'EVAL.\nPRÁCTICA', key: 'practice', width: 10 },
      { header: 'PROMEDIO\nFINAL', key: 'average', width: 12 },
      { header: 'ESTADO', key: 'status', width: 15 }
    );
  }

  // --- 1. Configuración de Columnas (Anchos fijos) ---
  // Mapeamos las columnas definidas a la hoja
  worksheet.columns = columns.map(c => ({ key: c.key, width: c.width }));

  // --- 2. Encabezado Corporativo (Filas 1-5) ---
  // Calculamos la última columna para el merge
  const lastColIndex = columns.length;
  const lastColLetter = worksheet.getColumn(lastColIndex).letter;
  
  // Logo: A1:B5 (siempre que haya al menos 2 columnas, que las hay)
  worksheet.mergeCells('A1:B5'); 
  const logoCell = worksheet.getCell('A1');
  logoCell.value = "LOGO EMPRESA"; 
  logoCell.alignment = { vertical: 'middle', horizontal: 'center' };
  logoCell.font = { bold: true, color: { argb: 'FF999999' } };
  logoCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  // Definir ancho de la sección de Info (Código/Versión)
  // Para super_super_admin (12 cols) usamos 3 columnas. Para otros (7-8 cols) usamos 2.
  const infoColWidth = userRole === 'super_super_admin' ? 3 : 2;
  const infoStartColIndex = lastColIndex - infoColWidth + 1;
  const infoStartColLetter = worksheet.getColumn(infoStartColIndex).letter;
  
  const titleEndColIndex = infoStartColIndex - 1;
  const titleEndColLetter = worksheet.getColumn(titleEndColIndex).letter;

  // Título del Documento
  worksheet.mergeCells(`C1:${titleEndColLetter}5`);
  const titleCell = worksheet.getCell('C1');
  // El título debe ser el nombre del módulo
  titleCell.value = training.title.toUpperCase();
  titleCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  titleCell.font = { name: 'Arial', size: 16, bold: true };
  titleCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  // Sección de Información (Código y Versión) - SIEMPRE VISIBLE
  worksheet.mergeCells(`${infoStartColLetter}1:${lastColLetter}2`); // Código
  const codeCell = worksheet.getCell(`${infoStartColLetter}1`);
  codeCell.value = "CÓDIGO: SIG-REG-001";
  codeCell.alignment = { vertical: 'middle', horizontal: 'center' };
  codeCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  worksheet.mergeCells(`${infoStartColLetter}3:${lastColLetter}5`); // Versión
  const verCell = worksheet.getCell(`${infoStartColLetter}3`);
  verCell.value = "VERSIÓN: 2.0";
  verCell.alignment = { vertical: 'middle', horizontal: 'center' };
  verCell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };

  // --- 3. Datos del Curso (Fila 6) ---
  // Ajustamos merges según columnas disponibles
  
  const row6 = worksheet.getRow(6);
  
  // CAPACITACIÓN
  worksheet.getCell('A6').value = "CAPACITACIÓN:";
  worksheet.getCell('A6').font = { bold: true };
  
  // Si hay pocas columnas, reducimos el merge
  const titleMerge = userRole === 'super_super_admin' ? 'B6:E6' : 'B6:C6';
  worksheet.mergeCells(titleMerge);
  worksheet.getCell('B6').value = training.title.toUpperCase();

  // FECHA
  const dateLabelCol = userRole === 'super_super_admin' ? 'F' : 'D';
  const dateValCol = userRole === 'super_super_admin' ? 'G' : 'E';
  worksheet.getCell(`${dateLabelCol}6`).value = "FECHA:";
  worksheet.getCell(`${dateLabelCol}6`).font = { bold: true };
  worksheet.getCell(`${dateValCol}6`).value = training.date;

  // INSTRUCTOR
  const instrLabelCol = userRole === 'super_super_admin' ? 'H' : 'F';
  const instrValStart = userRole === 'super_super_admin' ? 'I' : 'G';
  const instrValEnd = lastColLetter;
  
  worksheet.getCell(`${instrLabelCol}6`).value = "INSTRUCTOR:";
  worksheet.getCell(`${instrLabelCol}6`).font = { bold: true };
  worksheet.mergeCells(`${instrValStart}6:${instrValEnd}6`);
  worksheet.getCell(`${instrValStart}6`).value = (training.instructorName || "STAFF INTERNO").toUpperCase();

  // --- 4. Encabezados de Tabla (Fila 7) ---
  const headerRow = worksheet.getRow(7);
  headerRow.values = columns.map(c => c.header);
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
    
    // Mapeo de datos según columnas
    // Common columns
    row.getCell(1).value = index + 1;
    row.getCell(2).value = p.name.toUpperCase();
    row.getCell(3).value = p.organization.toUpperCase();
    row.getCell(4).value = p.area.toUpperCase();
    row.getCell(5).value = p.role.toUpperCase();
    row.getCell(6).value = p.dni;
    row.getCell(7).value = p.brevete || '-';

    if (userRole === 'super_admin') {
       // Columna H: Aprobado
       row.getCell(8).value = p.status === 'APROBADO' || p.status === 'LINK ENVIADO' ? 'SÍ' : 'NO';
    } else if (userRole === 'super_super_admin') {
       // Columna H: Firma (vacía)
       // Columna I: Teoría (vacía)
       // Columna J: Práctica (vacía)
       // Columna K: Promedio (Fórmula)
       row.getCell(11).value = { formula: `IF(COUNT(I${rowIdx}:J${rowIdx})=2, (I${rowIdx}+J${rowIdx})/2, "")` };
       // Columna L: Estado (Fórmula)
       row.getCell(12).value = { formula: `IF(K${rowIdx}="","",IF(K${rowIdx}>=14,"APROBADO","DESAPROBADO"))` };
    }

    // Estilos de Fila
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
      // Centrar N° y columnas de datos numéricos/cortos
      if (colNumber === 1 || colNumber >= 6) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  });

  // --- 7. Generar Archivo ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Handle default import behavior for FileSaver in browser ESM
  const saveAs = (FileSaver as any).saveAs || FileSaver;
  saveAs(blob, `${training.title.replace(/\s+/g, '_').toUpperCase()}.xlsx`);
  
  return true;
};
