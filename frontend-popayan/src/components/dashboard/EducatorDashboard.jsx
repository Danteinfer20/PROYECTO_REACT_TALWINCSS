import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Users, Heart, PlusCircle, 
  Video, FileText, ChevronRight, Activity,
  Award, Loader2
} from 'lucide-react';

const EducatorDashboard = ({ user, seccionActiva, setSeccionActiva }) => {
  const [stats, setStats] = useState({ routes: 0, views: 0, saved: 0 });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Simulación de carga de métricas (Se conectará a tu API real)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // Aquí consumiríamos el endpoint de educación
        const response = await axios.get(`${API_URL}/education?dashboard=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.status === 'success') {
          const contents = response.data.data;
          setRecentContent(contents.slice(0, 4)); // Últimos 4
          
          // Calculamos métricas básicas
          const totalViews = contents.reduce((acc, curr) => acc + (curr.stats?.views || 0), 0);
          const totalSaved = contents.reduce((acc, curr) => acc + (curr.stats?.favorites || 0), 0);
          
          setStats({
            routes: contents.length,
            views: totalViews,
            saved: totalSaved
          });
        }
      } catch (error) {
        console.error("Error cargando el aula:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 lg:p-12 w-full animate-in fade-in zoom-in-95 duration-700">
      
      {/* 🟠 HEADER ÁMBAR */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></span>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-amber-500/60">Aula Virtual Activa</span>
        </div>
        <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white">
          Mi <span className="text-amber-500">Aula</span>
        </h2>
        <p className="text-gray-500 text-[11px] font-mono uppercase tracking-[0.2em] mt-3">
          Bienvenido, Maestro {user?.name.split(' ')[0]}.
        </p>
      </header>

      {/* 📊 BENTO GRID DE MÉTRICAS (IMPACTO ACADÉMICO) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#111113] border border-amber-500/20 p-8 rounded-[40px] relative overflow-hidden group hover:border-amber-500/40 transition-colors duration-500">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">Material Didáctico</span>
              <h3 className="text-5xl font-black text-white font-mono">{loading ? '-' : stats.routes}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#111113] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group hover:border-amber-500/20 transition-colors duration-500">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">Impacto (Lecturas)</span>
              <h3 className="text-5xl font-black text-white font-mono">{loading ? '-' : stats.views}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[#111113] border border-white/5 p-8 rounded-[40px] relative overflow-hidden group hover:border-amber-500/20 transition-colors duration-500">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-2">Guardados por Alumnos</span>
              <h3 className="text-5xl font-black text-white font-mono">{loading ? '-' : stats.saved}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
              <Heart size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 📚 ÚLTIMAS RUTAS EDUCATIVAS */}
        <div className="xl:col-span-2 bg-[#111113] border border-white/5 rounded-[45px] p-8 lg:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Últimos Módulos</h3>
            <button onClick={() => setSeccionActiva('rutas')} className="text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 flex items-center gap-1">
              Ver Todo <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-20">
               <Loader2 className="animate-spin text-amber-500" size={32} />
             </div>
          ) : recentContent.length > 0 ? (
            <div className="space-y-4">
              {recentContent.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] border border-white/5 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 overflow-hidden flex-shrink-0">
                      {item.cover_image ? (
                         <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-amber-500/50"><FileText size={20} /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1 opacity-60">
                        <span className="text-[9px] font-mono text-gray-400 uppercase">{item.difficulty_level}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-[9px] font-mono text-gray-400 uppercase">{item.estimated_read_time} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono"><Users size={12}/> {item.stats?.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-black/20 rounded-[30px] border border-white/5 border-dashed">
              <BookOpen size={40} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">El aula está vacía</p>
              <p className="text-gray-600 text-[10px] font-mono mt-2 uppercase">Comienza a forjar tu primera ruta de aprendizaje.</p>
            </div>
          )}
        </div>

        {/* ⚡ ACCIONES RÁPIDAS */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-amber-500/20 to-[#111113] border border-amber-500/30 rounded-[40px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full"></div>
            <Award className="text-amber-500 mb-6 relative z-10" size={32} />
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter mb-2 relative z-10">Forjar Ruta</h3>
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-8 leading-relaxed relative z-10">
              Crea nuevo material didáctico, define objetivos y compártelo con Popayán.
            </p>
            <button 
              // 🔥 Aquí conectaremos el componente de Creación en la Fase 3
              onClick={() => setSeccionActiva('crear_ruta')} 
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-10 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <PlusCircle size={16} /> Crear Material
            </button>
          </div>

          <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8">
            <h3 className="text-sm font-black uppercase text-gray-500 tracking-[0.2em] mb-6">Herramientas</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setSeccionActiva('rutas')}
                className="w-full p-4 rounded-[20px] bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all flex items-center gap-4 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-gray-400 group-hover:text-amber-500 transition-colors">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-white uppercase tracking-widest">Mis Guías</span>
                  <span className="text-[9px] font-mono text-gray-600">Gestionar inventario</span>
                </div>
              </button>
              
              <button 
                className="w-full p-4 rounded-[20px] bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all flex items-center gap-4 text-left group opacity-50 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-gray-400 group-hover:text-amber-500 transition-colors">
                  <Video size={18} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-white uppercase tracking-widest">Videoteca</span>
                  <span className="text-[9px] font-mono text-gray-600">Próximamente</span>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EducatorDashboard;