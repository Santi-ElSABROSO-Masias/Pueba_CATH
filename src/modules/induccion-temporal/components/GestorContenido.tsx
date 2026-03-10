import React, { useState, useEffect } from 'react';
import { ContenidoCurso } from '../types/induccion.types';
import { useInduccion } from '../hooks/useInduccion';
import { ContentUploader } from './ContentUploader';
import { useAuth } from '../../../../AuthContext';
// Icons needed (we can simulate or use basic SVG for now)

export const GestorContenido: React.FC = () => {
    const { isSuperSuperAdmin } = useAuth();
    const canEdit = isSuperSuperAdmin();
    const { listarContenido, reordenarContenido, eliminarContenido, loading, error } = useInduccion();
    const [contenidos, setContenidos] = useState<ContenidoCurso[]>([]);
    const [showUploader, setShowUploader] = useState(false);

    // Drag and drop state
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    useEffect(() => {
        fetchContenidos();
    }, []);

    const fetchContenidos = async () => {
        try {
            const data = await listarContenido();
            setContenidos(data.sort((a, b) => a.orden - b.orden));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        const items = [...contenidos];
        const draggedIndex = items.findIndex(item => item.id === draggedItemId);
        const targetIndex = items.findIndex(item => item.id === targetId);

        // Swap or insert
        const [draggedItem] = items.splice(draggedIndex, 1);
        items.splice(targetIndex, 0, draggedItem);

        // Update order values
        const newOrderedItems = items.map((item, index) => ({ ...item, orden: index }));
        setContenidos(newOrderedItems);
        setDraggedItemId(null);

        // Persist to backend
        try {
            const orderData = newOrderedItems.map(item => ({ id: item.id, orden: item.orden }));
            await reordenarContenido(orderData);
        } catch (err) {
            console.error('Failed to reorder', err);
            // fallback to original fetch if failed
            fetchContenidos();
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Está seguro de eliminar este contenido? Esta acción no se puede deshacer.')) return;

        try {
            await eliminarContenido(id);
            setContenidos(contenidos.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting content:', err);
            alert('Error al eliminar contenido');
        }
    };

    const handleToggleActivo = (id: string) => {
        if (!canEdit) return;
        // we mock the toggle functionality in local state since the endpoint is not explicitly requested,
        // but in real world we'd patch the specific item
        setContenidos(contenidos.map(c => c.id === id ? { ...c, activo: !c.activo } : c));
    };

    return (
        <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">Gestor de Contenido del Curso</h2>
                {canEdit && (
                    <button
                        onClick={() => setShowUploader(!showUploader)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                        {showUploader ? 'Cancelar' : 'Agregar Contenido'}
                    </button>
                )}
            </div>

            {canEdit && showUploader && (
                <div className="mb-8">
                    <ContentUploader
                        onUploadSuccess={(nuevoContenido) => {
                            setContenidos([...contenidos, nuevoContenido].sort((a, b) => a.orden - b.orden));
                            setShowUploader(false);
                        }}
                    />
                </div>
            )}

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading && !contenidos.length ? (
                <div className="text-slate-500 py-4">Cargando contenido...</div>
            ) : (
                <div className="space-y-3">
                    {contenidos.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-lg text-slate-500 border border-dashed border-slate-300">
                            No hay contenido disponible para el curso todavía.
                        </div>
                    ) : (
                        contenidos.map((item) => (
                            <div
                                key={item.id}
                                draggable={canEdit}
                                onDragStart={(e) => canEdit && handleDragStart(e, item.id)}
                                onDragOver={(e) => canEdit && handleDragOver(e)}
                                onDrop={(e) => canEdit && handleDrop(e, item.id)}
                                className={`flex items-center justify-between p-4 bg-white border ${draggedItemId === item.id ? 'border-indigo-500 opacity-50' : 'border-slate-200'} rounded-lg shadow-sm ${canEdit ? 'cursor-move hover:border-indigo-300' : ''} transition-colors`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded mr-3 uppercase">
                                            {item.tipo}
                                        </span>
                                        <span className="font-medium text-slate-700">{item.titulo}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`text-sm ${item.activo ? 'text-green-600' : 'text-slate-400'}`}>
                                        {item.activo ? 'Activo' : 'Oculto'}
                                    </span>

                                    {canEdit && (
                                        <>
                                            <button
                                                onClick={() => handleToggleActivo(item.id)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 transition"
                                                title={item.activo ? 'Ocultar' : 'Mostrar'}
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.activo ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"}></path></svg>
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 transition"
                                                title="Eliminar"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
