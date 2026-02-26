import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import axios from 'axios';
import { Heart, CheckCircle } from 'lucide-react'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const navigate = useNavigate();
  const [obras, setObras] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // ✅ ESTADOS NUEVOS PARA FAVORITOS Y NOTIFICACIONES
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  const token = localStorage.getItem('token');

  // 📡 Función para mostrar notificaciones elegantes
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // 1. Traemos todas las obras
        const respuesta = await axios.get('http://localhost:8000/api/v1/posts');
        const listaObras = respuesta.data.data || respuesta.data;
        setObras(listaObras);

        // 2. Si hay usuario, traemos sus favoritos para pintar los corazones
        if (token) {
          const resFavs = await axios.get('http://localhost:8000/api/v1/saved-items', {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Guardamos solo los IDs para hacer la búsqueda muy rápida
          const ids = resFavs.data.data.map(fav => fav.post_id);
          setFavoritosIds(ids);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    obtenerDatos();
  }, [token]);

  // ✅ FUNCIÓN CORREGIDA: Toggle Visual Inmediato
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
        setFavoritosIds(prev => [...prev, postId]); // Añadir ID
        showToast("❤️ Añadido a tu colección de favoritos");
      } else {
        setFavoritosIds(prev => prev.filter(id => id !== postId)); // Quitar ID
        showToast("💔 Eliminado de tus favoritos");
      }
    } catch (error) {
      console.error("Error al gestionar favorito:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col relative">
      <Navbar />

      {/* 🍞 TOAST NOTIFICATION FLOTANTE */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#a855f7] text-white px-6 py-3 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.4)] flex items-center gap-3 text-xs font-black uppercase tracking-widest">
          <CheckCircle size={16} /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1600px] mx-auto">
        
        {/* SECCIÓN HERO */}
        <section className="px-6 md:px-16 py-20 md:py-32 flex flex-col items-center text-center border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a855f7]/10 blur-[120px] rounded-full -z-10"></div>
          
          <span className="text-[#a855f7] font-black tracking-[0.3em] text-xs uppercase mb-6 animate-pulse">
            El Corazón de Cauca
          </span>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-none mb-8 max-w-4xl font-sans">
            Descubre el alma <br/> de Popayán.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12">
            Explora la galería digital más grande de maestros artesanos y artistas de la Ciudad Blanca.
          </p>
          
          <button 
            onClick={() => document.getElementById('galeria').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-black px-10 py-4 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:text-white transition-all shadow-lg active:scale-95"
          >
            Explorar Obras
          </button>
        </section>

        {/* SECCIÓN GALERÍA */}
        <section id="galeria" className="px-6 md:px-16 py-20">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase">Obras Recientes</h2>
            <Link to="/obras" className="text-[#a855f7] text-sm font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
              Ver todas →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 bg-white/5 animate-pulse rounded-3xl"></div>
              ))
            ) : obras.length > 0 ? (
              obras.map((obra) => {
                
                // ✅ VERIFICAMOS SI ESTA OBRA YA ESTÁ GUARDADA POR EL USUARIO
                const esFavorito = favoritosIds.includes(obra.id);

                return (
                  <div key={obra.id} className="bg-[#111] rounded-[32px] overflow-hidden border border-white/5 group cursor-pointer transition-all hover:border-[#a855f7]/50 shadow-2xl relative">
                    
                    {/* ❤️ BOTÓN DE FAVORITO DINÁMICO */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        toggleFavorite(obra.id);
                      }}
                      className={`absolute top-6 right-6 z-30 p-3 backdrop-blur-md border rounded-full transition-all duration-300 shadow-xl active:scale-90 ${
                        esFavorito 
                          ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500 hover:text-white' 
                          : 'bg-black/40 border-white/10 text-white hover:bg-red-500 hover:border-red-500'
                      }`}
                    >
                      <Heart 
                        size={20} 
                        fill={esFavorito ? "currentColor" : "none"} 
                        className={esFavorito ? "" : "group-hover:fill-white"} 
                      />
                    </button>

                    <div className="h-80 bg-gray-900 relative overflow-hidden">
                      {/* ✅ RUTAS DE IMAGEN CORREGIDAS AL SERVIDOR LOCAL */}
                      <img 
                        src={obra.media && obra.media.length > 0 
                          ? (obra.media[0].file_path.startsWith('http') ? obra.media[0].file_path : `http://localhost:8000/storage/${obra.media[0].file_path}`) 
                          : 'https://ui-avatars.com/api/?name=Art&background=333&color=fff'} 
                        alt={obra.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                    </div>

                    <div className="p-8">
                      <h3 className="text-xl font-black mb-2 group-hover:text-[#a855f7] transition-colors uppercase tracking-tight text-white line-clamp-1">
                        {obra.title}
                      </h3>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        Por <span className="text-gray-300">{obra.user?.name || 'Maestro Local'}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center border-2 border-dashed border-white/5 rounded-[40px]">
                <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em] mb-4">El museo está vacío... por ahora.</p>
                <Link to="/login" className="text-[#a855f7] text-xs font-black uppercase underline tracking-widest hover:text-white transition-colors">
                  Sé el primero en publicar una obra
                </Link>
              </div>
            )}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Home;