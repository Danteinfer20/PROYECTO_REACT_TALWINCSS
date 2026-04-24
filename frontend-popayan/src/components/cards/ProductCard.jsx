import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';

const ProductCard = ({ producto, onClickCard }) => {
  
  // 🔥 ESCUDO SEGURO Y LIMPIO
  const resolverImagen = (path, gallery) => {
    if (gallery && gallery.length > 0 && gallery[0]) return gallery[0];
    if (!path) return 'https://ui-avatars.com/api/?name=Tienda&background=111113&color=a855f7&size=600';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  const formatoCOP = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  return (
    <div onClick={() => onClickCard(producto.id)} className="group cursor-pointer flex flex-col relative w-full h-full">
      {/* 🖼️ SQUICLE DE CRISTAL */}
      <div className="relative w-full aspect-[4/5] bg-[#111113] rounded-[24px] overflow-hidden border border-white/5 group-hover:border-[#a855f7]/30 transition-all duration-700 mb-4 shadow-lg">
        <img 
          src={resolverImagen(producto.main_image, producto.gallery_urls || producto.images)} 
          alt={producto.name} 
          className="w-full h-full object-cover transition-transform duration-[1500ms] grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />
        
        {producto.is_featured && (
          <div className="absolute top-3 left-3 bg-[#a855f7]/90 backdrop-blur-md text-white text-[7px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg z-10">
            <Star size={8} fill="currentColor"/> Destacado
          </div>
        )}
      </div>

      {/* 📝 TIPOGRAFÍA NEO-TRADICIÓN */}
      <div className="px-1 flex flex-col flex-1">
        <h3 className="text-sm font-bold uppercase tracking-tight text-white leading-snug mb-1 group-hover:text-[#a855f7] transition-colors line-clamp-2">
          {producto.name}
        </h3>
        
        <span className="text-[#a855f7] font-mono font-medium text-[11px] mb-3 tracking-widest">
          {formatoCOP(producto.price)}
        </span>
        
        <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-3">
           <span className="text-[8px] font-medium text-gray-500 uppercase tracking-widest truncate">
              {producto.author?.name || producto.artisan?.name || 'Popayán Cultural'}
           </span>
           <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 text-gray-400 group-hover:bg-[#a855f7] group-hover:text-white transition-all duration-300">
             <ShoppingBag size={10} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;