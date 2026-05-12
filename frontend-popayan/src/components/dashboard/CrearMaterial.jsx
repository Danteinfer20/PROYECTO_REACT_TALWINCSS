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
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/categories?type=education`);
        setCategories(res.data.data || []);
      } catch (err) { console.error("Error al cargar categorías", err); }
    };
    fetchCategories();

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
  }, [materialExistente, API_URL]);

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
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (materialExistente?.id) formData.append('_method', 'PUT');

      formData.append('title', title);
      formData.append('content', content);
      formData.append('category_id', categoryId);
      formData.append('difficulty_level', difficultyLevel);
      formData.append('estimated_read_time', estimatedReadTime || 5);
      formData.append('knowledge_area', knowledgeArea); // Sync con backend snake_case
      
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
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in zoom-in duration-700 transition-colors duration-500">
          <div className="w-24 h-24 bg-[rgb(var(--role-accent))] rounded-[30px] flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(var(--role-accent),0.5)]">
            <CheckCircle size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-bold italic text-[var(--text-heading)] uppercase mb-2 text-center transition-colors">Material Forjado</h2>
          <p className="text-[rgb(var(--role-accent))]/70 font-mono text-[10px] uppercase tracking-[0.4em] text-center transition-colors">La ruta de aprendizaje está activa en Popayán Cultural.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 w-full max-w-[1400px] mx-auto animate-in fade-in zoom-in-95 duration-700 pb-24 transition-colors duration-500">
      
      {/* HEADER TÁCTICO */}
      <header className="mb-10 border-b border-[var(--border-color)] pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 transition-colors">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[rgb(var(--role-accent))]/60">Taller de Enseñanza</span>
          </div>
          <h2 className="text-4xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter drop-shadow-sm transition-colors">
            Forjar <span className="text-[rgb(var(--role-accent))]">Ruta</span>
          </h2>
        </div>
        <button onClick={() => setSeccionActiva('escritorio')} className="text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] transition-colors">
          Cancelar y Volver
        </button>
      </header>

      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center gap-4 animate-in slide-in-from-top-4">
          <AlertTriangle className="text-red-500 shrink-0" size={24} />
          <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUMNA IZQUIERDA: PORTADA Y METADATOS */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* UPLOAD DE PORTADA */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.3em] transition-colors">Portada del Módulo</label>
            <div 
              className="relative w-full aspect-video bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[40px] overflow-hidden group cursor-pointer shadow-inner flex items-center justify-center hover:border-[rgb(var(--role-accent))]/30 transition-all duration-500"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-5 py-2 bg-[rgb(var(--role-accent))] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">Cambiar Imagen</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-[var(--text-body)]/20 group-hover:text-[rgb(var(--role-accent))]/40 transition-colors">
                  <UploadCloud size={48} strokeWidth={1} />
                  <span className="text-[9px] font-mono uppercase tracking-widest">Subir Imagen .JPG .PNG</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
            </div>
          </div>

          {/* METADATOS TÉCNICOS */}
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 space-y-6 shadow-sm transition-colors duration-500">
            <div>
              <label className="text-[9px] font-black uppercase text-[var(--text-body)] opacity-50 tracking-[0.3em] flex items-center gap-2 mb-3 transition-colors"><BookOpen size={12}/> Taxonomía</label>
              <div className="relative">
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] p-4 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all appearance-none cursor-pointer shadow-inner">
                  <option value="">Selecciona la categoría...</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black uppercase text-[var(--text-body)] opacity-50 tracking-[0.3em] flex items-center gap-2 mb-3 transition-colors"><Hash size={12}/> Nivel</label>
                <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] p-4 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all appearance-none cursor-pointer shadow-inner">
                  <option value="beginner">Básico</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-[var(--text-body)] opacity-50 tracking-[0.3em] flex items-center gap-2 mb-3 transition-colors"><Clock size={12}/> Minutos</label>
                <input type="number" value={estimatedReadTime} onChange={(e) => setEstimatedReadTime(e.target.value)} placeholder="Ej. 15" min="1" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] p-4 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder-[var(--text-body)]/40" />
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EL NÚCLEO DEL CONTENIDO */}
        <div className="lg:col-span-7 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[50px] p-8 lg:p-12 shadow-sm relative overflow-hidden transition-colors duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--role-accent))]/5 blur-[80px] rounded-full pointer-events-none transition-colors"></div>

          <div className="space-y-10 relative z-10">
            
            {/* TÍTULO Y ÁREA */}
            <div className="space-y-6">
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Título de la Ruta Educativa..." 
                className="w-full bg-transparent border-b-2 border-[var(--border-color)] pb-4 text-3xl font-bold italic text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))] transition-colors placeholder-[var(--text-body)]/20" 
              />
              <input 
                type="text" 
                value={knowledgeArea} 
                onChange={(e) => setKnowledgeArea(e.target.value)} 
                placeholder="Área de Conocimiento (Ej. Fotografía Digital, Historia del Arte...)" 
                className="w-full bg-transparent border-none text-sm font-mono uppercase tracking-widest text-[rgb(var(--role-accent))] outline-none placeholder-[rgb(var(--role-accent))]/30 transition-colors" 
              />
            </div>

            {/* MATRIZ JSONB: OBJETIVOS DE APRENDIZAJE */}
            <div className="space-y-5 bg-[var(--text-heading)]/[0.02] border border-[var(--border-color)] p-6 rounded-[30px] transition-colors">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 transition-colors">
                <label className="text-[10px] font-black uppercase text-[var(--text-body)] opacity-60 tracking-[0.3em] flex items-center gap-2 transition-colors"><Target size={14} className="text-[rgb(var(--role-accent))]"/> Objetivos de Aprendizaje</label>
                <span className="text-[9px] font-mono text-[var(--text-body)] opacity-40 bg-[var(--bg-primary)] px-3 py-1 rounded-full border border-[var(--border-color)] transition-colors">JSONB Array</span>
              </div>
              
              <div className="space-y-3">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 mt-1 transition-colors">
                      <span className="text-[10px] font-black text-[var(--text-body)] opacity-40">{index + 1}</span>
                    </div>
                    <input 
                      type="text" 
                      value={obj} 
                      onChange={(e) => handleObjectiveChange(index, e.target.value)} 
                      placeholder="El alumno será capaz de..." 
                      className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] p-4 text-[var(--text-heading)] text-xs outline-none focus:border-[rgb(var(--role-accent))]/40 shadow-inner transition-all placeholder-[var(--text-body)]/20"
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

              <button onClick={addObjective} className="w-full py-4 border border-dashed border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] rounded-[20px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Añadir Objetivo
              </button>
            </div>

            {/* CUERPO DEL TEXTO (CONTENIDO) */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-[var(--text-body)] opacity-50 tracking-[0.3em] transition-colors">Cuerpo Didáctico</label>
              <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Desarrolla el material educativo aquí. Usa saltos de línea para estructurar..." 
                className="w-full min-h-[250px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-6 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all resize-none shadow-inner leading-relaxed transition-colors placeholder-[var(--text-body)]/20"
              ></textarea>
            </div>

            {/* BOTÓN MAESTRO DE ACCIÓN */}
            <button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="w-full py-6 rounded-[30px] font-black text-[11px] uppercase tracking-[0.4em] bg-[rgb(var(--role-accent))] hover:opacity-90 text-white transition-all flex items-center justify-center gap-4 shadow-[0_15px_30px_rgba(var(--role-accent),0.3)] disabled:opacity-50 active:scale-95"
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