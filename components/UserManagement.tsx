
import React, { useState } from 'react';
import { SystemUser, Company, UserRole } from '../types';

interface UserManagementProps {
  users: SystemUser[];
  companies: Company[];
  onAddUser: (user: Omit<SystemUser, 'id'>) => void;
  onUpdateUser: (user: SystemUser) => void;
  onToggleStatus: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, companies, onAddUser, onUpdateUser, onToggleStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole,
    companyId: ''
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'user', companyId: '' });
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
      setFormData({ name: '', email: '', password: '', role: 'user', companyId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (formData.role === 'user' && !formData.companyId) {
      alert("Debes asignar una empresa a los usuarios no administradores.");
      return;
    }

    const userData: any = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      companyId: formData.role === 'superadmin' ? null : formData.companyId,
      isActive: true
    };

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
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Gestión de Usuarios</h2>
          <p className="text-slate-500 text-sm mt-1">Administra el acceso al sistema de operadores y administradores.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all"
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
             <div key={u.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all group">
               <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {u.name.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex gap-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                         {u.isActive ? 'Activo' : 'Inactivo'}
                     </span>
                 </div>
               </div>
               
               <h3 className="text-slate-900 font-semibold mb-1">{u.name}</h3>
               <p className="text-sm text-slate-500 mb-4">{u.email}</p>

               <div className="border-t border-slate-50 pt-4 space-y-2">
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Rol:</span>
                    <span className={`font-medium ${u.role === 'superadmin' ? 'text-amber-600' : 'text-slate-700'} capitalize`}>
                        {u.role === 'superadmin' ? 'Super Admin' : 'Operador'}
                    </span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Empresa:</span>
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">
                        {u.role === 'superadmin' ? 'Global (Todas)' : company?.name || 'Sin Asignar'}
                    </span>
                 </div>
               </div>

               <div className="mt-6 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => openModal(u)}
                     className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                     title="Editar"
                   >
                       <i className="fas fa-pencil-alt text-xs"></i>
                   </button>
                   <button 
                     onClick={() => onToggleStatus(u.id)}
                     className={`p-2 rounded-lg transition-colors ${u.isActive ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-8 animate-fadeIn">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Nombre Completo</label>
                        <input 
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</label>
                        <input 
                            required
                            type="email"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                            {editingUser ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <input 
                            type="password"
                            required={!editingUser}
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Rol</label>
                            <select 
                                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                            >
                                <option value="user">Operador</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>
                        {formData.role === 'user' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Empresa</label>
                                <select 
                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                                    value={formData.companyId}
                                    onChange={e => setFormData({...formData, companyId: e.target.value})}
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
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 font-medium hover:bg-slate-50 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 shadow-lg">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
