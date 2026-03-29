
import React, { useState, useRef } from 'react';
import { Training, EventUser, UserStatus, Company } from '../../../../types';

interface IndividualWorkerFormProps {
  training: Training;
  companies: Company[];
  currentUserCompanyId: string | null;
  existingUsers: EventUser[];
  onRegister: (user: Partial<EventUser>, newCompany?: string) => void;
  onClose: () => void;
}

export const IndividualWorkerForm: React.FC<IndividualWorkerFormProps> = ({
  training,
  companies,
  currentUserCompanyId,
  existingUsers,
  onRegister,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    dni: '',
    email: '',
    phone: '',
    companyId: currentUserCompanyId || '',
    newCompanyName: '',
    isNewCompany: false,
    area: '',
    role: '',
    brevete: '',
    dniPhoto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{8}$/.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    } else if (existingUsers.some(u => u.dni === formData.dni)) {
      newErrors.dni = 'Este DNI ya está registrado en esta capacitación';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de correo inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else {
      const phoneRegex = /^[\d\s\-\+\(\)]{9,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Formato de teléfono inválido';
      } else {
        const cleanPhone = formData.phone.replace(/[\s\-\+\(\)]/g, '');
        const peruMobileRegex = /^9\d{8}$/;
        if (cleanPhone.length === 9 && !peruMobileRegex.test(cleanPhone)) {
          newErrors.phone = 'Celular peruano debe comenzar con 9';
        }
      }
    }

    if (formData.isNewCompany) {
      if (!formData.newCompanyName.trim()) {
        newErrors.company = 'El nombre de la nueva empresa es obligatorio';
      } else if (companies.some(c => c.name.toLowerCase() === formData.newCompanyName.trim().toLowerCase())) {
        newErrors.company = 'Esta empresa ya existe en la lista';
      }
    } else {
      if (!formData.companyId) {
        newErrors.company = 'Debe seleccionar una empresa';
      }
    }

    if (!formData.area.trim()) newErrors.area = 'El área es obligatoria';
    if (!formData.role.trim()) newErrors.role = 'El cargo es obligatorio';
    if (!formData.dniPhoto) newErrors.dniPhoto = 'La foto del DNI es obligatoria';

    // Validar cupo si la empresa existe
    if (!formData.isNewCompany && formData.companyId) {
      const selectedCompany = companies.find(c => c.id === formData.companyId);
      if (selectedCompany) {
        const quotaMax = selectedCompany.quotaMax || 0;
        const quotaUsed = selectedCompany.quotaUsed || 0;
        if (quotaUsed >= quotaMax && quotaMax > 0) {
          // Quota validation placeholder
        }
      }
    }

    if (existingUsers.length >= training.maxCapacity) {
      newErrors.quota = 'No hay cupo disponible para esta capacitación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, dniPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const selectedCompany = companies.find(c => c.id === formData.companyId);
      onRegister({
        name: formData.name,
        dni: formData.dni,
        email: formData.email,
        phone: formData.phone,
        area: formData.area,
        role: formData.role,
        brevete: formData.brevete,
        dniPhoto: formData.dniPhoto,
        organization: formData.isNewCompany ? formData.newCompanyName : (selectedCompany?.name || ''),
        status: UserStatus.REGISTERED
      }, formData.isNewCompany ? formData.newCompanyName : undefined);
    }
  };

  const selectedCompany = companies.find(c => c.id === formData.companyId);
  const hasNoQuota = !formData.isNewCompany && selectedCompany && (selectedCompany.quotaMax || 0) === 0;

  // Helper: input class based on error state
  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
    } outline-none focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green transition-all text-catalina-grey font-normal`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-catalina-grey/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-montserrat">
        {/* ═══ Header ═══ */}
        <div className="p-6 bg-catalina-forest-green text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Registro Individual</h3>
            <p className="text-white/60 text-xs uppercase tracking-widest font-medium mt-1">{training.title}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
          {/* Alertas */}
          {errors.quota && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700">
              <i className="fas fa-exclamation-circle text-xl"></i>
              <div>
                <p className="font-semibold text-sm">Error de Cupo</p>
                <p className="text-xs font-normal">{errors.quota}</p>
              </div>
            </div>
          )}

          {formData.isNewCompany && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 text-amber-700">
              <i className="fas fa-info-circle text-xl"></i>
              <div>
                <p className="font-semibold text-sm">Aviso de Cupo</p>
                <p className="text-xs font-normal">Esta empresa no tiene cupos asignados inicialmente.</p>
              </div>
            </div>
          )}

          {hasNoQuota && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-center gap-3 text-amber-700">
              <i className="fas fa-exclamation-triangle text-xl"></i>
              <div>
                <p className="font-semibold text-sm">Empresa sin Cupo</p>
                <p className="text-xs font-normal">La empresa seleccionada no tiene cupos asignados.</p>
              </div>
            </div>
          )}

          {/* ═══ Sección: Datos Personales ═══ */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-catalina-forest-green uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-user text-[10px]"></i> Datos Personales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Nombres y Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputClass('name')}
                placeholder="Ej. Juan Pérez García"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                DNI (8 dígitos) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={8}
                className={`${inputClass('dni')} font-mono`}
                placeholder="00000000"
                value={formData.dni}
                onChange={e => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
              />
              {errors.dni && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.dni}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={inputClass('email')}
                placeholder="ejemplo@empresa.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Teléfono / Celular <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={inputClass('phone')}
                placeholder="987654321 o +51 987654321"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* ═══ Separador ═══ */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* ═══ Sección: Datos Laborales ═══ */}
          <div>
            <p className="text-xs font-semibold text-catalina-forest-green uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-briefcase text-[10px]"></i> Datos Laborales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Empresa <span className="text-red-500">*</span>
              </label>
              {!formData.isNewCompany ? (
                <div className="flex gap-2">
                  <select
                    className={`flex-grow px-4 py-3 rounded-xl border ${errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green transition-all text-catalina-grey font-normal`}
                    value={formData.companyId}
                    onChange={e => {
                      if (e.target.value === 'NEW') {
                        setFormData({ ...formData, isNewCompany: true, companyId: '' });
                      } else {
                        setFormData({ ...formData, companyId: e.target.value });
                      }
                    }}
                  >
                    <option value="">Seleccionar empresa...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="NEW" className="text-catalina-green font-medium">➕ Crear nueva empresa</option>
                  </select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-grow px-4 py-3 rounded-xl border ${errors.company ? 'border-red-300 bg-red-50' : 'border-gray-300'} outline-none focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green transition-all text-catalina-grey font-normal`}
                    placeholder="Nombre de la nueva empresa"
                    value={formData.newCompanyName}
                    onChange={e => setFormData({ ...formData, newCompanyName: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isNewCompany: false, newCompanyName: '' })}
                    className="px-4 py-3 bg-gray-100 text-catalina-grey rounded-xl hover:bg-gray-200 transition-all"
                    title="Volver a lista"
                  >
                    <i className="fas fa-undo"></i>
                  </button>
                </div>
              )}
              {errors.company && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.company}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Área <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputClass('area')}
                placeholder="Ej. Mantenimiento"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
              />
              {errors.area && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputClass('role')}
                placeholder="Ej. Operador de Grúa"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              />
              {errors.role && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.role}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Brevete <span className="text-catalina-grey/40 text-xs font-normal">(Opcional)</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green transition-all text-catalina-grey font-normal"
                placeholder="Ej. Q12345678"
                value={formData.brevete}
                onChange={e => setFormData({ ...formData, brevete: e.target.value })}
              />
            </div>
          </div>

          {/* ═══ Separador ═══ */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* ═══ Sección: Documentos ═══ */}
          <div>
            <p className="text-xs font-semibold text-catalina-forest-green uppercase tracking-wider mb-4 flex items-center gap-2">
              <i className="fas fa-id-card text-[10px]"></i> Documentos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                Foto DNI <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full px-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all ${formData.dniPhoto
                    ? 'border-catalina-dusty-green/50 bg-catalina-dusty-green/10 text-catalina-forest-green'
                    : errors.dniPhoto
                      ? 'border-red-300 bg-red-50 text-red-500'
                      : 'border-gray-300 hover:border-catalina-green text-catalina-grey/60'
                  }`}
              >
                <i className={formData.dniPhoto ? "fas fa-check-circle" : "fas fa-camera"}></i>
                <span className="text-xs font-medium">{formData.dniPhoto ? 'Foto Cargada ✓' : 'Subir Foto DNI'}</span>
              </button>
              {errors.dniPhoto && <p className="text-[11px] text-red-500 font-medium mt-1">{errors.dniPhoto}</p>}
            </div>
          </div>

          {/* ═══ Footer Buttons ═══ */}
          <div className="pt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-medium text-catalina-grey/60 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[2] bg-catalina-green text-white px-6 py-4 rounded-2xl font-semibold hover:bg-catalina-green/90 active:scale-[0.98] shadow-lg shadow-catalina-green/20 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-save"></i>
              Guardar Trabajador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
