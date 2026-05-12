import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';

const ProductCard = ({ producto, onClickCard }) => {
  
  // 🛡️ ESCUDO ANTI-CORB DEFINITIVO (Validación rigurosa de array)
  const resolverImagen = (path, gallery) => {
    const fallback = 'https://ui-avatars.com/api/?name=Tienda&background=111113&color=a855f7&size=600';

    // 1. Prioridad: Imágenes de galería (Cloudinary)
    if (gallery && gallery.length > 0 && gallery[0] && (gallery[0].startsWith('http://') || gallery[0].startsWith('https://'))) {
      return gallery[0];
    }
    
    // 2. Resolución absoluta: Si la imagen principal es URL completa
    if (path && (path.startsWith('http://') || path.startsWith('https://'))) {
      return path;
    }
    
    // 3. Fallback estricto Anti-CORB (Bloqueo de peticiones locales /storage/)
    return fallback;
  };

  const formatoCOP = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  return (
    <div onClick={() => onClickCard(producto.id)} className="group cursor-pointer flex flex-col relative w-full h-full">
      {/* 🖼️ SQUICLE DE CRISTAL (Matriz Dinámica acoplada al rol) */}
      <div className="relative w-full aspect-[4/5] bg-[var(--bg-card)] rounded-[24px] overflow-hidden border border-[var(--border-color)] group-hover:border-[rgb(var(--role-accent))]/50 transition-all duration-700 mb-4 shadow-sm">
        <img 
          src={resolverImagen(producto.main_image, producto.gallery_urls || producto.images)} 
          alt={producto.name} 
          className="w-full h-full object-cover transition-transform duration-[1500ms] grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        
        {producto.is_featured && (
          <div className="absolute top-3 left-3 bg-[rgb(var(--role-accent))]/90 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(var(--role-accent),0.3)] z-10">
            <Star size={8} fill="currentColor"/> Destacado
          </div>
        )}
      </div>

      {/* 📝 TIPOGRAFÍA NEO-TRADICIÓN */}
      <div className="px-1 flex flex-col flex-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-heading)] leading-snug mb-1 group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2">
          {producto.name}
        </h3>
        
        <span className="text-[rgb(var(--role-accent))] font-mono font-medium text-[11px] mb-3 tracking-widest">
          {formatoCOP(producto.price)}
        </span>
        
        <div className="flex items-center justify-between mt-auto border-t border-[var(--border-color)] pt-3 transition-colors duration-500">
           <span className="text-[8px] font-medium text-[var(--text-body)] uppercase tracking-widest truncate">
              {producto.author?.name || producto.artisan?.name || 'Popayán Cultural'}
           </span>
           <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[var(--text-heading)]/5 text-[var(--text-body)] group-hover:bg-[rgb(var(--role-accent))] group-hover:text-white transition-all duration-300">
             <ShoppingBag size={10} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;