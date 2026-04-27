import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, DollarSign, Calendar, 
  Clock, ExternalLink, CheckCircle2, AlertTriangle,
  Activity, TrendingUp, Briefcase, UserPlus, Image as ImageIcon, Bell, ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status === 'success') {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      setError("Error de sincronización con el núcleo del sistema.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleApprove = async (applicationId) => {
    try {
      setProcessingId(applicationId);
      const token = localStorage.getItem('token');
      
      await axios.patch(`${API_URL}/admin/users/${applicationId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualización de estado inmutable respetando tu lógica original
      setDashboardData(prev => ({
        ...prev,
        pending_applications: prev.pending_applications.filter(app => app.id !== applicationId),
        kpis: {
          ...prev.kpis,
          verified_creators: (prev.kpis?.verified_creators || 0) + 1
        }
      }));

    } catch (err) {
      const msg = err.response?.data?.message || "Fallo en la autorización del ascenso.";
      alert(msg);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-blue-500 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Sincronizando Torre de Control...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12">
        <div className="bg-red-500/10 border border-red-500/30 p-10 rounded-[40px] flex flex-col items-center gap-6 text-red-400">
          <AlertTriangle size={48} strokeWidth={1} />
          <p className="font-mono text-xs tracking-widest uppercase text-center leading-relaxed">{error}</p>
          <button onClick={fetchDashboard} className="px-8 py-3 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all">Reintentar Conexión</button>
        </div>
      </div>
    );
  }

  // 📊 MOCK DATA PARA LA BARRA LATERAL TÁCTICA
  const mockActivity = [
    { id: 1, type: 'user', text: 'Carlos Pérez completó su registro', time: 'Hace 10 min', icon: <UserPlus size={14} className="text-blue-400" />, bg: 'bg-blue-500/10' },
    { id: 2, type: 'art', text: 'Sofía R. publicó la obra "Amanecer Cauca"', time: 'Hace 45 min', icon: <ImageIcon size={14} className="text-violet-400" />, bg: 'bg-violet-500/10' },
    { id: 3, type: 'event', text: 'Nuevo evento: "Feria de Pubenza"', time: 'Hace 2 horas', icon: <Calendar size={14} className="text-emerald-400" />, bg: 'bg-emerald-500/10' },
    { id: 4, type: 'alert', text: 'Intento fallido de acceso (IP: 192.168.x.x)', time: 'Hace 5 horas', icon: <ShieldAlert size={14} className="text-amber-400" />, bg: 'bg-amber-500/10' },
  ];
  const mockChartData = [30, 45, 20, 60, 80, 50, 95];

  return (
    <div className="w-full p-8 lg:p-12 animate-in fade-in duration-700">
      
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={16} className="text-blue-500" strokeWidth={2.5}/>
          <span className="text-gray-500 font-mono text-[10px] font-black uppercase tracking-[0.4em]">Sistemas Activos • Popayán Cultural</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
          Centro de <span className="text-blue-600">Mando</span>
        </h1>
      </header>

      {/* 📊 KPI INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Población Total', val: dashboardData?.kpis?.total_users || 0, icon: Users, color: 'text-blue-500', glow: 'shadow-blue-500/10' },
          { label: 'Gremio Verificado', val: dashboardData?.kpis?.verified_creators || 0, icon: ShieldCheck, color: 'text-violet-500', glow: 'shadow-violet-500/10' },
          { label: 'Flujo Económico', val: `$${dashboardData?.kpis?.total_revenue || 0}`, icon: TrendingUp, color: 'text-emerald-500', glow: 'shadow-emerald-500/10' },
          { label: 'Agenda Activa', val: dashboardData?.kpis?.active_events || 0, icon: Calendar, color: 'text-amber-500', glow: 'shadow-amber-500/10' }
        ].map((item, i) => (
          <div key={i} className={`bg-[#111113] border border-white/5 rounded-[35px] p-10 shadow-2xl transition-all hover:border-white/10 ${item.glow}`}>
            <div className={`w-14 h-14 rounded-2xl bg-[#0A0A0C] border border-white/5 flex items-center justify-center mb-8 ${item.color}`}>
              <item.icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-gray-500 font-mono text-[9px] font-black uppercase tracking-[0.3em] mb-2">{item.label}</p>
              <h3 className="text-4xl font-black italic text-white tracking-tighter uppercase">{item.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 🚀 GRID MAESTRO (2 Columnas Curaduría / 1 Columna Inteligencia) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CORTE DE CURADURÍA (Ocupa 2/3) */}
        <section className="xl:col-span-2 bg-[#111113] border border-white/5 rounded-[50px] p-10 lg:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                <Gavel size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Corte de Curaduría</h2>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">Expedientes de ascenso pendientes</p>
              </div>
            </div>
            <span className="px-6 py-2 bg-blue-600/10 border border-blue-500/30 rounded-full text-blue-400 font-mono text-[10px] font-black tracking-widest uppercase">
              {dashboardData?.pending_applications?.length || 0} Solicitudes Críticas
            </span>
          </div>

          {(!dashboardData?.pending_applications || dashboardData.pending_applications.length === 0) ? (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-[#0A0A0C]/50 relative z-10">
              <CheckCircle2 size={60} className="mx-auto text-gray-800 mb-6" strokeWidth={1}/>
              <h3 className="text-2xl font-black italic text-gray-600 uppercase tracking-tighter">Sistemas Depurados</h3>
              <p className="font-mono text-[11px] text-gray-700 uppercase tracking-widest mt-2">El gremio está operando al 100%. No hay expedientes en cola.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 relative z-10">
              {dashboardData.pending_applications.map((app) => (
                <div key={app.id} className="bg-[#0A0A0C] border border-white/5 rounded-[35px] p-8 flex flex-col 2xl:flex-row gap-8 items-start 2xl:items-center hover:border-blue-500/30 transition-all duration-500 group shadow-xl">
                  
                  <div className="flex items-center gap-6 min-w-[300px]">
                    <div className="relative shrink-0">
                      <img 
                        src={app.user?.profile_picture ? (app.user.profile_picture.startsWith('http') ? app.user.profile_picture : `http://localhost:8000${app.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.name || 'U')}&background=3B82F6&color=fff&bold=true`} 
                        alt="avatar" 
                        className="w-20 h-20 rounded-[28px] border-2 border-white/5 object-cover grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-lg p-1.5 border-4 border-[#0A0A0C]">
                        <Briefcase size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{app.user?.name || 'Usuario Anónimo'}</h3>
                      <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">{app.user?.email}</p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          Aspira a: {app.proposed_type || 'Creador'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-gray-400 border-l border-white/5 pl-8 py-2">
                    <p className="mb-6 italic leading-relaxed text-gray-300">"{app.message || 'Sin mensaje de presentación.'}"</p>
                    {app.portfolio_url && (
                      <a 
                        href={app.portfolio_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-3 text-blue-400 hover:text-white font-mono text-[10px] font-black uppercase tracking-widest transition-all bg-blue-500/10 hover:bg-blue-600 px-6 py-3 rounded-xl border border-blue-500/20"
                      >
                        <ExternalLink size={14} /> Inspeccionar Portafolio
                      </a>
                    )}
                  </div>

                  <div className="shrink-0 2xl:pl-8 w-full 2xl:w-auto mt-4 2xl:mt-0">
                    <button 
                      onClick={() => handleApprove(app.id)}
                      disabled={processingId === app.id}
                      className="w-full 2xl:w-[200px] py-5 bg-blue-600 text-white rounded-[22px] font-black text-[10px] uppercase tracking-[0.25em] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 group-hover:scale-105 active:scale-95"
                    >
                      {processingId === app.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <><CheckCircle2 size={18} /> Aprobar Ascenso</>
                      )}
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: INTELIGENCIA TÁCTICA (Ocupa 1/3) */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* WIDGET 1: Gráfica de Crecimiento (CSS Nativo) */}
          <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <TrendingUp size={16} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="text-white font-black italic uppercase tracking-tight">Tráfico de Red</h4>
                  <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Últimos 7 días</p>
                </div>
              </div>
              <span className="text-emerald-400 font-mono text-[10px] font-black tracking-widest">+12%</span>
            </div>
            
            {/* Sparkline CSS (Sin Librerías) */}
            <div className="h-32 flex items-end justify-between gap-2 pt-4 border-b border-white/5">
              {mockChartData.map((val, idx) => (
                <div key={idx} className="w-full relative group">
                  <div 
                    className="w-full bg-blue-600/30 rounded-t-sm group-hover:bg-blue-500 transition-colors duration-300" 
                    style={{ height: `${val}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[8px] font-mono text-gray-600 uppercase">
              <span>Lun</span><span>Dom</span>
            </div>
          </div>

          {/* WIDGET 2: Bitácora de Actividad (Log) */}
          <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 shadow-2xl h-fit">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Bell size={16} className="text-gray-400" />
              </div>
              <div>
                <h4 className="text-white font-black italic uppercase tracking-tight">Radar de Sucesos</h4>
                <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Monitoreo en Vivo</p>
              </div>
            </div>

            <div className="space-y-4">
              {mockActivity.map((log) => (
                <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.bg}`}>
                    {log.icon}
                  </div>
                  <div>
                    <p className="text-gray-300 text-[11px] font-medium leading-relaxed">{log.text}</p>
                    <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-1">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-4 border border-white/5 rounded-2xl text-[9px] font-black text-gray-500 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all">
              Ver Historial Completo
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

// Componente Gavel Icon para consistencia
const Gavel = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 5-8 8 2 2 8-8-2-2Z"/><path d="m16 7 2-2 1.5 1.5-2 2"/><path d="M2 21h7"/><path d="M10 21h10"/><path d="m10 14 5 5-1.5 1.5-5-5z"/>
  </svg>
);

export default AdminDashboard;