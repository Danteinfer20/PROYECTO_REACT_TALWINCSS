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
      
      {/* 🖼️ SQUICLE DE CRISTAL (Conectado a la Matriz Dinámica) */}
      <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 transition-all duration-700 shadow-lg mb-4">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover transition-transform duration-[1500ms] grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
          alt={obra.title}
        />
        
        {/* ⭐ FAVORITO DINÁMICO */}
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            if(onToggleFavorite) onToggleFavorite(obra.id); 
          }}
          className={`absolute top-4 right-4 z-40 p-2 rounded-full backdrop-blur-xl transition-all duration-300 border ${
            esFavorito 
              ? 'bg-[rgb(var(--role-accent))] border-[rgb(var(--role-accent))] text-white shadow-[0_0_10px_rgba(var(--role-accent),0.4)]' 
              : 'bg-[var(--bg-primary)]/50 border-[var(--border-color)] text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))]/50'
          }`}
        >
          <Heart size={14} fill={esFavorito ? "currentColor" : "none"} strokeWidth={esFavorito ? 0 : 1.5} />
        </button>
      </div>

      {/* 📝 TIPOGRAFÍA MATEMÁTICA (Responde a Claro/Oscuro y al Rol) */}
      <div className="px-1 flex flex-col flex-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2 leading-snug">
          {obra.title}
        </h3>
        
        <div className="mt-auto pt-3 flex flex-col gap-1.5 border-t border-[var(--border-color)] mt-3 transition-colors duration-500">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-[rgb(var(--role-accent))] uppercase tracking-[0.2em]">
              {obra.category?.name || 'Patrimonio'}
            </span>
            <span className="text-[var(--text-body)] text-[9px] flex items-center gap-1 font-mono">
              <Eye size={10}/> {obra.stats?.views || obra.view_count || 0}
            </span>
          </div>
          <p className="text-[9px] font-medium text-[var(--text-body)] uppercase tracking-widest truncate">
            Maestro <span className="text-[var(--text-heading)] opacity-90 font-bold">{authorName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;