import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, ShieldCheck, DollarSign, Calendar, 
  Clock, ExternalLink, CheckCircle2, AlertTriangle,
  Activity, TrendingUp, Briefcase, UserPlus, Image as ImageIcon, Bell, ShieldAlert, Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // 🔥 MOTOR DE ACENTO PARA ADMIN (Azul)
  const roleAccent = '59 130 246';

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
      <div style={{ '--role-accent': roleAccent }} className="w-full h-[80vh] flex flex-col items-center justify-center transition-colors duration-500">
        <Loader2 className="w-12 h-12 text-[rgb(var(--role-accent))] animate-spin mb-6" />
        <p className="text-[rgb(var(--role-accent))] font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse font-black">
          Sincronizando Torre de Control...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 animate-in fade-in transition-colors duration-500">
        <div className="bg-red-500/10 border border-red-500/30 p-10 rounded-[40px] flex flex-col items-center gap-6 text-red-500">
          <AlertTriangle size={48} strokeWidth={1} />
          <p className="font-mono text-xs tracking-widest uppercase text-center leading-relaxed">{error}</p>
          <button onClick={fetchDashboard} className="px-8 py-3 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95">Reintentar Conexión</button>
        </div>
      </div>
    );
  }

  // 📊 MOCK DATA PARA LA BARRA LATERAL
  const mockActivity = [
    { id: 1, text: 'Carlos Pérez completó su registro', time: 'Hace 10 min', icon: <UserPlus size={14} className="text-blue-500" />, bg: 'bg-blue-500/10' },
    { id: 2, text: 'Sofía R. publicó "Amanecer Cauca"', time: 'Hace 45 min', icon: <ImageIcon size={14} className="text-purple-500" />, bg: 'bg-purple-500/10' },
    { id: 3, text: 'Evento: "Feria de Pubenza"', time: 'Hace 2 horas', icon: <Calendar size={14} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
    { id: 4, text: 'Intento fallido de acceso IP', time: 'Hace 5 horas', icon: <ShieldAlert size={14} className="text-amber-500" />, bg: 'bg-amber-500/10' },
  ];
  const mockChartData = [30, 45, 20, 60, 80, 50, 95];

  return (
    <div style={{ '--role-accent': roleAccent }} className="w-full p-8 lg:p-12 animate-in fade-in duration-700 transition-colors duration-500">
      
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={16} className="text-[rgb(var(--role-accent))]" strokeWidth={2.5}/>
          <span className="text-[var(--text-body)] font-mono text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Sistemas Activos • Popayán Cultural</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm transition-colors duration-500">
          Centro de <span className="text-[rgb(var(--role-accent))]">Mando</span>
        </h1>
      </header>

      {/* 📊 KPI INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {[
          { label: 'Población Total', val: dashboardData?.kpis?.total_users || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Gremio Verificado', val: dashboardData?.kpis?.verified_creators || 0, icon: ShieldCheck, color: 'text-purple-500' },
          { label: 'Flujo Económico', val: `$${dashboardData?.kpis?.total_revenue || 0}`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Agenda Activa', val: dashboardData?.kpis?.active_events || 0, icon: Calendar, color: 'text-amber-500' }
        ].map((item, i) => (
          <div key={i} className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[35px] p-10 shadow-sm transition-all duration-500 hover:border-[rgb(var(--role-accent))]/40 hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))]">
            <div className={`w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mb-8 ${item.color} shadow-inner`}>
              <item.icon size={24} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[var(--text-body)] font-mono text-[9px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">{item.label}</p>
              <h3 className="text-4xl font-black italic text-[var(--text-heading)] tracking-tighter uppercase transition-colors">{item.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CORTE DE CURADURÍA */}
        <section className="xl:col-span-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[50px] p-8 lg:p-14 shadow-sm relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[rgb(var(--role-accent))]/5 to-transparent pointer-events-none transition-colors"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[rgb(var(--role-accent))]/10 rounded-2xl flex items-center justify-center text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/20 shadow-inner">
                <Gavel size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter transition-colors">Corte de Curaduría</h2>
                <p className="text-[10px] font-mono text-[var(--text-body)] uppercase tracking-widest mt-1 opacity-60">Expedientes de ascenso pendientes</p>
              </div>
            </div>
            <span className="px-6 py-2 bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] rounded-full font-mono text-[10px] font-black tracking-widest uppercase shadow-sm">
              {dashboardData?.pending_applications?.length || 0} Solicitudes Críticas
            </span>
          </div>

          {(!dashboardData?.pending_applications || dashboardData.pending_applications.length === 0) ? (
            <div className="py-24 text-center border-2 border-dashed border-[var(--border-color)] rounded-[40px] bg-[var(--bg-primary)]/50 relative z-10 transition-colors">
              <CheckCircle2 size={60} className="mx-auto text-[var(--text-body)] opacity-10 mb-6" strokeWidth={1}/>
              <h3 className="text-2xl font-bold italic text-[var(--text-body)] uppercase tracking-tighter opacity-40">Sistemas Depurados</h3>
              <p className="font-mono text-[11px] text-[var(--text-body)] uppercase tracking-widest mt-2 opacity-30">El gremio está operando al 100%. No hay expedientes en cola.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 relative z-10">
              {dashboardData.pending_applications.map((app) => (
                <div key={app.id} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[35px] p-8 flex flex-col 2xl:flex-row gap-8 items-start 2xl:items-center hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 group shadow-inner">
                  <div className="flex items-center gap-6 min-w-[300px]">
                    <div className="relative shrink-0">
                      <img 
                        src={app.user?.profile_picture ? (app.user.profile_picture.startsWith('http') ? app.user.profile_picture : `http://localhost:8000${app.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.name || 'U')}&background=050505&color=fff&bold=true`} 
                        alt="avatar" 
                        className="w-20 h-20 rounded-[28px] border-2 border-[var(--border-color)] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 shadow-sm"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[rgb(var(--role-accent))] rounded-lg p-1.5 border-4 border-[var(--bg-primary)] shadow-lg transition-colors">
                        <Briefcase size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--text-heading)] italic uppercase tracking-tighter transition-colors">{app.user?.name || 'Usuario Anónimo'}</h3>
                      <p className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-widest opacity-60 transition-colors">{app.user?.email}</p>
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-[var(--text-heading)]/5 border border-[var(--border-color)] text-[var(--text-body)] rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors">
                          Aspira a: {app.proposed_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-sm text-[var(--text-body)] border-l border-[var(--border-color)] pl-8 py-2 transition-colors">
                    <p className="mb-6 italic leading-relaxed opacity-80">"{app.message || 'Sin mensaje de presentación.'}"</p>
                    {app.portfolio_url && (
                      <a 
                        href={app.portfolio_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-3 text-[rgb(var(--role-accent))] hover:text-[var(--text-heading)] font-mono text-[10px] font-black uppercase tracking-widest transition-all bg-[rgb(var(--role-accent))]/10 hover:bg-[rgb(var(--role-accent))] hover:text-white px-6 py-3 rounded-xl border border-[rgb(var(--role-accent))]/20 active:scale-95"
                      >
                        <ExternalLink size={14} /> Inspeccionar Portafolio
                      </a>
                    )}
                  </div>

                  <div className="shrink-0 2xl:pl-8 w-full 2xl:w-auto">
                    <button 
                      onClick={() => handleApprove(app.id)}
                      disabled={processingId === app.id}
                      className="w-full 2xl:w-[200px] py-5 bg-[rgb(var(--role-accent))] text-white rounded-[22px] font-black text-[10px] uppercase tracking-[0.25em] hover:opacity-90 hover:shadow-[0_10px_30px_rgba(var(--role-accent),0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                    >
                      {processingId === app.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 size={18} /> Aprobar Ascenso</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: INTELIGENCIA */}
        <div className="xl:col-span-1 space-y-8">
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm transition-colors duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center border border-[rgb(var(--role-accent))]/20 transition-colors shadow-inner">
                  <TrendingUp size={16} className="text-[rgb(var(--role-accent))]" />
                </div>
                <div>
                  <h4 className="text-[var(--text-heading)] font-bold italic uppercase tracking-tight transition-colors">Tráfico de Red</h4>
                  <p className="text-[8px] font-mono text-[var(--text-body)] uppercase tracking-widest opacity-60">Últimos 7 días</p>
                </div>
              </div>
              <span className="text-emerald-500 font-mono text-[10px] font-black tracking-widest">+12%</span>
            </div>
            
            <div className="h-32 flex items-end justify-between gap-2 pt-4 border-b border-[var(--border-color)] transition-colors">
              {mockChartData.map((val, idx) => (
                <div key={idx} className="w-full relative group">
                  <div 
                    className="w-full bg-[rgb(var(--role-accent))]/20 rounded-t-sm group-hover:bg-[rgb(var(--role-accent))] transition-all duration-300 shadow-inner" 
                    style={{ height: `${val}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[var(--text-heading)] text-[var(--bg-primary)] px-2 py-1 rounded text-[8px] font-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[8px] font-mono text-[var(--text-body)] opacity-40 uppercase">
              <span>Lun</span><span>Dom</span>
            </div>
          </div>

          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm h-fit transition-colors duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[var(--text-heading)]/5 flex items-center justify-center border border-[var(--border-color)] shadow-inner transition-colors">
                <Bell size={16} className="text-[var(--text-body)]" />
              </div>
              <div>
                <h4 className="text-[var(--text-heading)] font-bold italic uppercase tracking-tight transition-colors">Radar de Sucesos</h4>
                <p className="text-[8px] font-mono text-[var(--text-body)] uppercase tracking-widest opacity-60">Monitoreo en Vivo</p>
              </div>
            </div>

            <div className="space-y-4">
              {mockActivity.map((log, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 transition-all duration-300 shadow-sm">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.bg} shadow-inner`}>
                    {log.icon}
                  </div>
                  <div>
                    <p className="text-[var(--text-heading)] text-[11px] font-medium leading-relaxed transition-colors">{log.text}</p>
                    <p className="text-[8px] font-mono text-[var(--text-body)] uppercase tracking-widest mt-1 opacity-50">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-4 border border-[var(--border-color)] rounded-2xl text-[9px] font-black text-[var(--text-body)] uppercase tracking-widest hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)] transition-all shadow-sm">
              Ver Historial Completo
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

const Gavel = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 5-8 8 2 2 8-8-2-2Z"/><path d="m16 7 2-2 1.5 1.5-2 2"/><path d="M2 21h7"/><path d="M10 21h10"/><path d="m10 14 5 5-1.5 1.5-5-5z"/>
  </svg>
);

export default AdminDashboard;