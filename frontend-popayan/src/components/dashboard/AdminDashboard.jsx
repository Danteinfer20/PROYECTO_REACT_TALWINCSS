import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, ShieldCheck, DollarSign, Calendar, 
  Clock, ExternalLink, CheckCircle2, AlertTriangle,
  Activity, TrendingUp, Briefcase, UserPlus, Image as ImageIcon, Bell, ShieldAlert, Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({}); // { applicationId: 'artist' }
  const roleAccent = '59 130 246';

  // Lista de roles disponibles
  const ROLES = [
    { value: 'artist', label: 'Artista' },
    { value: 'cultural_manager', label: 'Gestor Cultural' },
    { value: 'educator', label: 'Educador' },
    { value: 'admin', label: 'Administrador' },
    { value: 'visitor', label: 'Visitante' },
  ];

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
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

  const fetchRecentActivity = async () => {
    try {
      setLoadingActivity(true);
      const res = await api.get('/admin/activity');
      if (res.data.status === 'success') {
        setRecentActivity(res.data.data);
      }
    } catch (err) {
      console.error("Error al obtener actividad reciente:", err);
      setRecentActivity([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchRecentActivity();
  }, []);

  const handleApprove = async (applicationId) => {
    const role = selectedRoles[applicationId];
    if (!role) {
      alert('Es obligatorio asignar un rol para el ascenso.');
      return;
    }

    try {
      setProcessingId(applicationId);
      await api.patch(`/admin/users/${applicationId}/approve`, {
        assigned_role: role
      });
      setDashboardData(prev => ({
        ...prev,
        pending_applications: prev.pending_applications.filter(app => app.id !== applicationId),
        kpis: {
          ...prev.kpis,
          verified_creators: (prev.kpis?.verified_creators || 0) + 1
        }
      }));
      fetchRecentActivity();
      // Limpiar el rol seleccionado
      setSelectedRoles(prev => {
        const newState = { ...prev };
        delete newState[applicationId];
        return newState;
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Fallo en la autorización del ascenso.";
      alert(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = (applicationId, role) => {
    setSelectedRoles(prev => ({
      ...prev,
      [applicationId]: role
    }));
  };

  // Función para formatear el tiempo relativo
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Hace ' + diff + ' seg';
    if (diff < 3600) return 'Hace ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'Hace ' + Math.floor(diff / 3600) + ' h';
    return 'Hace ' + Math.floor(diff / 86400) + ' d';
  };

  // Mapeo de acciones a iconos y colores
  const getActionIcon = (action) => {
    const icons = {
      'user_registered': { icon: UserPlus, bg: 'bg-blue-500/10', color: 'text-blue-500' },
      'user_logged_in': { icon: Users, bg: 'bg-teal-500/10', color: 'text-teal-500' },
      'post_created': { icon: ImageIcon, bg: 'bg-purple-500/10', color: 'text-purple-500' },
      'comment_added': { icon: Activity, bg: 'bg-amber-500/10', color: 'text-amber-500' },
      'reaction_added': { icon: ShieldAlert, bg: 'bg-pink-500/10', color: 'text-pink-500' },
      'content_approved': { icon: CheckCircle2, bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
      'content_rejected': { icon: AlertTriangle, bg: 'bg-red-500/10', color: 'text-red-500' },
    };
    return icons[action] || { icon: Bell, bg: 'bg-gray-500/10', color: 'text-gray-500' };
  };

  if (loading) {
    return (
      <div style={{ '--role-accent': roleAccent }} className="w-full h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[rgb(var(--role-accent))] animate-spin mb-4 md:mb-6" />
        <p className="text-[rgb(var(--role-accent))] font-mono text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.5em] animate-pulse font-black">
          Sincronizando Torre de Control...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-12 animate-in fade-in">
        <div className="bg-red-500/10 border border-red-500/30 p-6 md:p-10 rounded-[30px] md:rounded-[40px] flex flex-col items-center gap-4 md:gap-6 text-red-500">
          <AlertTriangle size={36} className="md:w-12 md:h-12" strokeWidth={1} />
          <p className="font-mono text-[10px] md:text-xs tracking-widest uppercase text-center leading-relaxed">{error}</p>
          <button onClick={fetchDashboard} className="px-6 py-2 md:px-8 md:py-3 bg-red-500 text-white rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95">
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  const activityData = loadingActivity ? [] : recentActivity;
  const chartData = [30, 45, 20, 60, 80, 50, 95];

  return (
    <div style={{ '--role-accent': roleAccent }} className="w-full p-4 md:p-6 lg:p-10 animate-in fade-in duration-700">
      
      <header className="mb-6 md:mb-10 lg:mb-12">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Activity size={12} className="md:w-4 md:h-4 text-[rgb(var(--role-accent))]" strokeWidth={2.5}/>
          <span className="text-[var(--text-body)] font-mono text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] opacity-60">
            Sistemas Activos • Popayán Cultural
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm">
          Centro de <span className="text-[rgb(var(--role-accent))]">Mando</span>
        </h1>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6 mb-8 md:mb-10 lg:mb-12">
        {[
          { label: 'Población Total', val: dashboardData?.kpis?.total_users || 0, icon: Users, color: 'text-blue-500' },
          { label: 'Gremio Verificado', val: dashboardData?.kpis?.verified_creators || 0, icon: ShieldCheck, color: 'text-purple-500' },
          { label: 'Flujo Económico', val: `$${dashboardData?.kpis?.total_revenue || 0}`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Agenda Activa', val: dashboardData?.kpis?.active_events || 0, icon: Calendar, color: 'text-amber-500' }
        ].map((item, i) => (
          <div key={i} className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 shadow-sm hover:border-[rgb(var(--role-accent))]/40 transition-all">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mb-3 md:mb-4 ${item.color} shadow-inner`}>
              <item.icon size={16} className="md:w-5 md:h-5" strokeWidth={1.5} />
            </div>
            <p className="text-[var(--text-body)] font-mono text-[7px] md:text-[8px] lg:text-[9px] font-black uppercase tracking-wider mb-1 opacity-60">{item.label}</p>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-black italic text-[var(--text-heading)] tracking-tighter uppercase">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        
        {/* Columna izquierda - Expedientes */}
        <section className="xl:col-span-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 md:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-[rgb(var(--role-accent))]/10 rounded-xl flex items-center justify-center text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/20 shadow-inner">
                <Gavel size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter">Corte de Curaduría</h2>
                <p className="text-[8px] md:text-[9px] font-mono text-[var(--text-body)] uppercase tracking-widest mt-0.5 opacity-60">Expedientes de ascenso pendientes</p>
              </div>
            </div>
            <span className="px-3 py-1 md:px-4 md:py-1.5 bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] rounded-full font-mono text-[8px] md:text-[9px] font-black tracking-wider uppercase shadow-sm text-center">
              {dashboardData?.pending_applications?.length || 0} Solicitudes Críticas
            </span>
          </div>

          {(!dashboardData?.pending_applications || dashboardData.pending_applications.length === 0) ? (
            <div className="py-12 md:py-16 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-primary)]/50">
              <CheckCircle2 size={32} className="md:w-10 md:h-10 mx-auto text-[var(--text-body)] opacity-10 mb-3" strokeWidth={1}/>
              <h3 className="text-lg md:text-xl font-bold italic text-[var(--text-body)] uppercase tracking-tighter opacity-40">Sistemas Depurados</h3>
              <p className="font-mono text-[8px] md:text-[9px] text-[var(--text-body)] uppercase tracking-widest mt-2 opacity-30">No hay expedientes en cola.</p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-5">
              {dashboardData.pending_applications.map((app) => {
                const currentRole = selectedRoles[app.id] || app.proposed_type || 'artist';
                return (
                  <div key={app.id} className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row gap-4 items-start hover:border-[rgb(var(--role-accent))]/40 transition-all group">
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                      <div className="relative shrink-0">
                        <img 
                          src={app.user?.profile_picture ? (app.user.profile_picture.startsWith('http') ? app.user.profile_picture : `${window.location.origin}${app.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(app.user?.name || 'U')}&background=050505&color=fff&bold=true`} 
                          alt="avatar" 
                          className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-[var(--border-color)] object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-[rgb(var(--role-accent))] rounded-md p-0.5 border border-[var(--bg-primary)]">
                          <Briefcase size={6} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-[var(--text-heading)] italic uppercase tracking-tighter truncate">{app.user?.name || 'Usuario Anónimo'}</h3>
                        <p className="text-[var(--text-body)] font-mono text-[7px] md:text-[8px] uppercase tracking-wider opacity-60 truncate">{app.user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[var(--text-heading)]/5 border border-[var(--border-color)] text-[var(--text-body)] rounded-md text-[6px] md:text-[7px] font-bold uppercase tracking-wider">
                          Aspira a: {app.proposed_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 text-xs md:text-sm text-[var(--text-body)]">
                      <p className="text-[10px] md:text-xs italic leading-relaxed opacity-80 line-clamp-2">{app.message || 'Sin mensaje de presentación.'}</p>
                      {app.portfolio_url && (
                        <a 
                          href={app.portfolio_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 mt-2 text-[rgb(var(--role-accent))] hover:text-white font-mono text-[7px] md:text-[8px] font-black uppercase tracking-wider transition-all bg-[rgb(var(--role-accent))]/10 hover:bg-[rgb(var(--role-accent))] px-3 py-1.5 rounded-lg border border-[rgb(var(--role-accent))]/20"
                        >
                          <ExternalLink size={10} /> Inspeccionar
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:items-end">
                      {/* Selector de roles */}
                      <div className="relative">
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(app.id, e.target.value)}
                          className="w-full lg:w-36 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all appearance-none cursor-pointer shadow-sm"
                        >
                          {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-body)]">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                          </svg>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleApprove(app.id)}
                        disabled={processingId === app.id}
                        className="w-full lg:w-36 py-2 md:py-2.5 bg-[rgb(var(--role-accent))] text-white rounded-xl font-black text-[7px] md:text-[8px] uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                      >
                        {processingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle2 size={12} /> Aprobar</>}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Columna derecha - Inteligencia */}
        <div className="space-y-5 md:space-y-6">
          {/* Gráfico */}
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[rgb(var(--role-accent))]/10 flex items-center justify-center border border-[rgb(var(--role-accent))]/20 shadow-inner">
                  <TrendingUp size={12} className="text-[rgb(var(--role-accent))]" />
                </div>
                <div>
                  <h4 className="text-xs md:text-sm font-bold italic uppercase tracking-tight text-[var(--text-heading)]">Tráfico de Red</h4>
                  <p className="text-[6px] md:text-[7px] font-mono text-[var(--text-body)] uppercase tracking-wider opacity-60">Últimos 7 días</p>
                </div>
              </div>
              <span className="text-emerald-500 font-mono text-[8px] md:text-[9px] font-black tracking-wider">+12%</span>
            </div>
            
            <div className="h-20 md:h-24 flex items-end justify-between gap-1 pt-3 border-b border-[var(--border-color)]">
              {chartData.map((val, idx) => (
                <div key={idx} className="w-full relative group">
                  <div 
                    className="w-full bg-[rgb(var(--role-accent))]/20 rounded-t-sm group-hover:bg-[rgb(var(--role-accent))] transition-all duration-300" 
                    style={{ height: `${val * 0.8}%` }}
                  ></div>
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[var(--text-heading)] text-[var(--bg-primary)] px-1 py-0.5 rounded text-[5px] font-black opacity-0 group-hover:opacity-100 transition-opacity">
                    {val}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[5px] md:text-[6px] font-mono text-[var(--text-body)] opacity-40 uppercase">
              <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
            </div>
          </div>

          {/* Radar de Sucesos (con datos reales) */}
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[var(--text-heading)]/5 flex items-center justify-center border border-[var(--border-color)] shadow-inner">
                <Bell size={12} className="text-[var(--text-body)]" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold italic uppercase tracking-tight text-[var(--text-heading)]">Radar de Sucesos</h4>
                <p className="text-[6px] md:text-[7px] font-mono text-[var(--text-body)] uppercase tracking-wider opacity-60">Monitoreo en Vivo</p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--text-heading)]/10">
              {loadingActivity ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-[rgb(var(--role-accent))]" />
                </div>
              ) : activityData.length === 0 ? (
                <div className="text-center py-4 text-[var(--text-body)] text-[10px] font-mono">
                  No hay actividad reciente
                </div>
              ) : (
                activityData.map((log) => {
                  const actionInfo = getActionIcon(log.action);
                  const IconComp = actionInfo.icon;
                  return (
                    <div key={log.id} className="flex gap-2 p-2 rounded-lg bg-[var(--bg-primary)]/50 border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 transition-all">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${actionInfo.bg}`}>
                        <IconComp size={12} className={`md:w-3.5 md:h-3.5 ${actionInfo.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] md:text-[10px] font-medium text-[var(--text-heading)] truncate">{log.description}</p>
                        <p className="text-[6px] md:text-[7px] font-mono text-[var(--text-body)] uppercase tracking-wider opacity-50">
                          {timeAgo(log.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button 
              onClick={() => { fetchRecentActivity(); }} 
              className="w-full mt-4 py-2 border border-[var(--border-color)] rounded-lg text-[6px] md:text-[7px] font-black text-[var(--text-body)] uppercase tracking-wider hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)] transition-all flex items-center justify-center gap-1"
            >
              <Activity size={10} /> Actualizar
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