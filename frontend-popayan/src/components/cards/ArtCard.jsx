import React from 'react';
import { Heart, Eye } from 'lucide-react';

const ArtCard = ({ obra, onToggleFavorite, esFavorito, onClickCard }) => {
  
  // 🛡️ ESCUDO ARQUITECTÓNICO: Extracción inteligente de la imagen
  const getImagePath = () => {
    if (obra.images && obra.images.length > 0) return obra.images[0];
    if (obra.post_media && obra.post_media.length > 0) return obra.post_media[0].file_path;
    if (obra.media && obra.media.length > 0) return obra.media[0].file_path;
    return null;
  };

  // 🛡️ ESCUDO ANTI-CORB DEFINITIVO (Cero Local Storage)
  const resolverImagen = (path) => {
    const fallback = `https://ui-avatars.com/api/?name=Arte&background=111113&color=a855f7&size=600`;
    if (!path) return fallback;
    
    // Si es Cloudinary legítimo, se respeta
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path; 
    }
    
    // 🚫 AMPUTACIÓN DE STORAGE LOCAL: Ignoramos datos sucios de la DB para evitar el 404/CORB
    return fallback;
  };

  const imageUrl = resolverImagen(getImagePath());
  
  // 🔥 Extracción inteligente del Autor
  const authorName = obra.author?.name || obra.user?.name || 'Maestro Anónimo';

  return (
    <div className="group cursor-pointer flex flex-col h-full" onClick={() => onClickCard(obra.id)}>
      
      {/* 🖼️ SQUICLE DE CRISTAL (Contenedor de la Imagen) */}
      <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[#111113] border border-white/5 group-hover:border-[#a855f7]/30 transition-all duration-700 shadow-lg mb-4">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover transition-transform duration-[1500ms] grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
          alt={obra.title}
        />
        
        {/* ⭐ FAVORITO SUTIL */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            if(onToggleFavorite) onToggleFavorite(obra.id); 
          }}
          className={`absolute top-4 right-4 z-40 p-2 rounded-full backdrop-blur-xl transition-all duration-300 border ${
            esFavorito 
              ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
              : 'bg-black/30 border-white/10 text-white/70 hover:text-white hover:bg-[#a855f7]/50'
          }`}
        >
          <Heart size={14} fill={esFavorito ? "currentColor" : "none"} strokeWidth={esFavorito ? 0 : 1.5} />
        </button>
      </div>

      {/* 📝 TIPOGRAFÍA NEO-TRADICIÓN (Sutil, Controlada y Elegante) */}
      <div className="px-1 flex flex-col flex-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-[#a855f7] transition-colors line-clamp-2 leading-snug">
          {obra.title}
        </h3>
        
        <div className="mt-auto pt-3 flex flex-col gap-1.5 border-t border-white/5 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-[#a855f7] uppercase tracking-[0.2em]">
              {obra.category?.name || 'Patrimonio'}
            </span>
            <span className="text-gray-500 text-[9px] flex items-center gap-1 font-mono">
              <Eye size={10}/> {obra.stats?.views || obra.view_count || 0}
            </span>
          </div>
          <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest truncate">
            Maestro <span className="text-gray-300 font-bold">{authorName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;