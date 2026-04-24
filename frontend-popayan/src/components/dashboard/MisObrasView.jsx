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
        setObras(res.data.data || []);
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
    obra.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas destruir esta obra de los registros?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setObras(obras.filter(o => o.id !== id));
      } catch (err) {
        alert("Fallo en la eliminación transaccional.");
      }
    }
  };

  const getCoverImage = (obra) => {
    if (obra.images && obra.images.length > 0) return obra.images[0];
    if (obra.post_media && obra.post_media.length > 0) {
        const path = obra.post_media[0].file_path;
        return path.startsWith('http') ? path : `${API_URL.replace('/api/v1', '')}/storage/${path}`;
    }
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
      
      {/* CABECERA LÍMPIA E IMPONENTE */}
      <header className="mb-12 relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter italic drop-shadow-lg">
          Gestor de Catálogo
        </h2>
        <p className="text-[#a855f7] text-[10px] font-mono uppercase tracking-[0.3em] mt-3 font-bold flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse shadow-[0_0_10px_#a855f7]"></span>
           Control absoluto sobre tus piezas maestras
        </p>
      </header>

      {/* CONTROLES DE MANDO (Neo-Modern) */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8 relative z-10">
        
        {/* Segmented Control (Switch) */}
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

        {/* Buscador Implacable (Deep UI) */}
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

      {/* GRID DE OBRAS MAESTRAS */}
      {filteredObras.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {filteredObras.map(obra => {
            const coverImage = getCoverImage(obra);
            const vistas = obra.stats?.views || obra.view_count || 0;
            const likes = obra.stats?.reactions || obra.reactions_count || 0;

            return (
              <div key={obra.id} className="group bg-[#111113] border border-white/5 rounded-[40px] overflow-hidden hover:border-[#a855f7]/30 hover:shadow-[0_20px_50px_rgba(168,85,247,0.1)] transition-all duration-700 relative flex flex-col">
                
                {/* ÁREA VISUAL CON BARRA DE ACCIÓN FANTASMA */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#050505]">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={obra.title} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/10 group-hover:text-[#a855f7]/30 transition-colors duration-500">
                      <ImageIcon size={48} strokeWidth={1} />
                      <span className="text-[8px] font-mono mt-3 uppercase tracking-widest">Sin Matriz Visual</span>
                    </div>
                  )}
                  
                  {/* Glassmorphism ActionBar (Se revela al hacer Hover) */}
                  <div className="absolute inset-0 bg-[#0A0A0C]/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 z-20">
                    <button 
                      onClick={() => onEditRequest(obra)}
                      className="w-14 h-14 rounded-full bg-[#111113]/90 border border-white/10 flex items-center justify-center text-white hover:bg-[#a855f7] hover:border-[#a855f7] hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300"
                      title="Refinar Obra"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(obra.id)}
                      className="w-14 h-14 rounded-full bg-[#111113]/90 border border-white/10 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all duration-300"
                      title="Destruir Obra"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {/* Gradiente sutil para fundir la imagen con la tarjeta */}
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#111113] to-transparent z-10 pointer-events-none"></div>
                </div>

                {/* CUERPO DE LA TARJETA Y METADATOS */}
                <div className="p-8 flex flex-col flex-1 relative z-30">
                  <div className="mb-auto">
                     <p className="text-[9px] font-mono text-[#a855f7] uppercase tracking-widest font-bold mb-2">
                        ID: #{obra.id.toString().padStart(4, '0')}
                     </p>
                     <h3 className="text-2xl font-serif text-white italic leading-tight group-hover:text-[#a855f7] transition-colors line-clamp-2 drop-shadow-md">
                        {obra.title || obra.name}
                     </h3>
                  </div>

                  {/* Ficha Técnica de Galería */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 group/stat">
                           <Eye size={14} className="text-gray-600 group-hover/stat:text-white transition-colors"/>
                           <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest group-hover/stat:text-white transition-colors">{vistas} Vistas</span>
                        </div>
                        <div className="w-px h-4 bg-white/10"></div>
                        <div className="flex items-center gap-2 group/stat">
                           <Heart size={14} className="text-gray-600 group-hover/stat:text-rose-500 transition-colors"/>
                           <span className="text-gray-400 font-mono text-[10px] uppercase tracking-widest group-hover/stat:text-white transition-colors">{likes} Likes</span>
                        </div>
                     </div>
                  </div>
                </div>
                
                {/* Ambient Glow Inferior */}
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#a855f7]/0 via-[#a855f7]/0 to-[#a855f7]/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none duration-700"></div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-32 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-[#050505] shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-[#a855f7]/5 blur-[100px] rounded-full w-64 h-64 mx-auto top-1/2 -translate-y-1/2"></div>
          <div className="w-20 h-20 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center mb-6 shadow-2xl relative z-10">
             <AlertCircle size={32} className="text-gray-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-white font-serif text-3xl italic mb-3 relative z-10">Archivo Silencioso</h3>
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest text-center max-w-sm leading-relaxed relative z-10">
            No existen registros catalogados como <span className="text-[#a855f7] font-bold">{activeTab === 'published' ? 'Públicas' : 'Borradores'}</span> en este momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default MisObrasView;