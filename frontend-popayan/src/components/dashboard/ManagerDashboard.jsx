import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, Ticket, MapPin, Users, 
  PlusCircle, Search, Clock, ChevronRight,
  TrendingUp, Calendar, DollarSign, Loader2, AlertCircle
} from 'lucide-react';
import api from '../../services/api';// ✅ Importar la instancia de axios

const ManagerDashboard = ({ user, setSeccionActiva }) => {
  const [stats, setStats] = useState({
    metrics: { active_events_month: 0, total_rsvps: 0, estimated_revenue: 0 },
    upcoming_events: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagerStats = async () => {
      setIsLoading(true);
      try {
        // ✅ Usar api en lugar de fetch con localhost
        const response = await api.get('/manager/dashboard');
        if (response.data.status === 'success') {
          setStats(response.data.data);
        } else {
          throw new Error('Error al obtener estadísticas');
        }
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("Desconexión temporal con la red neural. Reintentando...");
      } finally {
        setIsLoading(false);
      }
    };
    fetchManagerStats();
  }, []);

  return (
    <div className="p-4 md:p-8 lg:p-12 w-full animate-in fade-in zoom-in-95 duration-700 transition-colors">
      
      {/* HEADER */}
      <header className="mb-6 md:mb-10 max-w-[1400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm">
              Centro de <span className="text-[rgb(var(--role-accent))] drop-shadow-[0_0_10px_rgba(var(--role-accent),0.3)]">Mando</span>
            </h1>
            <p className="text-[var(--text-body)] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-2 border-l-2 border-[rgb(var(--role-accent))]/50 pl-3 md:pl-4">
              Operador Logístico: {user?.name}
            </p>
          </div>
          <button 
            onClick={() => setSeccionActiva && setSeccionActiva('crear')}
            className="flex items-center justify-center gap-2 md:gap-3 bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] px-5 py-2.5 md:px-8 md:py-4 rounded-[20px] font-black text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all shadow-[0_0_10px_rgba(var(--role-accent),0.1)] hover:shadow-[0_0_20px_rgba(var(--role-accent),0.4)] active:scale-95"
          >
            <PlusCircle size={16} className="md:w-5 md:h-5" /> Orquestar Evento
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-3 md:gap-4 bg-red-500/5 border border-red-500/20 text-red-500 p-3 md:p-4 rounded-[20px] mb-6 md:mb-8 max-w-[1400px]">
          <AlertCircle size={16} className="animate-pulse" />
          <p className="text-[9px] md:text-[10px] font-mono tracking-widest uppercase">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1400px]">
        
        {/* Columna Izquierda (2/3) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          
          {/* Tarjetas de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {/* Eventos Activos */}
            <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-[28px] md:rounded-[32px] border border-[var(--border-color)] group hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[120px] md:min-h-[140px] shadow-sm hover:shadow-[0_10px_20px_rgba(var(--glass-shadow))]">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-[rgb(var(--role-accent))]/10 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 transition-all group-hover:bg-[rgb(var(--role-accent))]/20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-[var(--bg-primary)] p-1.5 md:p-2 rounded-xl border border-[var(--border-color)]">
                  <Calendar className="text-[rgb(var(--role-accent))]" size={14} md:w-5 md:h-5 />
                </div>
                <span className="text-[6px] md:text-[8px] font-black text-[rgb(var(--role-accent))] bg-[rgb(var(--role-accent))]/10 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full uppercase tracking-widest border border-[rgb(var(--role-accent))]/20">ESTE MES</span>
              </div>
              <div className="relative z-10 mt-2 md:mt-0">
                <h4 className="text-2xl md:text-4xl font-black text-[var(--text-heading)] font-mono tracking-tighter">
                  {isLoading ? <Loader2 className="animate-spin text-[rgb(var(--role-accent))] opacity-50 w-5 h-5 md:w-auto md:h-auto" /> : stats.metrics.active_events_month}
                </h4>
                <p className="text-[8px] md:text-[9px] text-[var(--text-body)] font-bold uppercase tracking-widest mt-1">Eventos Activos</p>
              </div>
            </div>

            {/* RSVPs Totales */}
            <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-[28px] md:rounded-[32px] border border-[var(--border-color)] group hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[120px] md:min-h-[140px] shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-[rgb(var(--role-accent))]/10 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 transition-all group-hover:bg-[rgb(var(--role-accent))]/20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-[var(--bg-primary)] p-1.5 md:p-2 rounded-xl border border-[var(--border-color)]">
                  <Users className="text-[rgb(var(--role-accent))]" size={14} md:w-5 md:h-5 />
                </div>
                <TrendingUp className="text-[rgb(var(--role-accent))]/40" size={12} md:w-4 md:h-4 />
              </div>
              <div className="relative z-10 mt-2 md:mt-0">
                <h4 className="text-2xl md:text-4xl font-black text-[var(--text-heading)] font-mono tracking-tighter">
                  {isLoading ? <Loader2 className="animate-spin text-[rgb(var(--role-accent))] opacity-50 w-5 h-5 md:w-auto md:h-auto" /> : stats.metrics.total_rsvps}
                </h4>
                <p className="text-[8px] md:text-[9px] text-[var(--text-body)] font-bold uppercase tracking-widest mt-1">RSVPs Totales</p>
              </div>
            </div>

            {/* Recaudación Estimada */}
            <div className="bg-[var(--bg-card)] p-4 md:p-6 rounded-[28px] md:rounded-[32px] border border-[var(--border-color)] group hover:border-amber-500/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between min-h-[120px] md:min-h-[140px] shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-500/10 rounded-full blur-[30px] md:blur-[40px] -mr-8 -mt-8 transition-all group-hover:bg-amber-500/20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-[var(--bg-primary)] p-1.5 md:p-2 rounded-xl border border-[var(--border-color)]">
                  <Ticket className="text-amber-500" size={14} md:w-5 md:h-5 />
                </div>
                <DollarSign className="text-amber-500/40" size={12} md:w-4 md:h-4 />
              </div>
              <div className="relative z-10 mt-2 md:mt-0">
                <h4 className="text-xl md:text-3xl font-black text-[var(--text-heading)] font-mono tracking-tighter">
                  {isLoading ? <Loader2 className="animate-spin text-amber-500 opacity-50 w-5 h-5 md:w-auto md:h-auto" /> : `$${stats.metrics.estimated_revenue.toLocaleString('es-CO')}`}
                </h4>
                <p className="text-[8px] md:text-[9px] text-[var(--text-body)] font-bold uppercase tracking-widest mt-1">Recaudación Estimada</p>
              </div>
            </div>
          </div>

          {/* Lista de Eventos */}
          <div className="bg-[var(--bg-container)] rounded-[28px] md:rounded-[32px] border border-[var(--border-color)] p-5 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-20 md:h-24 bg-[rgb(var(--role-accent))]/5 rounded-full blur-[40px] md:blur-[60px] pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4 md:mb-8 relative z-10">
              <h3 className="text-base md:text-lg font-black text-[var(--text-heading)] uppercase italic flex items-center gap-2 md:gap-3">
                <Clock size={14} className="md:w-[18px] md:h-[18px] text-[rgb(var(--role-accent))]"/> Próximos en Agenda
              </h3>
              <button 
                onClick={() => setSeccionActiva && setSeccionActiva('eventos')}
                className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[rgb(var(--role-accent))]/80 hover:text-[rgb(var(--role-accent))] transition-colors border-b border-[rgb(var(--role-accent))]/30 pb-0.5 md:pb-1"
              >
                Ver Todo
              </button>
            </div>
            
            <div className="space-y-2 md:space-y-3 relative z-10">
              {isLoading ? (
                [1, 2].map((i) => (
                  <div key={i} className="flex items-center p-3 md:p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[16px] md:rounded-[20px] animate-pulse">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-[12px] md:rounded-[14px] bg-[var(--bg-card)] mr-4 md:mr-5"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-3 md:h-4 bg-[var(--bg-card)] rounded w-1/3"></div>
                      <div className="h-2 md:h-3 bg-[var(--bg-card)] rounded w-1/4"></div>
                    </div>
                  </div>
                ))
              ) : stats.upcoming_events.length === 0 ? (
                <div 
                  onClick={() => setSeccionActiva && setSeccionActiva('eventos')}
                  className="flex flex-col items-center justify-center py-8 md:py-12 bg-[var(--bg-primary)] rounded-[20px] md:rounded-[24px] border border-dashed border-[var(--border-color)] group hover:border-[rgb(var(--role-accent))]/30 cursor-pointer"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 group-hover:bg-[rgb(var(--role-accent))]/10 transition-all">
                    <CalendarRange className="text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))]" size={20} md:w-6 md:h-6 />
                  </div>
                  <p className="text-[var(--text-heading)] text-xs md:text-sm font-bold tracking-tight">Sin eventos en radar</p>
                  <p className="text-[var(--text-body)] text-[9px] md:text-[10px] font-mono uppercase tracking-widest mt-2 text-center max-w-[200px] md:max-w-[250px]">
                    El escenario está libre. Comienza a orquestar tu próxima experiencia.
                  </p>
                </div>
              ) : (
                stats.upcoming_events.map((event) => {
                  const eventDate = new Date(event.start_date);
                  const month = eventDate.toLocaleString('es-ES', { month: 'short' });
                  const day = eventDate.getDate();
                  return (
                    <div key={event.id} onClick={() => setSeccionActiva && setSeccionActiva('eventos')} className="flex items-center justify-between p-3 md:p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[16px] md:rounded-[20px] hover:border-[rgb(var(--role-accent))]/30 hover:bg-[var(--bg-container)] transition-all cursor-pointer group">
                      <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-[12px] md:rounded-[14px] bg-[var(--bg-primary)] flex flex-col items-center justify-center border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/40 group-hover:bg-[rgb(var(--role-accent))]/10 transition-colors shadow-inner">
                          <span className="text-[7px] md:text-[9px] font-black text-[rgb(var(--role-accent))] uppercase leading-none mb-0.5 md:mb-1">{month}</span>
                          <span className="text-sm md:text-lg font-black text-[var(--text-heading)] leading-none">{day}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[var(--text-heading)] text-xs md:text-sm group-hover:text-[rgb(var(--role-accent))] transition-colors break-words">
                            {event.title}
                          </h4>
                          <p className="text-[9px] md:text-[10px] text-[var(--text-body)] flex items-center gap-1 mt-0.5 md:mt-1 font-mono">
                            <MapPin size={8} className="md:w-2.5 md:h-2.5 text-[rgb(var(--role-accent))]/60"/> {event.location_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-5 ml-2">
                        <div className="hidden sm:flex flex-col items-end">
                          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-[var(--text-body)] mb-0.5">Aforo</span>
                          <span className="text-[9px] md:text-[11px] font-mono text-[rgb(var(--role-accent))] bg-[rgb(var(--role-accent))]/10 px-1.5 py-0.5 md:px-2 rounded border border-[rgb(var(--role-accent))]/20">
                            {event.max_capacity - event.available_slots} / {event.max_capacity}
                          </span>
                        </div>
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[rgb(var(--role-accent))]/20 group-hover:translate-x-1 transition-all">
                          <ChevronRight size={12} className="md:w-4 md:h-4 text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Herramientas */}
        <div className="space-y-4 md:space-y-6">
          
          {/* Escáner QR */}
          <div 
            onClick={() => setSeccionActiva && setSeccionActiva('escaner_qr')} 
            className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/50 rounded-[28px] md:rounded-[32px] p-5 md:p-8 group cursor-pointer hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))] transition-all relative overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-transparent via-[rgb(var(--role-accent))]/5 to-[rgb(var(--role-accent))]/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <div className="absolute right-[-5px] top-[-5px] md:right-[-10px] md:top-[-10px] opacity-[0.05] group-hover:opacity-10 transform group-hover:scale-110 group-hover:-rotate-12 transition-all text-[var(--text-heading)]">
              <Search size={80} className="md:w-[140px] md:h-[140px]" strokeWidth={1} />
            </div>
            <div className="relative z-10 flex flex-col justify-between min-h-[140px] md:min-h-[180px]">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-[var(--bg-primary)] rounded-[14px] md:rounded-[16px] flex items-center justify-center border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 group-hover:shadow-[0_0_15px_rgba(var(--role-accent),0.3)] transition-all shadow-inner">
                <Search size={18} className="md:w-6 md:h-6 text-[rgb(var(--role-accent))]" />
              </div>
              <div className="mt-4 md:mt-8">
                <h4 className="text-2xl md:text-3xl font-black uppercase italic text-[var(--text-heading)] leading-none tracking-tighter">
                  Escáner<br/><span className="text-[rgb(var(--role-accent))]">Accesos</span>
                </h4>
                <p className="text-[8px] md:text-[9px] font-mono mt-2 md:mt-3 font-bold uppercase tracking-widest text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] transition-colors">Validar Entradas en puerta</p>
              </div>
            </div>
          </div>

          {/* Mis Ventas */}
          <div 
            onClick={() => setSeccionActiva && setSeccionActiva('ventas')} 
            className="bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 rounded-[28px] md:rounded-[32px] p-5 md:p-8 group cursor-pointer hover:shadow-[0_10px_20px_rgba(var(--glass-shadow))] transition-all relative overflow-hidden"
          >
            <div className="absolute -bottom-8 -right-8 w-24 h-24 md:w-32 md:h-32 bg-[rgb(var(--role-accent))]/10 rounded-full blur-[30px] md:blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10 flex items-center gap-3 md:gap-5">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[var(--bg-primary)] rounded-[12px] md:rounded-[14px] flex items-center justify-center border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/40 group-hover:bg-[rgb(var(--role-accent))]/10 transition-colors shadow-inner">
                <Ticket size={16} className="md:w-5 md:h-5 text-[rgb(var(--role-accent))]" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-black uppercase italic text-[var(--text-heading)] leading-none tracking-tighter">Mis Ventas</h4>
                <p className="text-[7px] md:text-[8px] font-mono mt-1 font-bold uppercase tracking-widest text-[var(--text-body)]">Gestión P2P</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;