import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Gavel, Users, ShieldCheck, 
  XCircle, CheckCircle2, Ban, ShieldAlert, 
  Search, RefreshCw, Send, UserCheck, UserX,
  Loader2, ChevronDown
} from 'lucide-react';

const AuditoriaView = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('expedientes');
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const roleAccent = '59 130 246';

  const ROLES = [
    { value: 'artist', label: 'Artista' },
    { value: 'cultural_manager', label: 'Gestor Cultural' },
    { value: 'educator', label: 'Educador' },
    { value: 'admin', label: 'Administrador' },
    { value: 'visitor', label: 'Visitante' },
  ];

  const fetchIntel = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.status === 'success') {
        setPendingUsers(res.data.data.pending_applications || []);
        setAllUsers(res.data.data.all_users || []);
      }
    } catch (e) {
      showToast("Fallo de sincronización con el núcleo.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIntel(); }, []);

  const handleApprove = async (applicationId, role, userName) => {
    try {
      setActionLoading(`approve-${applicationId}`);
      await api.patch(`/admin/users/${applicationId}/approve`, { assigned_role: role });
      setPendingUsers(prev => prev.filter(app => app.id !== applicationId));
      showToast(`${userName} promovido a ${role.toUpperCase()}`, 'success');
      fetchIntel(); 
    } catch (e) {
      showToast(e.response?.data?.message || 'Error en la autorización', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const submitReject = async (applicationId, userName) => {
    if (rejectionReason.trim().length < 10) {
      showToast('El motivo debe ser detallado (Mínimo 10 caracteres).', 'error');
      return;
    }

    try {
      setActionLoading(`reject-${applicationId}`);
      await api.patch(`/admin/users/${applicationId}/reject`, { rejection_reason: rejectionReason });
      setPendingUsers(prev => prev.filter(app => app.id !== applicationId));
      showToast(`Solicitud de ${userName} denegada correctamente.`, 'success');
      setRejectingId(null);
      setRejectionReason('');
      fetchIntel();
    } catch (e) {
      showToast(e.response?.data?.message || 'Error al denegar solicitud', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      showToast(`Estado de ${userName} actualizado a ${newStatus}`, 'success');
      fetchIntel();
    } catch (e) {
      showToast('Fallo al cambiar estado', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const usuariosFiltrados = allUsers.filter(u => 
    u.name.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getRoleColor = (role) => {
    const colors = {
      'artist': '#ec4899',
      'cultural_manager': '#10b981',
      'educator': '#f59e0b',
      'admin': '#3b82f6',
      'visitor': '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <div style={{ '--role-accent': roleAccent }} className="p-4 sm:p-6 lg:p-8 xl:p-10 animate-in fade-in duration-700 w-full transition-colors duration-500">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-xl border px-5 py-3.5 rounded-[16px] shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${
          toast.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-500' 
            : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'
        }`}>
          {toast.type === 'error' ? <ShieldAlert size={16} className="shrink-0" /> : <ShieldCheck size={16} className="shrink-0" />} 
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 lg:mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm transition-colors duration-500">
              Corte de <span className="text-[rgb(var(--role-accent))]">Curaduría</span>
            </h1>
            <p className="text-[var(--text-body)] font-mono text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.2em] mt-2 border-l-2 border-[rgb(var(--role-accent))]/50 pl-3 lg:pl-4 transition-colors">
              Expedientes de ascenso y censo de ciudadanos
            </p>
          </div>
          
          <div className="relative group w-full lg:w-80 xl:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-body)] opacity-50" />
            <input 
              type="text" 
              placeholder="Buscar ciudadanos..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-[10px] font-mono rounded-full pl-11 pr-5 py-3 sm:py-3.5 outline-none shadow-inner focus:border-[rgb(var(--role-accent))]/50 transition-all placeholder:[var(--text-body)]/40"
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-3 mb-8 lg:mb-10 border-b border-[var(--border-color)] pb-5 overflow-x-auto scrollbar-hide transition-colors">
        {[
          { id: 'expedientes', label: 'Pendientes de Rango', icon: <Gavel size={14} /> },
          { id: 'usuarios', label: 'Censo de Usuarios', icon: <Users size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3 rounded-full text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm border whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-[rgb(var(--role-accent))] text-white border-[rgb(var(--role-accent))] shadow-[0_0_20px_rgba(var(--role-accent),0.3)]' 
                : 'bg-[var(--bg-container)] border-[var(--border-color)] text-[var(--text-body)] hover:text-[var(--text-heading)]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full space-y-6 sm:space-y-8">
        {loading ? (
          <div className="py-32 sm:py-40 flex flex-col items-center text-[rgb(var(--role-accent))] transition-colors">
            <Loader2 className="animate-spin mb-6" size={36} />
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.5em] opacity-50">Consultando...</p>
          </div>
        ) : activeTab === 'expedientes' ? (
          <div className="grid grid-cols-1 gap-6">
            {pendingUsers.length > 0 ? (
              pendingUsers.map(app => {
                const isRejecting = rejectingId === app.id;
                const selectedRole = app.proposed_type || 'artist';
                
                return (
                  <div key={app.id} className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-sm transition-all duration-500 hover:border-[rgb(var(--role-accent))]/30">
                    
                    {/* Cabecera */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      <div className="shrink-0">
                        <img 
                          src={app.user?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.name || 'U')}&background=0A0A0C&color=ffffff&bold=true`} 
                          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl object-cover border border-[var(--border-color)] shadow-inner" 
                          alt="Aspirante" 
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter truncate">
                            {app.user?.name || 'Usuario Anónimo'}
                          </h3>
                          <span className="px-3 py-1 bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))] rounded-xl text-[7px] sm:text-[8px] font-black uppercase tracking-widest shadow-inner whitespace-nowrap">
                            Aspira: {app.proposed_type}
                          </span>
                        </div>
                        <p className="text-[rgb(var(--role-accent))] font-mono text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-widest mt-1 opacity-90 truncate">
                          @{app.user?.username || 'user'}
                        </p>
                        <p className="text-[var(--text-body)] text-sm italic mt-2 max-w-3xl opacity-80 leading-relaxed line-clamp-2">
                          "{app.message || 'Sin mensaje de presentación.'}"
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    {!isRejecting && (
                      <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
                        <div className="w-full sm:w-auto">
                          <label className="text-[7px] font-mono uppercase tracking-widest text-[var(--text-body)] opacity-60 block mb-1">Asignar rol</label>
                          <div className="relative">
                            <select
                              value={selectedRole}
                              onChange={(e) => {
                                const updatedApp = { ...app, proposed_type: e.target.value };
                              }}
                              className="w-full sm:w-44 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all appearance-none cursor-pointer shadow-sm pr-8"
                            >
                              {ROLES.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-body)] pointer-events-none opacity-50" />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                          <button 
                            onClick={() => setRejectingId(app.id)} 
                            disabled={actionLoading} 
                            className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                          >
                            <UserX size={14} /> Denegar
                          </button>
                          <button 
                            onClick={() => handleApprove(app.id, selectedRole, app.user?.name)} 
                            disabled={actionLoading} 
                            className="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 sm:py-3 bg-[rgb(var(--role-accent))] text-white rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                          >
                            {actionLoading === `approve-${app.id}` ? <Loader2 className="animate-spin" size={14} /> : <UserCheck size={14} />} Aprobar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Panel de rechazo */}
                    {isRejecting && (
                      <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-[var(--border-color)] animate-in slide-in-from-top-4 fade-in w-full">
                        <h4 className="text-red-500 font-bold italic uppercase tracking-tighter text-base sm:text-lg mb-3 flex items-center gap-2">
                          <XCircle size={18} /> Justificación de Rechazo
                        </h4>
                        <textarea 
                          value={rejectionReason} 
                          onChange={(e) => setRejectionReason(e.target.value)} 
                          placeholder="Escriba el motivo (mínimo 10 caracteres)..." 
                          className="w-full bg-[var(--bg-primary)] border border-red-500/30 rounded-xl p-4 text-xs font-mono text-[var(--text-heading)] outline-none transition-colors shadow-inner" 
                          rows={2} 
                        />
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                          <button 
                            onClick={() => { setRejectingId(null); setRejectionReason(''); }} 
                            className="px-5 py-2.5 text-[var(--text-body)] text-[9px] font-black uppercase hover:text-[var(--text-heading)] transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => submitReject(app.id, app.user?.name)} 
                            disabled={rejectionReason.length < 10 || actionLoading === `reject-${app.id}`} 
                            className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:bg-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === `reject-${app.id}` ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />} Confirmar Rechazo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-20 sm:py-28 text-center bg-[var(--bg-container)] border border-dashed border-[var(--border-color)] rounded-3xl sm:rounded-4xl transition-colors">
                <CheckCircle2 size={40} className="sm:w-[50px] sm:h-[50px] mx-auto text-[rgb(var(--role-accent))] opacity-20 mb-5" />
                <p className="text-[var(--text-body)] font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Sin Pendientes.</p>
                <p className="text-[var(--text-body)] text-xs opacity-30 mt-1">Todos los expedientes han sido resueltos.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors duration-500">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-left border-b border-[var(--border-color)] bg-[var(--text-heading)]/[0.03] transition-colors">
                    <th className="p-4 sm:p-5 lg:p-6 text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase text-[var(--text-body)] opacity-50">Ciudadano</th>
                    <th className="p-4 sm:p-5 lg:p-6 text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase text-[var(--text-body)] opacity-50 hidden sm:table-cell">Rango</th>
                    <th className="p-4 sm:p-5 lg:p-6 text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase text-[var(--text-body)] opacity-50 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id} className="hover:bg-[var(--text-heading)]/[0.02] transition-colors group">
                      <td className="p-4 sm:p-5 lg:p-6">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img 
                            src={u.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&background=${getRoleColor(u.user_type).replace('#', '')}&color=fff`} 
                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full object-cover border border-[var(--border-color)] shadow-inner" 
                            alt="Avatar"
                          />
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base font-bold text-[var(--text-heading)] uppercase tracking-tight truncate">{u.name}</p>
                            <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-mono text-[var(--text-body)] opacity-50 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 lg:p-6 hidden sm:table-cell">
                        <span 
                          className="px-2.5 py-1 rounded-xl text-[7px] sm:text-[8px] font-black uppercase border shadow-inner"
                          style={{ 
                            color: getRoleColor(u.user_type),
                            borderColor: getRoleColor(u.user_type) + '40',
                            backgroundColor: getRoleColor(u.user_type) + '10'
                          }}
                        >
                          {u.user_type}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 lg:p-6 text-right">
                        <button 
                          onClick={() => handleToggleStatus(u.id, u.status, u.name)} 
                          className={`p-2.5 sm:p-3 rounded-xl transition-all shadow-sm ${
                            u.status === 'active' 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white' 
                              : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title={u.status === 'active' ? 'Suspender' : 'Activar'}
                        >
                          <Ban size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usuariosFiltrados.length === 0 && (
              <div className="py-12 sm:py-16 text-center">
                <p className="text-[var(--text-body)] font-mono text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriaView;