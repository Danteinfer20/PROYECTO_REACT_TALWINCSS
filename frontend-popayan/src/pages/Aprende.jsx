import React, { useState, useEffect, useCallback } from 'react';
import { Search, Clock, ChevronRight, Sparkles, Loader2, Library, Play, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AprendeModal from '../components/modals/AprendeModal';

const Aprende = () => {
  const { t } = useTranslation();
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [leccionSeleccionada, setLeccionSeleccionada] = useState(null);

  const [user] = useState(() => {
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

  const cargarLecciones = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/education', { params: { search: busqueda } });
      setLecciones(response.data.data || []);
    } catch (error) {
      console.error("API Sync Error:", error);
    } finally {
      setLoading(false);
    }
  }, [busqueda]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handler = setTimeout(() => cargarLecciones(), 400);
    return () => clearTimeout(handler);
  }, [cargarLecciones]);

  const getDifficultyStyle = (level) => {
    const styles = {
      beginner: { label: t('aprende.levels.beginner', 'Básico'), color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
      intermediate: { label: t('aprende.levels.intermediate', 'Intermedio'), color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
      advanced: { label: t('aprende.levels.advanced', 'Avanzado'), color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' }
    };
    return styles[level] || { label: t('aprende.levels.general', 'General'), color: 'text-[rgb(var(--role-accent))]', bg: 'bg-[rgb(var(--role-accent))]/20', border: 'border-[rgb(var(--role-accent))]/30' };
  };

  const getCoverImage = (leccion) => {
    if (leccion.cover_image) return leccion.cover_image;
    if (leccion.images && leccion.images.length > 0) return leccion.images[0];
    return null;
  };

  const roleAccentRGB = getRoleAccentRGB();

  return (
    <div style={{ '--role-accent': roleAccentRGB }} className="min-h-screen bg-[#0A0A0A] text-gray-200 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-20 sm:pt-24 pb-16 sm:pb-24">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-[rgb(var(--role-accent))]" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                {t('aprende.header.badge', 'Curaduría Digital')}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Patrimonio <span className="text-[rgb(var(--role-accent))]">Caucano</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-400 max-w-xl mt-3 leading-relaxed">
              {t('aprende.header.description', 'Acceso técnico al archivo histórico y cultural de la región.')}
            </p>
          </div>

          <div className="w-full lg:w-80 xl:w-96">
            <div className="relative bg-[#141414] border border-white/10 rounded-xl flex items-center px-4 py-2.5 transition-all focus-within:border-[rgb(var(--role-accent))]/40">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder={t('aprende.search.placeholder', 'Buscar en el archivo...')}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-gray-500 text-white"
              />
            </div>
          </div>
        </div>

        {/* Estados de carga / vacío */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="animate-spin text-[rgb(var(--role-accent))]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              {t('aprende.status.loading', 'Sincronizando Archivo...')}
            </span>
          </div>
        ) : lecciones.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center bg-[#141414] rounded-2xl border border-white/5">
            <Library size={40} className="text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">
              {t('aprende.status.empty', 'Sin registros didácticos disponibles.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 md:gap-6 lg:gap-7">
            {lecciones.map((leccion) => {
              const meta = leccion.metadata || {};
              const diff = getDifficultyStyle(meta.difficulty_level);
              const coverImage = getCoverImage(leccion);
              const hasVideo = leccion.video_url;
              const fallbackImage = 'https://images.unsplash.com/photo-1566417712758-5bf8bd7b4a0a?q=80&w=2070&auto=format&fit=crop';

              return (
                <article
                  key={leccion.id}
                  onClick={() => setLeccionSeleccionada(leccion.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setLeccionSeleccionada(leccion.id)}
                  role="button"
                  tabIndex={0}
                  className="group relative bg-[#141414] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[rgb(var(--role-accent))]/50 flex flex-col h-full"
                >
                  {/* Imagen de portada */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#0A0A0A]">
                    <img 
                      src={coverImage || fallbackImage} 
                      alt={leccion.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />
                    
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                    
                    {/* Badge de video */}
                    {hasVideo && (
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1 flex items-center gap-1.5">
                        <Play size={10} className="text-[rgb(var(--role-accent))]" fill="currentColor" />
                        <span className="text-[8px] font-bold uppercase tracking-wider text-white">Video</span>
                      </div>
                    )}

                    {/* Badge de dificultad (sobre la imagen) */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${diff.bg} ${diff.color} border ${diff.border} backdrop-blur-sm`}>
                      {diff.label}
                    </div>

                    {/* Área de conocimiento (sobre la imagen) */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-300/80 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full inline-block">
                        {meta.knowledge_area || t('aprende.card.default_area', 'Cultura General')}
                      </span>
                    </div>
                  </div>

                  {/* Contenido textual */}
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <h3 className="text-sm md:text-base font-bold leading-tight text-white group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2">
                      {leccion.title}
                    </h3>
                    
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 flex-1">
                      {leccion.excerpt || t('aprende.card.default_excerpt', 'Análisis documental y técnico del patrimonio.')}
                    </p>

                    {/* Footer con autor y tiempo */}
                    <div className="mt-2 pt-3 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#0A0A0A] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                          {leccion.author?.profile_picture ? (
                            <img src={leccion.author.profile_picture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] font-bold text-[rgb(var(--role-accent))]">
                              {leccion.author?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-gray-400 truncate max-w-[80px]">
                          {leccion.author?.name || t('aprende.card.anonymous', 'Anónimo')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400 text-[9px] font-mono shrink-0">
                        <Clock size={10} /> {meta.estimated_read_time || '5'} min
                        <ChevronRight size={12} className="text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {leccionSeleccionada && (
        <AprendeModal
          leccionId={leccionSeleccionada}
          onClose={() => setLeccionSeleccionada(null)}
        />
      )}
    </div>
  );
};

export default Aprende;