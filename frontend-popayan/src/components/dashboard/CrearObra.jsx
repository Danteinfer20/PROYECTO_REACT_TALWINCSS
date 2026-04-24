import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  UploadCloud, CheckCircle, AlertTriangle, Loader2, 
  ChevronRight, Trash2, DollarSign, Package, Plus, ImagePlus, Layers, FileText
} from 'lucide-react';

const CrearObra = ({ obraExistente = null }) => {
  // 1. ESTADO MAESTRO
  const [postType, setPostType] = useState('art'); 

  // 2. Estados Dinámicos
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contentTypeId, setContentTypeId] = useState(''); 
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  // 3. Archivos
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [extraFile1, setExtraFile1] = useState(null);
  const [extraPreview1, setExtraPreview1] = useState(null);
  const extraInputRef1 = useRef(null);

  const [extraFile2, setExtraFile2] = useState(null);
  const [extraPreview2, setExtraPreview2] = useState(null);
  const extraInputRef2 = useRef(null);
  
  const [categories, setCategories] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [successMode, setSuccessMode] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        let loadedCategories = [];
        let loadedTypes = [];

        try {
            const catRes = await axios.get(`${API_URL}/categories?type=${postType}`);
            const realData = Array.isArray(catRes.data.data) ? catRes.data.data : catRes.data.data?.data;
            if (realData?.length > 0) loadedCategories = realData;
        } catch (e) { console.warn("Fallo en categorías."); }

        if (postType === 'art') {
            try {
                const typeRes = await axios.get(`${API_URL}/content-types`);
                const realData = Array.isArray(typeRes.data.data) ? typeRes.data.data : typeRes.data.data?.data;
                if (realData?.length > 0) loadedTypes = realData;
            } catch (e) { console.warn("Fallo en tipos de contenido."); }
        }
        
        setCategories(loadedCategories);
        setContentTypes(loadedTypes);
        
        if (!obraExistente) {
            if (loadedCategories.length > 0) setCategoryId(loadedCategories[0].id);
            if (loadedTypes.length > 0) setContentTypeId(loadedTypes[0].id);
        }
      } catch (err) {
        console.error("Error crítico en catálogos", err);
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, [API_URL, postType, obraExistente]); 

  useEffect(() => {
    if (obraExistente && !loadingCatalogs) {
      setTitle(obraExistente.title || obraExistente.name || '');
      setCategoryId(obraExistente.category_id || categories[0]?.id || '');
      setContentTypeId(obraExistente.content_type_id || contentTypes[0]?.id || '');
      setContent(obraExistente.content || obraExistente.description || '');

      if (obraExistente.price) setPrice(obraExistente.price);
      if (obraExistente.stock_quantity !== undefined) setStock(obraExistente.stock_quantity);

      let existingImage = null;
      if (obraExistente.images && obraExistente.images.length > 0) {
        existingImage = obraExistente.images[0].image_path || obraExistente.images[0];
      } else if (obraExistente.post_media && obraExistente.post_media.length > 0) {
        const path = obraExistente.post_media[0].file_path;
        existingImage = path.startsWith('http') ? path : `${API_URL.replace('/api/v1', '')}/storage/${path}`;
      } else if (obraExistente.main_image) {
        existingImage = obraExistente.main_image.startsWith('http') ? obraExistente.main_image : `${API_URL.replace('/api/v1', '')}/storage/${obraExistente.main_image}`;
      }
      setImagePreview(existingImage);

      if (obraExistente.product_type || obraExistente.isProduct) {
          setPostType('product');
          if (obraExistente.images && obraExistente.images.length > 1) {
              if (obraExistente.images[1]) {
                  const p1 = obraExistente.images[1].image_path || obraExistente.images[1];
                  setExtraPreview1(p1.startsWith('http') ? p1 : `${API_URL.replace('/api/v1', '')}/storage/${p1}`);
              }
              if (obraExistente.images[2]) {
                  const p2 = obraExistente.images[2].image_path || obraExistente.images[2];
                  setExtraPreview2(p2.startsWith('http') ? p2 : `${API_URL.replace('/api/v1', '')}/storage/${p2}`);
              }
          }
      }
    }
  }, [obraExistente, loadingCatalogs, categories, contentTypes, API_URL]);

  const processFile = (file, setFile, setPreview) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen supera los 5MB."); return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeFile = (e, setFile, setPreview, ref) => {
    e.stopPropagation(); setFile(null); setPreview(null);
    if (ref.current) ref.current.value = '';
  };

  const handleSubmit = async (status = 'published') => {
    if (!title.trim() || (!imageFile && !imagePreview)) {
      setError("El identificador y la matriz visual son obligatorios."); return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('category_id', categoryId);
      formData.append('status', status);
      
      let endpoint = `${API_URL}/posts`; 
      
      if (postType === 'product') {
        endpoint = `${API_URL}/products`;
        formData.append('name', title);
        formData.append('description', content);
        formData.append('price', price || 0);
        formData.append('stock_quantity', stock || 1);
        formData.append('product_type', 'physical');

        if (imageFile) formData.append('images[]', imageFile);
        if (extraFile1) formData.append('images[]', extraFile1);
        if (extraFile2) formData.append('images[]', extraFile2);
      } 
      else {
        if (imageFile) formData.append('image', imageFile);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('content_type_id', contentTypeId);
      }

      if (obraExistente) formData.append('_method', 'PUT');
      const url = obraExistente ? `${endpoint}/${obraExistente.id}` : endpoint;
      
      const response = await axios.post(url, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success || response.data.status === 'success') {
        setSuccessMode(true);
        setTimeout(() => {
          window.location.reload(); 
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Anomalía en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (successMode) return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] animate-in zoom-in duration-500">
        <CheckCircle size={56} strokeWidth={1.5} className="text-[#a855f7] mb-8 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
        <h2 className="text-4xl font-serif italic text-white mb-3 tracking-tight">Registro Consolidado</h2>
        <p className="text-[#a855f7] font-mono text-[11px] uppercase tracking-[0.3em] font-bold">El activo se ha forjado en la base de datos.</p>
    </div>
  );

  return (
    <div className="w-full max-w-[1600px] pl-0 pr-6 md:pr-10 animate-in fade-in duration-700 font-sans pb-20">
      
      {/* 🏛️ ENCABEZADO UNIFICADO: Sobrio y alineado a la izquierda */}
      <header className="mb-10 flex flex-col gap-6 border-b border-white/5 pb-8 pt-4 items-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></span>
              <p className="text-[#a855f7] text-[9px] font-mono uppercase tracking-[0.3em] font-black">
                  Módulo de Gestión de Activos
              </p>
          </div>
          <h2 className="text-3xl font-serif text-white tracking-tight italic drop-shadow-md">
              {obraExistente ? 'Refinar Archivo' : 'Taller Creativo'}
          </h2>
        </div>

        {!obraExistente && (
          <div className="bg-[#0A0A0C] border border-white/10 p-1 rounded-full flex shadow-xl w-fit">
            <button 
              onClick={() => setPostType('art')} 
              className={`px-10 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
                  postType === 'art' 
                  ? 'bg-[#a855f7] text-white shadow-[0_5px_15px_rgba(168,85,247,0.4)]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              OBRA
            </button>
            <button 
              onClick={() => setPostType('product')} 
              className={`px-10 py-2.5 rounded-full font-mono text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-300 ${
                  postType === 'product' 
                  ? 'bg-[#a855f7] text-white shadow-[0_5px_15px_rgba(168,85,247,0.4)]' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              PRODUCTO
            </button>
          </div>
        )}
      </header>

      {error && (
        <div className="mb-10 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 animate-in slide-in-from-top-4">
          <AlertTriangle size={18} strokeWidth={1.5} />
          <p className="font-mono text-[10px] uppercase tracking-widest font-bold">{error}</p>
        </div>
      )}

      {/* 📐 GRID BALANCEADO: 5 Columnas Visual / 7 Columnas Datos */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 items-stretch">
        
        {/* 🖼️ COLUMNA 1: MATRIZ VISUAL (5 Columnas - Sweet Spot) */}
        <div className="xl:col-span-5 flex flex-col h-full">
          <div className="bg-[#111113] border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7] rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>

            {/* Contenedor Dropzone (Proporción 4:5 vertical estricta) */}
            <div onClick={() => fileInputRef.current?.click()} className={`relative w-full aspect-[4/5] rounded-[24px] overflow-hidden cursor-pointer transition-all duration-500 bg-[#050505] flex flex-col items-center justify-center group ${imagePreview ? 'border border-[#a855f7]/40 shadow-[0_0_40px_rgba(168,85,247,0.15)]' : 'border border-dashed border-white/10 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5'}`}>
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0], setImageFile, setImagePreview)} accept="image/*" />
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="Preview"/>
                  <div className="absolute inset-0 bg-[#0A0A0C]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                      <span className="text-white font-mono text-[10px] uppercase tracking-widest font-bold flex flex-col items-center gap-3 bg-black/60 px-6 py-4 rounded-2xl shadow-xl"><UploadCloud size={20} strokeWidth={1.5}/> Cargar Sustituto</span>
                  </div>
                  <button onClick={(e) => removeFile(e, setImageFile, setImagePreview, fileInputRef)} className="absolute top-5 right-5 p-3 rounded-full bg-red-500/90 text-white flex items-center justify-center z-10 hover:bg-red-500 hover:scale-110 transition-all shadow-lg"><Trash2 size={16} strokeWidth={2} /></button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#a855f7]/30 transition-all duration-500 shadow-inner">
                      <UploadCloud size={32} className="text-gray-500 group-hover:text-[#a855f7] transition-colors" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white font-serif italic text-xl mb-2">Archivo Matriz</h4>
                  <p className="text-gray-600 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed">Alta Fidelidad 4:5<br/>1080x1350px • Max 5MB</p>
                </div>
              )}
            </div>

            {/* Galería Secundaria (Vista 2 y 3) */}
            {postType === 'product' && (
              <div className="grid grid-cols-2 gap-5 mt-6 animate-in slide-in-from-bottom-4 flex-shrink-0">
                <div onClick={() => extraInputRef1.current?.click()} className={`relative aspect-square rounded-[20px] overflow-hidden cursor-pointer transition-all bg-[#050505] flex flex-col items-center justify-center group ${extraPreview1 ? 'border border-white/10' : 'border border-dashed border-white/10 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5'}`}>
                  <input type="file" className="hidden" ref={extraInputRef1} onChange={(e) => processFile(e.target.files[0], setExtraFile1, setExtraPreview1)} accept="image/*" />
                  {extraPreview1 ? (
                    <><img src={extraPreview1} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Extra 1"/><button onClick={(e) => removeFile(e, setExtraFile1, setExtraPreview1, extraInputRef1)} className="absolute top-2 right-2 p-2 rounded-full bg-red-500/90 text-white z-10"><Trash2 size={12} /></button></>
                  ) : (<div className="flex flex-col items-center justify-center p-4"><Plus size={24} className="text-gray-600 mb-2 group-hover:text-[#a855f7] transition-colors" strokeWidth={1.5} /><span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-bold">Vista 2</span></div>)}
                </div>
                <div onClick={() => extraInputRef2.current?.click()} className={`relative aspect-square rounded-[20px] overflow-hidden cursor-pointer transition-all bg-[#050505] flex flex-col items-center justify-center group ${extraPreview2 ? 'border border-white/10' : 'border border-dashed border-white/10 hover:border-[#a855f7]/50 hover:bg-[#a855f7]/5'}`}>
                  <input type="file" className="hidden" ref={extraInputRef2} onChange={(e) => processFile(e.target.files[0], setExtraFile2, setExtraPreview2)} accept="image/*" />
                  {extraPreview2 ? (
                    <><img src={extraPreview2} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Extra 2"/><button onClick={(e) => removeFile(e, setExtraFile2, setExtraPreview2, extraInputRef2)} className="absolute top-2 right-2 p-2 rounded-full bg-red-500/90 text-white z-10"><Trash2 size={12} /></button></>
                  ) : (<div className="flex flex-col items-center justify-center p-4"><Plus size={24} className="text-gray-600 mb-2 group-hover:text-[#a855f7] transition-colors" strokeWidth={1.5} /><span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest font-bold">Vista 3</span></div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📋 COLUMNA 2: FICHA TÉCNICA (7 Columnas - Espaciosa) */}
        <div className="xl:col-span-7 flex flex-col h-full">
          <div className="bg-[#111113] border border-white/5 rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col h-full relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-10 pb-5 border-b border-white/5 flex-shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <Layers size={22} className="text-[#a855f7]" strokeWidth={1.5} />
                    <h3 className="text-white font-serif text-2xl italic tracking-wide">Ficha Técnica</h3>
                </div>
                {loadingCatalogs && <Loader2 size={16} className="animate-spin text-[#a855f7]"/>}
            </div>
            
            <div className="space-y-8 flex-grow relative z-10">
              
              {/* Identificador Principal */}
              <div className="group">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 transition-colors group-focus-within:text-[#a855f7]">Identificador de Activo</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Crónicas del Cauca" className="w-full bg-[#050505] border border-white/5 rounded-[16px] py-4 px-6 text-white text-lg focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 outline-none transition-all placeholder:text-gray-800 shadow-inner" />
              </div>

              {/* Categorización */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 transition-colors group-focus-within:text-[#a855f7]">Taxonomía</label>
                  <div className="relative">
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[16px] py-4 pl-6 pr-12 text-white text-sm focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 outline-none appearance-none transition-all cursor-pointer shadow-inner">
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                    <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 rotate-90 pointer-events-none" />
                  </div>
                </div>

                {postType === 'art' && (
                  <div className="group animate-in fade-in">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 transition-colors group-focus-within:text-[#a855f7]">Disciplina / Técnica</label>
                    <div className="relative">
                      <select value={contentTypeId} onChange={(e) => setContentTypeId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[16px] py-4 pl-6 pr-12 text-white text-sm focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 outline-none appearance-none transition-all cursor-pointer shadow-inner">
                        {contentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                      </select>
                      <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Logística Comercial */}
              {postType === 'product' && (
                <div className="p-7 bg-[#050505] rounded-[24px] border border-[#f59e0b]/20 animate-in fade-in relative overflow-hidden shadow-inner space-y-6">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#f59e0b] to-transparent opacity-50"></div>
                  <div className="flex items-center gap-3 mb-2 pb-4 border-b border-[#f59e0b]/10">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b]">Parámetros Comerciales</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group">
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 transition-colors group-focus-within:text-white">Valor COP</label>
                      <div className="relative">
                        <DollarSign size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-[#111113] border border-white/5 rounded-[16px] py-4 pl-12 pr-5 text-white text-sm focus:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/20 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 transition-colors group-focus-within:text-white">Inventario</label>
                      <div className="relative">
                         <Package size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
                         <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="1" className="w-full bg-[#111113] border border-white/5 rounded-[16px] py-4 pl-12 pr-5 text-white text-sm focus:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/20 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Relato */}
              <div className="flex flex-col flex-grow group">
                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-gray-500 mb-3 transition-colors group-focus-within:text-[#a855f7]"><FileText size={14} strokeWidth={1.5}/> Relato y Detalles de la Obra</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ingresa el trasfondo histórico, la técnica artesanal o las dimensiones..." className="w-full flex-grow min-h-[160px] bg-[#050505] border border-white/5 rounded-[24px] py-5 px-6 text-gray-300 text-sm focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 outline-none transition-all resize-none placeholder:text-gray-800 shadow-inner leading-relaxed"></textarea>
              </div>
            </div>

            {/* BOTÓN MAESTRO DE ACCIÓN */}
            <div className="mt-10 pt-8 border-t border-white/5 flex-shrink-0 relative z-10">
              <button onClick={() => handleSubmit('published')} disabled={loading} className="w-full py-5 px-8 rounded-2xl bg-[#a855f7] text-white font-mono text-[12px] font-black uppercase tracking-[0.25em] shadow-[0_10px_30px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.5)] hover:bg-purple-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4">
                {loading ? <Loader2 size={20} className="animate-spin" /> : <UploadCloud size={20} strokeWidth={2}/>}
                {obraExistente ? 'Sincronizar' : `Forjar ${postType === 'product' ? 'PRODUCTO' : 'OBRA'}`}
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearObra;