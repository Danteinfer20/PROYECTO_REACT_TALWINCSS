import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2, Palette, Image as ImageIcon, CheckCircle, Eye, Heart, Sparkles, Loader2 } from 'lucide-react';

const FavoritosView = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  // 🔥 MOTOR DE ESTADO PARA ROL CROMÁTICO (Heredado o calculado para el acento)
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

  // 🔥 FUNCIONALIDAD RECUPERADA: Eliminación real desde la bóveda
  const eliminarFavorito = async (e, postId) => {
    e.stopPropagation();
    try {
      await axios.post(`${API_URL}/saved-items/toggle`, { post_id: postId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoritos(prev => prev.filter(f => f.savable_id !== postId));
      showToast("🗑️ Registro retirado del archivo");
    } catch (error) {
      showToast("❌ No se pudo actualizar el Ledger.");
    }
  };

  const renderImage = (obra) => {
    const fallback = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop';
    if (!obra) return fallback;
    if (obra.media && Array.isArray(obra.media) && obra.media.length > 0) {
      return obra.media[0].url || obra.media[0].original_url || fallback;
    }
    return obra.image_url || obra.file_path || obra.url || fallback;
  };

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="p-6 md:p-12 max-w-[1600px] mx-auto animate-in fade-in duration-700 relative min-h-screen selection:bg-[rgb(var(--role-accent))]/30 transition-colors duration-500">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[var(--bg-container)] border border-[rgb(var(--role-accent))]/30 text-[var(--text-heading)] px-8 py-4 rounded-[20px] shadow-lg flex items-center gap-4 backdrop-blur-xl">
          <CheckCircle size={20} className="text-[rgb(var(--role-accent))]" /> 
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{toast.message}</span>
        </div>
      </div>

      <header className="flex flex-col mb-16 relative">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-[rgb(var(--role-accent))]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-[rgb(var(--role-accent))] font-mono text-[10px] font-black uppercase tracking-[0.5em] mb-4 flex items-center gap-3">
            <Sparkles size={14} className="animate-pulse" /> Archivo de Curaduría Privada
          </span>
          <h1 className="text-5xl md:text-7xl font-bold italic uppercase text-[var(--text-heading)] tracking-tighter leading-none transition-colors duration-500">
            Obras <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-heading)] via-[var(--text-heading)] to-[var(--text-body)] opacity-60">Guardadas.</span>
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-[450px] bg-[var(--bg-card)] animate-pulse rounded-[35px] border border-[var(--border-color)]" />)}
        </div>
      ) : favoritos.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-40 border border-dashed border-[var(--border-color)] rounded-[40px] transition-colors duration-500">
          <Heart size={48} className="text-[var(--text-body)] opacity-20 mb-6" />
          <h3 className="text-2xl font-bold italic uppercase text-[var(--text-body)] opacity-40">Bóveda Vacía</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {favoritos.map((fav) => {
            const obra = fav.savable; 
            if (!obra) return null;

            return (
              <div 
                key={fav.id} 
                className="group relative h-[450px] rounded-[35px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/40 transition-all duration-700 shadow-sm hover:shadow-[0_20px_50px_rgba(var(--glass-shadow))] cursor-pointer"
                onClick={() => navigate(`/obra/${obra.id}`)}
              >
                <div className="relative h-[65%] w-full overflow-hidden border-b border-[var(--border-color)]">
                  <img 
                    src={renderImage(obra)} 
                    alt={obra.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute top-5 left-5 z-20 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-heading)] px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></div> Curada
                  </div>

                  <button 
                    onClick={(e) => eliminarFavorito(e, obra.id)}
                    className="absolute top-5 right-5 z-30 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-500 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 shadow-lg"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>
                </div>

                <div className="relative h-[35%] p-8 flex flex-col justify-between bg-[var(--bg-card)] transition-colors duration-500">
                  <div>
                    <p className="text-[rgb(var(--role-accent))] text-[9px] font-black uppercase tracking-[0.4em] mb-2 flex items-center gap-2 transition-colors">
                      <Palette size={12} /> {obra.user?.name || 'Maestro Caucano'}
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold italic uppercase text-[var(--text-heading)] tracking-tighter leading-none line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-all">
                      {obra.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-5 transition-colors duration-500">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--text-body)] opacity-50">REF-{obra.id}</span>
                    <div className="w-10 h-10 rounded-full bg-[var(--text-heading)]/5 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] group-hover:bg-[rgb(var(--role-accent))] group-hover:text-white transition-all duration-500 shadow-sm">
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