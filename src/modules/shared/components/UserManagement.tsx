
import React, { useState } from 'react';
import { SystemUser, Company, UserRole, ROLE_LABELS } from '../../../../types';

interface UserManagementProps {
  users: SystemUser[];
  companies: Company[];
  onAddUser: (user: Omit<SystemUser, 'id'>) => void;
  onUpdateUser: (user: SystemUser) => void;
  onToggleStatus: (userId: string) => void;
  onAddCompany: (company: Partial<Company>) => Promise<Company | undefined>;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, companies, onAddUser, onUpdateUser, onToggleStatus, onAddCompany }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin_contratista' as UserRole,
    companyId: ''
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'admin_contratista', companyId: '' });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const openModal = (user?: SystemUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // No mostrar contraseña
        role: user.role,
        companyId: user.companyId || ''
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'admin_contratista', companyId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCreateCompany = async () => {
    const name = window.prompt("Ingrese el nombre de la nueva empresa o contrata:");
    if (!name || name.trim() === '') return;

    try {
      const newCompany = await onAddCompany({ name: name.trim() });
      if (newCompany && newCompany.id) {
        setFormData(prev => ({ ...prev, companyId: newCompany.id }));
        alert(`Empresa "${newCompany.name}" agregada exitosamente.`);
      }
    } catch (e: any) {
      alert(e.message || "Error al agregar la empresa");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (formData.role === 'admin_contratista' && !formData.companyId) {
      alert("Debes asignar una empresa a los administradores de contratista.");
      return;
    }

    const userData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: true
    };
    if (formData.role === 'admin_contratista' && formData.companyId) {
      userData.companyId = formData.companyId;
    }

    if (formData.password) {
      userData.password = formData.password;
    }

    if (editingUser) {
      onUpdateUser({ ...userData, id: editingUser.id, isActive: editingUser.isActive });
    } else {
      onAddUser(userData);
    }
    resetForm();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-catalina-grey/20 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-catalina-forest-green tracking-tight">Gestión de Usuarios</h2>
          <p className="text-catalina-grey/80 text-sm mt-1">Administra el acceso al sistema de operadores y administradores.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-catalina-green text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-catalina-forest-green shadow-lg shadow-catalina-green/20 transition-all"
        >
          <i className="fas fa-user-plus text-xs"></i>
          Nuevo Usuario
        </button>
      </div>

      {/* Grid de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const company = companies.find(c => c.id === u.companyId);
          return (
            <div key={u.id} className="bg-white rounded-2xl border border-catalina-grey/20 p-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-catalina-green/10 flex items-center justify-center text-catalina-green font-bold text-sm">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${u.isActive ? 'bg-catalina-green/10 text-catalina-green border-catalina-green/20' : 'bg-catalina-grey/10 text-catalina-grey border-catalina-grey/20'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <h3 className="text-catalina-forest-green font-semibold mb-1">{u.name}</h3>
              <p className="text-sm text-catalina-grey/70 mb-4">{u.email}</p>

              <div className="border-t border-catalina-grey/10 pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-catalina-grey/60">Rol:</span>
                  <span className={`font-medium ${u.role === 'super_super_admin' ? 'text-catalina-highlight-orange' : u.role === 'super_admin' ? 'text-catalina-forest-green' : 'text-catalina-green'} capitalize`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-catalina-grey/60">Empresa:</span>
                  <span className="font-medium text-catalina-forest-green truncate max-w-[150px]">
                    {u.role === 'admin_contratista' ? company?.name || 'Sin Asignar' : 'Global (Todas)'}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(u)}
                  className="p-2 text-catalina-grey/60 hover:text-catalina-green hover:bg-catalina-green/10 rounded-lg transition-colors"
                  title="Editar"
                >
                  <i className="fas fa-pencil-alt text-xs"></i>
                </button>
                <button
                  onClick={() => onToggleStatus(u.id)}
                  className={`p-2 rounded-lg transition-colors ${u.isActive ? 'text-catalina-grey/60 hover:text-catalina-highlight-orange hover:bg-catalina-highlight-orange/10' : 'text-catalina-grey/60 hover:text-catalina-green hover:bg-catalina-green/10'}`}
                  title={u.isActive ? "Desactivar" : "Activar"}
                >
                  <i className={`fas ${u.isActive ? 'fa-ban' : 'fa-check-circle'} text-xs`}></i>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-catalina-forest-green/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 animate-fadeIn">
            <h3 className="text-lg font-bold text-catalina-forest-green mb-6">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-catalina-grey/80 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-catalina-grey/40 text-sm outline-none focus:ring-1 focus:ring-catalina-green focus:border-catalina-green transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-catalina-grey/80 uppercase tracking-wider mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-catalina-grey/40 text-sm outline-none focus:ring-1 focus:ring-catalina-green focus:border-catalina-green transition-all"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-catalina-grey/80 uppercase tracking-wider mb-1">
                  {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  className="w-full px-4 py-2.5 rounded-lg border border-catalina-grey/40 text-sm outline-none focus:ring-1 focus:ring-catalina-green focus:border-catalina-green transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-catalina-grey/80 uppercase tracking-wider mb-1">Rol</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-catalina-grey/40 text-sm outline-none bg-white focus:ring-1 focus:ring-catalina-green focus:border-catalina-green transition-all"
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                  >
                    <option value="admin_contratista">{ROLE_LABELS.admin_contratista}</option>
                    <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                    <option value="super_super_admin">{ROLE_LABELS.super_super_admin}</option>
                  </select>
                </div>
                {formData.role === 'admin_contratista' && (
                  <div>
                    <label className="flex justify-between block text-xs font-bold text-catalina-grey/80 uppercase tracking-wider mb-1">
                      <span>Empresa</span>
                      <button
                        type="button"
                        onClick={handleCreateCompany}
                        className="text-catalina-green hover:underline capitalize"
                      >
                        + Nueva Empresa
                      </button>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 rounded-lg border border-catalina-grey/40 text-sm outline-none bg-white focus:ring-1 focus:ring-catalina-green focus:border-catalina-green transition-all"
                      value={formData.companyId}
                      onChange={e => setFormData({ ...formData, companyId: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-catalina-grey/80 font-bold hover:bg-catalina-grey/10 rounded-lg">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm bg-catalina-green text-white font-bold rounded-lg hover:bg-catalina-forest-green shadow-lg shadow-catalina-green/20">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
