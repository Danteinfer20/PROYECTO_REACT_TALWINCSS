import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Filter, Clock, Lightbulb, 
  ChevronRight, User, Sparkles, Loader2, Library
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Aprende = () => {
  const navigate = useNavigate();
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [dificultadActiva, setDificultadActiva] = useState('');
  const [areaActiva, setAreaActiva] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const dificultades = [
    { value: '', label: 'Cualquier Nivel' },
    { value: 'beginner', label: 'Básico' },
    { value: 'intermediate', label: 'Intermedio' },
    { value: 'advanced', label: 'Avanzado' }
  ];

  const areas = ['Todas', 'Historia', 'Técnica Artesanal', 'Significado Cultural', 'Música', 'Gastronomía'];

  useEffect(() => {
    window.scrollTo(0, 0);
    const delayDebounceFn = setTimeout(() => {
      cargarLecciones();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [busqueda, dificultadActiva, areaActiva]);

  const cargarLecciones = async () => {
    setLoading(true);
    try {
      const params = {};
      if (busqueda) params.search = busqueda;
      if (dificultadActiva) params.difficulty = dificultadActiva;
      if (areaActiva && areaActiva !== 'Todas') params.area = areaActiva; 

      const response = await axios.get(`${API_URL}/education`, { params });
      setLecciones(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar la biblioteca:", error);
    } finally {
      setLoading(false);
    }
  };

  const traducirDificultad = (nivel) => {
    switch(nivel) {
      case 'beginner': return { texto: 'Básico', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
      case 'intermediate': return { texto: 'Intermedio', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
      case 'advanced': return { texto: 'Avanzado', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' };
      default: return { texto: 'General', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/10', border: 'border-[#a855f7]/20' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-[#a855f7]/30">
      <Navbar />

      <main className="flex-1 w-full mx-auto pb-32">
        
        {/* 🔥 HERO COMPACTO Y ELEGANTE */}
        <section className="relative w-full pt-24 pb-12 flex flex-col items-center justify-center overflow-visible">
          {/* Fondo Radial Optimizado */}
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[300px] bg-[#a855f7]/10 blur-[100px] rounded-[100%] transform -translate-y-10"></div>
          </div>

          <div className="relative z-20 text-center flex flex-col items-center px-4 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={14} strokeWidth={1.5} className="text-[#a855f7]" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-[#a855f7]">Biblioteca Digital</span>
              <Sparkles size={14} strokeWidth={1.5} className="text-[#a855f7]" />
            </div>
            {/* Título más apaisado para evitar empujar contenido hacia abajo */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl mb-4 leading-[1.1] max-w-4xl">
              APRENDE DEL PATRIMONIO CAUCANO
            </h1>
          </div>
        </section>

        {/* 🔥 DOCK DE FILTROS INTEGRADO (w-[95%] para expansión lateral) */}
        <div className="relative z-30 w-[95%] max-w-[1400px] mx-auto mb-16">
          <div className="bg-[#111113]/80 backdrop-blur-2xl border border-white/5 rounded-full p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-3">
            
            <div className="w-full md:flex-1 flex items-center bg-black/40 rounded-full border border-white/5 px-5 h-12 focus-within:border-[#A855F7]/40 transition-colors">
                <Search className="text-[#A855F7] shrink-0" size={16} strokeWidth={1.5} />
                <input 
                  type="text" 
                  placeholder="Buscar tratados, historias o técnicas..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-transparent py-2 px-4 text-[11px] font-medium text-white outline-none placeholder-gray-600 tracking-wide"
                />
            </div>
            
            <div className="w-full md:w-auto flex gap-2">
              <div className="relative flex-1 md:w-44">
                <select 
                  value={dificultadActiva} 
                  onChange={(e) => setDificultadActiva(e.target.value)}
                  className="w-full appearance-none bg-white/5 hover:bg-white/10 border border-white/5 text-white text-[9px] font-bold uppercase tracking-widest rounded-full h-12 px-6 outline-none cursor-pointer transition-colors"
                >
                  {dificultades.map(dif => (
                    <option key={dif.value} value={dif.value} className="bg-[#111113] text-white">{dif.label}</option>
                  ))}
                </select>
                <Filter size={12} strokeWidth={1.5} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Pastillas de filtro centradas */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {areas.map(area => (
              <button
                key={area}
                onClick={() => setAreaActiva(area)}
                className={`px-6 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.15em] transition-all duration-300 border ${
                  areaActiva === area || (area === 'Todas' && areaActiva === '')
                  ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                  : 'bg-[#111113]/50 backdrop-blur-md border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 GRID PRO EXPANDIDO (Hasta 4 columnas en pantallas gigantes) */}
        <div className="w-[95%] max-w-[1600px] mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-[#a855f7] text-[10px] font-mono uppercase tracking-widest gap-4">
              <Loader2 size={24} strokeWidth={1.5} className="animate-spin" /> Consultando Archivos...
            </div>
          ) : lecciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[40px] border border-white/5">
              <Library size={40} strokeWidth={1.5} className="text-gray-700 mb-6" />
              <h3 className="text-xl font-black italic uppercase text-white tracking-tighter mb-2">Sin Registros</h3>
              <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest text-center px-4 mb-6">
                No se encontraron manuscritos.
              </p>
              <button onClick={() => {setBusqueda(''); setDificultadActiva(''); setAreaActiva('');}} className="bg-white/5 hover:bg-[#a855f7] text-white text-[9px] uppercase font-bold tracking-[0.2em] transition-colors border border-white/10 px-8 py-3.5 rounded-full shadow-lg">
                Limpiar Filtros
              </button>
            </div>
          ) : (
            // Grilla expandida a 4 columnas para resoluciones ultra-anchas
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
              {lecciones.map((leccion) => {
                const confDif = traducirDificultad(leccion.metadata.difficulty_level);

                return (
                <article 
                  key={leccion.id} 
                  onClick={() => navigate(`/aprende/${leccion.id}`)}
                  className="group relative flex flex-col bg-gradient-to-b from-white/[0.04] to-[#111113]/40 backdrop-blur-xl border border-white/[0.05] rounded-[32px] p-8 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-[#a855f7]/30 hover:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.15)] overflow-hidden"
                >
                  {/* Resplandor Interno Superior */}
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50"></div>

                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-2 group-hover:text-[#a855f7] transition-colors">
                      <Lightbulb size={14} strokeWidth={1.5} /> {leccion.metadata.knowledge_area}
                    </span>
                    <span className={`px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-[0.15em] border ${confDif.bg} ${confDif.color} ${confDif.border}`}>
                      {confDif.texto}
                    </span>
                  </div>

                  <h3 className="text-xl lg:text-2xl font-black italic uppercase tracking-tighter text-white leading-tight mb-4 group-hover:text-gray-200 transition-colors relative z-10">
                    {leccion.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8 flex-1 line-clamp-3 relative z-10">
                    {leccion.excerpt || "Sumérgete en este documento para descubrir los secretos técnicos y la carga histórica de esta disciplina."}
                  </p>

                  {/* Footer de la tarjeta */}
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/[0.05] relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0A0A0C] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                        {leccion.author?.avatar ? (
                          <img src={leccion.author.avatar} alt="Autor" className="w-full h-full object-cover rounded-full grayscale-[30%] group-hover:grayscale-0 transition-all"/>
                        ) : (
                          <span className="text-[10px] font-black text-[#a855f7]">{leccion.author?.name?.charAt(0) || 'A'}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-medium text-gray-500 uppercase tracking-[0.2em]">Cátedra por</span>
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest truncate max-w-[120px] group-hover:text-white transition-colors">
                          {leccion.author?.name || 'Autor Desconocido'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px] tracking-widest">
                        <Clock size={12} strokeWidth={1.5} /> {leccion.metadata.estimated_read_time} min
                      </div>
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#a855f7] group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-inner">
                        <ChevronRight size={14} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </article>
              )})}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Aprende;