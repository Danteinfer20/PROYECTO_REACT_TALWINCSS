import React from 'react';

const CoreFields = ({ 
  title, setTitle, 
  categoryId, setCategoryId, categories, 
  contentTypeId, setContentTypeId, contentTypes, 
  postType 
}) => {
  return (
    <>
      <div className="group">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block group-focus-within:text-white transition-colors">Identificador del Activo</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Crónicas de Popayán" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none focus:border-[#a855f7]/50 focus:shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block">Taxonomía</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none appearance-none cursor-pointer focus:border-[#a855f7]/50 transition-all">
            <option value="">Selecciona una Categoría...</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        
        <div>
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block">Disciplina Técnica / Formato</label>
          <select value={contentTypeId} onChange={(e) => setContentTypeId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none appearance-none cursor-pointer focus:border-[#a855f7]/50 transition-all">
            <option value="">Selecciona la Técnica...</option>
            {contentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
        </div>
      </div>
    </>
  );
};

export default CoreFields;