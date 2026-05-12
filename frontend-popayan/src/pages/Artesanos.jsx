import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, MapPin, X, ChevronRight, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Artesanos = () => {
  const [artistas, setArtistas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [artistaSeleccionado, setArtistaSeleccionado] = useState(null);

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

  useEffect(() => {
    const obtenerArtistas = async () => {
      try {
        setCargando(true);
        const res = await axios.get('http://localhost:8000/api/v1/artists');
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

  const filtrados = artistas.filter(a => a.name.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[rgb(var(--role-accent))]/30 relative overflow-hidden transition-colors duration-500">
      
      {/* 🔥 LUCES ATMOSFÉRICAS DE FONDO DUAL */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[rgb(var(--role-accent))]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Navbar className="z-50 relative" />
      
      <main className="pt-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full flex-grow relative z-10">
        
        {/* 🎭 HERO BANNER EDITORIAL */}
        <div className="flex flex-col items-center justify-center text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 mb-6 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] px-4 py-1.5 rounded-full shadow-sm cursor-default">
            <span className="text-[rgb(var(--role-accent))] text-[9px] font-bold uppercase tracking-[0.3em]">Directorio Oficial</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-8 flex flex-wrap justify-center gap-3 drop-shadow-sm">
            Maestros <span className="text-[rgb(var(--role-accent))] italic">Artesanos</span>
          </h1>
          
          <div className="relative w-full max-w-xl mx-auto group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-[rgb(var(--role-accent))]/20 to-transparent rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors z-10" size={16} />
            <input 
              type="text" 
              placeholder="Buscar creador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="relative w-full bg-[var(--bg-container)]/70 backdrop-blur-2xl border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 rounded-full py-4 pl-14 pr-6 text-xs font-medium tracking-wide outline-none focus:border-[rgb(var(--role-accent))]/50 focus:bg-[var(--bg-card)] transition-all shadow-sm text-[var(--text-heading)] placeholder:text-[var(--text-body)]/60"
            />
          </div>
        </div>

        {/* 🔥 CUADRÍCULA DE MAESTROS */}
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-6">
            <div className="w-10 h-10 border-2 border-[rgb(var(--role-accent))] border-t-transparent animate-spin rounded-full"></div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-body)]">Forjando Red Cultural...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-32 mt-4">
            {filtrados.length > 0 ? (
              filtrados.map((art) => (
                <div 
                  key={art.id} 
                  onClick={() => abrirModal(art)}
                  className="group cursor-pointer bg-[var(--bg-card)] hover:bg-[var(--bg-container)] backdrop-blur-sm border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 rounded-[24px] p-6 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden shadow-sm"
                >
                  <div className="relative w-24 h-24 mb-5">
                    <div className="absolute inset-0 bg-[rgb(var(--role-accent))]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 transition-colors duration-500 bg-[var(--bg-primary)]">
                      {art.profile_picture ? (
                        <img 
                          src={art.profile_picture} 
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                          alt={art.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.name)}&background=0A0A0C&color=fff`; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl font-bold text-[rgb(var(--role-accent))]/50 uppercase tracking-tight">{art.name.substring(0, 2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold uppercase tracking-tight text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors mb-1 truncate w-full">
                    {art.name}
                  </h3>
                  <p className="text-[10px] text-[var(--text-body)] font-mono tracking-widest mb-4 truncate w-full">
                    @{art.username}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-[var(--text-body)] pt-3 border-t border-[var(--border-color)] w-full transition-colors duration-500">
                      <MapPin size={10} className="text-[rgb(var(--role-accent))]/80" /> {art.neighborhood || 'Popayán'}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[var(--bg-card)]/50 backdrop-blur-sm border border-dashed border-[var(--border-color)] rounded-[30px]">
                <Search size={32} className="text-[var(--text-body)] mb-4 opacity-50" />
                <h3 className="text-lg font-bold uppercase tracking-tight text-[var(--text-heading)] mb-2">Ningún maestro coincide</h3>
                <p className="text-xs font-mono text-[var(--text-body)] uppercase tracking-widest">Intenta ajustar los parámetros de búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🎭 MODAL NEO-TRADICIÓN (Acondicionado para Dual Mode) */}
      {artistaSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setArtistaSeleccionado(null)}></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[rgb(var(--role-accent))]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative bg-[var(--bg-container)]/95 backdrop-blur-3xl border border-[var(--border-color)] w-full max-w-3xl rounded-[36px] shadow-2xl overflow-hidden z-10 group/modal transition-colors duration-500">
            
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[rgb(var(--role-accent))] to-transparent opacity-70"></div>
            
            <button 
              onClick={() => setArtistaSeleccionado(null)}
              className="absolute top-5 right-5 p-2 bg-[var(--text-heading)]/5 hover:bg-[rgb(var(--role-accent))]/10 hover:text-[rgb(var(--role-accent))] rounded-full text-[var(--text-body)] transition-all z-50 border border-transparent hover:border-[rgb(var(--role-accent))]/30"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row p-10 gap-10 items-center md:items-start relative z-10">
              
              <div className="w-40 h-40 shrink-0 relative mt-2">
                <div className="absolute inset-0 bg-[rgb(var(--role-accent))] rounded-[24px] blur-[20px] opacity-20 animate-pulse"></div>
                <div className="w-full h-full rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm relative z-10">
                  {artistaSeleccionado.profile_picture ? (
                    <img 
                      src={artistaSeleccionado.profile_picture} 
                      className="w-full h-full object-cover grayscale-[10%] group-hover/modal:grayscale-0 transition-all duration-700 scale-100 group-hover/modal:scale-105" 
                      alt={artistaSeleccionado.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistaSeleccionado.name)}&background=050505&color=fff`; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
                      <span className="text-4xl font-bold text-[rgb(var(--role-accent))]/40 uppercase tracking-tight">{artistaSeleccionado.name.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <span className="text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/30 bg-[rgb(var(--role-accent))]/5 px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Award size={10} /> Maestro
                  </span>
                  {artistaSeleccionado.is_verified && <CheckCircle size={14} className="text-blue-500" title="Verificado" />}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none mb-1 text-[var(--text-heading)] drop-shadow-sm">
                  {artistaSeleccionado.name}
                </h2>
                <p className="text-[rgb(var(--role-accent))] text-[11px] font-mono uppercase tracking-widest mb-5 opacity-90">@{artistaSeleccionado.username}</p>
                
                <div className="flex items-center justify-center md:justify-start gap-2 text-[var(--text-body)] text-[10px] font-medium uppercase tracking-widest mb-6 border-b border-[var(--border-color)] pb-5 w-max mx-auto md:mx-0">
                  <MapPin size={12} className="text-[rgb(var(--role-accent))]" />
                  {artistaSeleccionado.city || 'Popayán'}, {artistaSeleccionado.neighborhood || 'Centro Histórico'}
                </div>

                <p className="text-[var(--text-body)] text-sm leading-relaxed mb-8">
                  {artistaSeleccionado.bio || 'Maestro artesano de Popayán Cultural. Su legado está documentado visualmente en el catálogo de la plataforma.'}
                </p>

                <Link 
                  to={`/artesanos/${artistaSeleccionado.username}`}
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--text-heading)] text-[var(--bg-primary)] hover:bg-[rgb(var(--role-accent))] hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 w-max mx-auto md:mx-0 group shadow-sm"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explorar Perfil <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
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