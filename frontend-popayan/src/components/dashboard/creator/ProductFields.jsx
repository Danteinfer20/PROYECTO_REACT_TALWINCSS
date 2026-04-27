import React from 'react';
import { DollarSign, Package, Tag } from 'lucide-react';

const ProductFields = ({ price, setPrice, stock, setStock, productType, setProductType }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[#a855f7]/[0.02] border border-[#a855f7]/10 rounded-[35px] animate-in zoom-in-95 duration-500">
      
      <div className="relative">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a855f7] mb-3 block">Valor de Intercambio (COP)</label>
        <DollarSign size={14} className="absolute left-5 bottom-5 text-[#a855f7]/50" />
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          placeholder="Ej: 50000" 
          className="w-full bg-[#050505] border border-white/5 rounded-[18px] py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" 
        />
      </div>

      <div className="relative">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a855f7] mb-3 block">Inventario Físico</label>
        <Package size={14} className="absolute left-5 bottom-5 text-[#a855f7]/50" />
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(e.target.value)} 
          placeholder="Ej: 10" 
          className="w-full bg-[#050505] border border-white/5 rounded-[18px] py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" 
        />
      </div>

      {/* 🔥 CAMPO RESTAURADO: Naturaleza del Producto */}
      <div className="relative md:col-span-2">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#a855f7] mb-3 block">Naturaleza del Activo</label>
        <Tag size={14} className="absolute left-5 bottom-5 text-[#a855f7]/50" />
        <select 
          value={productType} 
          onChange={(e) => setProductType(e.target.value)} 
          className="w-full bg-[#050505] border border-white/5 rounded-[18px] py-4 pl-12 pr-6 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner appearance-none cursor-pointer"
        >
          <option value="physical">Objeto Físico (Envío Tradicional)</option>
          <option value="handicraft">Artesanía / Pieza Única</option>
          <option value="digital">Activo Digital (Descargable)</option>
          <option value="service">Servicio Artístico / Taller</option>
        </select>
      </div>

    </div>
  );
};

export default ProductFields;