import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Clock, Lightbulb, ChevronRight, Sparkles, Loader2, Library } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Aprende = () => {
  const navigate = useNavigate();
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    window.scrollTo(0, 0);
    const handler = setTimeout(() => cargarLecciones(), 400);
    return () => clearTimeout(handler);
  }, [busqueda]);

  const cargarLecciones = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/education`, { params: { search: busqueda } });
      setLecciones(response.data.data || []);
    } catch (error) {
      console.error("API Sync Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyStyle = (level) => {
    const styles = {
      beginner: { label: 'Básico', color: 'text-emerald-400', border: 'border-emerald-400/20' },
      intermediate: { label: 'Intermedio', color: 'text-amber-400', border: 'border-amber-400/20' },
      advanced: { label: 'Avanzado', color: 'text-rose-400', border: 'border-rose-400/20' }
    };
    return styles[level] || { label: 'General', color: 'text-violet-400', border: 'border-violet-400/20' };
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F9FAFB] flex flex-col font-sans selection:bg-[#A855F7]/30">
      <Navbar />

      {/* 🔥 REFINAMIENTO 1: Contenedor expandido a 1600px para pantallas ultra anchas */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 pt-24 pb-32">
        
        {/* 🏛️ HEADER COMPACTO */}
        <section className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12 border-b border-white/5 pb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={12} className="text-[#A855F7]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500">Curaduría Digital</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
              Patrimonio <span className="text-[#A855F7]">Caucano</span>
            </h1>
            <p className="text-gray-500 text-[13px] leading-relaxed max-w-sm">
              Acceso técnico al archivo histórico y cultural de la región.
            </p>
          </div>

          <div className="w-full md:w-[380px] relative">
            <div className="relative bg-[#111113] border border-white/10 rounded-xl flex items-center px-4 h-12 transition-all focus-within:border-[#A855F7]/50 shadow-lg">
              <Search className="text-gray-600" size={16} />
              <input 
                type="text" 
                placeholder="Buscar en el archivo..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-transparent px-3 text-[13px] font-medium outline-none placeholder-gray-700"
              />
            </div>
          </div>
        </section>

        {/* 📚 GRID SYSTEM */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={24} className="animate-spin text-[#A855F7]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">Sincronizando Archivo</span>
          </div>
        ) : lecciones.length === 0 ? (
          <div className="py-20 text-center rounded-[30px] border border-white/5 border-dashed">
            <Library size={32} className="mx-auto text-gray-800 mb-4" />
            <p className="text-gray-600 font-bold uppercase text-[9px] tracking-widest">Sin registros disponibles</p>
          </div>
        ) : (
          /* 🔥 REFINAMIENTO 2: Grid Inteligente de Relleno Automático */
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6 xl:gap-8">
            {lecciones.map((leccion) => {
              const meta = leccion.metadata || {};
              const diff = getDifficultyStyle(meta.difficulty_level);
              return (
                <article 
                  key={leccion.id} 
                  // 🔥 CONEXIÓN DINÁMICA: 
                  // Redirige a /aprende/:id usando el id de la publicación de Laravel
                  onClick={() => navigate(`/aprende/${leccion.id}`)}
                  className="group relative bg-[#0F0F11] border border-white/5 rounded-[24px] p-8 hover:bg-[#131316] hover:border-[#A855F7]/30 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]"></div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                        {meta.knowledge_area || 'Cultura'}
                      </span>
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-tighter border px-2 py-0.5 rounded-md ${diff.color} ${diff.border}`}>
                      {diff.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug mb-3 group-hover:text-[#A855F7] transition-colors">
                    {leccion.title.toUpperCase()}
                  </h3>
                  
                  {/* 🔥 REFINAMIENTO 3: Mejora de contraste de text-gray-500 a text-gray-400 */}
                  <p className="text-gray-400 text-xs leading-relaxed mb-8 line-clamp-2">
                    {leccion.excerpt || "Análisis documental y técnico del patrimonio caucano."}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                        {leccion.author?.avatar ? (
                          <img src={leccion.author.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-[10px] font-bold text-[#A855F7]">{leccion.author?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Maestro</span>
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors">
                          {leccion.author?.name}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-600 font-mono text-[9px]">
                        <Clock size={10} /> {meta.estimated_read_time || '5'}M
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#A855F7] group-hover:text-black transition-all">
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Aprende;