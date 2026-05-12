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

  // 🔥 MOTOR DE ACENTO PARA EDUCADOR (Ámbar)
  const roleAccent = '245 158 11'; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/education?dashboard=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.status === 'success') {
          const contents = response.data.data;
          setRecentContent(contents.slice(0, 4));
          
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
  }, [API_URL]);

  return (
    // 🔥 INYECCIÓN DE ÁMBITO Y TRANSICIÓN DE FONDO
    <div style={{ '--role-accent': roleAccent }} className="p-8 lg:p-12 w-full animate-in fade-in zoom-in-95 duration-700 transition-colors duration-500">
      
      {/* 🟠 HEADER ÁMBAR DINÁMICO */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.6)]"></span>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[rgb(var(--role-accent))]/60">Aula Virtual Activa</span>
        </div>
        <h2 className="text-5xl lg:text-6xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] transition-colors">
          Mi <span className="text-[rgb(var(--role-accent))]">Aula</span>
        </h2>
        <p className="text-[var(--text-body)] text-[11px] font-mono uppercase tracking-[0.2em] mt-3 transition-colors opacity-70">
          Bienvenido, Maestro {user?.name.split(' ')[0]}.
        </p>
      </header>

      {/* 📊 BENTO GRID DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--bg-container)] border border-[rgb(var(--role-accent))]/20 p-8 rounded-[40px] relative overflow-hidden group hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 shadow-sm">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-[rgb(var(--role-accent))]/5 rounded-full blur-2xl group-hover:bg-[rgb(var(--role-accent))]/10 transition-colors"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.3em] block mb-2">Material Didáctico</span>
              <h3 className="text-5xl font-black text-[var(--text-heading)] font-mono transition-colors">{loading ? '-' : stats.routes}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center text-[rgb(var(--role-accent))] shadow-inner">
              <BookOpen size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-container)] border border-[var(--border-color)] p-8 rounded-[40px] relative overflow-hidden group hover:border-[rgb(var(--role-accent))]/20 transition-all duration-500 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.3em] block mb-2">Impacto (Lecturas)</span>
              <h3 className="text-5xl font-black text-[var(--text-heading)] font-mono transition-colors">{loading ? '-' : stats.views}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--text-heading)]/5 flex items-center justify-center text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] group-hover:bg-[rgb(var(--role-accent))]/10 transition-all">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-container)] border border-[var(--border-color)] p-8 rounded-[40px] relative overflow-hidden group hover:border-[rgb(var(--role-accent))]/20 transition-all duration-500 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.3em] block mb-2">Guardados</span>
              <h3 className="text-5xl font-black text-[var(--text-heading)] font-mono transition-colors">{loading ? '-' : stats.saved}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[var(--text-heading)]/5 flex items-center justify-center text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] group-hover:bg-[rgb(var(--role-accent))]/10 transition-all">
              <Heart size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* 📚 ÚLTIMAS RUTAS EDUCATIVAS */}
        <div className="xl:col-span-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[45px] p-8 lg:p-10 shadow-sm transition-colors duration-500">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[var(--border-color)]">
            <h3 className="text-xl font-bold italic uppercase text-[var(--text-heading)] tracking-tighter transition-colors">Últimos Módulos</h3>
            <button onClick={() => setSeccionActiva('rutas')} className="text-[10px] font-black text-[rgb(var(--role-accent))] uppercase tracking-widest hover:opacity-80 flex items-center gap-1 transition-all">
              Ver Todo <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-20">
               <Loader2 className="animate-spin text-[rgb(var(--role-accent))]" size={32} />
             </div>
          ) : recentContent.length > 0 ? (
            <div className="space-y-4">
              {recentContent.map((item) => (
                <div key={item.id} className="group flex items-center justify-between p-5 rounded-[24px] bg-[var(--bg-primary)]/50 border border-[var(--border-color)] hover:bg-[rgb(var(--role-accent))]/5 hover:border-[rgb(var(--role-accent))]/20 transition-all cursor-pointer shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-container)] border border-[var(--border-color)] overflow-hidden flex-shrink-0 shadow-inner">
                      {item.cover_image ? (
                         <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-[rgb(var(--role-accent))]/50"><FileText size={20} /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1 opacity-60">
                        <span className="text-[9px] font-mono text-[var(--text-body)] uppercase">{item.difficulty_level}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                        <span className="text-[9px] font-mono text-[var(--text-body)] uppercase">{item.estimated_read_time} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-[var(--text-body)] opacity-50">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono"><Users size={12}/> {item.stats?.views || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[var(--bg-primary)]/20 rounded-[30px] border border-[var(--border-color)] border-dashed transition-colors">
              <BookOpen size={40} className="mx-auto text-[var(--text-body)] opacity-20 mb-4" />
              <p className="text-[var(--text-body)] text-sm font-bold uppercase tracking-widest opacity-40">El aula está vacía</p>
              <p className="text-[var(--text-body)] text-[10px] font-mono mt-2 uppercase opacity-40">Comienza a forjar tu primera ruta de aprendizaje.</p>
            </div>
          )}
        </div>

        {/* ⚡ ACCIONES RÁPIDAS */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-[rgb(var(--role-accent))]/10 to-[var(--bg-container)] border border-[rgb(var(--role-accent))]/20 rounded-[40px] p-8 relative overflow-hidden transition-colors shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[rgb(var(--role-accent))]/10 blur-3xl rounded-full"></div>
            <Award className="text-[rgb(var(--role-accent))] mb-6 relative z-10" size={32} />
            <h3 className="text-2xl font-bold italic uppercase text-[var(--text-heading)] tracking-tighter mb-2 relative z-10 transition-colors">Forjar Ruta</h3>
            <p className="text-[10px] font-mono text-[var(--text-body)] uppercase tracking-widest mb-8 leading-relaxed relative z-10 opacity-70">
              Crea nuevo material didáctico, define objetivos y compártelo con Popayán.
            </p>
            <button 
              onClick={() => setSeccionActiva('crear_ruta')} 
              className="w-full py-4 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 relative z-10 shadow-[0_10px_20px_rgba(var(--role-accent),0.3)] active:scale-95"
            >
              <PlusCircle size={16} /> Crear Material
            </button>
          </div>

          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm transition-colors duration-500">
            <h3 className="text-sm font-black uppercase text-[var(--text-body)] opacity-40 tracking-[0.2em] mb-6">Herramientas</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setSeccionActiva('rutas')}
                className="w-full p-4 rounded-[20px] bg-[var(--text-heading)]/5 border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 hover:bg-[rgb(var(--role-accent))]/5 transition-all flex items-center gap-4 text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] transition-colors shadow-inner">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-widest transition-colors">Mis Guías</span>
                  <span className="text-[9px] font-mono text-[var(--text-body)] opacity-50">Gestionar inventario</span>
                </div>
              </button>
              
              <button 
                className="w-full p-4 rounded-[20px] bg-[var(--text-heading)]/5 border border-[var(--border-color)] transition-all flex items-center gap-4 text-left group opacity-30 cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-body)]">
                  <Video size={18} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-widest">Videoteca</span>
                  <span className="text-[9px] font-mono text-[var(--text-body)]">Próximamente</span>
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