import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, Ticket, MapPin, Users, 
  PlusCircle, Search, Clock, ChevronRight,
  TrendingUp, Calendar, DollarSign, Loader2, AlertCircle
} from 'lucide-react';

const ManagerDashboard = ({ user, setSeccionActiva }) => {
  // 1. Estados Reactivos para los Datos Reales
  const [stats, setStats] = useState({
    metrics: { active_events_month: 0, total_rsvps: 0, estimated_revenue: 0 },
    upcoming_events: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. El Cerebro (Consumo de la API)
  useEffect(() => {
    const fetchManagerStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token'); 
        if (!token) throw new Error("No hay token de sesión");

        const response = await fetch('http://localhost:8000/api/v1/manager/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error("Error al obtener estadísticas");
        
        const json = await response.json();
        if (json.status === 'success') {
          setStats(json.data);
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
    // CONTENEDOR MAESTRO: Alineación fluida, sin mx-auto, padding controlado
    <div className="p-8 lg:p-12 w-full animate-in fade-in zoom-in-95 duration-700">
      
      {/* HEADER DE GESTIÓN */}
      <header className="mb-10 max-w-[1400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
              Centro de <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Mando</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-emerald-500/50 pl-4">
              Operador Logístico: {user?.name}
            </p>
          </div>
          
          <button 
            // 🔥 CORRECCIÓN: Ahora redirige al orquestador (CrearObra), no a la lista.
            onClick={() => setSeccionActiva && setSeccionActiva('crear')}
            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            <PlusCircle size={18} /> Orquestar Evento
          </button>
        </div>
      </header>

      {/* Manejo de Errores Sutil (Estilo Toast Integrado) */}
      {error && (
        <div className="flex items-center gap-4 bg-red-500/5 border border-red-500/20 text-red-400 p-4 rounded-[20px] mb-8 max-w-[1400px] animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={18} className="animate-pulse" />
          <p className="text-[10px] font-mono tracking-widest uppercase">{error}</p>
        </div>
      )}

      {/* GRID PRINCIPAL: Alineado a la izquierda, expandible hasta 1400px */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-[1400px]">
        
        {/* COLUMNA IZQUIERDA: Métricas y Agenda (66%) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Dashboard de Métricas Rápidas (Bento Cards Reales) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tarjeta 1: Eventos Activos */}
            <div className="bg-[#111113] p-6 rounded-[32px] border border-white/5 group hover:border-emerald-500/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 backdrop-blur-sm group-hover:border-emerald-500/30 transition-colors">
                  <Calendar className="text-emerald-500" size={18} />
                </div>
                <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">ESTE MES</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                  {isLoading ? <Loader2 className="animate-spin text-emerald-500 opacity-50" /> : stats.metrics.active_events_month}
                </h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Eventos Activos</p>
              </div>
            </div>

            {/* Tarjeta 2: RSVPs Totales (Unificada a paleta Teal/Esmeralda) */}
            <div className="bg-[#111113] p-6 rounded-[32px] border border-white/5 group hover:border-teal-500/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-teal-500/20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 backdrop-blur-sm group-hover:border-teal-500/30 transition-colors">
                  <Users className="text-teal-500" size={18} />
                </div>
                <TrendingUp className="text-teal-500/40" size={16} />
              </div>
              <div className="relative z-10">
                <h4 className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                  {isLoading ? <Loader2 className="animate-spin text-teal-500 opacity-50" /> : stats.metrics.total_rsvps}
                </h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">RSVPs Totales</p>
              </div>
            </div>

            {/* Tarjeta 3: Recaudación (Mantiene Ámbar por convención de dinero) */}
            <div className="bg-[#111113] p-6 rounded-[32px] border border-white/5 group hover:border-amber-500/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5 backdrop-blur-sm group-hover:border-amber-500/30 transition-colors">
                  <Ticket className="text-amber-500" size={18} />
                </div>
                <DollarSign className="text-amber-500/40" size={16} />
              </div>
              <div className="relative z-10">
                <h4 className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                  {isLoading ? <Loader2 className="animate-spin text-amber-500 opacity-50" /> : `$${stats.metrics.estimated_revenue.toLocaleString('es-CO')}`}
                </h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">Recaudación Estimada</p>
              </div>
            </div>
          </div>

          {/* Lista de Eventos Recientes */}
          <div className="bg-[#111113] rounded-[32px] border border-white/5 p-8 relative overflow-hidden shadow-xl">
            {/* Glow sutil de fondo */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-lg font-black text-white uppercase italic flex items-center gap-3 drop-shadow-md">
                  <Clock size={18} className="text-emerald-500"/> Próximos en Agenda
                </h3>
                <button 
                  onClick={() => setSeccionActiva && setSeccionActiva('eventos')}
                  className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70 hover:text-emerald-400 transition-colors border-b border-emerald-500/30 pb-1"
                >
                    Ver Todo
                </button>
            </div>
            
            <div className="space-y-3 relative z-10">
              {isLoading ? (
                // Skeletons de Carga
                [1, 2].map((i) => (
                  <div key={i} className="flex items-center p-4 bg-white/[0.02] border border-white/5 rounded-[20px] animate-pulse">
                     <div className="w-12 h-12 rounded-[14px] bg-white/5 mr-5"></div>
                     <div className="space-y-2 flex-1">
                        <div className="h-4 bg-white/10 rounded w-1/3"></div>
                        <div className="h-3 bg-white/5 rounded w-1/4"></div>
                     </div>
                  </div>
                ))
              ) : stats.upcoming_events.length === 0 ? (
                // Estado Vacío Mejorado Visualmente
                <div 
                  onClick={() => setSeccionActiva && setSeccionActiva('eventos')}
                  className="flex flex-col items-center justify-center py-12 bg-white/[0.01] rounded-[24px] border border-dashed border-white/10 group hover:border-emerald-500/30 transition-colors cursor-pointer"
                >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all duration-500">
                      <CalendarRange className="text-gray-500 group-hover:text-emerald-500 transition-colors" size={24}/>
                    </div>
                    <p className="text-white text-sm font-bold tracking-tight">Sin eventos en radar</p>
                    <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-2 text-center max-w-[250px]">
                      El escenario está libre. Comienza a orquestar tu próxima experiencia.
                    </p>
                </div>
              ) : (
                // Renderizado Real de Eventos
                stats.upcoming_events.map((event) => {
                    const eventDate = new Date(event.start_date);
                    const month = eventDate.toLocaleString('es-ES', { month: 'short' });
                    const day = eventDate.getDate();

                    return (
                        <div key={event.id} onClick={() => setSeccionActiva && setSeccionActiva('eventos')} className="flex items-center justify-between p-4 bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 rounded-[20px] hover:border-emerald-500/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer group">
                          <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-[14px] bg-black/50 flex flex-col items-center justify-center border border-white/10 backdrop-blur-sm group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-colors shadow-inner">
                                  <span className="text-[9px] font-black text-emerald-500 uppercase leading-none mb-1">{month}</span>
                                  <span className="text-lg font-black text-white leading-none">{day}</span>
                              </div>
                              <div>
                                  <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors truncate max-w-[180px] md:max-w-[250px]">
                                    {event.title}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-1 font-mono">
                                      <MapPin size={10} className="text-emerald-500/50"/> {event.location_name}
                                  </p>
                              </div>
                          </div>
                          <div className="flex items-center gap-5">
                              <div className="hidden md:flex flex-col items-end">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Aforo</span>
                                  <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    {event.max_capacity - event.available_slots} / {event.max_capacity}
                                  </span>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:translate-x-1 transition-all">
                                <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-400" />
                              </div>
                          </div>
                        </div>
                    );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Herramientas Operativas Rápidas (33%) */}
        <div className="space-y-6">
          
          {/* Herramienta 1: Escáner QR (El Grito Verde Apagado - Dark Modern) */}
          <div 
            onClick={() => setSeccionActiva && setSeccionActiva('escaner_qr')} 
            className="bg-[#111113] border border-white/5 hover:border-emerald-500/50 rounded-[32px] p-8 group cursor-pointer hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-500 relative overflow-hidden"
          >
            {/* Glow Dinámico Hover */}
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/0 via-emerald-500/5 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            <div className="absolute right-[-10px] top-[-10px] opacity-[0.02] group-hover:opacity-10 transform group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700">
                <Search size={140} strokeWidth={1} />
            </div>
            
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
                <div className="w-14 h-14 bg-black/50 backdrop-blur-md rounded-[16px] flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-500">
                    <Search size={24} className="text-emerald-500" />
                </div>
                <div className="mt-8">
                  <h4 className="text-3xl font-black uppercase italic text-white leading-none tracking-tighter drop-shadow-md">
                    Escáner<br/><span className="text-emerald-500">Accesos</span>
                  </h4>
                  <p className="text-[9px] font-mono mt-3 font-bold uppercase tracking-widest text-gray-500 group-hover:text-emerald-400/80 transition-colors">Validar Entradas en puerta</p>
                </div>
            </div>
          </div>

          {/* Herramienta 2: Acceso a Ventas */}
          <div 
            onClick={() => setSeccionActiva && setSeccionActiva('ventas')} 
            className="bg-[#111113] border border-white/5 hover:border-teal-500/30 rounded-[32px] p-8 group cursor-pointer hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-teal-500/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex items-center gap-5">
                <div className="w-12 h-12 bg-black/50 rounded-[14px] flex items-center justify-center border border-white/10 backdrop-blur-sm group-hover:border-teal-500/40 group-hover:bg-teal-500/10 transition-colors shadow-inner">
                    <Ticket size={20} className="text-teal-500" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase italic text-white leading-none tracking-tighter drop-shadow-md">Mis Ventas</h4>
                  <p className="text-[8px] font-mono mt-1.5 font-bold uppercase tracking-widest text-gray-500">Gestión P2P</p>
                </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;