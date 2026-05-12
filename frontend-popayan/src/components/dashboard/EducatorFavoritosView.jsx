import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Heart, Search, BookOpen, ImageIcon, 
  Trash2, ExternalLink, Loader2, Bookmark
} from 'lucide-react';

const EducatorFavoritosView = ({ user }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/saved-items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === 'success') {
        setFavorites(response.data.data);
      }
    } catch (err) {
      console.error("Error de sincronización:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleOpen = (id) => {
    if (!id) return;
    window.open(`/posts/${id}`, '_blank');
  };

  const handleRemove = async (savedItemId, postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/saved-items/toggle`, 
        { post_id: postId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'removed') {
        setFavorites(prev => prev.filter(fav => fav.id !== savedItemId));
      } else {
        fetchFavorites(); 
      }
    } catch (err) {
      console.error("Fallo en la persistencia del borrado:", err);
    }
  };

  const filtrados = favorites.filter(fav => {
    const coincideTexto = (fav.title || "").toLowerCase().includes(busqueda.toLowerCase());
    const coincideTab = tabActiva === 'all' 
      ? true 
      : tabActiva === 'routes' ? fav.is_educational : !fav.is_educational;
    return coincideTexto && coincideTab;
  });

  return (
    <div className="p-8 lg:p-12 w-full max-w-[1600px] animate-in fade-in duration-700 transition-colors duration-500">
      
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.8)]"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[rgb(var(--role-accent))]/80">Baúl de Inspiración</span>
          </div>
          <h2 className="text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] transition-colors">
            Mis <span className="text-[rgb(var(--role-accent))]">Favoritos</span>
          </h2>
        </div>

        <div className="relative group w-full md:w-80">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar en guardados..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-xs font-mono rounded-[20px] pl-14 pr-6 py-4 outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner placeholder-[var(--text-body)]/60"
          />
        </div>
      </header>

      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide border-b border-[var(--border-color)] transition-colors">
        {[
          { id: 'all', label: 'Todo', icon: <Bookmark size={14}/> }, 
          { id: 'routes', label: 'Rutas Educativas', icon: <BookOpen size={14}/> }, 
          { id: 'posts', label: 'Obras y Post', icon: <ImageIcon size={14}/> }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setTabActiva(tab.id)} 
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm border ${
              tabActiva === tab.id 
                ? 'bg-[rgb(var(--role-accent))] text-white border-[rgb(var(--role-accent))] shadow-[0_0_20px_rgba(var(--role-accent),0.3)]' 
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-body)] hover:text-[var(--text-heading)]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-[rgb(var(--role-accent))]">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center py-40 border border-dashed border-[var(--border-color)] rounded-[40px] bg-[var(--bg-container)]/50 transition-colors">
          <Heart size={48} className="text-[var(--text-body)] opacity-20 mb-6" />
          <h3 className="text-2xl font-bold italic uppercase text-[var(--text-body)] opacity-40 transition-colors">Bóveda Vacía</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtrados.map((item) => (
            <div key={item.id} className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[35px] overflow-hidden hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 shadow-sm hover:shadow-[0_15px_40px_rgba(var(--glass-shadow))] flex flex-col">
              <div className="relative aspect-video overflow-hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                <img 
                  src={item.cover_image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600'} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out" 
                  alt={item.title} 
                />
              </div>
              <div className="p-8 flex-1 flex flex-col transition-colors">
                <h4 className="text-xl font-bold text-[var(--text-heading)] italic uppercase mb-6 line-clamp-2 transition-colors">{item.title}</h4>
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => handleOpen(item.post_id)} 
                    className="flex-1 py-3 bg-[var(--text-heading)]/5 hover:bg-[rgb(var(--role-accent))] text-[var(--text-body)] hover:text-white border border-[var(--border-color)] hover:border-transparent rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <ExternalLink size={12} /> Abrir
                  </button>
                  <button 
                    onClick={() => handleRemove(item.id, item.post_id)} 
                    className="w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-transparent rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducatorFavoritosView;