import React, { useState, useRef } from 'react';
import { DocumentRecord } from '../../../../../types/auth';

interface DocumentUploaderProps {
    requiredDocs: string[]; // Ej. ['Licencia', 'Récord Conductor']
    documents: DocumentRecord[];
    onDocumentChange: (docs: DocumentRecord[]) => void;
    readOnly?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ requiredDocs, documents, onDocumentChange, readOnly = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeDocType, setActiveDocType] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeDocType) return;

        // TODO: En producción subiría a un S3 o similar. Aquí simulamos URL.
        const fakeUrl = URL.createObjectURL(file);

        const updatedDocs = [...documents];
        const docIndex = updatedDocs.findIndex(d => d.nombre === activeDocType);

        if (docIndex >= 0) {
            updatedDocs[docIndex] = { ...updatedDocs[docIndex], estado: 'CARGADO', archivoUrl: fakeUrl };
        } else {
            updatedDocs.push({
                id: `doc_${Date.now()}`,
                nombre: activeDocType,
                estado: 'CARGADO',
                archivoUrl: fakeUrl
            });
        }

        onDocumentChange(updatedDocs);
        setActiveDocType(null);
    };

    const triggerUpload = (docName: string) => {
        if (readOnly) return;
        setActiveDocType(docName);
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-file-alt text-indigo-500"></i> Documentación Requerida
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredDocs.map(docName => {
                    const currentDoc = documents.find(d => d.nombre === docName);
                    const isUploaded = currentDoc?.estado === 'CARGADO' || currentDoc?.estado === 'APROBADO';
                    const isRejected = currentDoc?.estado === 'RECHAZADO';

                    return (
                        <div key={docName} className={`p-4 rounded-xl border-2 transition-all ${isUploaded ? 'border-green-400 bg-green-50' :
                            isRejected ? 'border-red-400 bg-red-50' :
                                'border-dashed border-slate-300 hover:border-indigo-400 bg-white'
                            }`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-sm text-slate-700">{docName}</p>
                                    <p className="text-xs font-bold mt-1">
                                        {isUploaded ? <span className="text-green-600">✓ Cargado</span> :
                                            isRejected ? <span className="text-red-500">✗ Rechazado</span> :
                                                <span className="text-amber-500">Pendiente</span>}
                                    </p>
                                </div>
                                {isUploaded && currentDoc.archivoUrl && (
                                    <a href={currentDoc.archivoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm">
                                        <i className="fas fa-external-link-alt"></i>
                                    </a>
                                )}
                            </div>

                            {isRejected && currentDoc.comentario && (
                                <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                                    <strong>Observación:</strong> {currentDoc.comentario}
                                </div>
                            )}

                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => triggerUpload(docName)}
                                    className={`mt-4 w-full py-2 text-xs font-bold rounded-lg border ${isUploaded ? 'border-slate-300 text-slate-600 hover:bg-slate-100' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                        }`}
                                >
                                    {isUploaded ? 'Reemplazar Archivo' : 'Cargar Archivo'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        </div>
    );
};
