import React, { useState } from 'react';

interface ApprovalPanelProps {
    onApprove: () => void;
    onReject: (comentario: string) => void;
    title?: string;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({ onApprove, onReject, title = "Validación de Solicitud" }) => {
    const [rejecting, setRejecting] = useState(false);
    const [comentario, setComentario] = useState("");

    const handleReject = () => {
        if (comentario.trim().length === 0) {
            alert("Debes ingresar un motivo de rechazo");
            return;
        }
        onReject(comentario);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-check-double text-indigo-500"></i> {title}
            </h3>

            {!rejecting ? (
                <div className="flex gap-4">
                    <button
                        onClick={() => onApprove()}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-check"></i> Aprobar Conforme
                    </button>

                    <button
                        onClick={() => setRejecting(true)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-times"></i> Rechazar/Observar
                    </button>
                </div>
            ) : (
                <div className="animate-fadeIn p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="font-semibold text-red-800 text-sm mb-2">Motivo de la Observación (Obligatorio)</p>
                    <textarea
                        className="w-full p-3 rounded-lg border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white min-h-[100px] text-sm"
                        placeholder="Ej. La póliza SOAT adjunta está vencida, por favor corregir."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                    ></textarea>

                    <div className="flex justify-end gap-3 mt-3">
                        <button
                            onClick={() => { setRejecting(false); setComentario(""); }}
                            className="px-4 py-2 font-semibold text-slate-500 hover:bg-slate-200 rounded-lg text-sm transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleReject}
                            className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors shadow-md shadow-red-500/20"
                        >
                            Confirmar Rechazo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
