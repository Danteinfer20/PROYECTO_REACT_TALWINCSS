import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, Heart, Image as ImageIcon, Store, 
  PlusCircle, Activity, AlertTriangle, ChevronRight 
} from 'lucide-react';

// 🔥 Importaciones del Taller Creativo
import MisObrasView from './MisObrasView'; 
import MiTiendaView from './MiTiendaView'; 
import GestionVentasView from './GestionVentasView';

const ArtistDashboard = ({ user, seccionActiva, setSeccionActiva }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 MOTOR DE ACENTO PARA ARTISTA (Carmesí)
  const roleAccent = '244 63 94';

  useEffect(() => {
    if (seccionActiva !== 'escritorio') {
        setLoading(false);
        return;
    }

    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        
        const res = await axios.get(`${API_BASE}/artist/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status === 'success') {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Error cargando el taller:", err);
        setError("Fallo de sincronización con el núcleo creativo.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [seccionActiva]);

  const handleEditRequest = (item) => {
    setSeccionActiva('crear', item);
  };

  if (loading) {
    return (
      <div style={{ '--role-accent': roleAccent }} className="w-full h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-[rgb(var(--role-accent))]/20 border-t-[rgb(var(--role-accent))] rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(var(--role-accent),0.4)]"></div>
        <p className="text-[rgb(var(--role-accent))] font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse font-black">
          Sincronizando Taller Creativo...
        </p>
      </div>
    );
  }

  if (error && seccionActiva === 'escritorio') {
    return (
      <div className="p-12 animate-in fade-in transition-colors duration-500">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[30px] flex items-center gap-4 text-red-500">
          <AlertTriangle size={24} className="shrink-0" /> 
          <p className="font-mono text-[10px] tracking-widest uppercase font-black">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || { total_works: 0, followers: 0, sales: 0, revenue: 0 };
  const recentWorks = dashboardData?.recent_works || [];

  return (
    <div style={{ '--role-accent': roleAccent }} className="transition-colors duration-500">
      {/* 🏛️ VISTA: MI TALLER */}
      {seccionActiva === 'escritorio' && (
        <div className="w-full min-h-screen p-6 md:p-12 font-sans animate-in fade-in duration-700">
          
          <header className="mb-10 relative">
            <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-10 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[rgb(var(--role-accent))]/5 rounded-full blur-[120px] pointer-events-none transition-colors duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))] font-mono text-[8px] uppercase tracking-widest font-black">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></div> Artista Verificado
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] mb-2 transition-colors duration-500">
                  Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-heading)] to-[var(--text-body)] opacity-60">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-[var(--text-body)] opacity-60 text-[10px] font-mono uppercase tracking-[0.4em]">Cuartel General del Maestro Artesano</p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Obras Creadas', val: kpis.total_works, icon: ImageIcon, color: 'text-blue-500' },
              { label: 'Comunidad', val: kpis.followers, icon: Heart, color: 'text-rose-500' },
              { label: 'Ventas en Tienda', val: kpis.sales, icon: Store, color: 'text-emerald-500' },
              { label: 'Recaudación', val: `$${Number(kpis.revenue).toLocaleString('es-CO')}`, icon: Activity, color: 'text-[rgb(var(--role-accent))]' }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[30px] p-8 shadow-sm flex flex-col justify-between hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-[18px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center transition-transform group-hover:scale-110 ${item.color} shadow-inner`}>
                    <item.icon size={20} strokeWidth={2} />
                  </div>
                  <Activity size={14} className="text-[var(--text-body)] opacity-5 group-hover:text-[rgb(var(--role-accent))]/20 transition-colors" />
                </div>
                <div>
                  <p className="text-[var(--text-body)] opacity-60 font-mono text-[9px] uppercase tracking-[0.2em] mb-1 font-black">{item.label}</p>
                  <h3 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter italic transition-colors">{item.val}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[30px] p-8 shadow-sm">
                <h3 className="text-[var(--text-heading)] font-bold italic uppercase text-lg tracking-tighter mb-6 transition-colors">Operaciones</h3>
                <button 
                  onClick={() => setSeccionActiva('crear')}
                  className="w-full mb-4 py-5 bg-[rgb(var(--role-accent))] text-white font-black text-[10px] uppercase tracking-widest rounded-[22px] hover:opacity-90 hover:shadow-[0_10px_20px_rgba(var(--role-accent),0.3)] transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <PlusCircle size={16} /> Subir Nueva Obra
                </button>
                <button 
                  onClick={() => setSeccionActiva('tienda')}
                  className="w-full py-5 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-body)] font-black text-[10px] uppercase tracking-widest rounded-[22px] hover:text-[var(--text-heading)] hover:bg-[var(--bg-container)] transition-all flex items-center justify-center gap-3 shadow-inner active:scale-95"
                >
                  <Store size={16} /> Mi Tienda Pop
                </button>
            </div>

            <div className="lg:col-span-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[30px] p-8 shadow-sm transition-colors duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[var(--text-heading)] font-bold italic uppercase text-lg tracking-tighter">Últimos Movimientos</h3>
                  <button 
                    onClick={() => setSeccionActiva('galeria')}
                    className="text-[rgb(var(--role-accent))] hover:opacity-80 transition-colors flex items-center gap-2 font-black text-[9px] uppercase tracking-widest"
                  >
                    CATÁLOGO COMPLETO <ChevronRight size={12} />
                  </button>
                </div>

                {recentWorks.length === 0 ? (
                  <div className="w-full py-16 border border-dashed border-[var(--border-color)] rounded-[25px] flex flex-col items-center justify-center bg-[var(--bg-primary)]/50 transition-colors">
                    <ImageIcon size={32} className="text-[var(--text-body)] opacity-10 mb-4" />
                    <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest font-bold opacity-40">Sin registros recientes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentWorks.map((work) => (
                      <div key={work.id} className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[22px] hover:border-[rgb(var(--role-accent))]/30 transition-colors shadow-inner">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-container)] border border-[var(--border-color)] flex items-center justify-center text-[rgb(var(--role-accent))] shadow-sm"><ImageIcon size={14} /></div>
                          <div>
                            <h4 className="text-[var(--text-heading)] font-bold text-[10px] uppercase italic tracking-tighter transition-colors">{work.title}</h4>
                            <p className="text-[var(--text-body)] font-mono text-[8px] uppercase mt-0.5 opacity-50">{new Date(work.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border transition-colors ${work.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {work.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ VISTAS DINÁMICAS (SECCIÓN ACTIVA) */}
      {seccionActiva === 'galeria' && (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] p-6 md:p-12 animate-in fade-in duration-500">
          <MisObrasView initialTab="published" onEditRequest={handleEditRequest} />
        </div>
      )}

      {seccionActiva === 'tienda' && (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] p-6 md:p-12 animate-in fade-in duration-500">
          <MiTiendaView onEditRequest={handleEditRequest} onAddRequest={() => setSeccionActiva('crear')} />
        </div>
      )}

      {seccionActiva === 'ventas' && (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] p-6 md:p-12 animate-in fade-in duration-500">
          <GestionVentasView />
        </div>
      )}
    </div>
  );
};

export default ArtistDashboard;