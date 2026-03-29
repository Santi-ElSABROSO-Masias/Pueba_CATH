import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { EventUser } from '../../../../types';

type UserWithTraining = EventUser & { training_name: string };

type FormErrors = {
  dni_photo?: string;
  selfie_photo?: string;
  general?: string;
};

export function IdentityValidationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserWithTraining | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [dniPhotoFile, setDniPhotoFile] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [dniPhotoPreview, setDniPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    setToken(tokenFromUrl);

    async function loadUserDataByToken() {
      if (!tokenFromUrl) {
        setErrors({ general: "Link inválido o expirado" });
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient.get(`/validation/${tokenFromUrl}`);
        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          setErrors({ general: "Link inválido o expirado" });
        }
      } catch (err: any) {
        setErrors({ general: err.response?.data?.message || "Error al cargar tus datos." });
      } finally {
        setLoading(false);
      }
    }

    loadUserDataByToken();
  }, []);

  const handleDniPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
          setErrors(prev => ({ ...prev, dni_photo: 'Solo se permiten imágenes JPG, PNG o WEBP' }));
          e.target.value = '';
          setDniPhotoPreview(null);
          setDniPhotoFile(null);
          return;
      }

      if (file.size < 100 * 1024) {
          setErrors(prev => ({ ...prev, dni_photo: 'La imagen es muy pequeña. Sube una foto clara de tu DNI (mín. 100KB)' }));
          e.target.value = '';
          setDniPhotoPreview(null);
          setDniPhotoFile(null);
          return;
      }

      if (file.size > 10 * 1024 * 1024) {
          setErrors(prev => ({ ...prev, dni_photo: 'La imagen es muy grande. Máximo 10MB' }));
          e.target.value = '';
          setDniPhotoPreview(null);
          setDniPhotoFile(null);
          return;
      }

      setErrors(prev => ({ ...prev, dni_photo: '' }));
      setDniPhotoFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
          setDniPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    if (!dniPhotoFile || !selfiePhoto || !user) {
      alert("Debes subir ambas fotos");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('dniPhoto', dniPhotoFile);
      formData.append('selfiePhoto', selfiePhoto);

      const response = await apiClient.post(`/validation/${token}/upload-dni`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess("¡Validación y documentación enviada exitosamente! Tu solicitud será revisada.");
      }
    } catch (err: any) {
        const errorData = err.response?.data;
        if (errorData?.field === 'dni_photo') {
            setErrors(prev => ({ ...prev, dni_photo: errorData.message }));
        } else {
            setErrors(prev => ({...prev, general: errorData?.message || 'Error al enviar la validación' }));
        }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center p-10">Cargando...</div>;
  if (errors.general) return <div className="text-center p-10 text-red-600">{errors.general}</div>;
  if (success) return <div className="text-center p-10 text-emerald-600">{success}</div>;
  if (!user) return <div className="text-center p-10">No se encontraron datos.</div>;

  return (
    <div className="font-sans bg-slate-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-200">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Validación de Identidad</h1>
                <p className="text-slate-500">Capacitación: <strong>{user.training_name}</strong></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-2">Tus datos registrados:</h3>
                    <p className="text-sm text-slate-600"><strong>Nombre:</strong> {user.name}</p>
                    <p className="text-sm text-slate-600"><strong>DNI:</strong> {user.dni}</p>
                    <p className="text-sm text-slate-600"><strong>Email:</strong> {user.email}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-lg font-semibold text-slate-800">1. Foto de tu DNI</label>
                    <p className="text-sm text-slate-500">
                        ⚠️ Por favor sube una foto legible de tu DNI (frente o ambas caras). Formatos: JPG, PNG, WEBP. Mínimo 100KB, máximo 10MB.
                    </p>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleDniPhotoChange}
                        className={`w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-lg p-2 ${errors.dni_photo ? 'border-red-500' : 'border-slate-300'}`}
                    />
                    {errors.dni_photo && <p className="text-red-500 text-xs mt-1">{errors.dni_photo}</p>}
                    {dniPhotoPreview && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-600 mb-2">Vista previa:</p>
                            <img src={dniPhotoPreview} alt="Preview DNI" className="max-w-xs max-h-48 rounded border border-slate-200 object-contain inline-block"/>
                            <p className="text-xs text-green-600 mt-1">✅ Imagen cargada correctamente</p>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-lg font-semibold text-slate-800">2. Selfie (foto de tu rostro)</label>
                    <p className="text-sm text-slate-500">Tómate una foto clara de tu rostro para verificar tu identidad.</p>
                    <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={(e) => setSelfiePhoto(e.target.files ? e.target.files[0] : null)}
                        required
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-lg p-2"
                    />
                    {selfiePhoto && (
                        <div className="mt-4 text-center">
                             <img src={URL.createObjectURL(selfiePhoto)} alt="Preview Selfie" className="max-w-xs max-h-48 rounded border border-slate-200 object-contain inline-block"/>
                            <p className="text-xs text-green-600 mt-1">✅ Selfie capturada</p>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!dniPhotoFile || !selfiePhoto || submitting}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {submitting ? "Validando..." : "Enviar Validación"}
                </button>
            </form>
        </div>
    </div>
  );
}
