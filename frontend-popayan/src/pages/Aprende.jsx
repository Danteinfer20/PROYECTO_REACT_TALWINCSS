import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Clock, Lightbulb, ChevronRight, Sparkles, Loader2, Library } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Aprende = () => {
  const navigate = useNavigate();
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 🔥 MOTOR DE ESTADO PARA ROL CROMÁTICO
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      default: return '168 85 247';
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    window.scrollTo(0, 0);
    const handler = setTimeout(() => cargarLecciones(), 400);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const cargarLecciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/education`, { params: { search: busqueda } });
      setLecciones(response.data.data || []);
    } catch (error) {
      console.error("API Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStyle = (level) => {
    const styles = {
      beginner: { label: 'Básico', color: 'text-emerald-500', border: 'border-emerald-500/20' },
      intermediate: { label: 'Intermedio', color: 'text-amber-500', border: 'border-amber-500/20' },
      advanced: { label: 'Avanzado', color: 'text-rose-500', border: 'border-rose-500/20' }
    };
    return styles[level] || { label: 'General', color: 'text-[rgb(var(--role-accent))]', border: 'border-[rgb(var(--role-accent))]/20' };
  };

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[rgb(var(--role-accent))]/30 transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 pt-24 pb-32">
        
        {/* 🏛️ HEADER COMPACTO */}
        <section className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12 border-b border-[var(--border-color)] pb-10 transition-colors duration-500">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={12} className="text-[rgb(var(--role-accent))]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-body)]">Curaduría Digital</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Patrimonio <span className="text-[rgb(var(--role-accent))] italic">Caucano</span>
            </h1>
            <p className="text-[var(--text-body)] text-[13px] leading-relaxed max-w-sm">
              Acceso técnico al archivo histórico y cultural de la región.
            </p>
          </div>

          <div className="w-full md:w-[380px] relative">
            <div className="relative bg-[var(--bg-container)] border border-[var(--border-color)] rounded-xl flex items-center px-4 h-12 transition-all focus-within:border-[rgb(var(--role-accent))]/50 shadow-sm">
              <Search className="text-[var(--text-body)]" size={16} />
              <input 
                type="text" 
                placeholder="Buscar en el archivo..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent px-3 text-[13px] font-medium outline-none placeholder:text-[var(--text-body)]/60 text-[var(--text-heading)]"
              />
            </div>
          </div>
        </section>

        {/* 📚 GRID SYSTEM */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={24} className="animate-spin text-[rgb(var(--role-accent))]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-body)]">Sincronizando Archivo</span>
          </div>
        ) : lecciones.length === 0 ? (
          <div className="py-20 text-center rounded-[30px] border border-[var(--border-color)] border-dashed">
            <Library size={32} className="mx-auto text-[var(--text-body)] mb-4 opacity-50" />
            <p className="text-[var(--text-body)] font-bold uppercase text-[9px] tracking-widest">Sin registros disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 xl:gap-8">
            {lecciones.map((leccion) => {
              const meta = leccion.metadata || {};
              const diff = getDifficultyStyle(meta.difficulty_level);
              return (
                <article 
                  key={leccion.id} 
                  onClick={() => navigate(`/aprende/${leccion.id}`)}
                  className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[24px] p-8 hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-[0_20px_40px_rgba(var(--glass-shadow))] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))]"></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-body)]">
                        {meta.knowledge_area || 'Cultura'}
                      </span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-tighter border px-2 py-0.5 rounded-md ${diff.color} ${diff.border}`}>
                      {diff.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug mb-3 text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors">
                    {leccion.title.toUpperCase()}
                  </h3>
                  
                  <p className="text-[var(--text-body)] text-xs leading-relaxed mb-8 line-clamp-2">
                    {leccion.excerpt || "Análisis documental y técnico del patrimonio caucano."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)] transition-colors duration-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all overflow-hidden">
                        {leccion.author?.avatar ? (
                          <img src={leccion.author.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-[rgb(var(--role-accent))]">{leccion.author?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-bold text-[var(--text-body)] uppercase tracking-widest">Maestro</span>
                        <span className="text-[10px] font-bold text-[var(--text-heading)] transition-colors">
                          {leccion.author?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[var(--text-body)] font-mono text-[9px]">
                        <Clock size={10} /> {meta.estimated_read_time || '5'}M
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[var(--text-heading)]/5 flex items-center justify-center text-[var(--text-body)] group-hover:bg-[rgb(var(--role-accent))] group-hover:text-white transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Aprende;