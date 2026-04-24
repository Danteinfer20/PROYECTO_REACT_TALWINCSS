import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Gavel, Palette, Building2, ShieldCheck, 
  Clock, MapPin, ExternalLink, XCircle, AlertTriangle, Activity, CheckCircle2
} from 'lucide-react';

const AuditoriaView = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const getSafeImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `http://localhost:8000${url}`;
  };

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setPendingUsers(res.data.data.pending_verifications || []);
      }
    } catch (e) {
      setFetchError("Error de sincronización con el núcleo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (userId, role, userName) => {
    try {
      setActionLoading(userId);
      const res = await axios.patch(`${API_URL}/admin/users/${userId}/approve`, 
        { assigned_role: role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        showToast(`${userName} ahora es ${role === 'artist' ? 'Artista' : 'Gestor'}`, 'success');
      }
    } catch (e) {
      showToast('Error en la autorización', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 🚀 TOAST */}
      {toast.show && (
        <div className={`fixed top-10 right-10 z-[100] backdrop-blur-xl border px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />} {toast.message}
        </div>
      )}

      <header className="mb-12 border-b border-white/5 pb-8 relative">
        <div className="flex items-center gap-3 mb-3">
          <Gavel size={14} className="text-[#a855f7]" strokeWidth={2.5}/>
          <span className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em]">CURADURÍA DE RANGOS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white">Corte de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#a855f7] inline-block pr-4">Curaduría</span></h1>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-24 flex flex-col items-center opacity-30">
            <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-mono text-[10px] uppercase tracking-widest">Consultando expedientes...</p>
          </div>
        ) : pendingUsers.length > 0 ? (
          pendingUsers.map(user => (
            <div key={user.id} className="bg-[#111113] border border-white/5 rounded-[40px] p-8 hover:border-white/10 transition-all duration-500 group shadow-2xl">
              <div className="flex flex-col sm:flex-row gap-8">
                <img 
                  src={user.profile_picture ? getSafeImageUrl(user.profile_picture) : `https://ui-avatars.com/api/?name=${user.name}&background=0A0A0C&color=ffffff`} 
                  className="w-24 h-24 rounded-[25px] object-cover border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner"
                  alt={user.name}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-serif text-white tracking-tight">{user.name}</h3>
                      <p className="text-[#a855f7] font-mono text-[10px] uppercase tracking-widest">@{user.username}</p>
                    </div>
                    <span className="text-gray-600 font-mono text-[9px]">ID#{user.id}</span>
                  </div>
                  <p className="text-gray-400 text-sm italic leading-relaxed mb-6 border-l-2 border-white/5 pl-4">"{user.bio}"</p>
                  <div className="flex gap-4 text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[#a855f7]"/> Popayán</span>
                    <span className="flex items-center gap-1.5 opacity-50"><Clock size={12}/> Pendiente</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex gap-4">
                <button 
                  onClick={() => handleApprove(user.id, 'artist', user.name)}
                  disabled={actionLoading}
                  className="flex-1 bg-[#a855f7]/5 border border-[#a855f7]/20 text-[#a855f7] py-4 rounded-2xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all shadow-lg"
                >
                  Aprobar Artista
                </button>
                <button 
                  onClick={() => handleApprove(user.id, 'cultural_manager', user.name)}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-500/5 border border-blue-500/20 text-blue-400 py-4 rounded-2xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                >
                  Aprobar Gestor
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-[#0A0A0C]/50 border border-dashed border-white/5 rounded-[40px]">
            <CheckCircle2 size={40} className="mx-auto text-gray-800 mb-4" strokeWidth={1} />
            <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.4em]">Sistemas Depurados. Cero Pendientes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditoriaView;