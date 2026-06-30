import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, BrainCircuit, User, Loader2, 
  ShoppingBag, Mail, MessageCircle, ChevronLeft,
  Award, BookOpen, Calendar, Phone
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Leccion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch { return null; }
  });

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247';
    const map = {
      admin: '59 130 246',
      cultural_manager: '16 185 129',
      educator: '245 158 11',
      artist: '244 63 94',
    };
    return map[user.user_type] || '168 85 247';
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1566417712758-5bf8bd7b4a0a?q=80&w=2070&auto=format&fit=crop';

  useEffect(() => {
    window.scrollTo(0, 0);
    const cargarLeccion = async () => {
      try {
        const response = await api.get(`/education/${id}`);
        setLeccion(response.data.data);
      } catch (error) {
        console.error("Error en la cátedra:", error);
        navigate('/aprende');
      } finally {
        setLoading(false);
      }
    };
    cargarLeccion();
  }, [id, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const traducirDificultad = (nivel) => {
    const config = {
      beginner: { texto: 'Básico', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
      intermediate: { texto: 'Intermedio', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
      advanced: { texto: 'Avanzado', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/30' }
    };
    return config[nivel] || { texto: 'General', color: 'text-[rgb(var(--role-accent))]', bg: 'bg-[rgb(var(--role-accent))]/20', border: 'border-[rgb(var(--role-accent))]/30' };
  };

  if (loading || !leccion) {
    return (
      <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center">
        <Loader2 size={40} className="animate-spin text-[rgb(var(--role-accent))] mb-6" />
        <p className="text-[rgb(var(--role-accent))] font-mono text-xs uppercase tracking-widest animate-pulse">Cargando lección...</p>
      </div>
    );
  }

  const confDif = traducirDificultad(leccion.metadata?.difficulty_level);
  const coverImage = leccion.cover_image || fallbackImage;
  const author = leccion.author || {};

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col">
      
      {/* Barra de progreso */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[rgb(var(--role-accent))] to-[rgba(var(--role-accent),0.3)] z-[9999] transition-all duration-300" style={{ width: `${scrollProgress}%` }} />

      <Navbar />

      <main className="flex-1 w-full">
        
        {/* ===================================================== */}
        {/* HERO - EQUILIBRADO, SIN EXAGERACIÓN */}
        {/* ===================================================== */}
        <header className="relative w-full overflow-hidden bg-[var(--bg-primary)]">
          {/* Imagen de fondo sutil */}
          <div className="absolute inset-0 z-0">
            <img
              src={imageError ? fallbackImage : coverImage}
              className="w-full h-full object-cover opacity-40 grayscale-[20%]"
              alt={leccion.title}
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/90 via-[var(--bg-primary)]/70 to-[var(--bg-primary)]" />
          </div>

          {/* Contenido */}
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
            <div className="max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-[var(--bg-container)]/80 backdrop-blur-sm border border-[var(--border-color)] px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[var(--text-body)]">
                  <BrainCircuit size={12} className="text-[rgb(var(--role-accent))]" />
                  {leccion.metadata?.knowledge_area || 'Patrimonio'}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${confDif.bg} ${confDif.color} border ${confDif.border}`}>
                  <Award size={12} /> {confDif.texto}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[var(--bg-container)]/80 backdrop-blur-sm border border-[var(--border-color)] px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]">
                  <Clock size={12} className="text-[rgb(var(--role-accent))]" />
                  {leccion.metadata?.estimated_read_time || 15} min
                </span>
              </div>

              {/* Título */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-[var(--text-heading)] mb-3">
                {leccion.title}
              </h1>

              {/* Extracto */}
              <p className="text-sm sm:text-base text-[var(--text-body)] leading-relaxed max-w-2xl">
                {leccion.excerpt}
              </p>

              {/* Autor y contacto - SIEMPRE VISIBLE */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-[var(--bg-primary)] border-2 border-[rgb(var(--role-accent))] flex items-center justify-center">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-[rgb(var(--role-accent))]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-body)] opacity-60">Curaduría</p>
                    <p className="text-sm font-bold text-[var(--text-heading)]">{author.name || 'Maestro Anónimo'}</p>
                  </div>
                </div>

                {/* Botones de contacto (siempre visibles, con placeholders) */}
                <div className="flex flex-wrap items-center gap-2 ml-0 sm:ml-auto">
                  {author.phone ? (
                    <a
                      href={`https://wa.me/${author.phone.replace(/\s+/g, '')}?text=Hola%20${encodeURIComponent(author.name || 'Maestro')}%2C%20estoy%20interesado%20en%20la%20lección%20"${encodeURIComponent(leccion.title)}"`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-[var(--text-body)] opacity-40 border border-dashed border-[var(--border-color)]">
                      <MessageCircle size={14} /> Sin contacto
                    </span>
                  )}
                  {author.email ? (
                    <a
                      href={`mailto:${author.email}?subject=Interés%20en%20la%20lección%20${encodeURIComponent(leccion.title)}`}
                      className="flex items-center gap-1.5 bg-[rgb(var(--role-accent))]/10 hover:bg-[rgb(var(--role-accent))] text-[rgb(var(--role-accent))] hover:text-white border border-[rgb(var(--role-accent))]/30 hover:border-[rgb(var(--role-accent))] px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95"
                    >
                      <Mail size={14} /> Correo
                    </a>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-[var(--text-body)] opacity-40 border border-dashed border-[var(--border-color)]">
                      <Mail size={14} /> Sin correo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================== */}
        {/* CUERPO DE LA LECCIÓN */}
        {/* ===================================================== */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Contenido principal */}
            <article className="lg:col-span-3">
              <div 
                className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-[var(--text-body)] 
                           prose-p:leading-relaxed prose-p:mb-4
                           prose-headings:font-bold prose-headings:text-[var(--text-heading)] prose-headings:tracking-tight
                           prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3
                           prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                           prose-strong:text-[rgb(var(--role-accent))]
                           prose-blockquote:border-l-4 prose-blockquote:border-[rgb(var(--role-accent))] prose-blockquote:bg-[var(--bg-container)] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:text-[var(--text-heading)] prose-blockquote:not-italic
                           prose-img:rounded-xl prose-img:shadow-md
                           prose-ul:space-y-1.5 prose-ol:space-y-1.5"
                dangerouslySetInnerHTML={{ __html: leccion.content || `<p>${leccion.excerpt}</p>` }}
              />
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-5">
              {/* Objetivos */}
              {leccion.metadata?.learning_objectives?.length > 0 && (
                <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-xl p-5 shadow-sm">
                  <h4 className="text-[9px] font-bold uppercase tracking-wider text-[rgb(var(--role-accent))] mb-3 flex items-center gap-2">
                    <BookOpen size={14} /> Objetivos
                  </h4>
                  <ul className="space-y-2">
                    {leccion.metadata.learning_objectives.map((obj, i) => (
                      <li key={i} className="text-xs text-[var(--text-body)] flex items-start gap-2 leading-relaxed">
                        <span className="text-[rgb(var(--role-accent))] font-bold mt-0.5">✦</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Volver al archivo */}
              <button
                onClick={() => navigate('/aprende')}
                className="w-full flex items-center justify-center gap-2 bg-[var(--bg-container)] hover:bg-[var(--text-heading)]/5 border border-[var(--border-color)] rounded-xl px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-[var(--text-body)] hover:text-[var(--text-heading)] transition-all"
              >
                <ChevronLeft size={14} /> Volver al archivo
              </button>
            </aside>
          </div>
        </section>

        {/* ===================================================== */}
        {/* PIE DE PÁGINA - ACCIÓN ÚTIL */}
        {/* ===================================================== */}
        <section className="w-full bg-[var(--bg-container)] border-t border-[var(--border-color)] py-8 sm:py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-[var(--text-body)] opacity-60 mb-4 font-mono uppercase tracking-widest">
              ¿Te gustó esta lección?
            </p>
            <button
              onClick={() => navigate('/aprende')}
              className="inline-flex items-center gap-2 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-[rgb(var(--role-accent))]/30 active:scale-95"
            >
              <BookOpen size={16} /> Explorar más contenido
            </button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Leccion;