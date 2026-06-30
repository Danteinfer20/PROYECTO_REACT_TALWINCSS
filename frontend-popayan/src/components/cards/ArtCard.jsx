import React from 'react';
import { Heart, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ArtCard = ({ obra, onToggleFavorite, esFavorito, onClickCard }) => {
  // 🌐 Inyectamos el idioma actual para forzar la reactividad
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const getImagePath = () => {
    if (obra.images && obra.images.length > 0) return obra.images[0];
    if (obra.post_media && obra.post_media.length > 0) return obra.post_media[0].file_path;
    if (obra.media && obra.media.length > 0) return obra.media[0].file_path;
    return null;
  };

  const resolverImagen = (path) => {
    const fallback = `https://ui-avatars.com/api/?name=Arte&background=0A0A0C&color=a855f7&size=600`;
    if (!path) return fallback;
    if (typeof path === 'string' && (path.startsWith('http://') || path.startsWith('https://'))) return path; 
    return fallback;
  };

  const imageUrl = resolverImagen(getImagePath());
  // Usamos el idioma actual para asegurar que cualquier cambio sea detectado
  const authorName = obra.author?.name || obra.user?.name || t('cards.art.anonymous', 'Maestro Anónimo');

  return (
    <div className="group cursor-pointer flex flex-col h-full" onClick={() => onClickCard(obra.id)}>
      <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 transition-all duration-700 shadow-lg mb-4">
        <img 
          key={`${currentLang}-${obra.id}`} // ⚡ CLAVE DE REACTIVIDAD: Fuerza el re-render al cambiar de idioma
          src={imageUrl} 
          className="w-full h-full object-cover transition-transform duration-[1500ms] grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100" 
          alt={obra.title}
        />
        
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

      <div className="px-1 flex flex-col flex-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2 leading-snug">
          {obra.title}
        </h3>
        
        <div className="mt-auto pt-3 flex flex-col gap-1.5 border-t border-[var(--border-color)] mt-3 transition-colors duration-500">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-mono text-[rgb(var(--role-accent))] uppercase tracking-[0.2em]">
              {obra.category?.name || t('cards.art.heritage', 'Patrimonio')}
            </span>
            <span className="text-[var(--text-body)] text-[9px] flex items-center gap-1 font-mono">
              <Eye size={10}/> {obra.stats?.views || obra.view_count || 0}
            </span>
          </div>
          <p className="text-[9px] font-medium text-[var(--text-body)] uppercase tracking-widest truncate">
            {t('cards.art.master_prefix', 'Maestro')} <span className="text-[var(--text-heading)] opacity-90 font-bold">{authorName}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArtCard;