import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, CheckCircle, Search, Filter, Image as ImageIcon, ChevronRight, Eye, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Obras = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState([]);
  const [obrasFiltradas, setObrasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carrusel State
  const [carruselIndex, setCarruselIndex] = useState(0);

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('Todas');

  // Favoritos
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });

  // ✅ ESTADO PARA EL MODAL / LIGHTBOX
  const [obraSeleccionada, setObraSeleccionada] = useState(null);

  const token = localStorage.getItem('token');
  const categorias = ['Todas', 'Pintura', 'Escultura', 'Fotografía', 'Arte Religioso', 'Tejido Ancestral'];

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await axios.get('http://localhost:8000/api/v1/posts');
        const listaObras = respuesta.data.data || respuesta.data;
        setObras(listaObras);
        setObrasFiltradas(listaObras);

        if (token) {
          const resFavs = await axios.get('http://localhost:8000/api/v1/saved-items', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const ids = resFavs.data.data.map(fav => Number(fav.post_id));
          setFavoritosIds(ids);
        }
      } catch (error) {
        console.error("Error al cargar obras:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerDatos();
  }, [token]);

  useEffect(() => {
    let resultado = obras;
    if (busqueda) {
      resultado = resultado.filter(obra =>
        obra.title.toLowerCase().includes(busqueda.toLowerCase()) ||
        (obra.user?.name || '').toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    setObrasFiltradas(resultado);
  }, [busqueda, obras]);

  const obrasDestacadas = obrasFiltradas.slice(0, 5); 

  useEffect(() => {
    if (obrasDestacadas.length === 0) return;
    const interval = setInterval(() => {
      setCarruselIndex((prev) => (prev + 1) % obrasDestacadas.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [obrasDestacadas.length]);

  const toggleFavorite = async (postId) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/saved-items/toggle',
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 'added') {
        setFavoritosIds(prev => [...prev, Number(postId)]);
        showToast("❤️ Añadido a tu colección");
      } else {
        setFavoritosIds(prev => prev.filter(id => Number(id) !== Number(postId)));
        showToast("💔 Eliminado de tus favoritos");
      }
    } catch (error) {
      console.error("Error al gestionar favorito:", error);
    }
  };

  const getImageUrl = (mediaArray) => {
    if (!mediaArray || mediaArray.length === 0) return 'https://ui-avatars.com/api/?name=Art&background=111&color=fff';
    const path = mediaArray[0].file_path;
    return path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans relative">
      <Navbar />

      {/* TOAST NOTIFICATION */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#a855f7] text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.4)] flex items-center gap-3 text-xs font-black uppercase tracking-widest">
          <CheckCircle size={16} /> {toast.message}
        </div>
      </div>

      {/* =========================================
          🖼️ MODAL / LIGHTBOX DE LA OBRA
         ========================================= */}
      {obraSeleccionada && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
          
          {/* Fondo oscuro desenfocado */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
            onClick={() => setObraSeleccionada(null)}
          ></div>

          {/* Tarjeta del Modal */}
          <div className="relative bg-[#0a0a0c] border border-white/10 rounded-[32px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Botón de cerrar (X) */}
            <button 
              onClick={() => setObraSeleccionada(null)}
              className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-red-500 text-white p-3 rounded-full transition-all duration-300 shadow-xl"
            >
              <X size={20} />
            </button>

            {/* Mitad Izquierda: Imagen */}
            <div className="w-full md:w-1/2 lg:w-3/5 h-[40vh] md:h-auto bg-[#111] relative flex items-center justify-center">
              <img 
                src={getImageUrl(obraSeleccionada.media)} 
                alt={obraSeleccionada.title}
                className="w-full h-full object-contain p-4 md:p-8"
              />
            </div>

            {/* Mitad Derecha: Información */}
            <div className="w-full md:w-1/2 lg:w-2/5 p-8 md:p-12 flex flex-col overflow-y-auto max-h-[50vh] md:max-h-full">
              <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tighter mb-2 leading-none">
                {obraSeleccionada.title}
              </h2>
              <p className="text-[#a855f7] font-black uppercase tracking-[0.2em] text-xs mb-8">
                Por {obraSeleccionada.user?.name || 'Maestro Local'}
              </p>

              <div className="mb-8">
                <h4 className="text-white text-[10px] uppercase font-black tracking-widest mb-3 border-b border-white/10 pb-2">
                  Descripción de la Obra
                </h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {obraSeleccionada.content || 'El artista no ha proporcionado una descripción detallada para esta pieza.'}
                </p>
              </div>

              {/* Botones de acción dentro del modal */}
              <div className="mt-auto flex flex-col gap-3">
                <button 
                  onClick={() => toggleFavorite(obraSeleccionada.id)}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${
                    favoritosIds.includes(Number(obraSeleccionada.id))
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart size={18} fill={favoritosIds.includes(Number(obraSeleccionada.id)) ? "currentColor" : "none"} />
                  {favoritosIds.includes(Number(obraSeleccionada.id)) ? 'Quitar de Favoritos' : 'Guardar en Favoritos'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <main className="flex-1 w-full">

        {/* =========================================
            🚀 SHOWCASE CAROUSEL (Inspirado en Car.shop)
           ========================================= */}
        <section className="relative w-full h-[75vh] md:h-[85vh] bg-[#050505] overflow-hidden">

          {loading ? (
            <div className="w-full h-full bg-[#111] animate-pulse"></div>
          ) : obrasDestacadas.length > 0 ? (
            obrasDestacadas.map((obra, index) => (
              <div
                key={obra.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === carruselIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={getImageUrl(obra.media)}
                  className="w-full h-full object-cover transform scale-105"
                  alt={obra.title}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full px-6 md:px-16 pb-16 md:pb-24 max-w-[1600px] mx-auto z-20 flex flex-col md:flex-row justify-between items-end gap-10">
                  <div className="max-w-4xl">
                    <span className="text-[#a855f7] text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">
                      Obra Destacada
                    </span>
                    <h1 className="text-5xl md:text-8xl font-black uppercase text-white leading-[0.9] tracking-tighter drop-shadow-2xl">
                      {obra.title}
                    </h1>
                  </div>

                  <div className="flex flex-col items-start md:items-end text-left md:text-right w-full md:w-auto">
                    <p className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-6">
                      Creado por <br/> <span className="text-white text-base">{obra.user?.name}</span>
                    </p>
                    
                    {/* ✅ BOTÓN CONECTADO AL MODAL */}
                    <button
                      onClick={() => setObraSeleccionada(obra)}
                      className="bg-[#a855f7] text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center gap-3"
                    >
                      Explorar Obra <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#111]">
              <p className="text-white">No hay obras destacadas</p>
            </div>
          )}
        </section>

        {/* =========================================
            🔍 BARRA DE BÚSQUEDA Y FILTROS
           ========================================= */}
        <div className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 py-4">
          <div className="px-6 md:px-16 max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter size={16} className="text-gray-500 hidden md:block mr-2" />
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroActivo(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtroActivo === cat
                      ? 'bg-[#a855f7] text-white shadow-md'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={16} />
              <input
                type="text"
                placeholder="Buscar obra..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-[#a855f7] transition-all"
              />
            </div>
          </div>
        </div>

        {/* =========================================
            🖼️ CUADRÍCULA DE COLECCIÓN COMPLETA
           ========================================= */}
        <div className="px-6 md:px-16 py-20 max-w-[1800px] mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Colección Completa</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="aspect-[4/5] bg-[#111] border border-white/5 animate-pulse rounded-2xl"></div>
              ))
            ) : obrasFiltradas.length > 0 ? (
              obrasFiltradas.map((obra) => {
                const esFavorito = favoritosIds.includes(Number(obra.id));

                return (
                  <div key={obra.id} className="group flex flex-col gap-4">
                    <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[#111] border border-white/5 group-hover:border-[#a855f7]/40 transition-all duration-500 shadow-xl">
                      <img
                        src={getImageUrl(obra.media)}
                        alt={obra.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />
                      
                      {/* ✅ BOTÓN "VER MÁS" CONECTADO AL MODAL */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setObraSeleccionada(obra);
                        }}
                        className="absolute inset-0 w-full h-full z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
                      >
                        <div className="bg-[#a855f7] text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform shadow-[0_10px_30px_rgba(168,85,247,0.4)]">
                          <Eye size={16} /> Ver Más
                        </div>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(obra.id); }}
                        className={`absolute top-4 right-4 z-30 p-3 backdrop-blur-md rounded-full transition-all duration-300 shadow-xl active:scale-90 ${esFavorito ? 'bg-red-500 text-white' : 'bg-black/50 text-white hover:bg-red-500 border border-white/10'}`}
                      >
                        <Heart size={16} fill={esFavorito ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase text-white tracking-tight line-clamp-1 group-hover:text-[#a855f7] transition-colors">{obra.title}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Por {obra.user?.name}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center border border-dashed border-white/10 rounded-[32px] bg-[#111]/30">
                <p className="text-white text-sm font-black uppercase tracking-widest">No encontramos obras</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Obras;