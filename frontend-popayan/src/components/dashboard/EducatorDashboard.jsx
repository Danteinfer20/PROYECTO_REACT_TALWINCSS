import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Users, Heart, PlusCircle, 
  Play, FileText, ChevronRight, Award, 
  Loader2, Clock, Eye, Star, FolderOpen
} from 'lucide-react';

const EducatorDashboard = ({ user, seccionActiva, setSeccionActiva }) => {
  const [stats, setStats] = useState({ routes: 0, views: 0, saved: 0 });
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
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
    <div style={{ '--role-accent': roleAccent }} className="p-4 md:p-6 lg:p-8 w-full animate-in fade-in duration-700">
      
      <header className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-[rgb(var(--role-accent))]/70">Aula Virtual</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)]">
              Mi <span className="text-[rgb(var(--role-accent))]">Aula</span>
            </h2>
            <p className="text-[var(--text-body)] text-xs font-mono uppercase tracking-wider mt-1 opacity-60">
              Bienvenido, {user?.name?.split(' ')[0] || 'Educador'}
            </p>
          </div>
          <button 
            onClick={() => setSeccionActiva('crear_ruta')} 
            className="flex items-center gap-2 bg-[rgb(var(--role-accent))] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            <PlusCircle size={16} /> Crear Material
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between hover:border-[rgb(var(--role-accent))]/30 transition-all">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-body)] opacity-60">Material</p>
            <p className="text-2xl md:text-3xl font-bold text-[var(--text-heading)]">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-[rgb(var(--role-accent))]" /> : stats.routes}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center text-[rgb(var(--role-accent))]">
            <BookOpen size={20} />
          </div>
        </div>
        <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between hover:border-[rgb(var(--role-accent))]/30 transition-all">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-body)] opacity-60">Lecturas</p>
            <p className="text-2xl md:text-3xl font-bold text-[var(--text-heading)]">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-[rgb(var(--role-accent))]" /> : stats.views}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center text-[rgb(var(--role-accent))]">
            <Eye size={20} />
          </div>
        </div>
        <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between hover:border-[rgb(var(--role-accent))]/30 transition-all">
          <div>
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-body)] opacity-60">Guardados</p>
            <p className="text-2xl md:text-3xl font-bold text-[var(--text-heading)]">
              {loading ? <Loader2 className="animate-spin w-5 h-5 text-[rgb(var(--role-accent))]" /> : stats.saved}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center text-[rgb(var(--role-accent))]">
            <Heart size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-color)]">
            <h3 className="text-sm md:text-base font-bold uppercase tracking-tight text-[var(--text-heading)] flex items-center gap-2">
              <FolderOpen size={18} className="text-[rgb(var(--role-accent))]" />
              Últimos Módulos
            </h3>
            <button 
              onClick={() => setSeccionActiva('rutas')} 
              className="text-[10px] font-black text-[rgb(var(--role-accent))] uppercase tracking-wider hover:opacity-80 flex items-center gap-1 transition-all"
            >
              Ver Todo <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-[rgb(var(--role-accent))]" size={28} />
            </div>
          ) : recentContent.length > 0 ? (
            <div className="space-y-3">
              {recentContent.map((item) => (
                <div 
                  key={item.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-container)] border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                      {item.cover_image ? (
                        <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[rgb(var(--role-accent))]/40">
                          <FileText size={16} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors truncate">
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="text-[9px] font-mono text-[var(--text-body)] uppercase bg-[var(--bg-container)] px-2 py-0.5 rounded-full border border-[var(--border-color)]">
                          {item.difficulty_level || 'Intermedio'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                        <span className="text-[9px] font-mono text-[var(--text-body)] uppercase flex items-center gap-1">
                          <Clock size={10} /> {item.estimated_read_time || 5} min
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0 text-[var(--text-body)] opacity-60">
                    <span className="flex items-center gap-1 text-[10px] font-mono">
                      <Eye size={12} /> {item.stats?.views || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-mono">
                      <Star size={12} /> {item.stats?.favorites || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-[var(--bg-primary)]/20 rounded-xl border border-dashed border-[var(--border-color)]">
              <BookOpen size={28} className="mx-auto text-[var(--text-body)] opacity-20 mb-2" />
              <p className="text-[var(--text-body)] text-sm font-bold uppercase tracking-widest opacity-50">Aula vacía</p>
              <p className="text-[var(--text-body)] text-[10px] font-mono mt-1 uppercase opacity-40">Crea tu primer material didáctico</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-[rgb(var(--role-accent))]/10 to-[var(--bg-container)] border border-[rgb(var(--role-accent))]/20 rounded-2xl p-5 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[rgb(var(--role-accent))]/10 blur-2xl rounded-full"></div>
            <Award className="text-[rgb(var(--role-accent))] mb-3 relative z-10" size={24} />
            <h3 className="text-base font-bold italic uppercase text-[var(--text-heading)] tracking-tight mb-1 relative z-10">Forjar Ruta</h3>
            <p className="text-[10px] font-mono text-[var(--text-body)] uppercase tracking-wider mb-4 leading-relaxed relative z-10 opacity-60">
              Crea material didáctico y compártelo.
            </p>
            <button 
              onClick={() => setSeccionActiva('crear_ruta')} 
              className="w-full py-2.5 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 relative z-10 shadow-sm active:scale-95"
            >
              <PlusCircle size={16} /> Nuevo Material
            </button>
          </div>

          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-[var(--text-body)] opacity-40 tracking-wider mb-4">Herramientas</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSeccionActiva('rutas')}
                className="w-full p-3 rounded-xl bg-[var(--text-heading)]/5 border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 hover:bg-[rgb(var(--role-accent))]/5 transition-all flex items-center gap-3 text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] transition-colors shadow-inner">
                  <FileText size={16} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider transition-colors">Mis Guías</span>
                  <span className="text-[9px] font-mono text-[var(--text-body)] opacity-50">Gestionar inventario</span>
                </div>
              </button>
              <button 
                className="w-full p-3 rounded-xl bg-[var(--text-heading)]/5 border border-[var(--border-color)] transition-all flex items-center gap-3 text-left group opacity-30 cursor-not-allowed"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-body)]">
                  <Play size={16} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Videoteca</span>
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