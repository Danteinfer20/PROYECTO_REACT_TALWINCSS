import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Palette, Image as ImageIcon, CheckCircle, Eye, Heart, Sparkles, RefreshCw } from 'lucide-react';

const FavoritosView = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const cargarFavoritos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/saved-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritos(response.data.data || []);
    } catch (error) {
      showToast("❌ Error de conexión con el Ledger.");
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => { cargarFavoritos(); }, [cargarFavoritos]);

  // 🔥 LÓGICA DE EXTRACCIÓN INFALIBLE (Sincronizada con SavedItemResource)
  const renderImage = (obra) => {
    const fallback = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop';
    
    if (!obra) return fallback;

    // 1. Intentar la ruta del Resource que acabamos de blindar
    if (obra.media && Array.isArray(obra.media) && obra.media.length > 0) {
      return obra.media[0].url || obra.media[0].original_url || fallback;
    }

    // 2. RASTREO DINÁMICO: Si el Resource falló, buscamos cualquier llave que huela a URL
    return obra.image_url || obra.file_path || obra.url || fallback;
  };

  return (
    <div className="p-6 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-700 relative min-h-screen selection:bg-[#a855f7]/30">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#111113] border border-[#a855f7]/30 text-white px-8 py-4 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 backdrop-blur-xl">
          <CheckCircle size={20} className="text-[#a855f7]" /> 
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{toast.message}</span>
        </div>
      </div>

      <header className="flex flex-col mb-16 relative">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[#a855f7]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-[#a855f7] font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-4 flex items-center gap-3">
            <Sparkles size={14} className="animate-pulse" /> Archivo de Curaduría Privada
          </span>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter leading-none">
            Obras <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-600">Guardadas.</span>
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-[450px] bg-[#111113] animate-pulse rounded-[35px] border border-white/5" />)}
        </div>
      ) : favoritos.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-40 border border-dashed border-white/5 rounded-[40px]">
          <Heart size={48} className="text-gray-800 mb-6" />
          <h3 className="text-2xl font-black italic uppercase text-gray-500">Bóveda Vacía</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {favoritos.map((fav) => {
            const obra = fav.savable; 
            if (!obra) return null;

            return (
              <div 
                key={fav.id} 
                className="group relative h-[450px] rounded-[35px] overflow-hidden bg-[#111113] border border-white/5 hover:border-[#a855f7]/30 transition-all duration-700 shadow-2xl cursor-pointer"
                onClick={() => navigate(`/obra/${obra.id}`)}
              >
                <div className="relative h-[65%] w-full overflow-hidden">
                  <img 
                    src={renderImage(obra)} 
                    alt={obra.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute top-5 left-5 z-20 bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></div> Curada
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); eliminarFavorito(e, obra.id); }}
                    className="absolute top-5 right-5 z-30 bg-white/5 hover:bg-red-500/20 hover:text-red-500 border border-white/5 text-gray-400 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-500 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>

                <div className="relative h-[35%] p-8 flex flex-col justify-between bg-[#111113]">
                  <div>
                    <p className="text-[#a855f7] text-[9px] font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                      <Palette size={12} /> {obra.user?.name || 'Maestro Caucano'}
                    </p>
                    <h3 className="text-xl md:text-2xl font-black italic uppercase text-white tracking-tighter leading-none line-clamp-2 group-hover:text-[#a855f7] transition-all">
                      {obra.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-5">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-gray-600">REF-{obra.id}</span>
                    <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#a855f7] group-hover:text-white transition-all duration-500">
                       <Eye size={18} />
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