import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Eye, Heart, Image as ImageIcon, Store, 
  PlusCircle, Activity, AlertTriangle, ChevronRight 
} from 'lucide-react';

// 🔥 Importaciones del Taller Creativo
import CrearObra from './CrearObra';
import MisObrasView from './MisObrasView'; 
import MiTiendaView from './MiTiendaView'; 
import GestionVentasView from './GestionVentasView'; // <-- NUEVO

const ArtistDashboard = ({ user, seccionActiva, setSeccionActiva }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🎯 ESTADO MAESTRO DE EDICIÓN
  const [itemParaEditar, setItemParaEditar] = useState(null);

  // 1. Sincronización con el Núcleo (Backend)
  useEffect(() => {
    if (seccionActiva !== 'escritorio') {
        setLoading(false);
        return;
    }

    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/artist/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.status === 'success') {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Error cargando el taller:", err);
        setError("Fallo de sincronización con el núcleo creativo. El servidor no responde.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [seccionActiva]);

  // 🔥 FUNCIÓN DE ENRUTAMIENTO INTERNO
  const handleEditRequest = (item) => {
    setItemParaEditar(item);
    setSeccionActiva('editar');
  };

  // 2. Pantalla de Carga
  if (loading) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center p-20 animate-in fade-in duration-500">
        <div className="w-12 h-12 border-4 border-[#a855f7] border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
        <p className="text-[#a855f7] font-mono text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Preparando Taller Creativo...
        </p>
      </div>
    );
  }

  // 3. Pantalla de Error
  if (error && seccionActiva === 'escritorio') {
    return (
      <div className="p-12 animate-in fade-in">
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-[24px] flex items-center gap-4 text-red-400">
          <AlertTriangle size={24} className="shrink-0" /> 
          <p className="font-mono text-[10px] tracking-widest uppercase">{error}</p>
        </div>
      </div>
    );
  }

  // 4. Extracción Segura de Datos
  const kpis = dashboardData?.kpis || { total_works: 0, followers: 0, sales: 0, revenue: 0 };
  const recentWorks = dashboardData?.recent_works || [];

  return (
    <>
      {/* ============================================================== */}
      {/* 🏛️ VISTA 1: MI TALLER (DASHBOARD PRINCIPAL)                    */}
      {/* ============================================================== */}
      {seccionActiva === 'escritorio' && (
        <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans animate-in fade-in duration-700">
          
          <header className="mb-10 relative">
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] font-mono text-[8px] uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></div> Sincronizado
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight mb-2">
                  Hola, <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">{user?.name?.split(' ')[0]}</span>
                </h1>
                <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
                  Bienvenido a tu cuartel general. Aquí puedes analizar el impacto de tus obras, gestionar tu catálogo y preparar tus próximas creaciones.
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: 'Obras Creadas', val: kpis.total_works, icon: ImageIcon, color: 'text-blue-400' },
              { label: 'Comunidad', val: kpis.followers, icon: Heart, color: 'text-rose-400' },
              { label: 'Ventas en Tienda', val: kpis.sales, icon: Store, color: 'text-emerald-400' },
              { label: 'Recaudación', val: `$${Number(kpis.revenue).toLocaleString('es-CO')}`, icon: Activity, color: 'text-[#a855f7]' }
            ].map((item, i) => (
              <div key={i} className="bg-[#111113] border border-white/5 rounded-[30px] p-8 shadow-lg flex flex-col justify-between hover:border-white/10 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-10 h-10 rounded-[14px] bg-[#0A0A0C] border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110 ${item.color}`}>
                    <item.icon size={18} strokeWidth={1.5} />
                  </div>
                  <Activity size={14} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </div>
                <div>
                  <p className="text-gray-500 font-mono text-[9px] uppercase tracking-[0.2em] mb-1">{item.label}</p>
                  <h3 className="text-3xl font-serif text-white tracking-tighter">{item.val}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-[#111113] border border-white/5 rounded-[30px] p-8 h-full shadow-lg">
                <h3 className="text-white font-serif text-xl italic mb-6">Acciones Rápidas</h3>
                
                <button 
                  onClick={() => setSeccionActiva('crear')}
                  className="w-full mb-4 py-5 bg-[#a855f7] text-white font-mono text-[10px] font-black uppercase tracking-widest rounded-[20px] hover:bg-[#9333ea] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-3"
                >
                  <PlusCircle size={16} /> Subir Nueva Obra
                </button>
                
                <button 
                  onClick={() => setSeccionActiva('tienda')}
                  className="w-full py-5 bg-[#0A0A0C] border border-white/10 text-gray-300 font-mono text-[10px] font-black uppercase tracking-widest rounded-[20px] hover:border-white/30 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-3"
                >
                  <Store size={16} /> Gestionar Tienda
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-[#111113] border border-white/5 rounded-[30px] p-8 min-h-[300px] shadow-lg">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-white font-serif text-xl italic">Últimas Publicaciones</h3>
                  <button 
                    onClick={() => setSeccionActiva('galeria')}
                    className="text-gray-500 hover:text-[#a855f7] transition-colors flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest"
                  >
                    Ver Catálogo <ChevronRight size={12} />
                  </button>
                </div>

                {recentWorks.length === 0 ? (
                  <div className="w-full py-16 border border-dashed border-white/10 rounded-[20px] flex flex-col items-center justify-center text-center bg-[#0A0A0C]/50">
                    <ImageIcon size={32} className="text-white/10 mb-4" strokeWidth={1} />
                    <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                      Aún no hay obras recientes en tu taller.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentWorks.map((work) => (
                      <div key={work.id} className="flex items-center justify-between p-5 bg-[#0A0A0C] border border-white/5 rounded-[20px] hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                            <ImageIcon size={16} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm mb-1">{work.title}</h4>
                            <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                              {new Date(work.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest ${work.status === 'published' ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {work.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 🎨 VISTA 2: CREAR / EDITAR (CONSOLA MAESTRA POLIMÓRFICA)       */}
      {/* ============================================================== */}
      {(seccionActiva === 'crear' || seccionActiva === 'editar') && (
        <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans animate-in fade-in">
          <CrearObra 
             obraExistente={seccionActiva === 'editar' ? itemParaEditar : null}
             onCancel={() => {
                if (itemParaEditar?.isProduct || itemParaEditar?.product_type) {
                    setSeccionActiva('tienda');
                } else {
                    setSeccionActiva('galeria'); 
                }
                setItemParaEditar(null);
             }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 🗂️ VISTA 3: GESTOR DE OBRAS (GALERÍA)                          */}
      {/* ============================================================== */}
      {seccionActiva === 'galeria' && (
        <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans animate-in fade-in">
          <MisObrasView 
             initialTab="published"
             onEditRequest={handleEditRequest} 
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 🛒 VISTA 4: MI TIENDA (POP STORE MANAGER)                      */}
      {/* ============================================================== */}
      {seccionActiva === 'tienda' && (
        <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans animate-in fade-in">
          <MiTiendaView 
             onEditRequest={handleEditRequest} 
             onAddRequest={() => {
                setItemParaEditar(null);
                setSeccionActiva('crear');
             }}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* 📦 VISTA 5: GESTIÓN DE VENTAS P2P                              */}
      {/* ============================================================== */}
      {seccionActiva === 'ventas' && (
        <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans animate-in fade-in">
          <GestionVentasView />
        </div>
      )}
    </>
  );
};

export default ArtistDashboard;