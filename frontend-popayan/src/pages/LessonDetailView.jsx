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

  // 🔥 DICCIONARIO DE TRADUCCIÓN
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
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center transition-colors duration-500">
      <Loader2 className="animate-spin text-[rgb(var(--role-accent))]" size={24} />
    </div>
  );

  const meta = lesson?.metadata || {};

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[rgb(var(--role-accent))]/30 transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-32 relative z-10">
        
        {/* 🏛️ HEADER NEO-TRADICIÓN */}
        <header className="mb-16 border-b border-[var(--border-color)] pb-10 flex flex-col md:flex-row justify-between items-end gap-10 transition-colors duration-500">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={12} className="text-[rgb(var(--role-accent))] animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--text-body)]">Documento de Cátedra Caucana</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tighter uppercase mb-6 leading-[0.9] text-[var(--text-heading)] drop-shadow-sm transition-colors duration-500">
              {lesson?.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6">
               <div className="flex items-center gap-3 bg-[var(--bg-container)] pl-2 pr-5 py-2 rounded-full border border-[var(--border-color)] backdrop-blur-md shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500 flex items-center justify-center">
                     {lesson?.author?.avatar ? (
                       <img src={lesson.author.avatar} className="w-full h-full object-cover" alt="Autor" />
                     ) : (
                       <span className="text-[10px] font-bold text-[rgb(var(--role-accent))]">
                         {lesson?.author?.name?.charAt(0)}
                       </span>
                     )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-bold text-[var(--text-body)] uppercase tracking-widest">Investigador</span>
                    <span className="text-[10px] font-black text-[var(--text-heading)] uppercase tracking-widest">{lesson?.author?.name}</span>
                  </div>
               </div>
               
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2 bg-emerald-500/10 px-4 py-2.5 rounded-full border border-emerald-500/20 shadow-sm">
                 <ShieldCheck size={12} strokeWidth={2.5} /> Archivo Verificado
               </span>
            </div>
          </div>

          <div className="flex gap-4 h-fit mb-1">
            <div className="flex flex-col items-center justify-center px-6 py-4 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[24px] backdrop-blur-xl min-w-[120px] shadow-sm transition-colors duration-500">
              <span className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-[0.3em] mb-2 text-center">Complejidad</span>
              <span className="text-[11px] font-black text-[rgb(var(--role-accent))] uppercase tracking-widest">
                {difficultyMap[meta.difficulty_level] || 'General'}
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-4 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[24px] backdrop-blur-xl min-w-[120px] shadow-sm transition-colors duration-500">
              <span className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-[0.3em] mb-2 text-center">Lectura</span>
              <span className="text-[11px] font-black text-[var(--text-heading)] font-mono tracking-tighter uppercase">
                {meta.estimated_read_time || '5'}:00 MIN_
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          <article className="lg:col-span-8 max-w-4xl">
            <div 
              className="text-[var(--text-body)] text-lg leading-[2] space-y-10 prose prose-lg max-w-none 
                         prose-headings:text-[var(--text-heading)] prose-headings:font-extrabold prose-headings:uppercase 
                         prose-headings:tracking-tighter prose-strong:text-[rgb(var(--role-accent))] prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: lesson?.content }}
            />
          </article>

          <aside className="lg:col-span-4">
            <div className="p-10 bg-[var(--bg-container)]/80 backdrop-blur-2xl border border-[var(--border-color)] rounded-[40px] sticky top-28 overflow-hidden shadow-md transition-colors duration-500">
               <div className="absolute top-0 right-0 w-40 h-40 bg-[rgb(var(--role-accent))]/10 blur-[80px] pointer-events-none"></div>

               <div className="flex items-center gap-3 mb-10 text-[rgb(var(--role-accent))] relative z-10">
                  <BookOpen size={18} strokeWidth={2} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Ficha del Archivo</span>
               </div>
               
               <div className="space-y-10 relative z-10">
                  <div>
                    <h4 className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-[0.3em] mb-4">Área de Conocimiento</h4>
                    <div className="inline-flex px-4 py-2 bg-[rgb(var(--role-accent))]/10 rounded-xl border border-[rgb(var(--role-accent))]/20">
                        <p className="text-[10px] font-black text-[rgb(var(--role-accent))] uppercase tracking-widest">{meta.knowledge_area || 'Cultura General'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-10 border-t border-[var(--border-color)]">
                    <div className="flex items-start gap-5 text-[var(--text-body)]">
                      <div className="w-10 h-10 rounded-2xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center shrink-0 border border-[rgb(var(--role-accent))]/20">
                        <Lightbulb size={18} className="text-[rgb(var(--role-accent))]" />
                      </div>
                      <p className="text-xs leading-relaxed italic">
                        "La preservación digital es el pilar que garantiza la inmortalidad de nuestras raíces técnicas."
                      </p>
                    </div>
                  </div>

                  <div className="pt-8">
                    <div className="px-6 py-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] text-center shadow-inner">
                      <p className="text-[8px] font-bold text-[var(--text-body)] uppercase tracking-[0.4em] mb-1">Pertenece a:</p>
                      <p className="text-[10px] font-black text-[var(--text-heading)] uppercase tracking-widest">
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