import React, { useState, useRef } from 'react';
import { TipoContenido, ContenidoCurso } from '../types/induccion.types';

interface ContentUploaderProps {
    onUploadSuccess: (contenido: ContenidoCurso) => void;
}

export const ContentUploader: React.FC<ContentUploaderProps> = ({ onUploadSuccess }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<TipoContenido>('video');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        setError(null);
        let maxSize = 500 * 1024 * 1024; // 500MB video default

        if (tipo === 'audio') maxSize = 100 * 1024 * 1024;
        if (tipo === 'pdf') maxSize = 50 * 1024 * 1024;

        if (tipo !== 'texto' && selectedFile.size > maxSize) {
            setError(`El archivo excede el tamaño máximo permitido para ${tipo}.`);
            setFile(null);
            return;
        }

        if (tipo === 'video' && !selectedFile.type.startsWith('video/')) {
            setError('El archivo seleccionado no es un video válido (.mp4, .webm).');
            return;
        }
        if (tipo === 'audio' && !selectedFile.type.startsWith('audio/')) {
            setError('El archivo seleccionado no es un audio válido (.mp3, .wav).');
            return;
        }
        if (tipo === 'pdf' && selectedFile.type !== 'application/pdf') {
            setError('El archivo seleccionado no es un PDF.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = () => {
        if ((!file && tipo !== 'texto') || !titulo) {
            setError('Por favor completa todos los campos requeridos.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('titulo', titulo);
        formData.append('tipo', tipo);
        if (file && tipo !== 'texto') {
            formData.append('file', file);
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/induccion/content/upload');

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                setUploadProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 201) {
                const response: ContenidoCurso = JSON.parse(xhr.responseText);
                onUploadSuccess(response);
                setFile(null);
                setTitulo('');
                setUploadProgress(0);
            } else {
                try {
                    const err = JSON.parse(xhr.responseText);
                    setError(err.message || 'Error al subir el archivo.');
                } catch {
                    setError('Error de servidor al subir el archivo.');
                }
            }
            setIsUploading(false);
        };

        xhr.onerror = () => {
            setError('Error de red al intentar subir el archivo.');
            setIsUploading(false);
        };

        xhr.send(formData);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Subir Nuevo Contenido</h3>

            {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ej: Video Introductorio"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        disabled={isUploading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Contenido</label>
                    <select
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={tipo}
                        onChange={(e) => {
                            setTipo(e.target.value as TipoContenido);
                            setFile(null); // Reset file if type changes
                        }}
                        disabled={isUploading}
                    >
                        <option value="video">Video (.mp4, .webm)</option>
                        <option value="audio">Audio (.mp3, .wav)</option>
                        <option value="pdf">Documento PDF</option>
                        {/* <option value="texto">Texto (Solo Título)</option> */}
                    </select>
                </div>
            </div>

            {tipo !== 'texto' && (
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:bg-slate-50'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={tipo === 'video' ? 'video/mp4,video/webm' : tipo === 'audio' ? 'audio/mpeg,audio/wav' : 'application/pdf'}
                        disabled={isUploading}
                    />

                    {file ? (
                        <div>
                            <div className="text-indigo-600 font-medium mb-1">{file.name}</div>
                            <div className="text-slate-500 text-sm">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                        </div>
                    ) : (
                        <div className="text-slate-500">
                            <p className="mb-2">Arrastra el archivo aquí o haz clic para seleccionar</p>
                            <p className="text-sm">
                                {tipo === 'video' ? 'Máximo 500MB' : tipo === 'audio' ? 'Máximo 100MB' : 'Máximo 50MB'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {isUploading && (
                <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1 text-slate-600">
                        <span>Subiendo...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    onClick={handleUpload}
                    disabled={isUploading || (!file && tipo !== 'texto') || !titulo}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                    {isUploading ? 'Subiendo...' : 'Subir Contenido'}
                </button>
            </div>
        </div>
    );
};
