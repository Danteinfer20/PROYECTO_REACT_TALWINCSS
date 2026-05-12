import React from 'react';
import { DollarSign, Package, Tag, ChevronDown } from 'lucide-react';

const ProductFields = ({ price, setPrice, stock, setStock, productType, setProductType }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-[rgb(var(--role-accent))]/[0.03] border border-[rgb(var(--role-accent))]/10 rounded-[35px] animate-in zoom-in-95 duration-500 transition-colors duration-500 shadow-inner">
      
      {/* VALOR DE INTERCAMBIO */}
      <div className="relative group">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[rgb(var(--role-accent))] mb-3 block transition-colors">
          Valor de Intercambio (COP)
        </label>
        <div className="relative">
          <DollarSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgb(var(--role-accent))]/50 transition-colors" />
          <input 
            type="number" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            placeholder="Ej: 50000" 
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[18px] py-4 pl-12 pr-6 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:[var(--text-body)]/20" 
          />
        </div>
      </div>

      {/* INVENTARIO FÍSICO */}
      <div className="relative group">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[rgb(var(--role-accent))] mb-3 block transition-colors">
          Inventario Físico
        </label>
        <div className="relative">
          <Package size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgb(var(--role-accent))]/50 transition-colors" />
          <input 
            type="number" 
            value={stock} 
            onChange={(e) => setStock(e.target.value)} 
            placeholder="Ej: 10" 
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[18px] py-4 pl-12 pr-6 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:[var(--text-body)]/20" 
          />
        </div>
      </div>

      {/* NATURALEZA DEL ACTIVO */}
      <div className="relative md:col-span-2 group">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[rgb(var(--role-accent))] mb-3 block transition-colors">
          Naturaleza del Activo
        </label>
        <div className="relative">
          <Tag size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgb(var(--role-accent))]/50 transition-colors z-10" />
          <select 
            value={productType} 
            onChange={(e) => setProductType(e.target.value)} 
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[18px] py-4 pl-12 pr-12 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner appearance-none cursor-pointer relative z-0"
          >
            <option value="physical">Objeto Físico (Envío Tradicional)</option>
            <option value="handicraft">Artesanía / Pieza Única</option>
            <option value="digital">Activo Digital (Descargable)</option>
            <option value="service">Servicio Artístico / Taller</option>
          </select>
          <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-body)] opacity-40 pointer-events-none" />
        </div>
      </div>

    </div>
  );
};

export default ProductFields;