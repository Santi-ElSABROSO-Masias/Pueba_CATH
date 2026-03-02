import React, { useState } from 'react';
import { RegistroTrabajadorForm } from './RegistroTrabajadorForm';
import { CargaMasivaExcel } from './CargaMasivaExcel';
import { AprobacionPanel } from './AprobacionPanel';
import { GestorContenido } from './GestorContenido';

type DashboardTab = 'trabajadores' | 'solicitudes' | 'contenido' | 'reportes';

export const InduccionDashboard: React.FC = () => {
    // Auth role check is handled by the parent App component before rendering this
    const [activeTab, setActiveTab] = useState<DashboardTab>('trabajadores');

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Módulo de Inducción Temporal</h1>
                <p className="text-slate-500 mt-2">Gestión y control de contratistas temporales (menor a 30 días)</p>
            </div>

            <div className="border-b border-slate-200 mb-8">
                <nav className="flex space-x-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('trabajadores')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'trabajadores' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            Registro de Trabajadores
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('solicitudes')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'solicitudes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Aprobaciones (Seguridad)
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('contenido')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'contenido' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            Gestor de Contenido
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('reportes')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'reportes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            Reportes
                        </div>
                    </button>
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'trabajadores' && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <RegistroTrabajadorForm />
                        <CargaMasivaExcel />
                    </div>
                )}

                {activeTab === 'solicitudes' && (
                    <AprobacionPanel />
                )}

                {activeTab === 'contenido' && (
                    <GestorContenido />
                )}

                {activeTab === 'reportes' && (
                    <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <h3 className="text-lg font-bold text-slate-700">Reportes en construcción</h3>
                        <p className="text-slate-500 mt-2">Las exportaciones consolidadas para el módulo de inducción rápida estarán disponibles en la fase 2.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
