import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ServerCrash, Eye, BookOpen, Calendar, 
  Image as ImageIcon, MapPin, Clock, Zap
} from 'lucide-react';

// Componentes Base
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx';
import ProductCard from '../components/cards/ProductCard.jsx';
import ArtistCard from '../components/cards/ArtistCard.jsx';
import ArtModal from '../components/modals/ArtModal.jsx';

const Home = () => {
  const navigate = useNavigate();
  
  // Estados de Datos
  const [obras, setObras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [educacion, setEducacion] = useState([]);
  const [favoritosIds, setFavoritosIds] = useState([]);
  
  // Estados de Control
  const [loading, setLoading] = useState(true);
  const [errorGlobal, setErrorGlobal] = useState(false);
  const [obraSeleccionada, setObraSeleccionada] = useState(null);
  
  const [carruselIndex, setCarruselIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  // 🛡️ HELPER: Validación de URLs Anti-CORB
  const getSafeImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  useEffect(() => {
    const cargarDatosHome = async () => {
      try {
        setLoading(true);
        // 🔥 CORRECCIÓN: Promise.allSettled evita que el Home colapse si un endpoint está vacío o falla
        const results = await Promise.allSettled([
          axios.get(`${API_URL}/posts`),
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/artists`),
          axios.get(`${API_URL}/events`),
          axios.get(`${API_URL}/education`),
        ]);

        // Extraemos los datos solo si la promesa fue 'fulfilled' (exitosa)
        const getResData = (result) => result.status === 'fulfilled' && result.value.data.data ? result.value.data.data : [];

        const obrasData = getResData(results[0]);
        const prodData = getResData(results[1]);
        const artData = getResData(results[2]);
        const eventData = getResData(results[3]);
        const eduData = getResData(results[4]);

        if (token) {
          try {
            const resFavs = await axios.get(`${API_URL}/saved-items`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setFavoritosIds(resFavs.data.data.map(f => f.post_id));
          } catch (e) { console.warn("Sincronización de favoritos omitida."); }
        }

        // 🔥 CURADURÍA ESTRICTA (Asignamos los arreglos, si falló, asignará un [] vacío)
        setObras(obrasData.slice(0, 5));
        setProductos(prodData.slice(0, 5));
        setArtistas(artData.slice(0, 5));
        setEventos(eventData.slice(0, 2));
        setEducacion(eduData.slice(0, 3));
        
      } catch (e) {
        console.error("Fallo estructural en Home:", e);
        setErrorGlobal(true);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosHome();
  }, [token, API_URL]);

  // Carrusel Logic
  useEffect(() => {
    if (obras.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % obras.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [obras.length, isPaused]);

  if (errorGlobal) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col items-center justify-center">
        <ServerCrash size={64} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Portal Fuera de Línea</h2>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-[#a855f7] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Reconectar Núcleo</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col relative overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-40">
        
        {/* 🎭 HERO AREA: EL ARCHIVO VIVO */}
        <section 
          className="relative w-full h-[65vh] min-h-[550px] flex items-center justify-start overflow-hidden mb-24 border-b border-white/5 bg-[#050505]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {obras.length > 0 ? obras.map((obra, index) => {
            const imgPath = getSafeImageUrl(obra.imagen);
            return (
              <div key={obra.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === carruselIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}>
                <div className="absolute inset-0 bg-[#111113] flex items-center justify-center">
                   <ImageIcon size={80} className="text-white/5" />
                </div>
                {imgPath && (
                  <img 
                    src={imgPath} 
                    className="w-full h-full object-cover opacity-60 z-10 grayscale-[30%]" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                    alt={obra.title} 
                  />
                )}
                {/* Overlay Gradientes Neo-Tradición */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/90 to-transparent w-[70%] z-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent z-20"></div>
                
                <div className="absolute inset-0 flex items-center z-30 px-8 md:px-20">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="w-12 h-[2px] bg-[#a855f7]"></span>
                      <span className="text-[#a855f7] text-[10px] font-bold uppercase tracking-[0.4em]">Patrimonio Destacado</span>
                    </div>
                    {/* 🔥 TIPOGRAFÍA REFINADA */}
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-8 drop-shadow-2xl leading-tight">
                      {obra.title}
                    </h2>
                    <button 
                      onClick={() => setObraSeleccionada(obra.id)} 
                      className="bg-white text-black px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:text-white transition-all shadow-[0_0_30px_rgba(168,85,247,0.15)] flex items-center gap-3"
                    >
                      Inspeccionar <Eye size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-gray-700 tracking-widest animate-pulse">Sincronizando Archivo Histórico...</div>}
        </section>

        <div className="px-6 md:px-12 lg:px-20 w-full max-w-[1920px] mx-auto space-y-32">
          
          {/* 🖼️ SECCIÓN OBRAS */}
          <section>
            <div className="mb-12 border-l-[3px] border-[#a855f7] pl-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                Obras Maestras
              </h2>
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                Selección exclusiva de nuestro archivo patrimonial
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4.5] bg-[#111113] animate-pulse rounded-[30px] border border-white/5"></div>)
                : obras.length > 0 ? obras.map(obra => <ArtCard key={obra.id} obra={obra} onClickCard={() => setObraSeleccionada(obra.id)} />) 
                : <div className="col-span-full h-32 border border-dashed border-white/5 rounded-[30px] flex items-center justify-center text-gray-600 font-mono text-[9px] uppercase tracking-[0.2em]">Próximamente nuevas obras</div>
              }
            </div>
          </section>

          {/* 🛍️ SECCIÓN POP STORE */}
          <section>
            <div className="mb-12 border-l-[3px] border-emerald-500 pl-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                Pop Store
              </h2>
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                Tesoros artesanales con certificación de origen
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {productos.length > 0 ? productos.map(prod => (
                <ProductCard 
                  key={prod.id} 
                  producto={prod} 
                  onClickCard={(id) => navigate(`/tienda/${id}`)} // 🔥 ENRUTAMIENTO ACTIVO
                />
              )) : <div className="col-span-full h-32 border border-dashed border-white/5 rounded-[30px] flex items-center justify-center text-gray-600 font-mono text-[9px] uppercase tracking-[0.2em]">Tienda en preparación</div>}
            </div>
          </section>

          {/* 📅 AGENDA CULTURAL */}
          <section>
            <div className="mb-12 border-l-[3px] border-blue-500 pl-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                Agenda Cultural
              </h2>
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                Próximos eventos y convocatorias de la ciudad
              </p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {eventos.length > 0 ? eventos.map(evento => (
                <div 
                  key={evento.id} 
                  // 🔥 CORRECCIÓN: Ruta en singular '/evento/' y propagación detenida
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/evento/${evento.id}`); 
                  }} 
                  className="group relative flex bg-[#111113] border border-white/5 rounded-[30px] overflow-hidden hover:border-[#a855f7]/30 transition-all duration-300 shadow-lg cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-28 md:w-36 bg-[#1a1a1c] border-r border-white/5 flex flex-col items-center justify-center p-6 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#a855f7]/5 blur-[20px]"></div>
                    <span className="relative text-[#a855f7] text-2xl md:text-3xl font-bold tracking-tight">
                      {evento.fecha ? evento.fecha.split(' ')[0] : '20'}
                    </span>
                    <span className="relative text-gray-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">
                      {evento.fecha ? evento.fecha.split(' ')[1] : 'Abril'}
                    </span>
                  </div>
                  
                  <div className="w-24 md:w-32 relative overflow-hidden bg-[#0d0d0f] border-r border-white/5">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20"><ImageIcon size={20}/></div>
                    <img src={getSafeImageUrl(evento.imagen)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10" onError={(e) => e.target.style.display='none'} alt={evento.nombre}/>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-[#a855f7] transition-colors">
                      {evento.nombre || 'Gala Cultural'}
                    </h3>
                    <div className="flex items-center gap-3 text-gray-500 font-mono text-[8px] uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 border-r border-white/10 pr-3"><MapPin size={10} className="text-[#a855f7]"/> {evento.lugar || 'Teatro'}</span>
                      <span className="flex items-center gap-1.5"><Clock size={10}/> {evento.hora || '19:00'}</span>
                    </div>
                  </div>
                </div>
              )) : <div className="col-span-full h-32 border border-dashed border-white/5 rounded-[30px] flex items-center justify-center text-gray-600 font-mono text-[9px] uppercase tracking-[0.2em]">Próximamente nuevos eventos</div>}
            </div>
          </section>

          {/* 📚 APRENDE */}
          <section>
            <div className="mb-12 border-l-[3px] border-amber-500 pl-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                Aprende
              </h2>
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                Cátedra cultural por nuestros maestros
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {educacion.length > 0 ? educacion.map(clase => (
                <div 
                  key={clase.id} 
                  // 🔥 CORRECCIÓN: Detener propagación
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/aprende/${clase.id}`);
                  }}
                  className="group flex flex-col bg-[#111113] border border-white/5 rounded-[30px] p-5 hover:bg-[#161618] transition-all shadow-lg cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-full aspect-video rounded-[20px] overflow-hidden mb-6 relative bg-gradient-to-br from-[#1a1a1c] to-[#0A0A0C]">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20"><BookOpen size={32}/></div>
                    <img 
                      src={getSafeImageUrl(clase.imagen)} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500 z-10" 
                      onError={(e) => e.target.style.display='none'} 
                      alt={clase.titulo}
                    />
                    <div className="absolute top-4 left-4 z-20 bg-[#a855f7] text-white text-[7px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                       <Zap size={8} fill="currentColor"/> Especialidad
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-4 leading-tight line-clamp-2 group-hover:text-[#a855f7] transition-colors">
                    {clase.titulo || 'Historia Cultural'}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col gap-0.5">
                       <span className="text-gray-500 font-mono text-[7px] uppercase tracking-widest">Duración</span>
                       <span className="text-gray-300 font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} className="text-[#a855f7]"/> {clase.duracion || '25 min'}</span>
                    </div>
                  </div>
                </div>
              )) : <div className="col-span-full h-48 border border-dashed border-white/5 rounded-[30px] flex flex-col items-center justify-center gap-3 text-gray-700">
                     <BookOpen size={24} strokeWidth={1.5} />
                     <p className="font-mono text-[8px] uppercase tracking-widest text-center">Próximamente nuevos talleres</p>
                  </div>}
            </div>
          </section>

          {/* 👥 DIRECTORIO */}
          <section>
            <div className="mb-12 border-l-[3px] border-rose-500 pl-6">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                Directorio
              </h2>
              <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest">
                Los creadores detrás del legado
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {artistas.length > 0 ? artistas.map(art => (
                <ArtistCard 
                  key={art.id} 
                  artista={art} 
                  onClickCard={(username) => navigate(`/artesanos/${username}`)} // 🔥 ENRUTAMIENTO ACTIVO
                />
              )) : <div className="col-span-full h-32 border border-dashed border-white/5 rounded-[30px] flex items-center justify-center text-gray-600 font-mono text-[9px] uppercase tracking-[0.2em]">Próximamente catálogo de artistas</div>}
            </div>
          </section>

        </div>
      </main>

      <Footer />
      {obraSeleccionada && <ArtModal obraId={obraSeleccionada} onClose={() => setObraSeleccionada(null)} token={token} />}
    </div>
  );
};

export default Home;