import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CoreFields = ({ 
  title, setTitle, 
  categoryId, setCategoryId, categories, 
  contentTypeId, setContentTypeId, contentTypes, 
  postType 
}) => {
  const { t } = useTranslation();

  // Helper para obtener traducción de categoría
  const getCategoryTranslation = (category) => {
    const key = category.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
    return t(`categories.${key}`, category.name);
  };

  const getContentTypeTranslation = (ct) => {
    const key = ct.name.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '');
    return t(`contentTypes.${key}`, ct.name);
  };

  return (
    <>
      {/* IDENTIFICADOR DEL ACTIVO */}
      <div className="group transition-colors duration-500">
        <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[rgb(var(--role-accent))] mb-4 block group-focus-within:text-[rgb(var(--role-accent))] transition-colors">
          {t('creator.asset_label', 'Identificador del Activo')}
        </label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder={t('creator.asset_placeholder', 'Ej: Crónicas de Popayán')} 
          className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 focus:ring-1 focus:ring-[rgb(var(--role-accent))]/20 transition-all shadow-inner placeholder-[var(--text-body)]/20" 
        />
      </div>

      {/* GRID DE TAXONOMÍA Y DISCIPLINA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[rgb(var(--role-accent))] mb-4 block transition-colors group-focus-within:text-[rgb(var(--role-accent))]">
            {t('creator.taxonomy_label', 'Taxonomía')}
          </label>
          <div className="relative">
            <select 
              value={categoryId} 
              onChange={(e) => setCategoryId(e.target.value)} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none appearance-none cursor-pointer focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner"
            >
              <option value="">{t('creator.select_category', 'Selecciona una Categoría...')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {getCategoryTranslation(cat)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] pointer-events-none opacity-40" size={16} />
          </div>
        </div>
        
        <div className="group">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[rgb(var(--role-accent))] mb-4 block transition-colors group-focus-within:text-[rgb(var(--role-accent))]">
            {postType === 'event' 
              ? t('creator.discipline_label', 'Disciplina Técnica / Formato')
              : t('creator.technique_label', 'Disciplina Técnica / Formato')}
          </label>
          <div className="relative">
            <select 
              value={contentTypeId} 
              onChange={(e) => setContentTypeId(e.target.value)} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none appearance-none cursor-pointer focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner"
            >
              <option value="">{t('creator.select_technique', 'Selecciona la Técnica...')}</option>
              {contentTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {getContentTypeTranslation(type)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] pointer-events-none opacity-40" size={16} />
          </div>
        </div>
      </div>
    </>
  );
};

export default CoreFields;