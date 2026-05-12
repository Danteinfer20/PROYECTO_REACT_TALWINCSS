import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, BrainCircuit, User, Loader2, 
  ShoppingBag, Phone, Instagram, Facebook, Mail 
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Leccion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 🔥 MOTOR DE ESTADO PARA ROL CROMÁTICO
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    window.scrollTo(0, 0);
    cargarLeccion();
  }, [id]);

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

  const cargarLeccion = async () => {
    try {
      const response = await axios.get(`${API_URL}/education/${id}`);
      setLeccion(response.data.data);
    } catch (error) {
      console.error("Error en la cátedra:", error);
      navigate('/aprende'); 
    } finally {
      setLoading(false);
    }
  };

  const traducirDificultad = (nivel) => {
    const config = {
      'beginner': { texto: 'Básico', color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
      'intermediate': { texto: 'Intermedio', color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
      'advanced': { texto: 'Avanzado', color: 'text-rose-500', border: 'border-rose-500/20', bg: 'bg-rose-500/10' }
    };
    return config[nivel] || { texto: 'General', color: 'text-[rgb(var(--role-accent))]', border: 'border-[rgb(var(--role-accent))]/20', bg: 'bg-[rgb(var(--role-accent))]/10' };
  };

  if (loading || !leccion) {
    return (
      <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex flex-col justify-center items-center transition-colors duration-500">
        <Loader2 size={40} strokeWidth={1.25} className="animate-spin text-[rgb(var(--role-accent))] mb-6" />
        <p className="text-[rgb(var(--role-accent))] font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Reconstruyendo Archivo...</p>
      </div>
    );
  }

  const confDif = traducirDificultad(leccion.metadata?.difficulty_level);

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[rgb(var(--role-accent))]/30 relative transition-colors duration-500">
      
      {/* BARRA DE PROGRESO */}
      <div className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[rgb(var(--role-accent))] to-[rgba(var(--role-accent),0.5)] z-[9999] shadow-[0_0_20px_rgba(var(--role-accent),0.8)]" style={{ width: `${scrollProgress}%` }}></div>

      <Navbar />

      <main className="flex-1 w-full pb-0">
        
        {/* 🔥 HERO COMPACTO */}
        <header className="relative w-full pt-16 md:pt-20 pb-10 border-b border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-[rgb(var(--role-accent))]/15 blur-[150px] rounded-full pointer-events-none"></div>
          
          <div className="w-[95%] max-w-[1200px] mx-auto px-4 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-body)] px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-sm">
                <BrainCircuit size={14} strokeWidth={1.5} className="text-[rgb(var(--role-accent))]" /> {leccion.metadata?.knowledge_area || 'Patrimonio'}
              </span>
              <span className={`border px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${confDif.color} ${confDif.border} ${confDif.bg}`}>
                Nivel {confDif.texto}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-[var(--text-heading)] leading-[0.95] mb-6 max-w-5xl transition-colors duration-500 drop-shadow-sm">
              {leccion.title}
            </h1>

            <p className="text-xl text-[var(--text-body)] font-medium leading-relaxed max-w-3xl border-l-[3px] border-[rgb(var(--role-accent))] pl-6 transition-colors duration-500">
              {leccion.excerpt}
            </p>
          </div>
        </header>

        {/* 🔥 LAYOUT DE LECTURA */}
        <section className="w-[95%] max-w-[1200px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16">
          
          {/* SIDEBAR LIMPIO */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 flex flex-col gap-8 bg-[var(--bg-container)]/80 backdrop-blur-xl p-8 rounded-[40px] border border-[var(--border-color)] shadow-sm transition-colors duration-500">
              
              <div>
                <span className="text-[9px] font-black text-[var(--text-body)] uppercase tracking-[0.3em] mb-5 block">Cátedra por</span>
                <div 
                  className="flex items-center gap-4 group cursor-pointer" 
                  onClick={() => navigate(`/artesanos/${leccion.author?.name}`)}
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-[rgb(var(--role-accent))]/50 transition-all duration-300">
                    {leccion.author?.avatar ? (
                      <img src={leccion.author.avatar} alt="Maestro" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <User size={24} strokeWidth={1.5} className="text-[rgb(var(--role-accent))]"/>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-[var(--text-heading)] uppercase tracking-widest group-hover:text-[rgb(var(--role-accent))] transition-colors">{leccion.author?.name || 'Anónimo'}</h4>
                    <p className="text-[10px] text-[var(--text-body)] font-mono tracking-widest mt-1">Maestro Caucano</p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-[var(--border-color)]"></div>

              <div className="flex items-center gap-3 text-[var(--text-body)]">
                <Clock size={16} strokeWidth={1.5} className="text-[rgb(var(--role-accent))]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{leccion.metadata?.estimated_read_time || 15} Min de lectura</span>
              </div>
            </div>
          </aside>

          {/* CUERPO EDITORIAL JUSTIFICADO (Soporte Light/Dark en prose) */}
          <article className="flex-1 max-w-[850px]">
            <div 
              className="prose prose-lg max-w-none text-[var(--text-body)] font-medium leading-[2.1]
                         prose-p:text-justify prose-p:mb-10 prose-p:tracking-wide
                         prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-[var(--text-heading)] prose-headings:mt-20 prose-headings:mb-8
                         prose-blockquote:border-l-[4px] prose-blockquote:border-[rgb(var(--role-accent))] prose-blockquote:bg-[var(--bg-container)] prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:rounded-r-[30px] prose-blockquote:text-[var(--text-heading)] prose-blockquote:my-16 prose-blockquote:shadow-sm prose-blockquote:not-italic
                         prose-img:rounded-[40px] prose-img:border prose-img:border-[var(--border-color)] prose-img:shadow-md prose-img:my-16
                         prose-ul:text-justify prose-ol:text-justify"
              dangerouslySetInnerHTML={{ __html: leccion.content || `<p>${leccion.excerpt}</p>` }}
            />
          </article>

        </section>

        {/* 🔥 CTA FINAL */}
        <section className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center overflow-hidden border-t border-[var(--border-color)] mt-10 bg-[var(--bg-primary)] transition-colors duration-500">
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[rgb(var(--role-accent))]/15 blur-[120px] rounded-[100%] pointer-events-none"></div>

          <div className="text-center relative z-10 mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight mb-2 text-[var(--text-heading)]">
              <span className="text-[var(--text-body)] opacity-70">El legado continúa</span><br/>
              <span className="drop-shadow-sm">en tus manos.</span>
            </h2>
          </div>

          {/* DOCK FLOTANTE */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 bg-[var(--bg-container)]/80 backdrop-blur-2xl border border-[var(--border-color)] p-2.5 rounded-3xl sm:rounded-full shadow-lg transition-colors duration-500">
            
            <div className="flex items-center gap-2 px-2">
               <a href={`https://wa.me/`} aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300">
                  <Phone size={16} strokeWidth={1.5} />
               </a>
               <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] hover:text-white hover:bg-pink-600 hover:border-pink-600 hover:shadow-[0_0_15px_rgba(219,39,119,0.4)] transition-all duration-300">
                  <Instagram size={16} strokeWidth={1.5} />
               </a>
               <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300">
                  <Facebook size={16} strokeWidth={1.5} />
               </a>
               <a href={`mailto:soporte@popayancultural.com?subject=Interes en Taller: ${leccion.title}`} aria-label="Correo" className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] hover:text-white hover:bg-[rgb(var(--role-accent))] hover:border-[rgb(var(--role-accent))] hover:shadow-[0_0_15px_rgba(var(--role-accent),0.4)] transition-all duration-300">
                  <Mail size={16} strokeWidth={1.5} />
               </a>
            </div>

            <div className="w-full sm:w-px h-px sm:h-8 bg-[var(--border-color)] my-2 sm:my-0 sm:mx-2"></div>

            <button onClick={() => navigate('/tienda')} className="w-full sm:w-auto h-12 px-6 rounded-full bg-[rgb(var(--role-accent))] text-white font-black text-[9px] uppercase tracking-[0.2em] hover:opacity-90 shadow-[0_10px_20px_rgba(var(--role-accent),0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
               <ShoppingBag size={14} strokeWidth={2} /> Explorar Obras
            </button>
            
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Leccion;