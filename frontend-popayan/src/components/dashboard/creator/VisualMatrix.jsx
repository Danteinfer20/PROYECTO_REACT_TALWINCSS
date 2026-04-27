import React from 'react';
import { UploadCloud, Trash2, Plus } from 'lucide-react';

const VisualMatrix = ({ 
  postType, 
  imageFile, setImageFile, imagePreview, setImagePreview, fileInputRef,
  extraFile1, setExtraFile1, extraPreview1, setExtraPreview1, extraInputRef1,
  extraFile2, setExtraFile2, extraPreview2, setExtraPreview2, extraInputRef2
}) => {
  
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
    <div className="bg-[#111113] border border-white/5 rounded-[40px] p-6 shadow-2xl flex flex-col gap-5 h-full relative overflow-hidden">
      
      {/* IMAGEN PRINCIPAL (SIEMPRE VISIBLE) */}
      <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-[4/5] rounded-[30px] overflow-hidden cursor-pointer transition-all duration-500 bg-[#050505] flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-white/20 group">
        <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0], setImageFile, setImagePreview)} accept="image/*" />
        {imagePreview ? (
          <>
            <img src={imagePreview} className="w-full h-full object-cover transition-all" alt="Preview"/>
            <button onClick={(e) => removeFile(e, setImageFile, setImagePreview, fileInputRef)} className="absolute top-4 right-4 p-3 rounded-full bg-red-500/90 text-white z-10 hover:bg-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all pointer-events-none">
              <UploadCloud size={30} className="text-white"/>
            </div>
          </>
        ) : (
          <div className="text-center">
            <UploadCloud size={24} className="text-gray-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
            <p className="text-white font-black uppercase text-[10px] tracking-widest">Archivo Matriz</p>
          </div>
        )}
      </div>

      {/* GALERÍA SECUNDARIA (RESTAURADA: SOLO PARA PRODUCTOS) */}
      {postType === 'product' && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
          {[
            {f: extraFile1, s: setExtraFile1, p: extraPreview1, sp: setExtraPreview1, r: extraInputRef1, num: 2},
            {f: extraFile2, s: setExtraFile2, p: extraPreview2, sp: setExtraPreview2, r: extraInputRef2, num: 3}
          ].map((slot, idx) => (
            <div key={idx} onClick={() => slot.r.current?.click()} className="relative aspect-square rounded-[20px] bg-[#050505] border border-dashed border-white/10 overflow-hidden cursor-pointer group hover:border-[#a855f7]/40 transition-colors">
              <input type="file" className="hidden" ref={slot.r} onChange={(e) => processFile(e.target.files[0], slot.s, slot.sp)} accept="image/*" />
              {slot.p ? (
                <>
                  <img src={slot.p} className="w-full h-full object-cover" alt={`Extra ${slot.num}`}/>
                  <button onClick={(e) => removeFile(e, slot.s, slot.sp, slot.r)} className="absolute top-2 right-2 p-2 rounded-full bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 group-hover:text-[#a855f7] transition-colors">
                  <Plus size={20} className="mb-2"/>
                  <span className="text-[8px] font-black uppercase tracking-widest">Vista {slot.num}</span>
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