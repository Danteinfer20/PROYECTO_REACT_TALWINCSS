import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Trash2, Palette, Image as ImageIcon, CheckCircle, Eye, Heart, Sparkles, Loader2 } from 'lucide-react';

const FavoritosView = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const navigate = useNavigate();

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
      const response = await api.get('/saved-items');
      setFavoritos(response.data.data || []);
    } catch (error) {
      showToast("❌ Error de conexión con el Ledger.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarFavoritos(); }, [cargarFavoritos]);

  const eliminarFavorito = async (e, postId) => {
    e.stopPropagation();
    try {
      await api.post('/saved-items/toggle', { post_id: postId });
      setFavoritos(prev => prev.filter(f => f.savable_id !== postId));
      showToast("🗑️ Registro retirado del archivo");
    } catch (error) {
      showToast("❌ No se pudo actualizar el Ledger.");
    }
  };

  const renderImage = (obra) => {
    const fallback = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop';
    if (!obra) return fallback;
    const image = obra.media?.[0]?.url || obra.media?.[0]?.original_url || obra.image_url || obra.file_path || obra.url;
    if (!image) return fallback;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    return `${window.location.origin}/storage/${image.replace(/^\/+/, '')}`;
  };

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-700 relative min-h-screen transition-colors duration-500">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 z-[100] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[var(--bg-container)] border border-[rgb(var(--role-accent))]/30 text-[var(--text-heading)] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-3 backdrop-blur-xl text-[8px] font-black uppercase tracking-[0.2em]">
          <CheckCircle size={14} className="text-[rgb(var(--role-accent))]" /> 
          <span>{toast.message}</span>
        </div>
      </div>

      <header className="flex flex-col mb-8 md:mb-12 relative">
        <div className="absolute -top-24 -left-24 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-[rgb(var(--role-accent))]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <span className="text-[rgb(var(--role-accent))] font-mono text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mb-2 md:mb-3 flex items-center gap-2">
            <Sparkles size={10} className="md:w-3 md:h-3 animate-pulse" /> Archivo de Curaduría Privada
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold italic uppercase text-[var(--text-heading)] tracking-tighter leading-tight">
            Obras <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-heading)] via-[var(--text-heading)] to-[var(--text-body)] opacity-60">Guardadas.</span>
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {[1, 2, 3, 4].map(n => <div key={n} className="aspect-[3/4] bg-[var(--bg-card)] animate-pulse rounded-xl md:rounded-2xl border border-[var(--border-color)]" />)}
        </div>
      ) : favoritos.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-16 md:py-24 border border-dashed border-[var(--border-color)] rounded-xl md:rounded-2xl">
          <Heart size={32} className="md:w-10 md:h-10 text-[var(--text-body)] opacity-20 mb-3" />
          <h3 className="text-lg md:text-xl font-bold italic uppercase text-[var(--text-body)] opacity-40">Bóveda Vacía</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {favoritos.map((fav) => {
            const obra = fav.savable; 
            if (!obra) return null;

            return (
              <div 
                key={fav.id} 
                className="group relative rounded-xl md:rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 shadow-sm hover:shadow-md cursor-pointer flex flex-col"
                onClick={() => navigate(`/obra/${obra.id}`)}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
                  <img 
                    src={renderImage(obra)} 
                    alt={obra.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-transparent opacity-80"></div>
                  
                  <div className="absolute top-2 left-2 z-20 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-heading)] px-2.5 py-1 rounded-full text-[6px] md:text-[7px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></div> Curada
                  </div>

                  <button 
                    onClick={(e) => eliminarFavorito(e, obra.id)}
                    className="absolute top-2 right-2 z-30 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full backdrop-blur-xl transition-all duration-500 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 shadow-lg"
                  >
                    <Trash2 size={12} className="md:w-3.5 md:h-3.5" strokeWidth={2} />
                  </button>
                </div>

                <div className="p-3 md:p-4 flex flex-col flex-1 justify-between bg-[var(--bg-card)]">
                  <div>
                    <p className="text-[rgb(var(--role-accent))] text-[6px] md:text-[8px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                      <Palette size={8} className="md:w-2.5 md:h-2.5" /> {obra.user?.name || 'Maestro Caucano'}
                    </p>
                    <h3 className="text-xs md:text-sm font-bold italic uppercase text-[var(--text-heading)] tracking-tighter leading-tight line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-all">
                      {obra.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-2 mt-2">
                    <span className="text-[6px] md:text-[7px] font-mono uppercase tracking-[0.2em] text-[var(--text-body)] opacity-50">REF-{obra.id}</span>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[var(--text-heading)]/5 border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] group-hover:bg-[rgb(var(--role-accent))] group-hover:text-white transition-all duration-500 shadow-sm">
                       <Eye size={10} className="md:w-3.5 md:h-3.5" />
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