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
        // IMPORTANTE: Laravel suele envolver en .data.data si usas Resources
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

  /**
   * 🎯 RESOLUCIÓN BASADA EN TU SQL (POST_MEDIA)
   */
  const getCoverImage = (obra) => {
    // 1. Buscamos en la relación post_media de tu arquitectura SQL
    if (obra.post_media && obra.post_media.length > 0) {
        const path = obra.post_media[0].file_path;
        // Si el path ya es una URL de Cloudinary (empieza con http) se usa directo
        // Si es local, se concatena el storage
        return path.startsWith('http') 
            ? path 
            : `${API_URL.replace('/api/v1', '')}/storage/${path}`;
    }
    
    // 2. Fallback por si el Resource envía el campo 'image' directo
    if (obra.image) return obra.image;

    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[#a855f7] animate-pulse">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Sincronizando Archivo Cultural...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 font-sans">
      
      <header className="mb-12 relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter italic drop-shadow-lg">
          Gestor de Catálogo
        </h2>
        <p className="text-[#a855f7] text-[10px] font-mono uppercase tracking-[0.3em] mt-3 font-bold flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse shadow-[0_0_10px_#a855f7]"></span>
           Conexión directa con tu base de datos
        </p>
      </header>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8 relative z-10">
        <div className="flex bg-[#050505] p-1.5 rounded-full border border-white/5 shadow-inner w-full lg:w-auto">
          <button 
            onClick={() => setActiveTab('published')}
            className={`flex-1 lg:flex-none px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'published' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            Públicas ({obras.filter(o => o.status === 'published').length})
          </button>
          <button 
            onClick={() => setActiveTab('draft')}
            className={`flex-1 lg:flex-none px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'draft' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-105' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}
          >
            Borradores ({obras.filter(o => o.status === 'draft').length})
          </button>
        </div>

        <div className="relative w-full lg:w-[400px] group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#a855f7] transition-colors" size={16} />
          <input 
            type="text"
            placeholder="BUSCAR EN EL ARCHIVO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#050505] border border-white/5 rounded-full py-4 pl-14 pr-6 text-white text-[10px] font-mono focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/30 outline-none transition-all placeholder:text-gray-700 shadow-inner"
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
              <div key={obra.id} className="group bg-[#111113] border border-white/5 rounded-[40px] hover:border-[#a855f7]/30 hover:shadow-[0_20px_50px_rgba(168,85,247,0.1)] transition-all duration-700 relative flex flex-col">
                <div className="h-56 sm:h-64 w-full relative bg-[#050505] rounded-t-[40px] overflow-hidden">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={obra.title || 'Obra Artística'} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/10 group-hover:text-[#a855f7]/30 transition-colors duration-500">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[8px] font-mono mt-3 uppercase tracking-widest">Sin Imagen</span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-[#0A0A0C]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 z-20">
                    <button 
                      onClick={() => onEditRequest(obra)}
                      className="w-14 h-14 rounded-full bg-[#111113]/90 border border-white/10 flex items-center justify-center text-white hover:bg-[#a855f7] hover:border-[#a855f7] hover:scale-110 transition-all duration-300"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(obra.id)}
                      className="w-14 h-14 rounded-full bg-[#111113]/90 border border-white/10 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 hover:scale-110 transition-all duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 relative z-30 bg-[#111113] rounded-b-[40px]">
                  <div className="mb-auto">
                     <p className="text-[9px] font-mono text-[#a855f7] uppercase tracking-widest font-bold mb-2">
                        ID: #{obra.id.toString().padStart(4, '0')}
                     </p>
                     <h3 className="text-2xl font-serif text-white italic leading-tight group-hover:text-[#a855f7] transition-colors line-clamp-2">
                        {obra.title}
                     </h3>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Eye size={14} className="text-gray-600"/>
                           <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">{vistas} Vistas</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Heart size={14} className="text-gray-600"/>
                           <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest">{likes} Likes</span>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
          <AlertCircle size={32} className="text-gray-600 mb-6" strokeWidth={1.5} />
          <h3 className="text-white font-serif text-3xl italic mb-3 relative z-10">Archivo Silencioso</h3>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest text-center">
            No hay registros en <span className="text-[#a855f7] font-bold">{activeTab}</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default MisObrasView;