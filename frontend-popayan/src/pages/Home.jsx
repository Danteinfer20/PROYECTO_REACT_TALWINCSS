import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ServerCrash, Eye, BookOpen, Clock, 
  Image as ImageIcon, MapPin, Zap, Sparkles, Calendar, ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🔥 INYECCIÓN POLÍGLOTA

// Componentes Base
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx';
import ProductCard from '../components/cards/ProductCard.jsx';
import ArtistCard from '../components/cards/ArtistCard.jsx';
import ArtModal from '../components/modals/ArtModal.jsx';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // 🔥 CEREBRO DE IDIOMAS ACTIVO
  
  // 🔥 MOTOR DE ESTADO (Para sincronización de rol en Home)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  
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
  
  // 🔥 CORTAFUEGOS: Imagen segura
  const FALLBACK_IMAGE = "https://ui-avatars.com/api/?name=Popayán+Cultural&background=111113&color=a855f7&size=1024";

  // 🔥 HELPER SANEADO
  const getSafeImageUrl = (url) => {
    if (!url) return FALLBACK_IMAGE;
    if (Array.isArray(url)) url = url[0]; 
    if (typeof url !== 'string') return FALLBACK_IMAGE;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return FALLBACK_IMAGE;
  };

  // 🔥 Sincronizador de Memoria de Usuario
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser || savedUser === "undefined") {
          setUser(null);
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔥 MOTOR MATEMÁTICO DE SEGMENTACIÓN CROMÁTICA
  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; // Púrpura Premium (Base)
    switch (user.user_type) {
      case 'admin': return '59 130 246';             // Blue-500
      case 'cultural_manager': return '16 185 129';  // Emerald-500
      case 'educator': return '245 158 11';          // Amber-500
      case 'artist': return '244 63 94';             // Rose-500 (Rojo Carmesí)
      case 'visitor': return '168 85 247';           // Purple-500
      default: return '168 85 247';                  // Fallback seguro
    }
  };

  useEffect(() => {
    const cargarDatosHome = async () => {
      const token = localStorage.getItem('token');
      const fetchConfig = { timeout: 12000 }; 

      try {
        setLoading(true);
        const results = await Promise.allSettled([
          axios.get(`${API_URL}/posts`, fetchConfig),
          axios.get(`${API_URL}/products`, fetchConfig),
          axios.get(`${API_URL}/artists`, fetchConfig),
          axios.get(`${API_URL}/events`, fetchConfig),
          axios.get(`${API_URL}/education`, fetchConfig),
        ]);

        const getResData = (result) => result.status === 'fulfilled' && result.value.data.data ? result.value.data.data : [];

        setObras(getResData(results[0]).slice(0, 5));
        setProductos(getResData(results[1]).slice(0, 5));
        setArtistas(getResData(results[2]).slice(0, 5));
        setEventos(getResData(results[3]).slice(0, 4)); 
        setEducacion(getResData(results[4]).slice(0, 3));

        if (token) {
          try {
            const resFavs = await axios.get(`${API_URL}/saved-items`, {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 8000
            });
            setFavoritosIds(resFavs.data.data.map(f => f.post_id));
          } catch (e) { console.warn("Sincronización de favoritos omitida."); }
        }
        
      } catch (e) {
        console.error("Fallo estructural en Home:", e);
        setErrorGlobal(true);
      } finally {
        setLoading(false); 
      }
    };
    cargarDatosHome();
  }, [API_URL]);

  useEffect(() => {
    if (eventos.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % eventos.length);
    }, 5000); 
    return () => clearInterval(interval);
  }, [eventos.length, isPaused]);

  if (errorGlobal) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col items-center justify-center transition-colors duration-500">
        <ServerCrash size={64} className="text-red-500 mb-6" />
        <h2 className="text-3xl font-bold italic uppercase tracking-tighter">{t('home.error.title', 'Portal Fuera de Línea')}</h2>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-[rgb(var(--role-accent,168_85_247))] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-md">{t('home.error.retry', 'Reconectar Núcleo')}</button>
      </div>
    );
  }

  return (
    // 🔥 INYECCIÓN DE ÁMBITO MAESTRO: Propaga --role-accent a todo el DOM de Home
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col relative overflow-x-hidden font-sans transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-40">
        
        {/* 🎭 HERO AREA: CONTROLADO POR EVENTOS */}
        <section 
          className="relative w-full h-[400px] md:h-[450px] mb-24 flex items-center justify-center overflow-hidden bg-[var(--bg-primary)] transition-colors duration-500"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {loading ? (
             <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-[rgb(var(--role-accent))] tracking-widest animate-pulse">{t('home.hero.syncing', 'Sincronizando Agenda Cultural...')}</div>
          ) : eventos.length > 0 ? eventos.map((evento, index) => {
            const rawImage = evento.images?.[0] || evento.image || evento.imagen || evento.file_path || evento.cover;
            const imgPath = getSafeImageUrl(rawImage);
            
            return (
              <div key={evento.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === carruselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <div className="absolute inset-0 pointer-events-none">
                  <img src={imgPath} className="w-full h-full object-cover opacity-40 blur-[60px] scale-125" alt="blur-bg" />
                  <div className="absolute inset-0 bg-[var(--bg-primary)]/60 transition-colors duration-500"></div>
                </div>

                <div className="relative z-10 w-full max-w-[1200px] h-[85%] md:h-[90%] mx-auto px-4 md:px-0">
                  <div className="w-full h-full relative rounded-[30px] overflow-hidden shadow-2xl border border-[var(--border-color)] ring-1 ring-[var(--border-color)] bg-[var(--bg-container)] transition-colors duration-500">
                    
                    <img 
                      src={imgPath} 
                      className={`w-full h-full object-cover transition-transform duration-[8000ms] ${index === carruselIndex ? 'scale-105' : 'scale-100'}`} 
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }}
                      alt={evento.title || evento.nombre || 'Evento'} 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent w-[90%] md:w-[65%] z-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/90 via-transparent to-transparent z-20"></div>

                    <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 md:px-16 z-30 max-w-[600px]">
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar size={14} className="text-[rgb(var(--role-accent))]" />
                        <span className="text-[rgb(var(--role-accent))] text-[9px] font-bold uppercase tracking-[0.4em]">{t('home.hero.next_event', 'Próximo Evento')}</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] mb-4 leading-tight drop-shadow-md">
                        {evento.title || evento.nombre}
                      </h2>
                      <div className="flex items-center gap-4 text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest mb-8">
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-[rgb(var(--role-accent))]"/> {evento.location_name || evento.lugar || 'Popayán'}</span>
                        <span className="flex items-center gap-1.5 border-l border-[var(--border-color)] pl-4"><Clock size={12}/> {evento.start_date ? new Date(evento.start_date).toLocaleDateString() : t('common.soon', 'Próximamente')}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/evento/${evento.id}`)} 
                        className="w-max bg-[var(--text-heading)]/10 backdrop-blur-md ring-1 ring-[var(--text-heading)]/20 text-[var(--text-heading)] px-6 py-3 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[rgb(var(--role-accent))] hover:ring-[rgb(var(--role-accent))] hover:text-white transition-all shadow-sm flex items-center gap-2 active:scale-95"
                      >
                        {t('home.hero.details', 'Ver Detalles')} <Eye size={14}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-[var(--text-body)] tracking-widest">{t('home.hero.starting', 'Iniciando transmisiones de ciudad...')}</div>}
        </section>

        {/* CONTENEDOR PRINCIPAL */}
        <div className="px-6 md:px-12 lg:px-20 w-full max-w-[1920px] mx-auto space-y-32">

          {/* 📅 AGENDA CULTURAL */}
          <section>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-[3px] border-transparent pl-6 relative">
              <div className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-[rgb(var(--role-accent))] rounded-full"></div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t('home.agenda.title', 'Agenda Cultural')}</h2>
                <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest">{t('home.agenda.subtitle', 'Próximos eventos y convocatorias de la ciudad')}</p>
              </div>
              <button onClick={() => navigate('/eventos')} className="group flex items-center gap-2 text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('home.agenda.link', 'Ver agenda completa')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {loading ? [...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[var(--bg-card)] animate-pulse rounded-[30px] border border-[var(--border-color)]"></div>)
                : eventos.length > 0 ? eventos.map(evento => {
                const evtImgRaw = evento.images?.[0] || evento.image || evento.imagen || evento.file_path || evento.cover;
                const evtImg = getSafeImageUrl(evtImgRaw);

                return (
                  <div 
                    key={evento.id} 
                    onClick={(e) => { e.stopPropagation(); navigate(`/evento/${evento.id}`); }} 
                    className="group relative flex bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[30px] overflow-hidden hover:border-[rgb(var(--role-accent))]/50 transition-all duration-300 shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <div className="w-28 md:w-36 bg-[var(--bg-card)]/50 border-r border-[var(--border-color)] flex flex-col items-center justify-center p-6 shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-[rgb(var(--role-accent))]/5 blur-[20px]"></div>
                      <span className="relative text-[rgb(var(--role-accent))] text-2xl md:text-3xl font-bold tracking-tight">
                        {evento.start_date ? new Date(evento.start_date).getDate() : '20'}
                      </span>
                      <span className="relative text-[var(--text-body)] text-[8px] font-bold uppercase tracking-[0.2em] mt-1">
                        {evento.start_date ? new Date(evento.start_date).toLocaleString('es', { month: 'short' }) : 'Mes'}
                      </span>
                    </div>
                    
                    <div className="w-24 md:w-32 relative overflow-hidden bg-[var(--bg-primary)]/50 border-r border-[var(--border-color)]">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20"><ImageIcon size={20} className="text-[var(--text-body)]" /></div>
                      <img src={evtImg} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-10" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} alt={evento.title || evento.nombre}/>
                    </div>

                    <div className="flex-1 p-6 flex flex-col justify-center">
                      <h3 className="text-lg md:text-xl font-bold text-[var(--text-heading)] mb-3 line-clamp-1 group-hover:text-[rgb(var(--role-accent))] transition-colors">{evento.title || evento.nombre || 'Gala Cultural'}</h3>
                      <div className="flex items-center gap-3 text-[var(--text-body)] font-mono text-[8px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5 border-r border-[var(--border-color)] pr-3"><MapPin size={10} className="text-[rgb(var(--role-accent))]"/> {evento.location_name || evento.lugar || 'Teatro'}</span>
                        <span className="flex items-center gap-1.5"><Clock size={10}/> {evento.start_date ? new Date(evento.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '19:00'}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="col-span-full h-32 border border-dashed border-[var(--border-color)] rounded-[30px] flex items-center justify-center text-[var(--text-body)] font-mono text-[9px] uppercase tracking-[0.2em]">{t('home.agenda.empty', 'Sin eventos programados actualmente')}</div>}
            </div>
          </section>
          
          {/* 🖼️ SECCIÓN OBRAS */}
          <section>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-[3px] border-transparent pl-6 relative">
              <div className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-[rgb(var(--role-accent))] rounded-full"></div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t('home.artworks.title', 'Obras Maestras')}</h2>
                <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest">{t('home.artworks.subtitle', 'Selección exclusiva de nuestro archivo patrimonial')}</p>
              </div>
              <button onClick={() => navigate('/obras')} className="group flex items-center gap-2 text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('home.artworks.link', 'Ver galería completa')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[3/4.5] bg-[var(--bg-card)] animate-pulse rounded-[30px] border border-[var(--border-color)]"></div>)
                : obras.length > 0 ? obras.map(obra => <ArtCard key={obra.id} obra={obra} onClickCard={() => setObraSeleccionada(obra.id)} />) 
                : <div className="col-span-full h-32 border border-dashed border-[var(--border-color)] rounded-[30px] flex items-center justify-center text-[var(--text-body)] font-mono text-[9px] uppercase tracking-[0.2em]">{t('home.artworks.empty', 'Próximamente nuevas obras')}</div>
              }
            </div>
          </section>

          {/* 🛍️ SECCIÓN POP STORE */}
          <section>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-[3px] border-transparent pl-6 relative">
              <div className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-[rgb(var(--role-accent))] rounded-full"></div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t('home.store.title', 'Pop Store')}</h2>
                <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest">{t('home.store.subtitle', 'Tesoros artesanales con certificación de origen')}</p>
              </div>
              <button onClick={() => navigate('/tienda')} className="group flex items-center gap-2 text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('home.store.link', 'Ver toda la tienda')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-square bg-[var(--bg-card)] animate-pulse rounded-[30px] border border-[var(--border-color)]"></div>)
                : productos.length > 0 ? productos.map(prod => (
                <ProductCard 
                  key={prod.id} 
                  producto={prod} 
                  onClickCard={(id) => navigate(`/tienda/${id}`)}
                />
              )) : <div className="col-span-full h-32 border border-dashed border-[var(--border-color)] rounded-[30px] flex items-center justify-center text-[var(--text-body)] font-mono text-[9px] uppercase tracking-[0.2em]">{t('home.store.empty', 'Tienda en preparación')}</div>}
            </div>
          </section>

          {/* 📚 APRENDE */}
          <section>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-[3px] border-transparent pl-6 relative">
              <div className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-[rgb(var(--role-accent))] rounded-full"></div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t('home.learn.title', 'Aprende')}</h2>
                <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest">{t('home.learn.subtitle', 'Cátedra cultural por nuestros maestros')}</p>
              </div>
              <button onClick={() => navigate('/aprende')} className="group flex items-center gap-2 text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('home.learn.link', 'Ver todos los cursos')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {loading ? [...Array(3)].map((_, i) => <div key={i} className="aspect-video bg-[var(--bg-card)] animate-pulse rounded-[30px] border border-[var(--border-color)]"></div>)
                : educacion.length > 0 ? educacion.map(clase => {
                const eduImgRaw = clase.cover || clase.portada || clase.thumbnail || clase.foto || clase.image || clase.imagen || clase.file_path || clase.images?.[0];
                const eduImg = getSafeImageUrl(eduImgRaw);

                return (
                  <div 
                    key={clase.id} 
                    onClick={(e) => { e.stopPropagation(); navigate(`/aprende/${clase.id}`); }}
                    className="group flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[30px] p-5 hover:border-[rgb(var(--role-accent))]/50 transition-all shadow-sm cursor-pointer active:scale-[0.98]"
                  >
                    <div className="w-full aspect-video rounded-[20px] overflow-hidden mb-6 relative bg-[var(--bg-primary)]">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20"><BookOpen size={32} className="text-[var(--text-body)]"/></div>
                      <img 
                        src={eduImg} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 z-10" 
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} 
                        alt={clase.titulo || 'Cátedra'}
                      />
                      <div className="absolute top-4 left-4 z-20 bg-[rgb(var(--role-accent))] text-white text-[7px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                         <Zap size={8} fill="currentColor"/> {t('home.learn.badge', 'Especialidad')}
                      </div>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-[var(--text-heading)] mb-4 leading-tight line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-colors">{clase.titulo || clase.title || 'Historia Cultural'}</h3>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                      <div className="flex flex-col gap-0.5">
                         <span className="text-[var(--text-body)] font-mono text-[7px] uppercase tracking-widest">{t('home.learn.duration', 'Duración')}</span>
                         <span className="text-[var(--text-heading)] font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} className="text-[rgb(var(--role-accent))]"/> {clase.duracion || '25 min'}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : <div className="col-span-full h-48 border border-dashed border-[var(--border-color)] rounded-[30px] flex flex-col items-center justify-center gap-3 text-[var(--text-body)]">
                     <BookOpen size={24} strokeWidth={1.5} />
                     <p className="font-mono text-[8px] uppercase tracking-widest text-center">{t('home.learn.empty', 'Próximamente nuevos talleres')}</p>
                  </div>}
            </div>
          </section>

          {/* 👥 DIRECTORIO */}
          <section>
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-[3px] border-transparent pl-6 relative">
              <div className="absolute -left-[3px] top-0 bottom-0 w-[3px] bg-[rgb(var(--role-accent))] rounded-full"></div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{t('home.directory.title', 'Directorio')}</h2>
                <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest">{t('home.directory.subtitle', 'Los creadores detrás del legado')}</p>
              </div>
              <button onClick={() => navigate('/artesanos')} className="group flex items-center gap-2 text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors pb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('home.directory.link', 'Ver todos los artistas')}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {loading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-square bg-[var(--bg-card)] animate-pulse rounded-full border border-[var(--border-color)] mx-auto w-3/4"></div>)
                : artistas.length > 0 ? artistas.map(art => (
                <ArtistCard key={art.id} artista={art} onClickCard={(username) => navigate(`/artesanos/${username}`)} />
              )) : <div className="col-span-full h-32 border border-dashed border-[var(--border-color)] rounded-[30px] flex items-center justify-center text-[var(--text-body)] font-mono text-[9px] uppercase tracking-[0.2em]">{t('home.directory.empty', 'Próximamente catálogo de artistas')}</div>}
            </div>
          </section>

        </div>
      </main>

      <Footer />
      {obraSeleccionada && <ArtModal obraId={obraSeleccionada} onClose={() => setObraSeleccionada(null)} token={localStorage.getItem('token')} />}
    </div>
  );
};

export default Home;