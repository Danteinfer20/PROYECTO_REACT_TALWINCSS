import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Clock, Loader2, Sparkles, BookOpen, ShieldCheck, Lightbulb } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LessonDetailView = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // 🔥 DICCIONARIO DE TRADUCCIÓN: Elimina el "Spanglish" de la interfaz
  const difficultyMap = {
    beginner: 'Básico',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchLesson = async () => {
      try {
        const response = await axios.get(`${API_URL}/education/${id}`);
        setLesson(response.data.data);
      } catch (error) {
        console.error("Error en la sincronización de API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id, API_URL]);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#A855F7]" size={24} />
    </div>
  );

  const meta = lesson?.metadata || {};

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F9FAFB] flex flex-col font-sans selection:bg-[#A855F7]/30">
      <Navbar />

      {/* CONTENEDOR MAESTRO: Optimizado para 27" y 4K */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-32 relative z-10">
        
        {/* 🏛️ HEADER NEO-TRADICIÓN */}
        <header className="mb-16 border-b border-white/5 pb-10 flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={12} className="text-[#A855F7] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-gray-500">Documento de Cátedra Caucana</span>
            </div>
            
            {/* TÍTULO ESPECTACULAR: Degradado sutil y Glow ambiental */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tighter uppercase mb-6 leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 drop-shadow-[0_10px_30px_rgba(168,85,247,0.15)]">
              {lesson?.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-3 bg-white/5 pl-2 pr-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-full bg-black border border-white/10 overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                     {lesson?.author?.avatar ? (
                       <img src={lesson.author.avatar} className="w-full h-full object-cover" alt="Autor" />
                     ) : (
                       <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#A855F7]">
                         {lesson?.author?.name?.charAt(0)}
                       </div>
                     )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">Investigador</span>
                    <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">{lesson?.author?.name}</span>
                  </div>
               </div>
               
               <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2 bg-emerald-400/5 px-4 py-2.5 rounded-full border border-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.05)]">
                 <ShieldCheck size={12} strokeWidth={2.5} /> Archivo Verificado
               </span>
            </div>
          </div>

          {/* METADATA: Píldoras de instrumentación técnica */}
          <div className="flex gap-4 h-fit mb-1">
            <div className="flex flex-col items-center justify-center px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-xl min-w-[120px]">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center">Complejidad</span>
              <span className="text-[11px] font-black text-[#A855F7] uppercase tracking-widest">
                {difficultyMap[meta.difficulty_level] || 'General'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-4 bg-white/[0.03] border border-white/10 rounded-[24px] backdrop-blur-xl min-w-[120px]">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2 text-center">Lectura</span>
              <span className="text-[11px] font-black text-gray-200 font-mono tracking-tighter uppercase">
                {meta.estimated_read_time || '5'}:00 MIN_
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          {/* CUERPO DE LECTURA: Columna optimizada para humanos */}
          <article className="lg:col-span-8 max-w-4xl">
            <div className="mb-14">
               <p className="text-xl text-gray-300 leading-relaxed font-light italic border-l-2 border-[#A855F7] pl-10 py-2">
                 {lesson?.excerpt || "Investigación técnica sobre el patrimonio."}
               </p>
            </div>
            
            <div 
              className="text-[#94A3B8] text-lg leading-[2] space-y-10 prose prose-invert max-w-none 
                         prose-headings:text-white prose-headings:font-extrabold prose-headings:uppercase 
                         prose-headings:tracking-tighter prose-strong:text-[#A855F7] prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: lesson?.content }}
            />
          </article>

          {/* SIDEBAR: Glassmorphism Puro */}
          <aside className="lg:col-span-4">
            <div className="p-10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/10 rounded-[40px] sticky top-28 overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[#A855F7]/10 blur-[80px] pointer-events-none"></div>

               <div className="flex items-center gap-3 mb-10 text-[#A855F7] relative z-10">
                  <BookOpen size={18} strokeWidth={2} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ficha del Archivo</span>
               </div>
               
               <div className="space-y-10 relative z-10">
                  <div>
                    <h4 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Área de Conocimiento</h4>
                    <div className="inline-flex px-4 py-2 bg-[#A855F7]/10 rounded-xl border border-[#A855F7]/20">
                        <p className="text-[10px] font-black text-[#A855F7] uppercase tracking-widest">{meta.knowledge_area || 'Cultura General'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-10 border-t border-white/5">
                    <div className="flex items-start gap-5 text-gray-400">
                      <div className="w-10 h-10 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center shrink-0 border border-[#A855F7]/20">
                        <Lightbulb size={18} className="text-[#A855F7]" />
                      </div>
                      <p className="text-xs leading-relaxed italic">
                        "La preservación digital es el pilar que garantiza la inmortalidad de nuestras raíces técnicas."
                      </p>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div className="px-6 py-5 bg-black/40 border border-white/5 rounded-[24px] text-center">
                      <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.4em] mb-1">Pertenece a:</p>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        Colección Patrimonio Caucano
                      </p>
                    </div>
                  </div>
               </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LessonDetailView;