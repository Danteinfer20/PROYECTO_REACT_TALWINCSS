import React from 'react';
import { Award } from 'lucide-react';

const ArtistCard = ({ artista, onClickCard }) => {
  
  // 🛡️ ESCUDO ANTI-CORB DEFINITIVO (Cero Local Storage)
  const resolverImagen = (path) => {
    const fallback = `https://ui-avatars.com/api/?name=${artista.name || 'Artista'}&background=111113&color=a855f7&size=600`;
    if (!path) return fallback;
    
    // Si es Cloudinary legítimo, se respeta
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path; 
    }
    
    // 🚫 AMPUTACIÓN DE STORAGE LOCAL: Ignoramos datos sucios de la DB
    return fallback;
  };

  return (
    <div 
      onClick={() => onClickCard(artista.username || artista.id)}
      className="group flex flex-col items-center text-center cursor-pointer"
    >
      {/* 👤 AVATAR PERFECTO (Bordes Dinámicos inyectados por el rol) */}
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 transition-all duration-700 mb-5 shadow-sm group-hover:shadow-[0_0_15px_rgba(var(--role-accent),0.2)]">
        <img 
          src={resolverImagen(artista.profile_picture)} 
          alt={artista.name} 
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          loading="lazy" 
        />
      </div>
      
      {/* 📝 IDENTIDAD */}
      <h3 className="font-bold uppercase text-sm md:text-base tracking-tight text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-1 w-full px-2">
        {artista.name}
      </h3>
      
      <div className="flex items-center gap-1.5 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
         <Award size={10} className="text-[rgb(var(--role-accent))]" />
         <p className="text-[9px] text-[var(--text-body)] uppercase font-mono tracking-widest line-clamp-1">
           {artista.neighborhood || artista.city || 'Maestro Artesano'}
         </p>
      </div>
    </div>
  );
};

export default ArtistCard;