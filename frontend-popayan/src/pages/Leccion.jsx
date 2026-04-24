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
      'beginner': { texto: 'Básico', color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/10' },
      'intermediate': { texto: 'Intermedio', color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/10' },
      'advanced': { texto: 'Avanzado', color: 'text-rose-400', border: 'border-rose-400/20', bg: 'bg-rose-400/10' }
    };
    return config[nivel] || { texto: 'General', color: 'text-[#a855f7]', border: 'border-[#a855f7]/20', bg: 'bg-[#a855f7]/10' };
  };

  if (loading || !leccion) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col justify-center items-center">
        <Loader2 size={40} strokeWidth={1.25} className="animate-spin text-[#a855f7] mb-6" />
        <p className="text-[#a855f7] font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">Reconstruyendo Archivo...</p>
      </div>
    );
  }

  const confDif = traducirDificultad(leccion.metadata?.difficulty_level);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#a855f7]/30 relative">
      {/* BARRA DE PROGRESO */}
      <div className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#a855f7] to-[#c084fc] z-[9999] shadow-[0_0_20px_rgba(168,85,247,0.8)]" style={{ width: `${scrollProgress}%` }}></div>

      <Navbar />

      <main className="flex-1 w-full pb-0">
        
        {/* 🔥 HERO COMPACTO: Espacio superior reducido drásticamente */}
        <header className="relative w-full pt-16 md:pt-20 pb-10 border-b border-white/5 bg-[#0A0A0C] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-[#a855f7]/15 blur-[150px] rounded-full pointer-events-none"></div>
          
          <div className="w-[95%] max-w-[1200px] mx-auto px-4 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-[#111113] border border-white/10 text-gray-300 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <BrainCircuit size={14} strokeWidth={1.5} className="text-[#a855f7]" /> {leccion.metadata?.knowledge_area || 'Patrimonio'}
              </span>
              <span className={`border px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${confDif.color} ${confDif.border} ${confDif.bg}`}>
                Nivel {confDif.texto}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.95] mb-6 max-w-5xl">
              {leccion.title}
            </h1>

            <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-3xl border-l-[3px] border-[#a855f7] pl-6">
              {leccion.excerpt}
            </p>
          </div>
        </header>

        {/* 🔥 LAYOUT DE LECTURA */}
        <section className="w-[95%] max-w-[1200px] mx-auto px-4 py-16 flex flex-col lg:flex-row gap-16">
          
          {/* SIDEBAR LIMPIO */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-24 flex flex-col gap-8 bg-[#111113]/80 backdrop-blur-xl p-8 rounded-[40px] border border-white/5 shadow-2xl">
              
              <div>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-5 block">Cátedra por</span>
                <div 
                  className="flex items-center gap-4 group cursor-pointer" 
                  onClick={() => navigate(`/artesanos/${leccion.author?.name}`)}
                >
                  <div className="w-16 h-16 rounded-full bg-[#0A0A0C] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-[#a855f7]/50 transition-all duration-300">
                    {leccion.author?.avatar ? (
                      <img src={leccion.author.avatar} alt="Maestro" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                    ) : (
                      <User size={24} strokeWidth={1.5} className="text-[#a855f7]"/>
                    )}
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-widest group-hover:text-[#a855f7] transition-colors">{leccion.author?.name || 'Anónimo'}</h4>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1">Maestro Caucano</p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-white/5"></div>

              <div className="flex items-center gap-3 text-gray-400">
                <Clock size={16} strokeWidth={1.5} className="text-[#a855f7]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{leccion.metadata?.estimated_read_time || 15} Min de lectura</span>
              </div>
            </div>
          </aside>

          {/* CUERPO EDITORIAL JUSTIFICADO */}
          <article className="flex-1 max-w-[850px]">
            <div 
              className="prose prose-invert prose-xl max-w-none text-gray-300 font-medium leading-[2.1]
                         prose-p:text-justify prose-p:mb-10 prose-p:tracking-wide
                         prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-white prose-headings:mt-20 prose-headings:mb-8
                         prose-blockquote:border-l-[4px] prose-blockquote:border-[#a855f7] prose-blockquote:bg-[#111113]/50 prose-blockquote:py-8 prose-blockquote:px-10 prose-blockquote:rounded-r-[30px] prose-blockquote:text-white prose-blockquote:my-16 prose-blockquote:shadow-lg prose-blockquote:not-italic
                         prose-img:rounded-[40px] prose-img:border prose-img:border-white/5 prose-img:shadow-[0_20px_60px_rgba(0,0,0,0.6)] prose-img:my-16
                         prose-ul:text-justify prose-ol:text-justify"
              dangerouslySetInnerHTML={{ __html: leccion.content || `<p>${leccion.excerpt}</p>` }}
            />
          </article>

        </section>

        {/* 🔥 CTA: Escalado natural, tipografía sólida y equilibrada */}
        <section className="relative w-full py-24 md:py-32 flex flex-col items-center justify-center overflow-hidden border-t border-white/5 mt-10 bg-[#0A0A0C]">
          
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#a855f7]/15 blur-[120px] rounded-[100%] pointer-events-none"></div>

          {/* Tipografía Equilibrada */}
          <div className="text-center relative z-10 mb-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-tight mb-2">
              <span className="text-gray-400">El legado continúa</span><br/>
              <span className="text-white drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">en tus manos.</span>
            </h2>
          </div>

          {/* DOCK FLOTANTE */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 bg-[#111113]/80 backdrop-blur-2xl border border-white/10 p-2.5 rounded-3xl sm:rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center gap-2 px-2">
               <a href={`https://wa.me/`} aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300">
                  <Phone size={16} strokeWidth={1.5} />
               </a>
               <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 hover:border-pink-600 hover:shadow-[0_0_15px_rgba(219,39,119,0.4)] transition-all duration-300">
                  <Instagram size={16} strokeWidth={1.5} />
               </a>
               <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300">
                  <Facebook size={16} strokeWidth={1.5} />
               </a>
               <a href={`mailto:soporte@popayancultural.com?subject=Interes en Taller: ${leccion.title}`} aria-label="Correo" className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#a855f7] hover:border-[#a855f7] hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all duration-300">
                  <Mail size={16} strokeWidth={1.5} />
               </a>
            </div>

            <div className="w-full sm:w-px h-px sm:h-8 bg-white/10 my-2 sm:my-0 sm:mx-2"></div>

            <button onClick={() => navigate('/tienda')} className="w-full sm:w-auto h-12 px-6 rounded-full bg-[#a855f7] text-white font-black text-[9px] uppercase tracking-[0.2em] hover:bg-[#9333ea] shadow-[0_10px_20px_rgba(168,85,247,0.2)] transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
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