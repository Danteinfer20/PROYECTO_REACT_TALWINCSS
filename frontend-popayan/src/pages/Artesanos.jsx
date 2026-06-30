import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ✅ Usamos la instancia api
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, MapPin, X, ChevronRight, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Artesanos = () => {
  const [artistas, setArtistas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null);
  
  const { t } = useTranslation();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user?.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      default: return '168 85 247';
    }
  };

  useEffect(() => {
    const obtenerArtistas = async () => {
      try {
        setCargando(true);
        // ✅ Usamos api.get con ruta relativa
        const res = await api.get('/artists');
        if (res.data && res.data.data) {
          setArtistas(res.data.data);
        }
      } catch (e) {
        console.error("Error cargando directorio:", e);
      } finally {
        setCargando(false);
      }
    };
    obtenerArtistas();
  }, []);

  const abrirModal = (artista) => {
    if (!artista) return;
    setArtistaSeleccionado(artista);
  };

  const filtrados = artistas.filter(a => a.name?.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans transition-colors duration-500">
      <Navbar />
      
      <main className="pt-24 px-4 sm:px-6 md:px-12 max-w-[1600px] mx-auto w-full flex-grow relative z-10">
        
        {/* Hero banner responsivo */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-4 md:mb-6 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] px-3 py-1 md:px-4 md:py-1.5 rounded-full">
            <span className="text-[rgb(var(--role-accent))] text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em]">
              {t('artisans.hero.badge', 'Directorio Oficial')}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-6 md:mb-8 flex flex-wrap justify-center gap-2 md:gap-3">
            {t('artisans.hero.title_prefix', 'Maestros')} <span className="text-[rgb(var(--role-accent))] italic">{t('artisans.hero.title_highlight', 'Artesanos')}</span>
          </h1>
          
          <div className="relative w-full max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-body)] z-10" size={16} />
            <input 
              type="text" 
              placeholder={t('artisans.hero.search', 'Buscar creador...')}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[var(--bg-container)]/70 backdrop-blur-2xl border border-[var(--border-color)] rounded-full py-3 pl-10 pr-4 text-xs font-medium outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all text-[var(--text-heading)] placeholder:text-[var(--text-body)]/60"
            />
          </div>
        </div>

        {/* Grid de artistas - responsivo */}
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-[rgb(var(--role-accent))] border-t-transparent animate-spin rounded-full"></div>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-body)]">
              {t('artisans.loading', 'Forjando Red Cultural...')}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 pb-24 md:pb-32">
            {filtrados.length > 0 ? (
              filtrados.map((art) => (
                <div 
                  key={art.id} 
                  onClick={() => abrirModal(art)}
                  className="group cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-container)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 rounded-2xl p-5 transition-all hover:-translate-y-1 flex flex-col items-center text-center shadow-sm"
                >
                  <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 bg-[rgb(var(--role-accent))]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 transition-colors bg-[var(--bg-primary)]">
                      {art.profile_picture ? (
                        <img 
                          src={art.profile_picture} 
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                          alt={art.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.name)}&background=0A0A0C&color=fff`; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-bold text-[rgb(var(--role-accent))]/50 uppercase">{art.name?.substring(0,2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors mb-1 truncate w-full">
                    {art.name}
                  </h3>
                  <p className="text-[9px] text-[rgb(var(--role-accent))] font-mono tracking-widest mb-2 truncate w-full">
                    @{art.username}
                  </p>
                  <p className="text-[10px] text-[var(--text-body)] line-clamp-2 leading-relaxed mb-3">
                    {art.bio || t('artisans.modal.default_bio', 'Maestro artesano de Popayán Cultural.')}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-[var(--text-body)] pt-3 border-t border-[var(--border-color)] w-full">
                    <MapPin size={10} className="text-[rgb(var(--role-accent))]" /> 
                    {art.city || t('artisans.card.default_location', 'Popayán')}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 bg-[var(--bg-card)]/50 border border-dashed border-[var(--border-color)] rounded-2xl">
                <Search size={28} className="text-[var(--text-body)] mb-3 opacity-50" />
                <h3 className="text-base font-bold uppercase tracking-tight text-[var(--text-heading)] mb-1">
                  {t('artisans.empty.title', 'Ningún maestro coincide')}
                </h3>
                <p className="text-[10px] font-mono text-[var(--text-body)] uppercase tracking-widest">
                  {t('artisans.empty.subtitle', 'Intenta ajustar los parámetros de búsqueda.')}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal (similar pero con mejor responsividad) */}
      {artistaSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setArtistaSeleccionado(null)}></div>
          <div className="relative bg-[var(--bg-container)]/95 backdrop-blur-3xl border border-[var(--border-color)] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setArtistaSeleccionado(null)}
              className="absolute top-3 right-3 p-1.5 bg-[var(--text-heading)]/5 hover:bg-[rgb(var(--role-accent))]/10 rounded-full text-[var(--text-body)] transition-all z-50"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col md:flex-row p-6 md:p-10 gap-6 md:gap-10 items-center md:items-start">
              <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
                <div className="w-full h-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)]">
                  {artistaSeleccionado.profile_picture ? (
                    <img src={artistaSeleccionado.profile_picture} className="w-full h-full object-cover" alt={artistaSeleccionado.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
                      <span className="text-2xl font-bold text-[rgb(var(--role-accent))]/40 uppercase">{artistaSeleccionado.name?.substring(0,2)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/30 bg-[rgb(var(--role-accent))]/5 px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Award size={10} /> {t('artisans.modal.badge', 'Maestro')}
                  </span>
                  {artistaSeleccionado.is_verified && <CheckCircle size={14} className="text-blue-500" />}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-1 text-[var(--text-heading)]">{artistaSeleccionado.name}</h2>
                <p className="text-[rgb(var(--role-accent))] text-[10px] font-mono uppercase tracking-widest mb-3">@{artistaSeleccionado.username}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--text-body)] text-[9px] font-medium uppercase tracking-widest mb-4 border-b border-[var(--border-color)] pb-3">
                  <MapPin size={10} className="text-[rgb(var(--role-accent))]" />
                  {artistaSeleccionado.city || 'Popayán'}, {artistaSeleccionado.neighborhood || 'Centro Histórico'}
                </div>
                <p className="text-[var(--text-body)] text-xs leading-relaxed mb-5">
                  {artistaSeleccionado.bio || t('artisans.modal.default_bio', 'Maestro artesano de Popayán Cultural.')}
                </p>
                <Link 
                  to={`/artesanos/${artistaSeleccionado.username}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--text-heading)] text-[var(--bg-primary)] hover:bg-[rgb(var(--role-accent))] hover:text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
                >
                  {t('artisans.modal.explore', 'Explorar Perfil')} <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Artesanos;