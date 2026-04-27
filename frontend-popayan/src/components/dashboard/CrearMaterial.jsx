import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  CheckCircle, AlertTriangle, Loader2, Save, 
  UploadCloud, Plus, Trash2, Target, Clock, BookOpen, Hash
} from 'lucide-react';

const CrearMaterial = ({ user, materialExistente = null, setSeccionActiva }) => {
  // ESTADOS MAESTROS
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  
  // ESTADOS ACADÉMICOS
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [estimatedReadTime, setEstimatedReadTime] = useState('');
  const [knowledgeArea, setKnowledgeArea] = useState('');
  const [objectives, setObjectives] = useState(['']); // Array dinámico para el JSONB
  
  // ESTADOS VISUALES
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // RED Y CONTROL
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // HIDRATACIÓN Y SINCRONIZACIÓN
  useEffect(() => {
    // Cargar categorías educativas
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories?type=education`);
        setCategories(res.data.data || []);
      } catch (err) { console.error("Error al cargar categorías", err); }
    };
    fetchCategories();

    // Si estamos editando (Fase 4 futura)
    if (materialExistente) {
      setTitle(materialExistente.title || '');
      setContent(materialExistente.content || '');
      setCategoryId(materialExistente.category?.id || '');
      setDifficultyLevel(materialExistente.difficulty_level || 'beginner');
      setEstimatedReadTime(materialExistente.estimated_read_time || '');
      setKnowledgeArea(materialExistente.knowledge_area || '');
      setImagePreview(materialExistente.cover_image || null);
      
      if (materialExistente.learning_objectives?.length > 0) {
        setObjectives(materialExistente.learning_objectives);
      }
    }
  }, [materialExistente]);

  // MANEJO DEL ARRAY DINÁMICO JSONB
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

  // MANEJO DE IMAGEN
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // MOTOR DE ENVÍO A POSTGRESQL
  const handleSubmit = async () => {
    // Muro de contención (Validaciones)
    if (!title.trim()) { setError("El Título es obligatorio."); return; }
    if (!categoryId) { setError("Debes seleccionar una taxonomía (Categoría)."); return; }
    if (!knowledgeArea.trim()) { setError("El Área de Conocimiento es vital."); return; }
    if (!content.trim()) { setError("El contenido de la ruta no puede estar vacío."); return; }

    // Limpiar objetivos vacíos antes de enviar
    const cleanObjectives = objectives.filter(obj => obj.trim() !== '');
    if (cleanObjectives.length === 0) { setError("Define al menos un Objetivo de Aprendizaje."); return; }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (materialExistente?.id) formData.append('_method', 'PUT');

      formData.append('title', title);
      formData.append('content', content);
      formData.append('category_id', categoryId);
      formData.append('difficulty_level', difficultyLevel);
      formData.append('estimated_read_time', estimatedReadTime || 5);
      formData.append('knowledgeArea', knowledgeArea);
      
      // 🔥 STRINGIFY PARA EL CAMPO JSONB EN LARAVEL
      formData.append('learning_objectives', JSON.stringify(cleanObjectives));

      if (imageFile) formData.append('image', imageFile);

      const endpoint = materialExistente?.id 
        ? `${API_URL}/education/${materialExistente.id}` 
        : `${API_URL}/education`;

      const response = await axios.post(endpoint, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });

      if (response.data.status === 'success' || response.status === 201) {
        setSuccessMode(true);
        setTimeout(() => {
          setSuccessMode(false);
          setSeccionActiva('rutas'); // Volver al inventario de guías
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
          <div className="w-24 h-24 bg-amber-500 rounded-[30px] flex items-center justify-center text-black mb-6 shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-black italic text-white uppercase mb-2 text-center">Material Forjado</h2>
          <p className="text-amber-500/70 font-mono text-[10px] uppercase tracking-[0.4em] text-center">La ruta de aprendizaje está activa en Popayán Cultural.</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 w-full max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-700 pb-24">
      
      {/* HEADER TÁCTICO */}
      <header className="mb-10 border-b border-white/5 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-amber-500/60">Taller de Enseñanza</span>
          </div>
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">
            Forjar <span className="text-amber-500">Ruta</span>
          </h2>
        </div>
        <button onClick={() => setSeccionActiva('escritorio')} className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-amber-500 transition-colors">
          Cancelar y Volver
        </button>
      </header>

      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-4">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <p className="text-red-400 text-[10px] font-mono uppercase tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: PORTADA Y METADATOS (40%) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* UPLOAD DE PORTADA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Portada del Módulo</label>
            <div 
              className="relative w-full aspect-video bg-[#0D0D0F] border border-white/5 rounded-[40px] overflow-hidden group cursor-pointer shadow-inner flex items-center justify-center hover:border-amber-500/30 transition-all duration-500"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-5 py-2 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">Cambiar Imagen</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-white/20 group-hover:text-amber-500/50 transition-colors">
                  <UploadCloud size={48} strokeWidth={1} />
                  <span className="text-[9px] font-mono uppercase tracking-widest">Subir Imagen .JPG .PNG</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>

          {/* METADATOS TÉCNICOS (BENTO GRID) */}
          <div className="bg-[#0D0D0F] border border-white/5 rounded-[40px] p-8 space-y-6 shadow-2xl">
            <div>
              <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2 mb-3"><BookOpen size={12}/> Taxonomía</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[20px] p-4 text-white text-xs outline-none focus:border-amber-500/40 transition-all appearance-none cursor-pointer">
                <option value="">Selecciona la categoría...</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2 mb-3"><Hash size={12}/> Nivel</label>
                <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[20px] p-4 text-white text-xs outline-none focus:border-amber-500/40 transition-all appearance-none cursor-pointer">
                  <option value="beginner">Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-[0.3em] flex items-center gap-2 mb-3"><Clock size={12}/> Minutos</label>
                <input type="number" value={estimatedReadTime} onChange={(e) => setEstimatedReadTime(e.target.value)} placeholder="Ej. 15" min="1" className="w-full bg-[#050505] border border-white/5 rounded-[20px] p-4 text-white text-xs outline-none focus:border-amber-500/40 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EL NÚCLEO DEL CONTENIDO (60%) */}
        <div className="lg:col-span-7 bg-[#0D0D0F] border border-white/5 rounded-[50px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="space-y-10 relative z-10">
            
            {/* TÍTULO Y ÁREA */}
            <div className="space-y-6">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Título de la Ruta Educativa..." 
                className="w-full bg-transparent border-b-2 border-white/10 pb-4 text-3xl font-black italic text-white outline-none focus:border-amber-500 transition-colors placeholder:text-gray-700" 
              />
              <input 
                type="text" 
                value={knowledgeArea} 
                onChange={(e) => setKnowledgeArea(e.target.value)} 
                placeholder="Área de Conocimiento (Ej. Fotografía Digital, Historia del Arte...)" 
                className="w-full bg-transparent border-none text-sm font-mono uppercase tracking-widest text-amber-500 outline-none placeholder:text-amber-500/30" 
              />
            </div>

            {/* MATRIZ JSONB: OBJETIVOS DE APRENDIZAJE */}
            <div className="space-y-5 bg-white/[0.02] border border-white/5 p-6 rounded-[30px]">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] flex items-center gap-2"><Target size={14} className="text-amber-500"/> Objetivos de Aprendizaje</label>
                <span className="text-[9px] font-mono text-gray-600 bg-black px-3 py-1 rounded-full">JSONB Array</span>
              </div>
              
              <div className="space-y-3">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-black border border-white/5 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-[10px] font-black text-gray-600">{index + 1}</span>
                    </div>
                    <input 
                      type="text" 
                      value={obj} 
                      onChange={(e) => handleObjectiveChange(index, e.target.value)} 
                      placeholder="El alumno será capaz de..." 
                      className="flex-1 bg-[#050505] border border-white/5 rounded-[20px] p-4 text-white text-xs outline-none focus:border-amber-500/40 shadow-inner transition-all"
                    />
                    <button 
                      onClick={() => removeObjective(index)}
                      className={`w-10 h-10 shrink-0 rounded-[16px] flex items-center justify-center transition-all mt-1 ${objectives.length > 1 ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'opacity-0 pointer-events-none'}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addObjective} className="w-full py-4 border border-dashed border-amber-500/30 text-amber-500 rounded-[20px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> Añadir Objetivo
              </button>
            </div>

            {/* CUERPO DEL TEXTO (CONTENIDO) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em]">Cuerpo Didáctico</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Desarrolla el material educativo aquí. Usa saltos de línea para estructurar..." 
                className="w-full min-h-[250px] bg-[#050505] border border-white/5 rounded-[30px] p-6 text-white text-sm outline-none focus:border-amber-500/40 transition-all resize-none shadow-inner leading-relaxed"
              ></textarea>
            </div>

            {/* BOTÓN MAESTRO DE ACCIÓN */}
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full py-6 rounded-[30px] font-black text-xs uppercase tracking-[0.4em] bg-amber-500 hover:bg-amber-400 text-black transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20}/>}
              {materialExistente?.id ? 'Actualizar Sistema' : 'Forjar Ruta Educativa'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMaterial;