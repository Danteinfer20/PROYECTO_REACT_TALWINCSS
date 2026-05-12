import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, Trash2, Search, AlertCircle, Loader2, Image as ImageIcon, Eye, Heart
} from 'lucide-react';

const MisObrasView = ({ initialTab, onEditRequest }) => {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || 'published');
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchMisObras = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { my_posts: true }
        });
        setObras(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error al recuperar catálogo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMisObras();
  }, [API_URL]);

  const filteredObras = obras.filter(obra => 
    obra.status === activeTab && 
    (obra.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     obra.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas destruir esta obra?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setObras(obras.filter(o => o.id !== id));
      } catch (err) {
        alert("Fallo en la eliminación.");
      }
    }
  };

  const getCoverImage = (obra) => {
    if (obra.post_media && obra.post_media.length > 0) {
        const path = obra.post_media[0].file_path;
        return path.startsWith('http') 
            ? path 
            : `${API_URL.replace('/api/v1', '')}/storage/${path}`;
    }
    if (obra.image) return obra.image;
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[rgb(var(--role-accent))] animate-pulse transition-colors duration-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Sincronizando Archivo Cultural...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 font-sans transition-colors duration-500">
      
      <header className="mb-12 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-heading)] tracking-tighter italic drop-shadow-sm transition-colors duration-500">
          Gestor de Catálogo
        </h2>
        <p className="text-[rgb(var(--role-accent))] text-[10px] font-mono uppercase tracking-[0.3em] mt-3 font-bold flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.8)]"></span>
           Conexión directa con tu base de datos
        </p>
      </header>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 border-b border-[var(--border-color)] pb-8 relative z-10 transition-colors duration-500">
        <div className="flex bg-[var(--bg-container)] p-1.5 rounded-full border border-[var(--border-color)] shadow-sm w-full lg:w-auto transition-colors duration-500">
          <button 
            onClick={() => setActiveTab('published')}
            className={`flex-1 lg:flex-none px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'published' ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_20px_rgba(var(--role-accent),0.3)] scale-105' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--text-heading)]/5'}`}
          >
            Públicas ({obras.filter(o => o.status === 'published').length})
          </button>
          <button 
            onClick={() => setActiveTab('draft')}
            className={`flex-1 lg:flex-none px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'draft' ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_20px_rgba(var(--role-accent),0.3)] scale-105' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--text-heading)]/5'}`}
          >
            Borradores ({obras.filter(o => o.status === 'draft').length})
          </button>
        </div>

        <div className="relative w-full lg:w-[400px] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" size={16} />
          <input 
            type="text"
            placeholder="BUSCAR EN EL ARCHIVO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full py-4 pl-14 pr-6 text-[var(--text-heading)] text-[10px] font-mono focus:border-[rgb(var(--role-accent))]/50 focus:ring-1 focus:ring-[rgb(var(--role-accent))]/30 outline-none transition-all placeholder:text-[var(--text-body)]/60 shadow-inner"
          />
        </div>
      </div>

      {filteredObras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredObras.map(obra => {
            const coverImage = getCoverImage(obra);
            const vistas = obra.view_count || 0;
            const likes = obra.reactions_count || 0;

            return (
              <div key={obra.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] hover:border-[rgb(var(--role-accent))]/40 hover:shadow-[0_20px_50px_rgba(var(--glass-shadow))] transition-all duration-700 relative flex flex-col">
                <div className="h-56 sm:h-64 w-full relative bg-[var(--bg-primary)] rounded-t-[40px] overflow-hidden border-b border-[var(--border-color)] transition-colors duration-500">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={obra.title || 'Obra Artística'} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-heading)]/10 group-hover:text-[rgb(var(--role-accent))]/30 transition-colors duration-500">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[8px] font-mono mt-3 uppercase tracking-widest">Sin Imagen</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-[var(--bg-container)]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 z-20">
                    <button 
                      onClick={() => onEditRequest(obra)}
                      className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))] hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300 shadow-lg"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(obra.id)}
                      className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-heading)] hover:bg-red-500 hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300 shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 relative z-30 bg-[var(--bg-card)] rounded-b-[40px] transition-colors duration-500">
                  <div className="mb-auto">
                     <p className="text-[9px] font-mono text-[rgb(var(--role-accent))] uppercase tracking-widest font-bold mb-2">
                       ID: #{obra.id.toString().padStart(4, '0')}
                     </p>
                     <h3 className="text-2xl font-bold text-[var(--text-heading)] italic leading-tight group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2">
                        {obra.title}
                     </h3>
                  </div>

                  <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex items-center justify-between transition-colors duration-500">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Eye size={14} className="text-[var(--text-body)]"/>
                           <span className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-widest">{vistas} Vistas</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Heart size={14} className="text-[var(--text-body)]"/>
                           <span className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-widest">{likes} Likes</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 border-2 border-dashed border-[var(--border-color)] rounded-[40px] flex flex-col items-center justify-center bg-[var(--bg-container)]/50 relative overflow-hidden transition-colors duration-500">
          <AlertCircle size={32} className="text-[var(--text-body)] opacity-50 mb-6" strokeWidth={1.5} />
          <h3 className="text-[var(--text-heading)] font-bold text-3xl italic mb-3 relative z-10 transition-colors">Archivo Silencioso</h3>
          <p className="text-[var(--text-body)] text-[10px] font-mono uppercase tracking-widest text-center">
            No hay registros en <span className="text-[rgb(var(--role-accent))] font-bold">{activeTab}</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default MisObrasView;