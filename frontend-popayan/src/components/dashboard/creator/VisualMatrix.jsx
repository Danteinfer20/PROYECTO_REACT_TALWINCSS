import React from 'react';
import { UploadCloud, Trash2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const VisualMatrix = ({ 
  postType, 
  imageFile, setImageFile, imagePreview, setImagePreview, fileInputRef,
  extraFile1, setExtraFile1, extraPreview1, setExtraPreview1, extraInputRef1,
  extraFile2, setExtraFile2, extraPreview2, setExtraPreview2, extraInputRef2
}) => {
  const { t } = useTranslation();
  
  const processFile = (file, setFile, setPreview) => {
    if (!file || file.size > 5 * 1024 * 1024) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeFile = (e, setFile, setPreview, ref) => {
    e.stopPropagation(); setFile(null); setPreview(null);
    if (ref.current) ref.current.value = '';
  };

  return (
    <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-6 shadow-sm flex flex-col gap-5 h-full relative overflow-hidden transition-colors duration-500">
      
      {/* IMAGEN PRINCIPAL (SIEMPRE VISIBLE) */}
      <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden cursor-pointer transition-all duration-500 bg-[var(--bg-primary)] flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/40 group shadow-inner">
        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0], setImageFile, setImagePreview)} accept="image/*" />
        
        {imagePreview ? (
          <>
            <img src={imagePreview} className="w-full h-full object-cover transition-all duration-700 opacity-90 group-hover:opacity-60" alt="Preview"/>
            <button onClick={(e) => removeFile(e, setImageFile, setImagePreview, fileInputRef)} className="absolute top-4 right-4 p-3 rounded-full bg-red-500 text-white z-10 hover:bg-red-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90 border border-red-400/20">
              <Trash2 size={16} />
            </button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all pointer-events-none">
              <UploadCloud size={32} className="text-white animate-bounce"/>
            </div>
          </>
        ) : (
          <div className="text-center transition-colors">
            <UploadCloud size={24} className="text-[var(--text-body)] opacity-20 mb-4 mx-auto group-hover:text-[rgb(var(--role-accent))] group-hover:scale-110 transition-all" />
            <p className="text-[var(--text-heading)] font-black uppercase text-[10px] tracking-widest opacity-40 group-hover:opacity-100">
              {t('creator.visual.main_label', 'Archivo Matriz')}
            </p>
          </div>
        )}
      </div>

      {/* GALERÍA SECUNDARIA (SOLO PARA PRODUCTOS) */}
      {postType === 'product' && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
          {[
            {f: extraFile1, s: setExtraFile1, p: extraPreview1, sp: setExtraPreview1, r: extraInputRef1, num: 2},
            {f: extraFile2, s: setExtraFile2, p: extraPreview2, sp: setExtraPreview2, r: extraInputRef2, num: 3}
          ].map((slot, idx) => (
            <div key={idx} onClick={() => slot.r.current?.click()} className="relative aspect-square rounded-[20px] bg-[var(--bg-primary)] border border-dashed border-[var(--border-color)] overflow-hidden cursor-pointer group hover:border-[rgb(var(--role-accent))]/40 transition-colors shadow-inner">
              <input type="file" className="hidden" ref={slot.r} onChange={(e) => processFile(e.target.files[0], slot.s, slot.sp)} accept="image/*" />
              
              {slot.p ? (
                <>
                  <img src={slot.p} className="w-full h-full object-cover opacity-90 group-hover:opacity-50 transition-opacity" alt={`Extra ${slot.num}`}/>
                  <button onClick={(e) => removeFile(e, slot.s, slot.sp, slot.r)} className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all active:scale-90 shadow-md">
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-body)] opacity-20 group-hover:text-[rgb(var(--role-accent))] group-hover:opacity-100 transition-all">
                  <Plus size={20} className="mb-2 group-hover:scale-110 transition-transform"/>
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    {t('creator.visual.extra_label', { number: slot.num })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisualMatrix;