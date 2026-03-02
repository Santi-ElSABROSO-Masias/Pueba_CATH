import React, { useState, useEffect } from 'react';
import { useInduccion } from '../hooks/useInduccion';
import { ContenidoCurso } from '../types/induccion.types';

interface CursoViewerProps {
    onCursoCompletado: () => void;
}

export const CursoViewer: React.FC<CursoViewerProps> = ({ onCursoCompletado }) => {
    const { listarContenido, loading, error } = useInduccion();
    const [contenidos, setContenidos] = useState<ContenidoCurso[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchContenidos();
    }, []);

    const fetchContenidos = async () => {
        try {
            const data = await listarContenido();
            // Solo activos, ordenados por orden numérico
            const activos = data.filter(c => c.activo).sort((a, b) => a.orden - b.orden);
            setContenidos(activos);
        } catch (err) {
            console.error('Error cargando contenidos:', err);
        }
    };

    const handleSiguiente = () => {
        if (currentIndex < contenidos.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onCursoCompletado();
        }
    };

    if (loading) return <div className="text-center py-20 text-indigo-600 font-medium animate-pulse">Cargando material del curso...</div>;
    if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
    if (contenidos.length === 0) return <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-xl mt-6">Este curso aún no tiene contenido asignado.</div>;

    const actual = contenidos[currentIndex];
    const isUltimo = currentIndex === contenidos.length - 1;

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-white p-6 md:p-10 shadow-lg shadow-slate-200/50 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{actual.titulo}</h2>
                    <p className="text-slate-500 text-sm mt-1">Módulo {currentIndex + 1} de {contenidos.length}</p>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full uppercase tracking-wider">
                    {actual.tipo}
                </div>
            </div>

            <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                {actual.tipo === 'video' && (
                    <video
                        src={actual.urlStorage}
                        controls
                        controlsList="nodownload"
                        className="w-full h-full object-contain"
                    // onEnded={handleSiguiente} // Opcional auto-next
                    >
                        Su navegador no soporta el formato de video.
                    </video>
                )}
                {actual.tipo === 'audio' && (
                    <div className="w-full px-10 h-full flex flex-col justify-center bg-slate-800">
                        <audio
                            src={actual.urlStorage}
                            controls
                            controlsList="nodownload"
                            className="w-full mt-4"
                        />
                    </div>
                )}
                {actual.tipo === 'pdf' && (
                    <iframe
                        src={`${actual.urlStorage}#toolbar=0`}
                        className="w-full h-full bg-slate-100"
                        title={actual.titulo}
                    ></iframe>
                )}
                {actual.tipo === 'texto' && (
                    <div className="bg-white w-full h-full p-10 overflow-auto text-slate-700 font-medium">
                        {/* El texto va directo en el titulo para MVP, o podríamos extender el backend para tener body. Asumiremos por título */}
                        <h3 className="text-xl mb-4 text-slate-900">{actual.titulo}</h3>
                        <p>Por favor revise las indicaciones adjuntas provistas por su supervisor de campo para este ítem.</p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <div>
                    <div className="flex gap-1.5">
                        {contenidos.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-indigo-600' : idx < currentIndex ? 'w-4 bg-indigo-200' : 'w-2 bg-slate-200'}`}
                            />
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleSiguiente}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow shadow-indigo-200"
                >
                    {isUltimo ? 'Ir al Examen Final' : 'Siguiente Tema'}
                </button>
            </div>
        </div>
    );
};
