import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Gavel, Users, FileSearch, ShieldCheck, 
  XCircle, CheckCircle2, Ban, ShieldAlert, 
  Search, RefreshCw, X, Send
} from 'lucide-react';

const AuditoriaView = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('expedientes');
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // 🛡️ Estados para el flujo de Rechazo
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const fetchIntel = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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

  // ✅ FLUJO: APROBAR
  const handleApprove = async (applicationId, role, userName) => {
    try {
      setActionLoading(`approve-${applicationId}`);
      await axios.patch(`${API_URL}/admin/users/${applicationId}/approve`, 
        { assigned_role: role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingUsers(prev => prev.filter(app => app.id !== applicationId));
      showToast(`${userName} promovido a ${role.toUpperCase()}`, 'success');
      fetchIntel(); 
    } catch (e) {
      showToast(e.response?.data?.message || 'Error en la autorización', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ❌ FLUJO: DENEGAR
  const submitReject = async (applicationId, userName) => {
    if (rejectionReason.trim().length < 10) {
      showToast('El motivo debe ser detallado (Mínimo 10 caracteres).', 'error');
      return;
    }

    try {
      setActionLoading(`reject-${applicationId}`);
      await axios.patch(`${API_URL}/admin/users/${applicationId}/reject`, 
        { rejection_reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  // 🚫 FLUJO: SUSPENDER/ACTIVAR
  const handleToggleStatus = async (userId, currentStatus, userName) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await axios.patch(`${API_URL}/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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

  return (
    <div className="p-4 animate-in fade-in duration-700 w-full">
      
      {/* 🚨 TOAST DE ALERTAS */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[100] backdrop-blur-xl border px-8 py-5 rounded-[25px] shadow-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right-10 ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
          {toast.type === 'error' ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />} {toast.message}
        </div>
      )}

      {/* 🔵 HEADER DE COMANDO */}
      <header className="mb-12">
        <h1 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
          Corte de <span className="text-blue-600">Curaduría</span>
        </h1>
        <div className="mt-8 relative group w-full xl:w-96">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input 
            type="text" 
            placeholder="Buscar ciudadanos..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#111113] border border-white/5 text-white text-[10px] font-mono rounded-full pl-14 pr-6 py-5 outline-none shadow-inner"
          />
        </div>
      </header>

      {/* 🎛️ SELECTOR DE PESTAÑAS */}
      <div className="flex gap-4 mb-12 border-b border-white/5 pb-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'expedientes', label: 'Pendientes de Rango', icon: <Gavel size={14}/> },
          { id: 'usuarios', label: 'Censo de Usuarios', icon: <Users size={14}/> },
          { id: 'contenido', label: 'Monitor de Contenido', icon: <FileSearch size={14}/> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 🚀 CONTENIDO MAESTRO */}
      <div className="w-full space-y-8">
        {loading ? (
          <div className="py-40 flex flex-col items-center">
            <RefreshCw className="animate-spin text-blue-600 mb-6" size={40} />
            <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-blue-500/50">Consultando...</p>
          </div>
        ) : activeTab === 'expedientes' ? (
          <div className="grid grid-cols-1 gap-8">
            {pendingUsers.length > 0 ? (
              pendingUsers.map(app => (
                <div key={app.id} className="bg-[#111113] border border-white/5 rounded-[40px] p-8 xl:p-10 shadow-2xl flex flex-col">
                  
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center w-full">
                    <img src={app.user?.profile_picture || `https://ui-avatars.com/api/?name=${app.user?.name}&background=0A0A0C&color=ffffff&bold=true`} className="w-24 h-24 rounded-[30px] object-cover border border-white/10" alt="Aspirante" />
                    <div className="flex-1">
                      <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">{app.user?.name}</h3>
                      <p className="text-blue-500 font-mono text-[11px] uppercase tracking-widest mb-3">@{app.user?.username || 'user'}</p>
                      <p className="text-gray-400 text-sm italic mb-4 max-w-4xl">"{app.message || 'Sin mensaje.'}"</p>
                      <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Aspiración: {app.proposed_type}</span>
                    </div>

                    {rejectingId !== app.id && (
                      <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0 flex gap-4">
                        <button onClick={() => setRejectingId(app.id)} disabled={actionLoading} className="px-8 py-4 bg-red-500/10 text-red-500 border border-red-500/30 rounded-[20px] font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Denegar</button>
                        <button onClick={() => handleApprove(app.id, app.proposed_type, app.user?.name)} disabled={actionLoading} className="px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black text-[9px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2">
                          {actionLoading === `approve-${app.id}` ? <RefreshCw className="animate-spin" size={14}/> : <ShieldCheck size={14}/>} Aprobar Ascenso
                        </button>
                      </div>
                    )}
                  </div>

                  {rejectingId === app.id && (
                    <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4 fade-in w-full">
                      <h4 className="text-red-400 font-black italic uppercase tracking-tighter text-xl mb-4">Justificación de Rechazo</h4>
                      <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Escriba el motivo (mínimo 10 caracteres)..." className="w-full bg-[#0A0A0C] border border-red-500/30 rounded-[25px] p-6 text-xs font-mono text-gray-300 outline-none transition-colors" rows={3} />
                      <div className="flex justify-end gap-4 mt-6">
                        <button onClick={() => { setRejectingId(null); setRejectionReason(''); }} className="px-8 py-4 text-gray-500 text-[9px] font-black uppercase">Cancelar</button>
                        <button onClick={() => submitReject(app.id, app.user?.name)} disabled={rejectionReason.length < 10} className="px-8 py-4 bg-red-600 text-white rounded-[20px] font-black text-[9px] uppercase tracking-widest flex items-center gap-2">
                          {actionLoading === `reject-${app.id}` ? <RefreshCw className="animate-spin" size={14}/> : <Send size={14}/>} Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-32 text-center bg-[#0D0D0F] border border-dashed border-white/5 rounded-[50px]">
                <CheckCircle2 size={50} className="mx-auto text-blue-600/20 mb-6" />
                <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.4em]">Sin Pendientes.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'usuarios' ? (
          <div className="bg-[#111113] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-white/5 bg-black/20">
                    <th className="p-8 text-[10px] font-black uppercase text-gray-500">Ciudadano</th>
                    <th className="p-8 text-[10px] font-black uppercase text-gray-500">Rango</th>
                    <th className="p-8 text-[10px] font-black uppercase text-gray-500 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          <img src={u.profile_picture || `https://ui-avatars.com/api/?name=${u.name}&background=3B82F6&color=fff`} className="w-12 h-12 rounded-full object-cover" alt="Avatar"/>
                          <div>
                            <p className="text-base font-bold text-white uppercase tracking-tight">{u.name}</p>
                            <p className="text-[10px] font-mono text-gray-600">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-gray-500/30 text-gray-400">{u.user_type}</span>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleStatus(u.id, u.status, u.name)} className={`p-4 rounded-2xl transition-all ${u.status === 'active' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                            <Ban size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-40 text-center bg-[#111113] border border-white/5 rounded-[50px] border-dashed">
            <ShieldAlert size={80} className="mx-auto text-violet-600/20 mb-8" />
            <h3 className="text-3xl font-black italic text-gray-600 uppercase">En construcción</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriaView;