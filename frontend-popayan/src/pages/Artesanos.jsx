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
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#a855f7]/30 relative overflow-hidden">
      
      {/* 🔥 LUCES ATMOSFÉRICAS DE FONDO */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Navbar className="z-50 relative" />
      
      <main className="pt-24 px-6 md:px-12 max-w-[1600px] mx-auto w-full flex-grow relative z-10">
        
        {/* 🎭 HERO BANNER EDITORIAL */}
        <div className="flex flex-col items-center justify-center text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 mb-6 bg-[#111113]/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-lg cursor-default">
            <span className="text-[#a855f7] text-[9px] font-bold uppercase tracking-[0.3em]">Directorio Oficial</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-8 flex flex-wrap justify-center gap-3 drop-shadow-lg">
            Maestros <span className="text-[#a855f7]">Artesanos</span>
          </h1>
          
          <div className="relative w-full max-w-xl mx-auto group z-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#a855f7]/0 via-[#a855f7]/20 to-[#a855f7]/0 rounded-full blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#a855f7] transition-colors z-10" size={16} />
            <input 
              type="text" 
              placeholder="Buscar creador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="relative w-full bg-[#111113]/70 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-full py-4 pl-14 pr-6 text-xs font-medium tracking-wide outline-none focus:border-[#a855f7]/50 focus:bg-[#151518]/90 transition-all shadow-xl text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* 🔥 CUADRÍCULA DE MAESTROS */}
        {cargando ? (
          <div className="py-20 flex flex-col items-center justify-center gap-6">
            <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent animate-spin rounded-full"></div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">Forjando Red Cultural...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-32 mt-4">
            {filtrados.length > 0 ? (
              filtrados.map((art) => (
                <div 
                  key={art.id} 
                  onClick={() => abrirModal(art)}
                  className="group cursor-pointer bg-[#111113]/40 hover:bg-[#151518]/80 backdrop-blur-sm border border-white/5 hover:border-[#a855f7]/30 rounded-[24px] p-6 transition-all duration-500 hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden"
                >
                  <div className="relative w-24 h-24 mb-5">
                    <div className="absolute inset-0 bg-[#a855f7]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative w-full h-full rounded-full overflow-hidden border border-white/5 group-hover:border-[#a855f7]/50 transition-colors duration-500 bg-[#0A0A0C]">
                      {art.profile_picture ? (
                        <img 
                          src={art.profile_picture} 
                          className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                          alt={art.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(art.name)}&background=0A0A0C&color=a855f7`; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-xl font-bold text-[#a855f7]/50 uppercase tracking-tight">{art.name.substring(0, 2)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold uppercase tracking-tight text-white group-hover:text-[#a855f7] transition-colors mb-1 truncate w-full">
                    {art.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono tracking-widest mb-4 truncate w-full">
                    @{art.username}
                  </p>
                  
                  <div className="flex items-center justify-center gap-1.5 text-[9px] font-medium uppercase tracking-widest text-gray-500 pt-3 border-t border-white/5 w-full">
                      <MapPin size={10} className="text-[#a855f7]/60" /> {art.neighborhood || 'Popayán'}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#111113]/30 backdrop-blur-sm border border-dashed border-white/10 rounded-[30px]">
                <Search size={32} className="text-gray-700 mb-4" />
                <h3 className="text-lg font-bold uppercase tracking-tight text-white mb-2">Ningún maestro coincide</h3>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Intenta ajustar los parámetros de búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 🎭 MODAL NEO-TRADICIÓN (Iluminación Elegante y Volumétrica) */}
      {artistaSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          
          {/* Fondo oscuro con desenfoque masivo */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setArtistaSeleccionado(null)}></div>
          
          {/* 🌟 Aura Ambiental detrás del Modal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#a855f7]/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Contenedor Principal del Modal */}
          <div className="relative bg-[#0A0A0C]/80 backdrop-blur-3xl border border-white/10 w-full max-w-3xl rounded-[36px] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 group/modal">
            
            {/* 🌟 Línea Superior de Neón */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#a855f7] to-transparent shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>
            
            <button 
              onClick={() => setArtistaSeleccionado(null)}
              className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-[#a855f7]/20 hover:text-[#a855f7] rounded-full text-gray-400 transition-all z-50 border border-transparent hover:border-[#a855f7]/50"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col md:flex-row p-10 gap-10 items-center md:items-start relative z-10">
              
              {/* Avatar Modal con Aura Pulsante */}
              <div className="w-40 h-40 shrink-0 relative mt-2">
                {/* 🌟 Glow detrás del Avatar */}
                <div className="absolute inset-0 bg-[#a855f7] rounded-[24px] blur-[30px] opacity-20 animate-pulse"></div>
                <div className="w-full h-full rounded-[24px] overflow-hidden border border-white/10 bg-[#111113] shadow-2xl relative z-10">
                  {artistaSeleccionado.profile_picture ? (
                    <img 
                      src={artistaSeleccionado.profile_picture} 
                      className="w-full h-full object-cover grayscale-[10%] group-hover/modal:grayscale-0 transition-all duration-700 scale-100 group-hover/modal:scale-105" 
                      alt={artistaSeleccionado.name}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artistaSeleccionado.name)}&background=151518&color=a855f7`; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111113] to-[#0A0A0C]">
                      <span className="text-4xl font-bold text-[#a855f7]/40 uppercase tracking-tight">{artistaSeleccionado.name.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Modal */}
              <div className="flex-1 flex flex-col w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <span className="text-[#a855f7] border border-[#a855f7]/30 bg-[#a855f7]/5 px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                    <Award size={10} /> Maestro
                  </span>
                  {artistaSeleccionado.is_verified && <CheckCircle size={14} className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]" title="Verificado" />}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none mb-1 text-white drop-shadow-md">
                  {artistaSeleccionado.name}
                </h2>
                <p className="text-[#a855f7] text-[11px] font-mono uppercase tracking-widest mb-5 opacity-90">@{artistaSeleccionado.username}</p>
                
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 text-[10px] font-medium uppercase tracking-widest mb-6 border-b border-white/5 pb-5 w-max mx-auto md:mx-0">
                  <MapPin size={12} className="text-[#a855f7]" />
                  {artistaSeleccionado.city || 'Popayán'}, {artistaSeleccionado.neighborhood || 'Centro Histórico'}
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-8">
                  {artistaSeleccionado.bio || 'Maestro artesano de Popayán Cultural. Su legado está documentado visualmente en el catálogo de la plataforma.'}
                </p>

                {/* 🌟 Botón Magnético con Glow en Hover */}
                <Link 
                  to={`/artesanos/${artistaSeleccionado.username}`}
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black hover:bg-[#a855f7] hover:text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 w-max mx-auto md:mx-0 group shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
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