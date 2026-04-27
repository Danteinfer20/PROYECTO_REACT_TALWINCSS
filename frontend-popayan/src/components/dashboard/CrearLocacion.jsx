import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, MapPin, UploadCloud, Trash2, 
  Save, Loader2, CheckCircle, AlertTriangle, Users 
} from 'lucide-react';

const CrearLocacion = ({ user, setSeccionActiva, locacionExistente = null }) => {
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Hidratación si estamos editando
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
      const token = localStorage.getItem('token');
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

      // Usamos el endpoint manager/locations (Asegúrate de que en Laravel exista el store/update)
      const endpoint = locacionExistente?.id 
        ? `${API_URL}/manager/locations/${locacionExistente.id}` 
        : `${API_URL}/manager/locations`;

      const response = await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' }
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
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in zoom-in duration-700">
          <CheckCircle size={64} className="text-emerald-500 mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <h2 className="text-4xl font-black italic text-white uppercase mb-2">Recinto Sincronizado</h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">El catálogo de bienes raíces ha sido actualizado.</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 w-full max-w-[1400px] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="mb-10 border-b border-white/5 pb-8 pt-4">
        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter flex items-center gap-4">
          <Building2 className="text-emerald-500" size={36} />
          {locacionExistente ? 'Modificar Recinto' : 'Forjar Nuevo Espacio'}
        </h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-emerald-500/50 pl-4">
          Registro Oficial de Bienes Raíces Culturales
        </p>
      </header>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-center gap-3 text-red-400 text-[10px] font-mono uppercase font-black animate-in slide-in-from-top-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        {/* COLUMNA IZQUIERDA: Fotografía del Recinto */}
        <div className="w-full lg:w-[35%]">
          <div className="bg-[#111113] border border-white/5 rounded-[40px] p-6 shadow-2xl relative overflow-hidden">
            <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-square rounded-[30px] overflow-hidden cursor-pointer transition-all duration-500 bg-[#050505] flex flex-col items-center justify-center border border-dashed border-white/10 hover:border-emerald-500/40 group">
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => processFile(e.target.files[0])} accept="image/*" />
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover transition-all" alt="Preview"/>
                  <button onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }} className="absolute top-4 right-4 p-3 rounded-full bg-red-500/90 text-white z-10 hover:bg-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-sm transition-all pointer-events-none">
                    <UploadCloud size={30} className="text-white"/>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <Building2 size={32} className="text-gray-600 mb-4 mx-auto group-hover:text-emerald-500 group-hover:scale-110 transition-all" />
                  <p className="text-white font-black uppercase text-[10px] tracking-widest">Fotografía del Recinto</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Datos del Recinto */}
        <div className="w-full lg:w-[65%] bg-[#111113] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="space-y-8">
            
            <div className="group">
              <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block group-focus-within:text-white transition-colors">Nombre del Espacio</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Teatro Municipal Guillermo Valencia" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none focus:border-emerald-500/50 focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block">Tipología Arquitectónica</label>
                <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none appearance-none cursor-pointer focus:border-emerald-500/50 transition-all">
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
              </div>

              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block">Aforo Total</label>
                <Users size={16} className="absolute left-6 bottom-[22px] text-gray-600" />
                <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Capacidad máxima" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 pl-14 pr-8 text-white outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block flex items-center gap-2"><MapPin size={12}/> Dirección Exacta</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Carrera 6 # 3-14" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div className="relative">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-4 block flex items-center gap-2"><MapPin size={12}/> Barrio / Sector</label>
                <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ej: Sector Histórico" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-5 px-8 text-white outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>

            <div className="bg-[#050505] p-2 rounded-[30px] border border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-6">¿Espacio Inclusivo / Accesible? (Silla de Ruedas)</span>
              <button onClick={() => setIsAccessible(!isAccessible)} className={`py-4 px-10 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${isAccessible ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-[#111113] border border-white/10 text-gray-500 hover:text-white'}`}>
                {isAccessible ? 'SÍ, ACCESIBLE' : 'NO ACCESIBLE'}
              </button>
            </div>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Reseña histórica o técnica del lugar..." className="w-full min-h-[120px] bg-[#050505] border border-white/5 rounded-[30px] py-6 px-8 text-white outline-none resize-none shadow-inner focus:border-emerald-500/50 transition-all"></textarea>
            
            <button onClick={handleSubmit} disabled={loading} className="w-full py-5 rounded-[30px] font-black text-xs uppercase tracking-[0.2em] bg-emerald-500 hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20}/>}
              {locacionExistente ? 'Guardar Cambios' : 'Registrar en Inventario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearLocacion;