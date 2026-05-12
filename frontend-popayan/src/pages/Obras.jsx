import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Search, ChevronDown, Eye, Loader2, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx'; 

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

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

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
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col relative overflow-x-hidden selection:bg-[rgb(var(--role-accent))]/30 transition-colors duration-500">
      <Navbar />

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[var(--bg-container)]/90 backdrop-blur-xl border border-[rgb(var(--role-accent))]/30 text-[var(--text-heading)] px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(var(--role-accent),0.3)] flex items-center gap-4 text-xs font-black uppercase tracking-widest">
          <CheckCircle size={16} className="text-[rgb(var(--role-accent))]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full relative">
        
        {/* 🎭 HERO CARRUSEL */}
        <section className="relative w-full h-[45vh] md:h-[55vh] min-h-[450px] overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-primary)] transition-colors duration-500">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-[rgb(var(--role-accent))]" size={40} /></div>
          ) : destacadas.length > 0 ? (
            destacadas.map((o, i) => (
              <div key={o.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${i === carruselIndex ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`}>
                <img src={getHeroImage(o)} className="w-full h-full object-cover opacity-60" alt={o.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/50 to-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/90 via-transparent to-transparent w-[80%] transition-colors duration-500"></div>
                
                <div className="absolute inset-0 flex items-center z-20">
                  <div className="w-full max-w-[1800px] mx-auto px-8 md:px-12">
                    <div className="max-w-2xl">
                      <span className="inline-flex items-center gap-2 text-[rgb(var(--role-accent))] text-[9px] font-bold uppercase tracking-[0.4em] mb-4 border-l-2 border-[rgb(var(--role-accent))] pl-3 bg-[var(--bg-primary)]/40 backdrop-blur-sm pr-4 py-1 rounded-r-full shadow-sm">
                        <Sparkles size={10} /> Obra Destacada
                      </span>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-tight mb-4 drop-shadow-md line-clamp-2">
                        {o.title}
                      </h1>
                      <p className="text-[var(--text-body)] font-mono text-[10px] md:text-xs uppercase tracking-widest mb-8">
                        Maestro <span className="text-[var(--text-heading)] font-bold">{o.author?.name || o.user?.name}</span> • {o.category?.name}
                      </p>
                      <button onClick={() => navigate(`/obra/${o.id}`)} className="bg-[var(--text-heading)] text-[var(--bg-primary)] px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all shadow-sm flex items-center gap-3">
                        Explorar <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="w-full h-full flex items-center justify-center text-[var(--text-body)] uppercase font-mono tracking-widest text-[10px]">No hay contenido destacado</div>
          )}
        </section>

        {/* 🔍 BARRA DE FILTROS MINIMALISTA */}
        <div className="sticky top-0 z-50 py-4 border-b border-[var(--border-color)] backdrop-blur-2xl bg-[var(--bg-container)]/80 shadow-sm transition-colors duration-500">
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button onClick={() => setIsCategoriasOpen(!isCategoriasOpen)} className={`w-full md:w-64 flex items-center justify-between px-6 py-3 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${filtroActivo !== 'Todas' ? 'bg-[rgb(var(--role-accent))] border-[rgb(var(--role-accent))] text-white shadow-[0_0_15px_rgba(var(--role-accent),0.3)]' : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-body)] hover:border-[rgb(var(--role-accent))]/50'}`}>
                {filtroActivo} <ChevronDown size={14} className={`transition-transform ${isCategoriasOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCategoriasOpen && (
                <div className="absolute top-full mt-2 w-full md:w-64 bg-[var(--bg-container)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-[20px] p-2 shadow-2xl z-50 transition-colors duration-500">
                  {categoriasDinamicas.map(c => (
                    <button key={c} onClick={() => { setFiltroActivo(c); setIsCategoriasOpen(false); }} className={`w-full text-left px-5 py-3 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-colors ${filtroActivo === c ? 'bg-[rgb(var(--role-accent))] text-white' : 'hover:bg-[var(--text-heading)]/5 text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>{c}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-body)]" size={14} />
              <input type="text" placeholder="Buscar por título o maestro..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/50 rounded-full py-3 pl-12 pr-5 text-[10px] font-bold text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))] transition-all uppercase tracking-widest shadow-sm placeholder:text-[var(--text-body)]/70" />
            </div>
          </div>
        </div>

        {/* 🖼️ GRID DE COLECCIÓN */}
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 lg:gap-8">
            {loading ? [1,2,3,4,5,6].map(n => <div key={n} className="aspect-[4/5] bg-[var(--bg-card)] rounded-[24px] animate-pulse border border-[var(--border-color)]"></div>)
              : obrasFiltradas.length > 0 ? obrasFiltradas.map((o) => (
                <ArtCard 
                  key={o.id} 
                  obra={o} 
                  esFavorito={favoritosIds.includes(Number(o.id))} 
                  onToggleFavorite={toggleFavorite} 
                  onClickCard={() => navigate(`/obra/${o.id}`)} 
                />
              )) : (
                <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-[40px] bg-[var(--bg-container)]/50 transition-colors duration-500">
                  <Search size={40} className="text-[var(--text-body)] opacity-50 mb-4" />
                  <p className="text-[var(--text-body)] text-[10px] font-mono uppercase tracking-widest text-center">La bóveda no encontró resultados.</p>
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