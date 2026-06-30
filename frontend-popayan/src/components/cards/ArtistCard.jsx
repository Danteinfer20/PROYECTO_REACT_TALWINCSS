import React from 'react';
import { Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ArtistCard = ({ artista, onClickCard }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const resolverImagen = (path) => {
    const fallbackName = encodeURIComponent(artista.name || t('cards.artist.default_name', 'Artista'));
    const fallback = `https://ui-avatars.com/api/?name=${fallbackName}&background=0A0A0C&color=a855f7&size=600`;
    if (!path) return fallback;
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) return path; 
    return fallback;
  };

  return (
    <div 
      onClick={() => onClickCard(artista.username || artista.id)}
      className="group flex flex-col items-center text-center cursor-pointer"
    >
      {/* Tamaño responsivo: más pequeño en móvil, más grande en escritorio */}
      <div className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-[var(--bg-card)] border-2 border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/70 transition-all duration-700 mb-3 sm:mb-4 md:mb-5 shadow-sm group-hover:shadow-[0_0_20px_rgba(var(--role-accent),0.3)]">
        <img 
          key={`${currentLang}-${artista.id}`}
          src={resolverImagen(artista.profile_picture)} 
          alt={artista.name} 
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
          loading="lazy" 
        />
      </div>
      
      <h3 className="font-bold uppercase text-xs sm:text-sm md:text-base tracking-tight text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-1 w-full px-2">
        {artista.name}
      </h3>
      
      <div className="flex items-center gap-1.5 mt-1 sm:mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
         <Award size={10} className="text-[rgb(var(--role-accent))]" />
         <p className="text-[8px] sm:text-[9px] text-[var(--text-body)] uppercase font-mono tracking-widest line-clamp-1">
           {artista.neighborhood || artista.city || t('cards.artist.master', 'Maestro Artesano')}
         </p>
      </div>
    </div>
  );
};

export default ArtistCard;