import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Trash2, Image as ImageIcon, CheckCircle, Eye, Heart, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

const EducatorFavoritosView = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/saved-items');
      setFavoritos(response.data.data || []);
    } catch (error) {
      showToast("Error de conexión con el Ledger.", 'error');
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
      await api.post('/saved-items/toggle', { post_id: postId });
      setFavoritos(prev => prev.filter(f => f.savable_id !== postId));
      showToast("Registro retirado del archivo.");
    } catch (error) {
      showToast("No se pudo actualizar el Ledger.", 'error');
    }
  };

  const renderImage = (obra) => {
    if (!obra) return 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop';
    if (obra.images && obra.images.length > 0) return obra.images[0];
    if (obra.post_media && obra.post_media.length > 0) return obra.post_media[0].file_path;
    return 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-xl border px-6 py-3.5 rounded-[16px] shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} className="shrink-0" /> : <CheckCircle size={16} className="shrink-0" />}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      <header className="mb-8 md:mb-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-[rgb(var(--role-accent))]" />
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[rgb(var(--role-accent))]/80">Archivo de Curaduría Privada</span>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)]">
          Obras <span className="text-[rgb(var(--role-accent))]">Guardadas</span>
        </h1>
        <p className="text-[var(--text-body)] text-xs font-mono uppercase tracking-wider mt-1 opacity-60">Tu colección personal</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin text-[rgb(var(--role-accent))] mb-3" size={32} />
          <p className="text-[10px] font-mono text-[rgb(var(--role-accent))]/80 uppercase tracking-widest">Cargando colección...</p>
        </div>
      ) : favoritos.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-[var(--bg-container)]/50 border border-[var(--border-color)] rounded-2xl border-dashed">
          <Heart size={48} className="text-[var(--text-body)] opacity-30 mb-4" />
          <h3 className="text-xl font-bold italic text-[var(--text-body)] uppercase tracking-tighter">Bóveda Vacía</h3>
          <p className="text-xs text-[var(--text-body)]/60 mt-1">Aún no has guardado ninguna obra.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {favoritos.map((fav) => {
            const obra = fav.savable;
            if (!obra) return null;
            return (
              <div 
                key={fav.id} 
                className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:border-[rgb(var(--role-accent))]/40 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                onClick={() => navigate(`/obra/${obra.id}`)}
              >
                <div className="relative aspect-[4/3] bg-[var(--bg-primary)] overflow-hidden">
                  <img 
                    src={renderImage(obra)} 
                    alt={obra.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-[var(--bg-container)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-full text-[7px] font-black uppercase tracking-wider text-[rgb(var(--role-accent))] shadow-sm">
                      Guardada
                    </span>
                  </div>
                  <button 
                    onClick={(e) => eliminarFavorito(e, obra.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[8px] font-black text-[rgb(var(--role-accent))] uppercase tracking-wider mb-1">
                    {obra.user?.name || 'Maestro'}
                  </p>
                  <h3 className="text-sm font-bold text-[var(--text-heading)] leading-tight line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-colors mb-2">
                    {obra.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-auto pt-3 border-t border-[var(--border-color)] text-[var(--text-body)] text-[10px]">
                    <span className="flex items-center gap-1"><Eye size={12} /> {obra.view_count || 0}</span>
                    <span className="flex items-center gap-1"><Heart size={12} /> {obra.reactions_count || 0}</span>
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

export default EducatorFavoritosView;