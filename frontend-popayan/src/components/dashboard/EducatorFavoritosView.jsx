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

  // ✅ SOLUCIÓN ABRIR: Redirección por ID o Slug (Asegúrate que la ruta exista en App.jsx)
  const handleOpen = (id) => {
    if (!id) return;
    // Si tu ruta en App.jsx es diferente, cámbiala aquí (ej. /publicacion/ o /post/)
    window.open(`/posts/${id}`, '_blank');
  };

  // ✅ SOLUCIÓN ELIMINAR: Persistencia Real
  const handleRemove = async (savedItemId, postId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Enviamos el post_id exacto que espera tu ToggleSavedItemRequest
      const response = await axios.post(`${API_URL}/saved-items/toggle`, 
        { post_id: postId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🛡️ CRÍTICO: Solo eliminamos de la vista si el backend confirma el borrado
      if (response.data.status === 'removed') {
        setFavorites(prev => prev.filter(fav => fav.id !== savedItemId));
      } else {
        // Si el status es 'added', significa que el toggle volvió a crearlo por error de ID
        console.warn("El servidor no eliminó el ítem, lo volvió a añadir.");
        fetchFavorites(); // Forzamos resincronización
      }
    } catch (err) {
      console.error("Fallo en la persistencia del borrado:", err);
      alert("No se pudo eliminar de la base de datos.");
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
    <div className="p-8 lg:p-12 w-full max-w-[1600px] animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-amber-500/60">Baúl de Inspiración</span>
          </div>
          <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">
            Mis <span className="text-amber-500">Favoritos</span>
          </h2>
        </div>

        <div className="relative group w-full md:w-80">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar en guardados..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#111113] border border-white/5 text-white text-xs font-mono rounded-[20px] pl-14 pr-6 py-4 outline-none focus:border-amber-500/30 transition-all shadow-inner"
          />
        </div>
      </header>

      {/* Tabs y Grid se mantienen igual pero con las funciones corregidas */}
      <div className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
        {[{ id: 'all', label: 'Todo', icon: <Bookmark size={14}/> }, { id: 'routes', label: 'Rutas Educativas', icon: <BookOpen size={14}/> }, { id: 'posts', label: 'Obras y Post', icon: <ImageIcon size={14}/> }].map(tab => (
          <button key={tab.id} onClick={() => setTabActiva(tab.id)} className={`flex items-center gap-2 px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${tabActiva === tab.id ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtrados.map((item) => (
            <div key={item.id} className="group relative bg-[#0D0D0F] border border-white/5 rounded-[35px] overflow-hidden hover:border-amber-500/20 transition-all duration-500">
              <div className="relative aspect-video overflow-hidden">
                <img src={item.cover_image || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600'} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt={item.title} />
              </div>
              <div className="p-8">
                <h4 className="text-xl font-black text-white italic uppercase mb-4 line-clamp-2">{item.title}</h4>
                <div className="flex gap-3">
                  <button onClick={() => handleOpen(item.post_id)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[8px] font-black uppercase flex items-center justify-center gap-2">
                    <ExternalLink size={12} /> Abrir
                  </button>
                  <button onClick={() => handleRemove(item.id, item.post_id)} className="w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center">
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