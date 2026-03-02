import React, { useState, useEffect } from 'react';
import { useInduccion } from '../hooks/useInduccion';

interface EvaluacionFinalProps {
    solicitudId: string;
    onAprobado: (evaluacionId: string) => void;
}

const PREGUNTAS_MOCK = [
    {
        id: 'p1',
        pregunta: '¿Cuál es el principal EPP requerido antes de ingresar a cualquier área operativa?',
        opciones: ['Zapatos de vestir', 'Casco, lentes y zapatos de seguridad', 'Gorra y guantes', 'Chaqueta de cuero'],
        correcta: 1
    },
    {
        id: 'p2',
        pregunta: '¿Qué significa LOTOTO?',
        opciones: [
            'Limpieza, Orden, Trabajo, Observación, Tiempo, Organización',
            'Bloqueo, Etiquetado y Prueba de Energía Cero',
            'Ley Ocupacional de Tiempos Operatorios',
            'Ninguna de las anteriores'
        ],
        correcta: 1
    },
    {
        id: 'p3',
        pregunta: 'En caso de emergencia o sismo, usted debe...',
        opciones: [
            'Correr rápidamente a la salida más cercana',
            'Esconderse debajo de la maquinaria',
            'Mantener la calma y dirigirse al punto de encuentro establecido',
            'Buscar sus pertenencias antes de salir'
        ],
        correcta: 2
    }
];

export const EvaluacionFinal: React.FC<EvaluacionFinalProps> = ({ solicitudId, onAprobado }) => {
    const { registrarEvaluacion, loading, error } = useInduccion();
    const [respuestas, setRespuestas] = useState<Record<string, number>>({});
    const [tiempoRestante, setTiempoRestante] = useState(15 * 60); // 15 mins
    const [enviado, setEnviado] = useState(false);
    const [puntuacionAviso, setPuntuacionAviso] = useState<{ puntaje: number, aprobado: boolean, evaluacionId: string } | null>(null);

    useEffect(() => {
        if (tiempoRestante <= 0 && !enviado) {
            handleSubmit();
            return;
        }
        if (enviado) return;

        const timer = setInterval(() => setTiempoRestante(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [tiempoRestante, enviado]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (preguntaId: string, opcionIndex: number) => {
        if (enviado) return;
        setRespuestas(prev => ({ ...prev, [preguntaId]: opcionIndex }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setEnviado(true);

        // Calculate score
        let correctas = 0;
        PREGUNTAS_MOCK.forEach(p => {
            if (respuestas[p.id] === p.correcta) correctas++;
        });

        const puntaje = (correctas / PREGUNTAS_MOCK.length) * 100;
        const aprobado = puntaje >= 75; // 75% mínimo

        try {
            // Evaluacion temporal request expected shape mock/real
            const res = await registrarEvaluacion({
                solicitudId,
                puntaje,
                aprobado,
                intentoNum: 1,
                respuestas: Object.keys(respuestas).reduce((acc: any, key) => { acc[key] = respuestas[key].toString(); return acc; }, {})
            });
            // Asumimos que el backend retorna el objeto `resultado` con .id 
            // Para el MVP y no bloquearnos enviaremos id local si el backend no lo devolvió aún
            const finalId = res?.id || 'ev-' + Math.random().toString(36).substring(2, 8);
            setPuntuacionAviso({ puntaje, aprobado, evaluacionId: finalId });
        } catch (err) {
            console.error('Error enviando examen', err);
            // Fallback MVP simulado si el backend falla local
            const finalId = 'ev-' + Math.random().toString(36).substring(2, 8);
            setPuntuacionAviso({ puntaje, aprobado, evaluacionId: finalId });
        }
    };

    const handleContinueToCert = () => {
        if (puntuacionAviso && puntuacionAviso.aprobado) {
            onAprobado(puntuacionAviso.evaluacionId);
        } else {
            // Reload or alert to try again based on requirements
            window.alert('No alcanzo el puntaje minimo. Contacte a SSOMA para un nuevo intento.');
            window.location.reload();
        }
    };

    if (puntuacionAviso) {
        return (
            <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl text-center border overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-2 ${puntuacionAviso.aprobado ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner ${puntuacionAviso.aprobado ? 'bg-green-100/50 text-green-500' : 'bg-red-100/50 text-red-500'}`}>
                    {puntuacionAviso.aprobado ? '🏆' : '⚠️'}
                </div>

                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    {puntuacionAviso.aprobado ? '¡Felicitaciones!' : 'Módulo No Aprobado'}
                </h2>
                <p className="text-slate-600 mb-6 text-lg">
                    Su puntaje es: <strong className={puntuacionAviso.aprobado ? 'text-green-600' : 'text-red-600'}>{puntuacionAviso.puntaje.toFixed(0)}%</strong>
                </p>

                <div className="bg-slate-50 border p-4 rounded-xl mb-8">
                    <p className="text-slate-700 font-medium">
                        {puntuacionAviso.aprobado
                            ? 'Usted ha aprobado satisfactoriamente la inducción de seguridad.'
                            : 'Lamentablemente no alcanzó el mínimo requerido del 75%. Debe solicitar un nuevo intento al supervisor de campo.'}
                    </p>
                </div>

                <button
                    onClick={handleContinueToCert}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 ${puntuacionAviso.aprobado ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' : 'bg-slate-800 hover:bg-slate-900 shadow-slate-800/30'}`}
                >
                    {puntuacionAviso.aprobado ? 'Descargar Mi Certificado' : 'Salir al Inicio'}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-8 shadow-sm rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-5 mb-6 sticky top-0 bg-white z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Evaluación de Inducción</h2>
                    <p className="text-slate-500 text-sm mt-1">Preguntas de opción múltiple.</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold font-mono tracking-widest bg-slate-100 text-slate-700 ${tiempoRestante < 60 ? 'bg-red-50 text-red-600 animate-pulse' : ''}`}>
                    ⏱ {formatTime(tiempoRestante)}
                </div>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    {PREGUNTAS_MOCK.map((q, qIndex) => (
                        <div key={q.id} className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                            <h3 className="font-semibold text-lg text-slate-800 mb-4">
                                <span className="text-indigo-600 mr-2">{qIndex + 1}.</span>
                                {q.pregunta}
                            </h3>
                            <div className="space-y-3 pl-6">
                                {q.opciones.map((opc, oIndex) => (
                                    <label key={oIndex} className={`flex items-start gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${respuestas[q.id] === oIndex ? 'bg-indigo-50 border-indigo-200 shadow-inner' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                        <div className={`mt-0.5 min-w-[20px] h-5 rounded-full border-2 flex items-center justify-center ${respuestas[q.id] === oIndex ? 'border-indigo-600' : 'border-slate-300'}`}>
                                            {respuestas[q.id] === oIndex && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                                        </div>
                                        <span className={`font-medium ${respuestas[q.id] === oIndex ? 'text-indigo-900' : 'text-slate-700'}`}>{opc}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-6 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || Object.keys(respuestas).length < PREGUNTAS_MOCK.length}
                        className="px-10 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Procesando...' : 'Finalizar Examen'}
                    </button>
                </div>
            </form>
        </div>
    );
};
