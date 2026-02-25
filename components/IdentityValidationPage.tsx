import React, { useState, useEffect } from 'react';
import { EventUser, Training, UserStatus } from '../types'; // Asumiendo que Training también es necesario

// --- Mocks de API (reemplazar con llamadas reales) ---
type UserWithTraining = EventUser & { training_name: string };

const getUserByValidationToken = async (token: string | null): Promise<UserWithTraining | null> => {
  console.log('Buscando usuario con token:', token);
  if (!token) return null;
  // Simulación
  return {
    id: 'usr_abc',
    trainingId: 'trn_xyz',
    name: 'Rosa María Flores',
    dni: '87654321',
    email: 'rosa.flores@example.com',
    phone: '+51912345678',
    organization: 'Constructora XYZ',
    area: 'Seguridad y Salud',
    role: 'Prevencionista',
    status: 'APROBADO',
    attended: false,
    registeredAt: new Date().toISOString(),
    identity_validated: false,
    validation_link: `http://localhost:3000/validar-identidad?token=${token}`,
    validation_completed: false,
    training_name: 'Trabajos de Alto Riesgo en Altura',
  } as UserWithTraining;
};

const updateUserValidation = async (userId: string, data: Partial<EventUser>) => {
  console.log(`Actualizando validación para ${userId}:`, data);
  return { success: true };
};

const sendTeamsLink = async (user: EventUser) => {
  console.log(`Enviando link de Teams a ${user.name}`);
  return { success: true };
};
// --- Fin Mocks ---

export function IdentityValidationPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserWithTraining | null>(null);
  const [loading, setLoading] = useState(true);
  const [dniPhoto, setDniPhoto] = useState<File | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    setToken(tokenFromUrl);

    async function loadUserDataByToken() {
      if (!tokenFromUrl) {
        setError("Link inválido o expirado");
        setLoading(false);
        return;
      }
      try {
        const userData = await getUserByValidationToken(tokenFromUrl);
        if (userData) {
          setUser(userData);
        } else {
          setError("Link inválido o expirado");
        }
      } catch (err) {
        setError("Error al cargar tus datos.");
      } finally {
        setLoading(false);
      }
    }

    loadUserDataByToken();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    if (!dniPhoto || !selfiePhoto || !user) {
      alert("Debes subir ambas fotos");
      return;
    }
  
    setSubmitting(true);
  
    try {
      // 1. Marcar como validado en BD
      await updateUserValidation(user.id, {
        identity_validated: true,
        validation_date: new Date().toISOString(),
        status: UserStatus.APPROVED
      });
      
      // 2. Obtener datos de la capacitación (simulado por ahora)
      const training = { meetingLink: 'https://teams.microsoft.com/...' }; // Simulación
      
      // 3. ENVIAR LINK AUTOMÁTICAMENTE (si existe)
      if (training.meetingLink) {
        // await sendTeamsLinkToUser(user, training.meetingLink);
        
        // 4. Actualizar estado a LINK_SENT
        await updateUserValidation(user.id, {
          status: UserStatus.LINK_SENT,
          meetingLink: training.meetingLink
        });
        
        setSuccess("¡Validación exitosa! Revisa tu email y WhatsApp para el link de Teams.");
      } else {
        // Marcar como pendiente de link
        await updateUserValidation(user.id, {
          status: UserStatus.PENDING_LINK,
          identity_validated: true
        });
        
        // Notificar al admin que hay usuarios esperando link
        // await notifyAdminPendingLinks(trainingId);
        setSuccess("Validación exitosa. Recibirás el link cuando esté disponible.");
      }
      
    } catch (error) {
      alert("Error al validar: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center p-10">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">{error}</div>;
  }
  
  if (success) {
    return <div className="text-center p-10 text-emerald-600">{success}</div>;
  }

  if (!user) {
    return <div className="text-center p-10">No se encontraron datos.</div>;
  }

  return (
    <div className="validation-page font-sans bg-slate-50 min-h-screen py-12">
      <style>{`
        .validation-page { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .header h1 { font-size: 2rem; font-weight: bold; color: #1F2937; margin-bottom: 8px; }
        .header p { color: #4B5563; }
        .user-info-readonly { background: #F3F4F6; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #E5E7EB; }
        .user-info-readonly h3 { margin-top: 0; margin-bottom: 12px; color: #374151; font-weight: 600; }
        .user-info-readonly p { margin: 8px 0; color: #6B7280; }
        .photo-section { margin-bottom: 30px; padding: 20px; border: 2px dashed #D1D5DB; border-radius: 8px; background: white; }
        .photo-section h3 { margin-top: 0; color: #1F2937; font-weight: bold; }
        .photo-section p { color: #6B7280; font-size: 0.9rem; margin-bottom: 1rem;}
        .photo-section input[type="file"] { display: block; margin-top: 12px; padding: 12px; border: 1px solid #D1D5DB; border-radius: 6px; width: 100%; font-size: 0.9rem; }
        .preview { margin-top: 16px; text-align: center; }
        .preview img { max-width: 200px; max-height: 200px; border-radius: 8px; border: 2px solid #10B981; margin: 0 auto; }
        .preview p { color: #10B981; font-weight: 600; margin-top: 8px; }
        .submit-btn { width: 100%; padding: 16px; background: #3B82F6; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #2563EB; }
        .submit-btn:disabled { background: #9CA3AF; cursor: not-allowed; }
      `}</style>
      <div className="header">
        <h1>Validación de Identidad</h1>
        <p>Capacitación: <strong>{user.training_name}</strong></p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="user-info-readonly">
          <h3>Tus datos registrados:</h3>
          <p><strong>Nombre:</strong> {user.name}</p>
          <p><strong>DNI:</strong> {user.dni}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
        
        <div className="photo-section">
          <h3>1. Foto de tu DNI</h3>
          <p>Toma una foto clara del frente de tu Documento Nacional de Identidad.</p>
          <input 
            type="file"
            accept="image/*"
            onChange={(e) => setDniPhoto(e.target.files ? e.target.files[0] : null)}
            required
          />
          {dniPhoto && (
            <div className="preview">
              <img src={URL.createObjectURL(dniPhoto)} alt="Preview DNI" />
              <p>✅ DNI cargado</p>
            </div>
          )}
        </div>
        
        <div className="photo-section">
          <h3>2. Selfie (foto de tu rostro)</h3>
          <p>Tómate una foto clara de tu rostro para verificar tu identidad.</p>
          <input 
            type="file"
            accept="image/*"
            capture="user"
            onChange={(e) => setSelfiePhoto(e.target.files ? e.target.files[0] : null)}
            required
          />
          {selfiePhoto && (
            <div className="preview">
              <img src={URL.createObjectURL(selfiePhoto)} alt="Preview Selfie" />
              <p>✅ Selfie capturada</p>
            </div>
          )}
        </div>
        
        <button 
          type="submit"
          disabled={!dniPhoto || !selfiePhoto || submitting}
          className="submit-btn"
        >
          {submitting ? "Validando..." : "Enviar Validación"}
        </button>
      </form>
    </div>
  );
}
