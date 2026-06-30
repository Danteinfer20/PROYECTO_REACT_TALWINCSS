import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, 
  MapPin, ArrowRight, Eye, BookOpen, 
  Loader2, Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx';
import ProductCard from '../components/cards/ProductCard.jsx';
import ArtistCard from '../components/cards/ArtistCard.jsx';

// ─── Helpers ────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566417712758-5bf8bd7b4a0a?q=80&w=2070&auto=format&fit=crop';

const getSafeImageUrl = (url) => {
  if (!url) return FALLBACK_IMAGE;
  if (Array.isArray(url)) url = url[0];
  if (typeof url !== 'string') return FALLBACK_IMAGE;
  return url.startsWith('http://') || url.startsWith('https://') ? url : FALLBACK_IMAGE;
};

const roleAccentMap = {
  admin: '59 130 246',
  cultural_manager: '16 185 129',
  educator: '245 158 11',
  artist: '244 63 94',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Encabezado reutilizable de cada sección */
const SectionHeader = ({ title, subtitle, linkLabel, onLink }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6" style={{ borderRadius: 0 }}>
    <div className="flex items-start gap-3">
      <div className="w-[3px] self-stretch bg-[rgb(var(--role-accent))] rounded-none shrink-0 mt-1" style={{ borderRadius: 0 }} />
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.15em] mt-1">
          {subtitle}
        </p>
      </div>
    </div>
    {onLink && (
      <button
        onClick={onLink}
        className="group flex items-center gap-1.5 text-gray-400 hover:text-[rgb(var(--role-accent))] text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 self-start sm:self-auto"
      >
        {linkLabel}
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    )}
  </div>
);

/** Skeleton genérico con aspect ratio configurable */
const Skeleton = ({ className = '' }) => (
  <div className={`bg-[var(--bg-card)] animate-pulse rounded-xl border border-[var(--border-color)] ${className}`} />
);

/** Scroll horizontal móvil con fade en los bordes */
const HorizontalScroll = ({ children }) => (
  <div className="relative">
    <div className="overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-3 w-max">
        {children}
      </div>
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const Home = () => {
  const navigate  = useNavigate();
  const { t }     = useTranslation();

  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem('user');
      return s && s !== 'undefined' ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [obras,       setObras]       = useState([]);
  const [productos,   setProductos]   = useState([]);
  const [artistas,    setArtistas]    = useState([]);
  const [eventos,     setEventos]     = useState([]);
  const [educacion,   setEducacion]   = useState([]);
  const [favoritosIds, setFavoritosIds] = useState([]);

  const [loading,     setLoading]     = useState(true);
  const [errorGlobal, setErrorGlobal] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused,   setIsPaused]   = useState(false);
  const timerRef   = useRef(null);
  const touchStart = useRef(null);

  // Accent RGB según rol
  const accentRGB = user ? (roleAccentMap[user.user_type] ?? '168 85 247') : '168 85 247';

  // Sincronizar usuario desde otras pestañas
  useEffect(() => {
    const handler = () => {
      try {
        const s = localStorage.getItem('user');
        setUser(s && s !== 'undefined' ? JSON.parse(s) : null);
      } catch { setUser(null); }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      try {
        setLoading(true);
        const results = await Promise.allSettled([
          api.get('/posts',     { params: { type: 'obra' } }),
          api.get('/products'),
          api.get('/artists'),
          api.get('/events'),
          api.get('/education'),
        ]);

        const getData = (r) =>
          r.status === 'fulfilled' && r.value.data.data ? r.value.data.data : [];

        const posts = getData(results[0]);
        setObras(     posts.filter((p) => !p.is_educational).slice(0, 5));
        setProductos( getData(results[1]).slice(0, 5));
        setArtistas(  getData(results[2]).slice(0, 5));
        setEventos(   getData(results[3]).slice(0, 4));
        setEducacion( getData(results[4]).slice(0, 3));

        if (token) {
          try {
            const r = await api.get('/saved-items', { timeout: 8000 });
            setFavoritosIds(r.data.data.map((f) => f.post_id));
          } catch { /* ignore */ }
        }
      } catch {
        setErrorGlobal(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Carrusel automático ────────────────────────────────────────────────────
  useEffect(() => {
    if (eventos.length <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setSlideIndex((p) => (p + 1) % eventos.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, [eventos.length, isPaused]);

  const goToSlide = (idx) => {
    clearInterval(timerRef.current);
    setSlideIndex(idx);
    if (eventos.length > 1) {
      timerRef.current = setInterval(() => {
        setSlideIndex((p) => (p + 1) % eventos.length);
      }, 6000);
    }
  };

  const prevSlide = () => goToSlide((slideIndex - 1 + eventos.length) % eventos.length);
  const nextSlide = () => goToSlide((slideIndex + 1) % eventos.length);

  // Swipe touch para el carrusel
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
    touchStart.current = null;
  };

  // ── Error global ───────────────────────────────────────────────────────────
  if (errorGlobal) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-2xl font-bold italic uppercase tracking-tighter text-center">
          Portal fuera de línea
        </h2>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-[rgb(var(--role-accent,168_85_247))] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
        >
          Reconectar
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{ '--role-accent': accentRGB }}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col relative font-sans transition-colors duration-500"
    >
      <Navbar />

      <main className="flex-1 w-full"
            style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>

        {/* ════════════════════════════════════════════════════════════════════
            HERO CARRUSEL
        ════════════════════════════════════════════════════════════════════ */}
        <section
          className="relative w-full overflow-hidden"
          style={{ height: 'clamp(320px, 52vw, 560px)' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Eventos destacados"
        >
          {loading ? (
            <div className="w-full h-full bg-[var(--bg-card)] animate-pulse flex items-center justify-center">
              <Loader2 className="animate-spin text-[rgb(var(--role-accent))] w-8 h-8 opacity-60" />
            </div>
          ) : eventos.length > 0 ? (
            <>
              {eventos.map((evento, idx) => {
                const img    = getSafeImageUrl(evento.images?.[0] ?? evento.image ?? evento.cover);
                const active = idx === slideIndex;
                return (
                  <div
                    key={evento.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    aria-hidden={!active}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={evento.title ?? 'Evento'}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
                    />
                    {/* Overlays: gradiente vertical + lateral */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/85 via-[var(--bg-primary)]/20 to-transparent pointer-events-none" />

                    {/* Contenido del slide */}
                    <div className="absolute inset-0 z-20 flex items-end pb-10 sm:items-center sm:pb-0 px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
                      <div className="max-w-lg">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar size={12} className="text-[rgb(var(--role-accent))] shrink-0" />
                          <span className="text-[rgb(var(--role-accent))] text-[9px] font-bold uppercase tracking-[0.3em]">
                            Evento destacado
                          </span>
                        </div>

                        {/* Título */}
                        <h2 className="text-[clamp(1.6rem,5vw,3.5rem)] font-black uppercase tracking-tight leading-[1.05] text-white">
                          {evento.title}
                        </h2>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-gray-300 text-[11px] font-mono uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-[rgb(var(--role-accent))] shrink-0" />
                            {evento.location_name ?? 'Popayán'}
                          </span>
                          <span className="flex items-center gap-1.5 border-l border-gray-600 pl-4">
                            <Clock size={12} className="text-[rgb(var(--role-accent))] shrink-0" />
                            {evento.start_date
                              ? new Date(evento.start_date).toLocaleDateString('es-CO')
                              : 'Próximamente'}
                          </span>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => navigate(`/evento/${evento.id}`)}
                          className="mt-5 inline-flex items-center gap-2 bg-[rgb(var(--role-accent))] text-white px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                        >
                          <Eye size={14} />
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5" role="tablist">
                {eventos.map((_, idx) => (
                  <button
                    key={idx}
                    role="tab"
                    aria-selected={idx === slideIndex}
                    aria-label={`Ir al evento ${idx + 1}`}
                    onClick={() => goToSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === slideIndex
                        ? 'bg-[rgb(var(--role-accent))] w-6'
                        : 'bg-white/30 hover:bg-white/60 w-1.5'
                    }`}
                  />
                ))}
              </div>

              {/* Flechas — ocultas en móvil muy pequeño, visibles desde sm */}
              {eventos.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-9 h-9 rounded-full items-center justify-center transition-all"
                    aria-label="Evento anterior"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-9 h-9 rounded-full items-center justify-center transition-all"
                    aria-label="Siguiente evento"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-mono text-xs uppercase tracking-widest">
              Sin eventos programados
            </div>
          )}
        </section>

        {/* Separador visual bajo el hero */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="h-px bg-[var(--border-color)] mb-10 mt-2 opacity-50" />
        </div>

        {/* Wrapper de secciones con padding horizontal unificado */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-16 md:space-y-20">

          {/* ════════════════════════════════════════════════════════════════
              AGENDA CULTURAL
          ════════════════════════════════════════════════════════════════ */}
          <section id="agenda" className="scroll-mt-20">
            <SectionHeader
              title="Agenda cultural"
              subtitle="Próximos eventos y convocatorias"
              linkLabel="Ver agenda completa"
              onLink={() => navigate('/eventos')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px]" />
                  ))
                : eventos.length > 0
                ? eventos.map((ev) => (
                    <button
                      key={ev.id}
                      onClick={() => navigate(`/evento/${ev.id}`)}
                      className="group flex items-stretch text-left bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:border-[rgb(var(--role-accent))]/60 hover:bg-[var(--bg-card)]/80 transition-all overflow-hidden"
                    >
                      {/* Fecha */}
                      <div className="w-14 sm:w-16 shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border-color)] flex flex-col items-center justify-center py-3 gap-0.5">
                        <span className="text-[rgb(var(--role-accent))] text-lg font-black leading-none">
                          {ev.start_date ? new Date(ev.start_date).getDate() : '??'}
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-gray-500">
                          {ev.start_date
                            ? new Date(ev.start_date).toLocaleString('es', { month: 'short' })
                            : 'Mes'}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 px-3 py-2.5 flex flex-col justify-center gap-1">
                        <h3 className="text-sm font-semibold leading-snug line-clamp-1 group-hover:text-[rgb(var(--role-accent))] transition-colors">
                          {ev.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <MapPin size={9} className="shrink-0" />
                            {ev.location_name ?? 'Popayán'}
                          </span>
                          <span className="flex items-center gap-1 border-l border-gray-700/60 pl-3">
                            <Clock size={9} className="shrink-0" />
                            {ev.start_date
                              ? new Date(ev.start_date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                              : '--:--'}
                          </span>
                        </div>
                      </div>

                      {/* Flecha */}
                      <div className="flex items-center pr-3">
                        <ChevronRight size={15} className="text-gray-600 group-hover:text-[rgb(var(--role-accent))] transition-colors" />
                      </div>
                    </button>
                  ))
                : (
                    <div className="col-span-full h-20 border border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500 font-mono text-[11px] uppercase tracking-widest">
                      Sin eventos programados
                    </div>
                  )}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              OBRAS MAESTRAS
          ════════════════════════════════════════════════════════════════ */}
          <section id="obras" className="scroll-mt-20">
            <SectionHeader
              title="Obras maestras"
              subtitle="Selección exclusiva de nuestro archivo patrimonial"
              linkLabel="Ver galería completa"
              onLink={() => navigate('/obras')}
            />

            {/* Móvil: scroll horizontal */}
            <div className="md:hidden">
              <HorizontalScroll>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-44 aspect-[4/5] shrink-0" />
                    ))
                  : obras.length > 0
                  ? obras.map((obra) => (
                      <div key={obra.id} className="w-44 shrink-0">
                        <ArtCard obra={obra} onClickCard={() => navigate(`/obra/${obra.id}`)} />
                      </div>
                    ))
                  : <EmptyState label="Próximamente nuevas obras" />}
              </HorizontalScroll>
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5]" />
                  ))
                : obras.length > 0
                ? obras.map((obra) => (
                    <ArtCard key={obra.id} obra={obra} onClickCard={() => navigate(`/obra/${obra.id}`)} />
                  ))
                : <EmptyState className="col-span-full" label="Próximamente nuevas obras" />}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              POP STORE
          ════════════════════════════════════════════════════════════════ */}
          <section id="tienda" className="scroll-mt-20">
            <SectionHeader
              title="Pop Store"
              subtitle="Tesoros artesanales con certificación de origen"
              linkLabel="Ver toda la tienda"
              onLink={() => navigate('/tienda')}
            />

            {/* Móvil */}
            <div className="md:hidden">
              <HorizontalScroll>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="w-44 aspect-square shrink-0" />
                    ))
                  : productos.length > 0
                  ? productos.map((prod) => (
                      <div key={prod.id} className="w-44 shrink-0">
                        <ProductCard producto={prod} onClickCard={(id) => navigate(`/tienda/${id}`)} />
                      </div>
                    ))
                  : <EmptyState label="Tienda en preparación" />}
              </HorizontalScroll>
            </div>

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))
                : productos.length > 0
                ? productos.map((prod) => (
                    <ProductCard key={prod.id} producto={prod} onClickCard={(id) => navigate(`/tienda/${id}`)} />
                  ))
                : <EmptyState className="col-span-full" label="Tienda en preparación" />}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              APRENDE
          ════════════════════════════════════════════════════════════════ */}
          <section id="aprende" className="scroll-mt-20">
            <SectionHeader
              title="Aprende"
              subtitle="Cátedra cultural por nuestros maestros"
              linkLabel="Ver todos los cursos"
              onLink={() => navigate('/aprende')}
            />

            {/* Móvil */}
            <div className="md:hidden">
              <HorizontalScroll>
                {loading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="w-60 aspect-video shrink-0" />
                    ))
                  : educacion.length > 0
                  ? educacion.map((clase) => (
                      <CursoCard
                        key={clase.id}
                        clase={clase}
                        onClick={() => navigate(`/aprende/${clase.id}`)}
                        className="w-60 shrink-0"
                      />
                    ))
                  : <EmptyState label="Próximamente nuevos talleres" />}
              </HorizontalScroll>
            </div>

            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-5">
              {loading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video" />
                  ))
                : educacion.length > 0
                ? educacion.map((clase) => (
                    <CursoCard
                      key={clase.id}
                      clase={clase}
                      onClick={() => navigate(`/aprende/${clase.id}`)}
                    />
                  ))
                : (
                    <div className="col-span-full h-32 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500 font-mono text-[11px] uppercase tracking-widest">
                      <BookOpen size={22} className="opacity-30" />
                      Próximamente nuevos talleres
                    </div>
                  )}
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              DIRECTORIO
          ════════════════════════════════════════════════════════════════ */}
          <section id="directorio" className="scroll-mt-20">
            <SectionHeader
              title="Directorio"
              subtitle="Los creadores detrás del legado"
              linkLabel="Ver todos los artistas"
              onLink={() => navigate('/artesanos')}
            />

            {/* Móvil: scroll horizontal con avatares más grandes */}
            <div className="md:hidden">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-4 w-max pb-3 pt-1">
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-20 shrink-0 flex flex-col items-center gap-2">
                          <Skeleton className="w-16 h-16 rounded-full" />
                          <Skeleton className="h-2.5 w-14 rounded" />
                        </div>
                      ))
                    : artistas.length > 0
                    ? artistas.map((art) => (
                        <div key={art.id} className="w-20 shrink-0">
                          <ArtistCard
                            artista={art}
                            onClickCard={(username) => navigate(`/artesanos/${username}`)}
                          />
                        </div>
                      ))
                    : <EmptyState label="Próximamente artistas" />}
                  <div className="w-4 shrink-0" />
                </div>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded-full mx-auto w-3/4" />
                  ))
                : artistas.length > 0
                ? artistas.map((art) => (
                    <ArtistCard
                      key={art.id}
                      artista={art}
                      onClickCard={(username) => navigate(`/artesanos/${username}`)}
                    />
                  ))
                : (
                    <div className="col-span-full h-32 border border-dashed border-gray-700 rounded-xl flex items-center justify-center text-gray-500 font-mono text-[11px] uppercase tracking-widest">
                      Próximamente catálogo de artistas
                    </div>
                  )}
            </div>
          </section>

        </div>{/* /wrapper secciones */}
      </main>

      <Footer />
    </div>
  );
};

// ─── CursoCard extraído para no repetir 2 veces ───────────────────────────────
const CursoCard = ({ clase, onClick, className = '' }) => {
  const img = getSafeImageUrl(clase.cover_image);
  return (
    <div
      onClick={onClick}
      className={`group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[rgb(var(--role-accent))]/50 transition-all cursor-pointer ${className}`}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--bg-primary)]">
        <img
          src={img}
          alt={clase.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={(e) => { e.currentTarget.src = getSafeImageUrl(null); }}
        />
        <div className="absolute top-2 left-2 bg-[rgb(var(--role-accent))] text-white text-[8px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
          <Zap size={9} fill="currentColor" aria-hidden="true" /> Especialidad
        </div>
      </div>
      <div className="p-3 md:p-4">
        <h3 className="text-sm font-bold line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-colors leading-snug">
          {clase.title}
        </h3>
        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--border-color)] pt-2.5 text-[9px] md:text-[10px] text-gray-400 font-mono uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Clock size={10} className="text-[rgb(var(--role-accent))] shrink-0" />
            {clase.metadata?.estimated_read_time ?? '15'} min
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={10} className="text-[rgb(var(--role-accent))] shrink-0" />
            {clase.metadata?.difficulty_level ?? 'Intermedio'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ label, className = '' }) => (
  <div className={`h-20 border border-dashed border-gray-700/60 rounded-xl flex items-center justify-center text-gray-500 font-mono text-[11px] uppercase tracking-widest ${className}`}>
    {label}
  </div>
);

export default Home;