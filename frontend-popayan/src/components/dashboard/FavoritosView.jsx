import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Palette, Image as ImageIcon, CheckCircle, Eye, Heart, Sparkles } from 'lucide-react';

const FavoritosView = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/v1/saved-items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritos(response.data.data || []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      showToast("❌ Hubo un problema de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const eliminarFavorito = async (e, postId) => {
    e.stopPropagation();
    try {
      await axios.post(
        'http://localhost:8000/api/v1/saved-items/toggle',
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFavoritos(prev => prev.filter(fav => {
        const idObra = fav.savable?.id || fav.post_id;
        return idObra !== postId;
      }));
      showToast("🗑️ Obra eliminada de tu colección.");
    } catch (error) {
      console.error("Error al eliminar:", error);
      showToast("❌ No se pudo eliminar la obra.");
    }
  };

  const getImageUrl = (mediaArray) => {
    // Fallback fotográfico premium abstracto (Dark Modern)
    const premiumFallback = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop';
    
    if (!mediaArray || !Array.isArray(mediaArray) || mediaArray.length === 0) {
      return premiumFallback;
    }
    return mediaArray[0].url || mediaArray[0].file_path || premiumFallback; 
  };

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-700 relative min-h-screen">
      
      {/* Toast Notification Premium */}
      <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="bg-[#111113]/90 backdrop-blur-xl text-white px-6 py-4 rounded-full shadow-[0_20px_50px_rgba(168,85,247,0.3)] flex items-center gap-3 text-[10px] font-black uppercase tracking-widest border border-[#a855f7]/30">
          <CheckCircle size={18} className="text-[#a855f7]" strokeWidth={2} /> {toast.message}
        </div>
      </div>

      {/* Header Rediseñado: Sin pastilla gigante, integrado y orgánico */}
      <div className="flex flex-col mb-16 relative">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#a855f7]/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <span className="text-[#a855f7] text-[10px] font-black uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
            <Sparkles size={14} /> Archivo Privado
          </span>
          <div className="flex flex-wrap items-end gap-6">
            <h1 className="text-5xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
              Obras <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#d8b4fe]">Guardadas</span>
            </h1>
            {/* Badge de Contador Elegante */}
            {!loading && favoritos.length > 0 && (
              <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                Total: <span className="text-white text-sm">{favoritos.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estados y Renderizado */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-[380px] bg-[#111113] animate-pulse rounded-[30px] border border-white/5"></div>
          ))}
        </div>
      ) : favoritos.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-40 relative overflow-hidden bg-[#111113]/30 border border-white/5 rounded-[40px] backdrop-blur-sm">
          <div className="w-20 h-20 bg-[#0A0A0C] border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl">
            <Heart size={28} strokeWidth={1.5} className="text-gray-600" />
          </div>
          <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-3">La bóveda está vacía</h3>
          <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 text-center max-w-md mb-8 leading-relaxed">
            Aún no has reclamado ninguna pieza. El legado de Popayán espera por ti.
          </p>
          <button onClick={() => navigate('/tienda')} className="bg-[#a855f7] text-white px-8 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#9333ea] shadow-[0_15px_30px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-1">
            Explorar Maestros
          </button>
        </div>
      ) : (
        /* Grid Editorial Dark Modern 2.0 (Altura controlada a 380px) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favoritos.map((fav) => {
            const obra = fav.savable; 
            if (!obra) return null;

            return (
              <div 
                key={fav.id} 
                className="group relative h-[380px] w-full rounded-[30px] overflow-hidden bg-[#111113] border border-white/5 hover:border-[#a855f7]/40 transition-all duration-500 shadow-xl hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] flex flex-col cursor-pointer"
                onClick={() => navigate(`/obra/${obra.id}`)}
              >
                
                {/* 60% Superior: Contenedor de Imagen */}
                <div className="relative h-[60%] w-full overflow-hidden bg-[#0A0A0C]">
                  <img 
                    src={getImageUrl(obra.media)} 
                    alt={obra.title} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop'; }}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  />
                  {/* Gradiente de transición entre imagen y fondo de tarjeta */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent"></div>
                  
                  {/* Badge Tipo de Obra */}
                  <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <ImageIcon size={10} className="text-[#a855f7]" /> Guardada
                  </div>

                  {/* Botón de Borrar (Aparece en Hover) */}
                  <button 
                    onClick={(e) => eliminarFavorito(e, obra.id)}
                    className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-red-500 border border-white/10 hover:border-red-500 text-white w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                    title="Remover de Colección"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>

                {/* 40% Inferior: Información Limpia */}
                <div className="relative h-[40%] p-6 flex flex-col justify-between bg-[#111113] z-10">
                  
                  <div>
                    <p className="text-[#a855f7] text-[8px] font-black uppercase tracking-[0.3em] mb-1.5 flex items-center gap-1.5 line-clamp-1">
                      <Palette size={10} /> {obra.user?.name || obra.author?.name || 'Maestro Caucano'}
                    </p>
                    <h3 className="text-lg md:text-xl font-black italic uppercase text-white tracking-tight leading-[1.1] line-clamp-2">
                      {obra.title}
                    </h3>
                  </div>
                  
                  {/* Footer de Tarjeta (Aparece y empuja al hover) */}
                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-gray-500">
                      {fav.created_at ? new Date(fav.created_at).toLocaleDateString('es-CO') : 'Reciente'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#a855f7] text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                      <Eye size={14} strokeWidth={2} />
                    </div>
                  </div>
                  
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritosView;