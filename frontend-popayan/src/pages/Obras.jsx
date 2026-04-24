import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Search, ChevronDown, Eye, Loader2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx'; // 🔥 IMPORTACIÓN CRÍTICA (Reutilización de código)

const Obras = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [obrasFiltradas, setObrasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carruselIndex, setCarruselIndex] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('Todas');
  const [isCategoriasOpen, setIsCategoriasOpen] = useState(false);
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');
  const categoriasDinamicas = ['Todas', 'Pintura Óleo', 'Escultura', 'Artes Vivas', 'Patrimonio'];

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  // 🔥 ESCUDO PARA EL HERO: Genera un avatar limpio si no hay imagen
  const getHeroImage = (obra) => {
    if (obra.images && obra.images.length > 0) return obra.images[0];
    if (obra.post_media && obra.post_media.length > 0) {
      const path = obra.post_media[0].file_path;
      return path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(obra.title || 'Arte')}&background=050505&color=a855f7&size=1000`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const cargarObras = async () => {
      try {
        setLoading(true);
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/posts`, config);
        const data = res.data.data || [];
        setObras(data);
        setObrasFiltradas(data);

        if (token) {
          const ids = data.filter(o => o.user_interaction?.is_saved).map(o => Number(o.id));
          setFavoritosIds(ids);
        }
      } catch (err) {
        console.error("Error en API:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarObras();
  }, [token, API_URL]);

  useEffect(() => {
    let res = obras;
    if (filtroActivo !== 'Todas') res = res.filter(o => o.category?.name === filtroActivo);
    if (busqueda) {
      const t = busqueda.toLowerCase();
      res = res.filter(o => o.title.toLowerCase().includes(t) || (o.author?.name || '').toLowerCase().includes(t));
    }
    setObrasFiltradas(res);
  }, [busqueda, filtroActivo, obras]);

  const destacadas = obras.filter(o => o.is_featured).length > 0 
    ? obras.filter(o => o.is_featured).slice(0, 5) 
    : obras.slice(0, 5);

  useEffect(() => {
    if (destacadas.length <= 1) return;
    const int = setInterval(() => setCarruselIndex(p => (p + 1) % destacadas.length), 6000);
    return () => clearInterval(int);
  }, [destacadas.length]);

  const toggleFavorite = async (postId) => {
    if (!token) return navigate('/login');
    try {
      const res = await axios.post(`${API_URL}/saved-items/toggle`, { post_id: postId }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'added') {
        setFavoritosIds(p => [...p, Number(postId)]);
        showToast("❤️ Coleccionada");
      } else {
        setFavoritosIds(p => p.filter(id => id !== Number(postId)));
        showToast("🗑️ Eliminada");
      }
    } catch (e) { showToast("Error al guardar"); }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col relative overflow-x-hidden selection:bg-[#a855f7]/30">
      <Navbar />

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#111113]/90 backdrop-blur-xl border border-[#a855f7]/30 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center gap-4 text-xs font-black uppercase tracking-widest">
          <CheckCircle size={16} className="text-[#a855f7]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full relative">
        
        {/* 🎭 HERO CARRUSEL (Elegante y Letras controladas) */}
        <section className="relative w-full h-[45vh] md:h-[55vh] min-h-[450px] overflow-hidden border-b border-white/5 bg-[#050505]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#a855f7]" size={40} /></div>
          ) : destacadas.length > 0 ? (
            destacadas.map((o, i) => (
              <div key={o.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === carruselIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}>
                <img src={getHeroImage(o)} className="w-full h-full object-cover opacity-60" alt={o.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-black/30 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0C]/90 via-transparent to-transparent w-[80%]"></div>
                
                <div className="absolute inset-0 flex items-center z-20">
                  <div className="w-full max-w-[1800px] mx-auto px-8 md:px-12">
                    <div className="max-w-2xl">
                      <span className="inline-flex items-center gap-2 text-[#a855f7] text-[9px] font-bold uppercase tracking-[0.4em] mb-4 border-l-2 border-[#a855f7] pl-3 bg-black/20 backdrop-blur-sm pr-4 py-1 rounded-r-full">
                        <Sparkles size={10} /> Obra Destacada
                      </span>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-tight mb-4 drop-shadow-2xl line-clamp-2">
                        {o.title}
                      </h1>
                      <p className="text-gray-300 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-8">
                        Maestro <span className="text-white font-bold">{o.author?.name || o.user?.name}</span> • {o.category?.name}
                      </p>
                      <button onClick={() => navigate(`/obra/${o.id}`)} className="bg-white text-black px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-3">
                        Explorar <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500 uppercase font-mono tracking-widest text-[10px]">No hay contenido destacado</div>
          )}
        </section>

        {/* 🔍 BARRA DE FILTROS MINIMALISTA */}
        <div className="sticky top-0 z-50 py-4 border-b border-white/5 backdrop-blur-2xl bg-[#0A0A0C]/80 shadow-lg">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={() => setIsCategoriasOpen(!isCategoriasOpen)} className={`w-full md:w-64 flex items-center justify-between px-6 py-3 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${filtroActivo !== 'Todas' ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-[#111113] border-white/5 text-gray-400 hover:border-white/20'}`}>
                {filtroActivo} <ChevronDown size={14} className={`transition-transform ${isCategoriasOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoriasOpen && (
                <div className="absolute top-full mt-2 w-full md:w-64 bg-[#111113]/90 backdrop-blur-xl border border-white/10 rounded-[20px] p-2 shadow-2xl z-50">
                  {categoriasDinamicas.map(c => (
                    <button key={c} onClick={() => { setFiltroActivo(c); setIsCategoriasOpen(false); }} className={`w-full text-left px-5 py-3 rounded-[14px] text-[9px] font-bold uppercase tracking-widest transition-colors ${filtroActivo === c ? 'bg-[#a855f7] text-white' : 'hover:bg-white/5 text-gray-400'}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input type="text" placeholder="Buscar por título o maestro..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-[#111113] border border-white/5 hover:border-white/10 rounded-full py-3 pl-12 pr-5 text-[10px] font-bold text-white outline-none focus:border-[#a855f7]/50 transition-all uppercase tracking-widest shadow-inner placeholder:text-gray-600" />
            </div>
          </div>
        </div>

        {/* 🖼️ GRID DE COLECCIÓN (USANDO ARTCARD PARA UNIFICAR DISEÑO) */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-8">
            {loading ? [1,2,3,4,5,6].map(n => <div key={n} className="aspect-[4/5] bg-[#111113] rounded-[24px] animate-pulse border border-white/5"></div>)
              : obrasFiltradas.length > 0 ? obrasFiltradas.map((o) => (
                <ArtCard 
                  key={o.id} 
                  obra={o} 
                  esFavorito={favoritosIds.includes(Number(o.id))} 
                  onToggleFavorite={toggleFavorite} 
                  onClickCard={() => navigate(`/obra/${o.id}`)} 
                />
              )) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[40px] bg-[#111113]/30">
                  <Search size={40} className="text-gray-700 mb-4" />
                  <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest text-center">La bóveda no encontró resultados.</p>
                </div>
              )
            }
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Obras;