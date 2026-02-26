import React, { useState } from 'react';
import { 
  Camera, User, Save, Globe, Shield, 
  Image as ImageIcon, Instagram, Facebook, 
  MapPin
} from 'lucide-react';
import axios from 'axios'; // ¡VITAL PARA COMUNICARSE CON LARAVEL!

const AjustesView = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState('perfil');

  // Estados visuales (Base64)
  const [previewPerfil, setPreviewPerfil] = useState(user?.profile_picture || null);
  const [previewPortada, setPreviewPortada] = useState(user?.cover_picture || null);

  // ✅ NUEVO: Estados para guardar los archivos físicos
  const [filePerfil, setFilePerfil] = useState(null);
  const [filePortada, setFilePortada] = useState(null);

  const [perfil, setPerfil] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    neighborhood: user?.neighborhood || '',
    city: user?.city || 'Popayán',
    website: user?.website || '',
  });

  const handleImageChange = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Guardamos el archivo real para el backend
      if (tipo === 'perfil') setFilePerfil(file);
      else setFilePortada(file);

      // 2. Generamos la previsualización visual
      const reader = new FileReader();
      reader.onloadend = () => {
        if (tipo === 'perfil') setPreviewPerfil(reader.result);
        else setPreviewPortada(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ CORRECCIÓN: Ahora SÍ enviamos los datos a Laravel
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Creamos el FormData para poder enviar imágenes
    const formData = new FormData();
    formData.append('name', perfil.name);
    formData.append('bio', perfil.bio);
    formData.append('phone', perfil.phone);
    formData.append('neighborhood', perfil.neighborhood);
    formData.append('city', perfil.city);
    formData.append('website', perfil.website);

    // Si el usuario eligió una nueva foto, la adjuntamos
    if (filePerfil) formData.append('image', filePerfil); 
    if (filePortada) formData.append('cover_image', filePortada); 

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/v1/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        // Guardamos el nuevo usuario devuelto por la Base de Datos
        const userActualizado = response.data.user;
        
        localStorage.setItem('user', JSON.stringify(userActualizado));
        setUser(userActualizado);
        window.dispatchEvent(new Event('storage'));

        alert("✅ Identidad sincronizada con éxito en la Base de Datos");
      }
    } catch (error) {
      console.error("Error al guardar:", error.response?.data || error);
      alert("❌ Error al guardar. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animate-in fade-in duration-700 pb-20">
      
      {/* 🖼️ HEADER ORIGINAL */}
      <div className="relative h-80 w-full group bg-[#0d0d0f]">
        <div className="absolute inset-0 overflow-hidden bg-[#151517]">
          {previewPortada ? (
            <img src={previewPortada} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="Portada" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1c] to-[#0a0a0c] flex items-center justify-center">
               <ImageIcon size={48} className="text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-black/20"></div>
        </div>
        
        <label className="absolute bottom-8 right-12 bg-black/50 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#a855f7] hover:text-white transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl z-30">
          <ImageIcon size={16} /> Cambiar Portada
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'portada')} />
        </label>

        <div className="absolute -bottom-16 left-12 flex items-end gap-8 z-20">
          <div className="relative group/avatar">
            <div className="w-44 h-44 rounded-[45px] border-[6px] border-[#0d0d0f] overflow-hidden shadow-2xl bg-[#111] flex items-center justify-center">
              {previewPerfil ? (
                <img src={previewPerfil} className="w-full h-full object-cover" alt="Perfil" />
              ) : (
                <User size={48} className="text-white/20" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[38px] cursor-pointer">
              <Camera className="text-white shadow-2xl" size={32} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'perfil')} />
            </label>
          </div>
          <div className="mb-8">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{perfil.name || 'Sin Nombre'}</h2>
            <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-[#a855f7] text-white px-4 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-[#a855f7]/20">
                    {user?.user_type?.replace('_', ' ')} Verificado
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* ⚙️ PANEL VERSÁTIL */}
      <div className="mt-32 px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1600px] mx-auto">
        <div className="lg:col-span-3 space-y-4">
          {[
            { id: 'perfil', label: 'Datos Personales', icon: <User size={20} /> },
            { id: 'social', label: 'Redes y Enlaces', icon: <Globe size={20} /> },
            { id: 'seguridad', label: 'Privacidad', icon: <Shield size={20} /> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setTabActiva(item.id)}
              className={`w-full flex items-center gap-5 p-6 rounded-[30px] text-[11px] font-black uppercase tracking-[0.2em] transition-all border ${
                tabActiva === item.id 
                ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-2xl shadow-[#a855f7]/30 scale-[1.02]' 
                : 'bg-[#111] text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-9">
          <div className="bg-[#111] border border-white/5 rounded-[50px] p-16 shadow-2xl relative min-h-[600px]">
            <form onSubmit={handleSave} className="relative z-10 space-y-12">
              
              {tabActiva === 'perfil' && (
                <div className="grid md:grid-cols-2 gap-12 animate-in slide-in-from-right-10 duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-[0.2em]">Nombre de Autor</label>
                    <input type="text" value={perfil.name} onChange={(e)=>setPerfil({...perfil, name: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7] transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-[0.2em]">WhatsApp / Contacto</label>
                    <input type="text" value={perfil.phone} onChange={(e)=>setPerfil({...perfil, phone: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7] transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-[0.2em]">Biografía Narrativa (bio)</label>
                    <textarea value={perfil.bio} onChange={(e)=>setPerfil({...perfil, bio: e.target.value})} rows="5" className="w-full p-6 bg-[#1a1a1c] border border-white/5 rounded-[35px] text-white text-sm leading-relaxed outline-none focus:border-[#a855f7] transition-all resize-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-[0.2em]">Barrio / Comuna</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" value={perfil.neighborhood} onChange={(e)=>setPerfil({...perfil, neighborhood: e.target.value})} className="w-full p-5 pl-14 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7] transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 tracking-[0.2em]">Ciudad</label>
                    <input type="text" value={perfil.city} onChange={(e)=>setPerfil({...perfil, city: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7] transition-all" />
                  </div>
                </div>
              )}

              <div className="pt-12 border-t border-white/5 flex justify-end">
                <button type="submit" disabled={loading} className="bg-white text-black px-16 py-6 rounded-[25px] font-black text-[12px] uppercase tracking-[0.4em] hover:bg-[#a855f7] hover:text-white transition-all shadow-2xl flex items-center gap-5 active:scale-95">
                  <Save size={20} /> {loading ? 'SINCRONIZANDO...' : 'SINCRONIZAR PERFIL'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AjustesView;