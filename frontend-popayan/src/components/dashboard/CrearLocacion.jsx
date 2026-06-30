import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api'; // ✅ Importar api centralizada
import { 
  Building2, MapPin, UploadCloud, Trash2, 
  Save, Loader2, CheckCircle, AlertTriangle, Users, ChevronDown 
} from 'lucide-react';

const CrearLocacion = ({ user, setSeccionActiva, locacionExistente = null }) => {
  // 🔥 MOTOR DE ACENTO PARA GESTOR (Esmeralda)
  const roleAccent = '16 185 129';

  // Estados del Formulario
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [locationType, setLocationType] = useState('cultural_center');
  const [capacity, setCapacity] = useState('');
  const [isAccessible, setIsAccessible] = useState(true);
  const [description, setDescription] = useState('');
  
  // Estados Visuales e Imagen
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Estados de Control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Hidratación
  useEffect(() => {
    if (locacionExistente) {
      setName(locacionExistente.name || '');
      setAddress(locacionExistente.address || '');
      setNeighborhood(locacionExistente.neighborhood || '');
      setLocationType(locacionExistente.location_type || 'cultural_center');
      setCapacity(locacionExistente.capacity || '');
      setIsAccessible(locacionExistente.is_accessible ?? true);
      setDescription(locacionExistente.description || '');
      if (locacionExistente.photo) setImagePreview(locacionExistente.photo);
    }
  }, [locacionExistente]);

  const processFile = (file) => {
    if (!file || file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB.");
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim()) {
      setError("EL NOMBRE Y LA DIRECCIÓN SON OBLIGATORIOS.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();

      if (locacionExistente?.id) formData.append('_method', 'PUT');

      formData.append('name', name);
      formData.append('address', address);
      formData.append('neighborhood', neighborhood);
      formData.append('location_type', locationType);
      formData.append('capacity', capacity);
      formData.append('is_accessible', isAccessible ? 1 : 0);
      formData.append('description', description);
      
      if (imageFile) formData.append('photo', imageFile);

      // ✅ Usar api (ya maneja el token y la URL base)
      const endpoint = locacionExistente?.id 
        ? `/manager/locations/${locacionExistente.id}` 
        : '/manager/locations';

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success' || response.status === 201) {
        setSuccess(true);
        setTimeout(() => setSeccionActiva('locaciones'), 2000);
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.response?.data?.error || "Error al forjar la locación en el servidor.";
      setError(`RECHAZO: ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ '--role-accent': roleAccent }} className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in zoom-in duration-700 transition-colors">
          <CheckCircle size={64} className="text-[rgb(var(--role-accent))] mb-6 drop-shadow-[0_0_15px_rgba(var(--role-accent),0.5)]" />
          <h2 className="text-4xl font-bold italic text-[var(--text-heading)] uppercase mb-2 transition-colors">Recinto Sincronizado</h2>
          <p className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-widest transition-colors">El catálogo de bienes raíces ha sido actualizado.</p>
      </div>
    );
  }

  return (
    <div style={{ '--role-accent': roleAccent }} className="p-6 md:p-12 w-full max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 transition-colors duration-500">
      <header className="mb-10 border-b border-[var(--border-color)] pb-8 pt-4 transition-colors">
        <h2 className="text-4xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter flex items-center gap-4 transition-colors">
          <Building2 className="text-[rgb(var(--role-accent))]" size={36} />
          {locacionExistente ? 'Modificar Recinto' : 'Forjar Nuevo Espacio'}
        </h2>
        <p className="text-[var(--text-body)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-[rgb(var(--role-accent))]/50 pl-4 transition-colors">
          Registro Oficial de Bienes Raíces Culturales
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-center gap-3 text-red-500 text-[10px] font-mono uppercase font-black animate-in slide-in-from-top-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* COLUMNA IZQUIERDA: Fotografía */}
        <div className="w-full lg:w-[35%]">
          <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-6 shadow-sm relative overflow-hidden transition-colors">
            <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-square rounded-[30px] overflow-hidden cursor-pointer transition-all duration-500 bg-[var(--bg-primary)] flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/40 group shadow-inner">
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} accept="image/*" />
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover opacity-90 group-hover:opacity-60 transition-all" alt="Preview"/>
                  <button onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} className="absolute top-4 right-4 p-3 rounded-full bg-red-500/90 text-white z-10 hover:bg-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"><Trash2 size={16} /></button>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all pointer-events-none">
                    <UploadCloud size={30} className="text-white animate-bounce"/>
                  </div>
                </>
              ) : (
                <div className="text-center transition-colors">
                  <Building2 size={32} className="text-[var(--text-body)] opacity-20 mb-4 mx-auto group-hover:text-[rgb(var(--role-accent))] group-hover:scale-110 transition-all" />
                  <p className="text-[var(--text-body)] font-bold uppercase text-[10px] tracking-widest opacity-40">Fotografía del Recinto</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Datos */}
        <div className="w-full lg:w-[65%] bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 lg:p-12 shadow-sm relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[rgb(var(--role-accent))]/5 blur-[80px] rounded-full pointer-events-none transition-colors"></div>
          
          <div className="space-y-8 relative z-10">
            
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-body)] opacity-50 mb-4 block group-focus-within:text-[rgb(var(--role-accent))] transition-colors">Nombre del Espacio</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Teatro Municipal Guillermo Valencia" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 focus:ring-1 focus:ring-[rgb(var(--role-accent))]/20 transition-all shadow-inner placeholder:[var(--text-body)]/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-body)] opacity-50 mb-4 block transition-colors">Tipología Arquitectónica</label>
                <div className="relative">
                  <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none appearance-none cursor-pointer focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner">
                    <option value="museum">Museo</option>
                    <option value="theater">Teatro</option>
                    <option value="gallery">Galería</option>
                    <option value="street">Calle / Espacio Público</option>
                    <option value="park">Parque / Plaza</option>
                    <option value="cultural_center">Centro Cultural</option>
                    <option value="auditorium">Auditorio</option>
                    <option value="library">Biblioteca</option>
                    <option value="educational_center">Centro Educativo</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] pointer-events-none opacity-40" size={16} />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-body)] opacity-50 mb-4 block transition-colors">Aforo Total</label>
                <Users size={16} className="absolute left-6 bottom-[22px] text-[rgb(var(--role-accent))]/40" />
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Capacidad máxima" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 pl-14 pr-8 text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner placeholder:[var(--text-body)]/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-body)] opacity-50 mb-4 block flex items-center gap-2 transition-colors"><MapPin size={12} className="text-[rgb(var(--role-accent))]"/> Dirección Exacta</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Carrera 6 # 3-14" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner placeholder:[var(--text-body)]/30" />
              </div>
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-body)] opacity-50 mb-4 block flex items-center gap-2 transition-colors"><MapPin size={12} className="text-[rgb(var(--role-accent))]"/> Barrio / Sector</label>
                <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ej: Sector Histórico" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-5 px-8 text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner placeholder:[var(--text-body)]/30" />
              </div>
            </div>

            <div className="bg-[var(--bg-primary)] p-2 rounded-[30px] border border-[var(--border-color)] flex items-center justify-between shadow-inner transition-colors duration-500">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)] opacity-50 ml-6 transition-colors">¿Espacio Inclusivo / Accesible?</span>
              <button onClick={() => setIsAccessible(!isAccessible)} className={`py-4 px-10 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 shadow-sm ${isAccessible ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_15px_rgba(var(--role-accent),0.3)]' : 'bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
                {isAccessible ? 'SÍ, ACCESIBLE' : 'NO ACCESIBLE'}
              </button>
            </div>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Reseña histórica o técnica del lugar..." className="w-full min-h-[120px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-6 px-8 text-[var(--text-heading)] outline-none resize-none shadow-inner focus:border-[rgb(var(--role-accent))]/50 transition-all placeholder:[var(--text-body)]/20"></textarea>
            
            <button onClick={handleSubmit} disabled={loading} className="w-full py-5 rounded-[30px] font-black text-xs uppercase tracking-[0.2em] bg-[rgb(var(--role-accent))] text-white hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-[0_10px_20px_rgba(var(--role-accent),0.2)] disabled:opacity-50 active:scale-95">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20}/>}
              {locacionExistente ? 'Guardar Cambios' : 'Registrar en Inventario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearLocacion;