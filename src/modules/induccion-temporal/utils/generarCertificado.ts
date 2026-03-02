import { jsPDF } from 'jspdf';

export function generarCertificadoPDF(data: {
    nombre: string;
    apellido: string;
    dni: string;
    fechaAprobacion: string;
    codigoUnico: string;
}): Blob {
    const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
    // Fondo decorativo
    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 297, 30, 'F');
    doc.rect(0, 180, 297, 30, 'F');
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('CERTIFICADO DE INDUCCIÓN', 148.5, 18, { align: 'center' });
    // Nombre del trabajador
    doc.setTextColor(30, 58, 95);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.nombre} ${data.apellido}`, 148.5, 80, { align: 'center' });
    // Resto de campos...
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`DNI: ${data.dni}`, 148.5, 100, { align: 'center' });
    doc.text(`Módulo: Inducción para Trabajos Temporales`, 148.5, 112, { align: 'center' });
    doc.text(`Fecha: ${data.fechaAprobacion}`, 148.5, 124, { align: 'center' });
    doc.text(`Estado: APROBADO`, 148.5, 136, { align: 'center' });
    doc.text(`Código verificación: ${data.codigoUnico}`, 148.5, 148, { align: 'center' });
    return doc.output('blob');
}
