import React from 'react';
import { Award } from 'lucide-react';

const ArtistCard = ({ artista, onClickCard }) => {
  
  // 🛡️ SEGURO ANTI-CAÍDAS SUTIL
  const resolverImagen = (path) => {
    if (!path) return `https://ui-avatars.com/api/?name=${encodeURIComponent(artista.name)}&background=111113&color=a855f7&size=400`;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div 
      onClick={() => onClickCard(artista.username || artista.id)}
      className="group flex flex-col items-center text-center cursor-pointer"
    >
      {/* 👤 AVATAR PERFECTO */}
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-[#111113] border border-white/10 group-hover:border-[#a855f7]/50 transition-all duration-700 mb-5 shadow-lg group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
        <img 
          src={resolverImagen(artista.profile_picture)} 
          alt={artista.name} 
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          loading="lazy" 
        />
      </div>
      
      {/* 📝 IDENTIDAD */}
      <h3 className="font-bold uppercase text-sm md:text-base tracking-tight text-white group-hover:text-[#a855f7] transition-colors line-clamp-1 w-full px-2">
        {artista.name}
      </h3>
      
      <div className="flex items-center gap-1.5 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
         <Award size={10} className="text-[#a855f7]" />
         <p className="text-[9px] text-gray-400 uppercase font-mono tracking-widest line-clamp-1">
           {artista.neighborhood || artista.city || 'Maestro Artesano'}
         </p>
      </div>
    </div>
  );
};

export default ArtistCard;