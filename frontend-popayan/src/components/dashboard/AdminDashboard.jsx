import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, DollarSign, Calendar, 
  Clock, ExternalLink, CheckCircle2, AlertTriangle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // 1. Cargar datos del servidor
  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status === 'success') {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      setError("Error al sincronizar con el núcleo del sistema.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Función para emitir el Veredicto (Aprobar)
  const handleApprove = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      const token = localStorage.getItem('token');
      
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/admin/users/${applicationId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar la vista quitando al usuario aprobado de la lista
      setDashboardData(prev => ({
        ...prev,
        pending_applications: prev.pending_applications.filter(app => app.id !== applicationId),
        kpis: {
          ...prev.kpis,
          verified_creators: prev.kpis.verified_creators + 1
        }
      }));

    } catch (err) {
      alert("Fallo al aprobar: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-20">
        <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#a855f7] font-mono text-[10px] uppercase tracking-widest">Sincronizando Corte de Curaduría...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-[20px] flex items-center gap-4 text-red-400">
          <AlertTriangle size={24} /> <p className="font-mono text-xs tracking-widest uppercase">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans animate-in fade-in duration-700">
      
      <header className="mb-12 border-b border-white/5 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <ShieldCheck size={16} className="text-blue-500" strokeWidth={2}/>
          <span className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em]">Administración Global</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">
          Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#a855f7]">Mando</span>
        </h1>
      </header>

      {/* 📊 KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Usuarios Totales', val: dashboardData?.kpis?.total_users || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Creadores Verificados', val: dashboardData?.kpis?.verified_creators || 0, icon: ShieldCheck, color: 'text-[#a855f7]' },
          { label: 'Ingresos Globales', val: `$${dashboardData?.kpis?.total_revenue || 0}`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Eventos Activos', val: dashboardData?.kpis?.active_events || 0, icon: Calendar, color: 'text-amber-500' }
        ].map((item, i) => (
          <div key={i} className="bg-[#111113] border border-white/5 rounded-[30px] p-8 shadow-lg flex flex-col justify-between">
            <div className={`w-12 h-12 rounded-2xl bg-[#0A0A0C] border border-white/5 flex items-center justify-center mb-6 ${item.color}`}>
              <item.icon size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <h3 className="text-3xl font-serif text-white tracking-tight">{item.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ⚖️ AUDITORÍA DE PERFILES (Fila de Espera) */}
      <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <Clock size={20} className="text-[#a855f7]" />
          <h2 className="text-2xl font-serif text-white uppercase italic tracking-tighter">Corte de Curaduría</h2>
          <span className="ml-4 px-3 py-1 bg-white/5 rounded-full text-gray-400 font-mono text-[10px] tracking-widest">
            {dashboardData?.pending_applications?.length || 0} PENDIENTES
          </span>
        </div>

        {(!dashboardData?.pending_applications || dashboardData.pending_applications.length === 0) ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-[30px] bg-[#0A0A0C]/50 relative z-10">
            <ShieldCheck size={40} className="mx-auto text-gray-700 mb-4" strokeWidth={1}/>
            <p className="font-mono text-[11px] text-gray-500 uppercase tracking-widest">El gremio está al día. No hay expedientes pendientes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 relative z-10">
            {dashboardData.pending_applications.map((app) => (
              <div key={app.id} className="bg-[#0A0A0C] border border-white/5 rounded-[24px] p-6 flex flex-col lg:flex-row gap-6 items-start lg:items-center hover:border-white/10 transition-colors">
                
                {/* Info del Usuario */}
                <div className="flex items-center gap-4 min-w-[250px]">
                  <img 
                    src={app.user?.profile_picture ? (app.user.profile_picture.startsWith('http') ? app.user.profile_picture : `http://localhost:8000${app.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${app.user?.name}&background=a855f7&color=fff`} 
                    alt="avatar" 
                    className="w-14 h-14 rounded-full border border-white/10 object-cover"
                  />
                  <div>
                    <h3 className="text-white font-bold text-lg">{app.user?.name}</h3>
                    <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">{app.user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20 rounded text-[8px] font-black uppercase tracking-widest">
                      Solicita: {app.proposed_type}
                    </span>
                  </div>
                </div>

                {/* Enlace y Carta */}
                <div className="flex-1 text-sm text-gray-400 border-l border-white/5 pl-6">
                  <p className="mb-4 line-clamp-2 italic">"{app.message}"</p>
                  <div className="flex items-center gap-4">
                    {/* 🔥 CIRUGÍA LEAN: Botón de Portafolio mejorado y único */}
                    {app.portfolio_url && (
                      <a href={app.portfolio_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#a855f7] hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-colors bg-[#a855f7]/10 hover:bg-[#a855f7]/20 px-5 py-2.5 rounded-[12px] border border-[#a855f7]/30">
                        <ExternalLink size={14} /> Inspeccionar Portafolio
                      </a>
                    )}
                  </div>
                </div>

                {/* Acción (Veredicto) */}
                <div className="shrink-0 lg:pl-6">
                  <button 
                    onClick={() => handleApprove(app.id)}
                    disabled={processingId === app.id}
                    className="px-6 py-3 bg-[#a855f7] text-white rounded-xl font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#9333ea] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[160px]"
                  >
                    {processingId === app.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><CheckCircle2 size={16} /> Aprobar Ascenso</>
                    )}
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;