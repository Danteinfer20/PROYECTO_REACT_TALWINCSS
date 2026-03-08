import React, { useState } from 'react';
import { 
  Camera, User, Save, Globe, Shield, 
  Image as ImageIcon, Instagram, Facebook, 
  MapPin, Twitter, Bell, CheckCircle, X,
  Calendar, Users, MessageCircle
} from 'lucide-react';
import axios from 'axios';

const AjustesView = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState('perfil');

  // Estados visuales (Previsualización)
  const [previewPerfil, setPreviewPerfil] = useState(user?.profile_picture || null);
  const [previewPortada, setPreviewPortada] = useState(user?.cover_picture || null);

  // Archivos físicos para FormData
  const [filePerfil, setFilePerfil] = useState(null);
  const [filePortada, setFilePortada] = useState(null);

  // ✅ ESTADO UNIFICADO CON TODOS LOS CAMPOS DE TU DB
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    birth_date: user?.birth_date || '', 
    gender: user?.gender || '',         
    phone: user?.phone || '',
    city: user?.city || 'Popayán',
    neighborhood: user?.neighborhood || '',
    bio: user?.bio || '',
    website: user?.website || '',
    // ✅ Redes sociales (JSONB) - AHORA CON WHATSAPP Y FACEBOOK
    social_media: {
      instagram: user?.social_media?.instagram || '',
      facebook: user?.social_media?.facebook || '',
      whatsapp: user?.social_media?.whatsapp || '',
      twitter: user?.social_media?.twitter || ''
    },
    // Ajustes (Tabla user_settings)
    settings: {
      public_profile: user?.settings?.public_profile ?? true,
      email_notifications: user?.settings?.email_notifications ?? true,
      nearby_events_notify: user?.settings?.nearby_events_notify ?? true
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Lógica para campos anidados (social_media.instagram)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      if (tipo === 'perfil') setFilePerfil(file);
      else setFilePortada(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        if (tipo === 'perfil') setPreviewPerfil(reader.result);
        else setPreviewPortada(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    // Añadimos todos los campos de texto
    data.append('name', formData.name);
    data.append('birth_date', formData.birth_date);
    data.append('gender', formData.gender);
    data.append('bio', formData.bio);
    data.append('phone', formData.phone);
    data.append('neighborhood', formData.neighborhood);
    data.append('city', formData.city);
    data.append('website', formData.website);
    
    // Convertimos objetos a String para Laravel
    data.append('social_media', JSON.stringify(formData.social_media));
    data.append('settings', JSON.stringify(formData.settings));

    if (filePerfil) data.append('image', filePerfil); 
    if (filePortada) data.append('cover_image', filePortada); 

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/v1/profile/update', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.status === 'success') {
        const userActualizado = response.data.user;
        localStorage.setItem('user', JSON.stringify(userActualizado));
        setUser(userActualizado);
        alert("✅ Identidad sincronizada en Popayán");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error al guardar. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animate-in fade-in duration-700 pb-20">
      
      {/* 🖼️ HEADER DE PORTADA */}
      <div className="relative h-80 w-full group bg-[#0d0d0f]">
        <div className="absolute inset-0 overflow-hidden bg-[#151517]">
          {previewPortada ? (
            <img src={previewPortada} className="w-full h-full object-cover" alt="Portada" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1a1c] to-[#0a0a0c]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-black/20"></div>
        </div>
        
        <label className="absolute bottom-8 right-12 bg-black/50 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#a855f7] transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest z-30">
          <ImageIcon size={16} /> Cambiar Portada
          <input type="file" className="hidden" onChange={(e) => handleImageChange(e, 'portada')} />
        </label>

        <div className="absolute -bottom-16 left-12 flex items-end gap-8 z-20">
          <div className="relative group/avatar">
            <div className="w-44 h-44 rounded-[45px] border-[6px] border-[#0d0d0f] overflow-hidden shadow-2xl bg-[#111]">
              <img src={previewPerfil || '/default-avatar.png'} className="w-full h-full object-cover" alt="Perfil" />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[38px] cursor-pointer">
              <Camera className="text-white" size={32} />
              <input type="file" className="hidden" onChange={(e) => handleImageChange(e, 'perfil')} />
            </label>
          </div>
          <div className="mb-8">
            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">{formData.name || 'Sin Nombre'}</h2>
            <p className="text-[#a855f7] text-[10px] font-black uppercase tracking-[0.3em] mt-1">@{user?.username}</p>
          </div>
        </div>
      </div>

      <div className="mt-32 px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-[1600px] mx-auto">
        
        {/* 📋 NAV LATERAL */}
        <div className="lg:col-span-3 space-y-4">
          {[
            { id: 'perfil', label: 'Datos de Identidad', icon: <User size={20} /> },
            { id: 'social', label: 'Redes y Contacto', icon: <Globe size={20} /> },
            { id: 'seguridad', label: 'Privacidad', icon: <Shield size={20} /> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setTabActiva(item.id)}
              className={`w-full flex items-center gap-5 p-6 rounded-[30px] text-[11px] font-black uppercase tracking-widest transition-all border ${
                tabActiva === item.id ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-lg shadow-[#a855f7]/20' : 'bg-[#111] text-gray-500 border-white/5'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* 📝 FORMULARIO CONTENIDO */}
        <div className="lg:col-span-9">
          <div className="bg-[#111] border border-white/5 rounded-[50px] p-12 shadow-2xl min-h-[600px]">
            <form onSubmit={handleSave} className="space-y-12">
              
              {tabActiva === 'perfil' && (
                <div className="grid md:grid-cols-2 gap-10 animate-in slide-in-from-right-5 duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">Nombre Real</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7]" />
                  </div>
                  
                  {/* FECHA DE NACIMIENTO */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 flex items-center gap-2"><Calendar size={12}/> Fecha de Nacimiento</label>
                    <input type="date" name="birth_date" value={formData.birth_date} onChange={handleInputChange} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7] [color-scheme:dark]" />
                  </div>

                  {/* GÉNERO */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4 flex items-center gap-2"><Users size={12}/> Género</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7] appearance-none">
                      <option value="">No definido</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">Barrio / Comuna</label>
                    <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7]" />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">Bio / Relato Cultural</label>
                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className="w-full p-6 bg-[#1a1a1c] border border-white/5 rounded-[35px] text-white text-sm outline-none focus:border-[#a855f7] resize-none" />
                  </div>
                </div>
              )}

              {/* ✅ PESTAÑA DE REDES Y CONTACTO ACTUALIZADA */}
              {tabActiva === 'social' && (
                <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-right-5 duration-500">
                  
                  {/* WhatsApp */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">WhatsApp (Ventas / Info)</label>
                    <div className="relative group">
                      <MessageCircle size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                      <input 
                        type="text" 
                        name="social_media.whatsapp" 
                        value={formData.social_media.whatsapp} 
                        onChange={handleInputChange} 
                        placeholder="Ej: 573001234567" 
                        className="w-full p-5 pl-14 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-green-500" 
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">Facebook</label>
                    <div className="relative group">
                      <Facebook size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        name="social_media.facebook" 
                        value={formData.social_media.facebook} 
                        onChange={handleInputChange} 
                        placeholder="tu.pagina" 
                        className="w-full p-5 pl-14 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">Instagram</label>
                    <div className="relative group">
                      <Instagram size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#a855f7] transition-colors" />
                      <input 
                        type="text" 
                        name="social_media.instagram" 
                        value={formData.social_media.instagram} 
                        onChange={handleInputChange} 
                        placeholder="@perfil" 
                        className="w-full p-5 pl-14 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7]" 
                      />
                    </div>
                  </div>

                  {/* Sitio Web */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase ml-4">Sitio Web / Portafolio</label>
                    <div className="relative group">
                      <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#a855f7] transition-colors" />
                      <input 
                        type="text" 
                        name="website" 
                        value={formData.website} 
                        onChange={handleInputChange} 
                        placeholder="https://tupagina.com" 
                        className="w-full p-5 pl-14 bg-[#1a1a1c] border border-white/5 rounded-3xl text-white font-bold outline-none focus:border-[#a855f7]" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {tabActiva === 'seguridad' && (
                <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                  {/* Toggle Perfil Público */}
                  <div 
                    className="bg-[#1a1a1c] p-10 rounded-[40px] flex items-center justify-between border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                    onClick={() => setFormData({...formData, settings: {...formData.settings, public_profile: !formData.settings.public_profile}})}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${formData.settings.public_profile ? 'bg-[#a855f7]/10 text-[#a855f7]' : 'bg-white/5 text-gray-600'}`}>
                        <Shield size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-xs">Visibilidad Pública</h4>
                        <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Permitir que otros vean tu perfil</p>
                      </div>
                    </div>
                    <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${formData.settings.public_profile ? 'bg-[#a855f7]' : 'bg-gray-800'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.settings.public_profile ? 'left-7' : 'left-1'}`}></div>
                    </div>
                  </div>

                  {/* Toggle Eventos */}
                  <div 
                    className="bg-[#1a1a1c] p-10 rounded-[40px] flex items-center justify-between border border-white/5 cursor-pointer hover:border-white/20 transition-all"
                    onClick={() => setFormData({...formData, settings: {...formData.settings, nearby_events_notify: !formData.settings.nearby_events_notify}})}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${formData.settings.nearby_events_notify ? 'bg-[#a855f7]/10 text-[#a855f7]' : 'bg-white/5 text-gray-600'}`}>
                        <Bell size={24} />
                      </div>
                      <div>
                        <h4 className="text-white font-black uppercase text-xs">Notificaciones de Popayán</h4>
                        <p className="text-gray-500 text-[10px] mt-1 uppercase tracking-widest font-bold">Alertas de eventos cerca de tu barrio</p>
                      </div>
                    </div>
                    <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${formData.settings.nearby_events_notify ? 'bg-[#a855f7]' : 'bg-gray-800'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData.settings.nearby_events_notify ? 'left-7' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-10 border-t border-white/5 flex justify-end">
                <button type="submit" disabled={loading} className="bg-white text-black px-12 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all flex items-center gap-4 shadow-xl">
                  {loading ? <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin rounded-full"></div> : <Save size={18} />}
                  {loading ? 'Sincronizando...' : 'Sincronizar Identidad'}
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