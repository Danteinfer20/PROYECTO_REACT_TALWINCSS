import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { 
  CheckCircle, AlertTriangle, Loader2, Save, 
  UploadCloud, Plus, Trash2, Target, Clock, BookOpen, Hash, Video, Link as LinkIcon, X
} from 'lucide-react';

const CrearMaterial = ({ user, materialExistente = null, setSeccionActiva }) => {
  // Estados del formulario
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  
  // Estados académicos
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [estimatedReadTime, setEstimatedReadTime] = useState('');
  const [knowledgeArea, setKnowledgeArea] = useState('');
  const [objectives, setObjectives] = useState(['']);
  
  // Estados multimedia
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef(null);

  // Estados de red
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [error, setError] = useState(null);

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('/').pop()}`;
    if (url.includes('tiktok.com')) return `https://www.tiktok.com/embed/v2/${url.split('/video/')[1]?.split('?')[0]}`;
    return url;
  };

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        // ✅ Usamos api centralizada
        const res = await api.get('/categories');
        if (res.data.status === 'success') {
          // Filtrar solo categorías de educación
          const educationCategories = res.data.data.filter(cat => cat.category_type === 'education');
          setCategories(educationCategories);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Error al cargar categorías", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();

    // Hidratar datos si es edición
    if (materialExistente) {
      setTitle(materialExistente.title || '');
      setContent(materialExistente.content || '');
      setCategoryId(materialExistente.category?.id || '');
      setDifficultyLevel(materialExistente.metadata?.difficulty_level || materialExistente.difficulty_level || 'beginner');
      setEstimatedReadTime(materialExistente.metadata?.estimated_read_time || materialExistente.estimated_read_time || '');
      setKnowledgeArea(materialExistente.metadata?.knowledge_area || materialExistente.knowledge_area || '');
      setImagePreview(materialExistente.cover_image || null);
      setVideoUrl(materialExistente.video_url || '');
      
      const existingObjectives = materialExistente.metadata?.learning_objectives || materialExistente.learning_objectives;
      if (existingObjectives?.length > 0) {
        setObjectives(existingObjectives);
      }
    }
  }, [materialExistente]);

  // Manejo de objetivos
  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...objectives];
    newObjectives[index] = value;
    setObjectives(newObjectives);
  };

  const addObjective = () => setObjectives([...objectives, '']);
  
  const removeObjective = (index) => {
    if (objectives.length > 1) {
      const newObjectives = objectives.filter((_, i) => i !== index);
      setObjectives(newObjectives);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError("El Título es obligatorio."); return; }
    if (!categoryId) { setError("Debes seleccionar una taxonomía (Categoría)."); return; }
    if (!knowledgeArea.trim()) { setError("El Área de Conocimiento es vital."); return; }
    if (!content.trim()) { setError("El contenido de la ruta no puede estar vacío."); return; }

    const cleanObjectives = objectives.filter(obj => obj.trim() !== '');
    if (cleanObjectives.length === 0) { setError("Define al menos un Objetivo de Aprendizaje."); return; }

    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      if (materialExistente?.id) formData.append('_method', 'PUT');

      formData.append('title', title);
      formData.append('content', content);
      formData.append('category_id', categoryId);
      formData.append('difficulty_level', difficultyLevel);
      formData.append('estimated_read_time', estimatedReadTime || 5);
      formData.append('knowledge_area', knowledgeArea);
      formData.append('learning_objectives', JSON.stringify(cleanObjectives));

      if (imageFile) formData.append('image', imageFile);
      if (videoUrl.trim()) formData.append('video_url', videoUrl.trim());

      const endpoint = materialExistente?.id 
        ? `/education/${materialExistente.id}` 
        : '/education';

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success' || response.status === 201) {
        setSuccessMode(true);
        setTimeout(() => {
          setSuccessMode(false);
          setSeccionActiva('rutas');
        }, 2500);
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.response?.data?.error || "Fallo en el servidor académico.";
      setError(`ALERTA: ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (successMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-[rgb(var(--role-accent))] rounded-[30px] flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(var(--role-accent),0.5)]">
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl font-bold italic text-[var(--text-heading)] uppercase mb-2 text-center">Material Forjado</h2>
        <p className="text-[rgb(var(--role-accent))]/70 font-mono text-[10px] uppercase tracking-[0.4em] text-center">La ruta de aprendizaje está activa en Popayán Cultural.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-24">
      
      {/* Header */}
      <header className="mb-8 md:mb-10 border-b border-[var(--border-color)] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[rgb(var(--role-accent))]/70">Taller de Enseñanza</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter">
            Forjar <span className="text-[rgb(var(--role-accent))]">Ruta</span>
          </h2>
        </div>
        <button 
          onClick={() => setSeccionActiva('escritorio')} 
          className="text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors flex items-center gap-1"
        >
          <X size={14} /> Cancelar y Volver
        </button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
        
        {/* Columna izquierda */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Portada */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.2em]">Portada del Módulo</label>
            <div 
              className="relative w-full aspect-video bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl overflow-hidden group cursor-pointer shadow-inner flex items-center justify-center hover:border-[rgb(var(--role-accent))]/40 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-4 py-2 bg-[rgb(var(--role-accent))] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Cambiar</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 text-[var(--text-body)]/30 group-hover:text-[rgb(var(--role-accent))]/50 transition-colors">
                  <UploadCloud size={40} strokeWidth={1} />
                  <span className="text-[8px] font-mono uppercase tracking-widest">Subir Imagen</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>

          {/* Video */}
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 shadow-sm space-y-3">
            <label className="text-[10px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.2em] flex items-center gap-2">
              <Video size={14} /> Material Audiovisual
            </label>
            <div className="relative">
              <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-body)] opacity-40 pointer-events-none" />
              <input 
                type="url" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="Enlace de YouTube o TikTok..." 
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:text-[var(--text-body)]/30"
              />
            </div>
            
            {videoUrl && getEmbedUrl(videoUrl) && (
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-[var(--border-color)] shadow-inner bg-black animate-in fade-in zoom-in-95 duration-300">
                <iframe 
                  src={getEmbedUrl(videoUrl)} 
                  className="w-full h-full border-none pointer-events-none" 
                  title="Preview" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          {/* Metadatos */}
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
            <div>
              <label className="text-[9px] font-black uppercase text-[var(--text-body)] opacity-60 tracking-[0.2em] flex items-center gap-2 mb-2">
                <BookOpen size={12} /> Taxonomía
              </label>
              <div className="relative">
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3.5 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all appearance-none cursor-pointer shadow-inner"
                  disabled={loadingCategories}
                >
                  <option value="">Selecciona la categoría...</option>
                  {loadingCategories ? (
                    <option disabled>Cargando categorías...</option>
                  ) : (
                    categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)
                  )}
                </select>
                {loadingCategories && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={16} className="animate-spin text-[rgb(var(--role-accent))]" />
                  </div>
                )}
              </div>
              {categories.length === 0 && !loadingCategories && (
                <p className="text-[10px] text-amber-500 font-mono mt-1">No hay categorías de educación disponibles.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase text-[var(--text-body)] opacity-60 tracking-[0.2em] flex items-center gap-2 mb-2">
                  <Hash size={12} /> Nivel
                </label>
                <select 
                  value={difficultyLevel} 
                  onChange={(e) => setDifficultyLevel(e.target.value)} 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3.5 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all appearance-none cursor-pointer shadow-inner"
                >
                  <option value="beginner">Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-[var(--text-body)] opacity-60 tracking-[0.2em] flex items-center gap-2 mb-2">
                  <Clock size={12} /> Minutos
                </label>
                <input 
                  type="number" 
                  value={estimatedReadTime} 
                  onChange={(e) => setEstimatedReadTime(e.target.value)} 
                  placeholder="15" 
                  min="1" 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3.5 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:text-[var(--text-body)]/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-7 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-6 md:p-8 shadow-sm">
          
          <div className="space-y-6">
            {/* Título y área */}
            <div className="space-y-4">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Título de la Ruta Educativa..." 
                className="w-full bg-transparent border-b-2 border-[var(--border-color)] pb-3 text-2xl font-bold italic text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))] transition-colors placeholder:text-[var(--text-body)]/20" 
              />
              <input 
                type="text" 
                value={knowledgeArea} 
                onChange={(e) => setKnowledgeArea(e.target.value)} 
                placeholder="Área de Conocimiento (Ej. Fotografía Digital, Historia del Arte...)" 
                className="w-full bg-transparent border-none text-xs font-mono uppercase tracking-wider text-[rgb(var(--role-accent))] outline-none placeholder:[rgb(var(--role-accent))]/30" 
              />
            </div>

            {/* Objetivos */}
            <div className="space-y-4 bg-[var(--bg-primary)]/30 border border-[var(--border-color)] p-5 rounded-xl">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                <label className="text-[10px] font-black uppercase text-[var(--text-body)] opacity-60 tracking-[0.2em] flex items-center gap-2">
                  <Target size={14} className="text-[rgb(var(--role-accent))]" /> Objetivos de Aprendizaje
                </label>
              </div>
              
              <div className="space-y-2">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 text-[9px] font-bold text-[var(--text-body)] opacity-40">
                      {index + 1}
                    </span>
                    <input 
                      type="text" 
                      value={obj} 
                      onChange={(e) => handleObjectiveChange(index, e.target.value)} 
                      placeholder="El alumno será capaz de..." 
                      className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:text-[var(--text-body)]/20"
                    />
                    <button 
                      onClick={() => removeObjective(index)}
                      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-all ${objectives.length > 1 ? 'text-red-500 hover:bg-red-500/10' : 'opacity-0 pointer-events-none'}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                onClick={addObjective} 
                className="w-full py-2.5 border border-dashed border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Añadir Objetivo
              </button>
            </div>

            {/* Cuerpo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-[var(--text-body)] opacity-60 tracking-[0.2em]">Cuerpo Didáctico</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Desarrolla el material educativo aquí. Usa saltos de línea para estructurar..." 
                className="w-full min-h-[200px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all resize-none shadow-inner leading-relaxed placeholder:text-[var(--text-body)]/20"
              />
            </div>

            {/* Botón */}
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] bg-[rgb(var(--role-accent))] hover:opacity-90 text-white transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(var(--role-accent),0.25)] disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {materialExistente?.id ? 'Actualizar Sistema' : 'Forjar Ruta Educativa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMaterial;