import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, User, Save, Globe, Shield, 
  Image as ImageIcon, Bell, Phone, X, Check,
  Instagram, Facebook, Twitter, MessageCircle, MapPin, Link
} from 'lucide-react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

const AjustesView = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState('perfil');

  // 🔥 CORRECCIÓN APLICADA: Inicializamos en null para evitar el warning src=""
  const [previewPerfil, setPreviewPerfil] = useState(null);
  const [previewPortada, setPreviewPortada] = useState(null);
  const [filePerfil, setFilePerfil] = useState(null);
  const [filePortada, setFilePortada] = useState(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropType, setCropType] = useState('perfil');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [formData, setFormData] = useState({
    name: '', username: '', email: '', birth_date: '', gender: '',        
    phone: '', city: 'Popayán', neighborhood: '', bio: '', website: '',
    social_media: { instagram: '', facebook: '', whatsapp: '', twitter: '' },
    settings: { public_profile: true, email_notifications: true, nearby_events_notify: true }
  });

  // EL VIGILANTE CLOUD: Lógica limpia, asumiendo URLs absolutas de Cloudinary
  useEffect(() => {
    if (user) {
      const safeProfilePic = user.profile_picture || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=a855f7&color=fff`;
      const safeCoverPic = user.cover_picture || null;

      setPreviewPerfil(safeProfilePic);
      setPreviewPortada(safeCoverPic);

      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        birth_date: user.birth_date || '', 
        gender: user.gender || '',        
        phone: user.phone || '',
        city: user.city || 'Popayán',
        neighborhood: user.neighborhood || '',
        bio: user.bio || '',
        website: user.website || '',
        social_media: {
          instagram: user.social_media?.instagram || '',
          facebook: user.social_media?.facebook || '',
          whatsapp: user.social_media?.whatsapp || '',
          twitter: user.social_media?.twitter || ''
        },
        settings: {
          public_profile: user.settings?.public_profile ?? true,
          email_notifications: user.settings?.email_notifications ?? true,
          nearby_events_notify: user.settings?.nearby_events_notify ?? true
        }
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleFileSelect = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setCropType(tipo);
        setCropModalOpen(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], `cropped_${cropType}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(croppedBlob);

      if (cropType === 'perfil') {
        setPreviewPerfil(previewUrl);
        setFilePerfil(croppedFile);
      } else {
        setPreviewPortada(previewUrl);
        setFilePortada(croppedFile);
      }
      setCropModalOpen(false);
      setImageToCrop(null);
    } catch (e) {
      console.error("Error recortando imagen:", e);
    }
  };

  // 🔥 LÓGICA DE PERSISTENCIA BLINDADA
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      
      const profileData = new FormData();
      
      // 🔥 BLINDAJE: Forzamos strings limpios para que JS no envíe "null" como texto
      profileData.append('name', formData.name || '');
      profileData.append('bio', formData.bio || '');
      profileData.append('phone', formData.phone || '');
      profileData.append('city', formData.city || '');
      profileData.append('neighborhood', formData.neighborhood || '');
      profileData.append('website', formData.website || '');
      profileData.append('social_media', JSON.stringify(formData.social_media || {}));
      
      if (filePerfil) profileData.append('profile_picture', filePerfil); 
      if (filePortada) profileData.append('cover_picture', filePortada); 

      const settingsData = {
        public_profile: formData.settings.public_profile,
        email_notifications: formData.settings.email_notifications,
        nearby_events_notify: formData.settings.nearby_events_notify
      };

      const [profileResponse] = await Promise.all([
        axios.post(`${API_URL}/profile/update`, profileData, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        }),
        axios.post(`${API_URL}/profile/settings`, settingsData, { 
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } 
        })
      ]);

      const updatedUser = profileResponse.data.user;

      if (setUser) setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));

      setFilePerfil(null);
      setFilePortada(null);

      alert("✅ Perfil sincronizado exitosamente con la Nube.");
    } catch (error) {
      console.error(error);
      alert("❌ Error al guardar. Revisa la consola o tu conexión con Cloudinary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col overflow-x-hidden pb-20">
      
      {/* MODAL DE RECORTE */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="w-full max-w-4xl h-[75vh] bg-[#111113] rounded-[40px] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)]">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[#a855f7] font-black uppercase tracking-widest text-[10px]">Ajustar Imagen</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="relative flex-1 bg-black">
              <Cropper
                image={imageToCrop} crop={crop} zoom={zoom}
                aspect={cropType === 'perfil' ? 1 / 1 : 21 / 9}
                cropShape={cropType === 'perfil' ? 'round' : 'rect'}
                showGrid={false} onCropChange={setCrop}
                onCropComplete={onCropComplete} onZoomChange={setZoom}
              />
            </div>
            <div className="p-5 border-t border-white/5 bg-[#111113] flex items-center gap-6">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-[#a855f7]" />
              <button type="button" onClick={handleCropSave} className="bg-[#a855f7] text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2"><Check size={14} /> Aplicar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE PORTADA */}
      <div className="relative w-full h-[35vh] md:h-[40vh] min-h-[300px] max-h-[500px] bg-[#0A0A0C]">
        <div className="absolute inset-0 overflow-hidden">
          {previewPortada ? (
            <img src={previewPortada} className="w-full h-full object-cover" alt="Portada" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#111113] to-[#0A0A0C]"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/50 to-transparent"></div>
        </div>
        
        <label className="absolute bottom-6 right-8 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl cursor-pointer hover:bg-[#a855f7] transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest z-30">
          <ImageIcon size={14} /> <span>Cambiar Portada</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'portada')} />
        </label>

        <div className="absolute -bottom-12 left-12 flex items-end gap-6 z-20">
          <div className="relative group/avatar">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] border-[6px] border-[#0A0A0C] overflow-hidden shadow-2xl bg-[#111113]">
              {/* 🔥 CORRECCIÓN APLICADA: Blindaje del src con fallback inmediato */}
              <img 
                src={previewPerfil || `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=a855f7&color=fff`} 
                className="w-full h-full object-cover" 
                alt="Perfil" 
                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=a855f7&color=fff`} 
              />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[34px] cursor-pointer backdrop-blur-sm">
              <Camera className="text-white" size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'perfil')} />
            </label>
          </div>
          <div className="mb-4">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg leading-tight">
              {formData.name || 'Cargando...'}
            </h2>
            <p className="text-[#a855f7] text-[10px] font-black uppercase tracking-[0.3em] mt-1 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              @{formData.username}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL DE AJUSTES */}
      <div className="mt-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Menú Lateral de Pestañas */}
          <div className="lg:col-span-3 space-y-3">
            {[{ id: 'perfil', label: 'Identidad', icon: <User size={18} /> },
              { id: 'social', label: 'Contacto', icon: <Globe size={18} /> },
              { id: 'seguridad', label: 'Privacidad', icon: <Shield size={18} /> }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setTabActiva(item.id)} 
                className={`w-full flex items-center gap-4 p-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all border ${tabActiva === item.id ? 'bg-[#111113] border-[#a855f7] text-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.1)]' : 'bg-[#111113] text-gray-500 border-white/5 hover:bg-white/5 hover:text-white'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* Área de Formularios */}
          <div className="lg:col-span-9">
            <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7]/5 rounded-full blur-[100px] pointer-events-none"></div>

              <form onSubmit={handleSave} className="space-y-10 relative z-10">
                
                {/* 1. PESTAÑA IDENTIDAD */}
                {tabActiva === 'perfil' && (
                  <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><User size={12}/> Nombre Real</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] focus:bg-black/60 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Phone size={12}/> Teléfono</label>
                      <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] focus:bg-black/60 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><MapPin size={12}/> Ciudad</label>
                      <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] focus:bg-black/60 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">Barrio / Localidad</label>
                      <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] focus:bg-black/60 transition-all" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">Biografía Cultural</label>
                      <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className="w-full p-5 bg-black/40 border border-white/5 rounded-[24px] text-white text-sm outline-none focus:border-[#a855f7] focus:bg-black/60 resize-none transition-all" placeholder="Cuéntale a Popayán sobre ti..." />
                    </div>
                  </div>
                )}
                
                {/* 2. PESTAÑA CONTACTO */}
                {tabActiva === 'social' && (
                  <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="md:col-span-2 space-y-2 mb-4">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Link size={12}/> Sitio Web / Portafolio</label>
                      <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://miportafolio.com" className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-[#a855f7] text-sm outline-none focus:border-[#a855f7] focus:bg-black/60 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Instagram size={12}/> Instagram</label>
                      <input type="text" name="social_media.instagram" value={formData.social_media.instagram} onChange={handleInputChange} placeholder="@usuario" className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Facebook size={12}/> Facebook</label>
                      <input type="text" name="social_media.facebook" value={formData.social_media.facebook} onChange={handleInputChange} placeholder="Enlace a tu perfil" className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><MessageCircle size={12}/> WhatsApp</label>
                      <input type="text" name="social_media.whatsapp" value={formData.social_media.whatsapp} onChange={handleInputChange} placeholder="+57 300 000 0000" className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2"><Twitter size={12}/> Twitter / X</label>
                      <input type="text" name="social_media.twitter" value={formData.social_media.twitter} onChange={handleInputChange} placeholder="@usuario" className="w-full p-4 bg-black/40 border border-white/5 rounded-[20px] text-white text-sm outline-none focus:border-[#a855f7] transition-all" />
                    </div>
                  </div>
                )}

                {/* 3. PESTAÑA PRIVACIDAD */}
                {tabActiva === 'seguridad' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-[24px]">
                      <div>
                        <h4 className="text-white font-black italic uppercase tracking-tighter text-lg flex items-center gap-2"><Globe className="text-[#a855f7]" size={20}/> Perfil Público</h4>
                        <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">Permite que otros vean tu perfil y tus obras.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="settings.public_profile" checked={formData.settings.public_profile} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#a855f7]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-[24px]">
                      <div>
                        <h4 className="text-white font-black italic uppercase tracking-tighter text-lg flex items-center gap-2"><Bell className="text-[#a855f7]" size={20}/> Notificaciones al Correo</h4>
                        <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">Recibe avisos sobre comentarios y likes.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="settings.email_notifications" checked={formData.settings.email_notifications} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#a855f7]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-black/40 border border-white/5 rounded-[24px]">
                      <div>
                        <h4 className="text-white font-black italic uppercase tracking-tighter text-lg flex items-center gap-2"><MapPin className="text-[#a855f7]" size={20}/> Radar de Eventos</h4>
                        <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">Avisarme cuando haya eventos cerca de mi localidad.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="settings.nearby_events_notify" checked={formData.settings.nearby_events_notify} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#a855f7]"></div>
                      </label>
                    </div>

                  </div>
                )}

                <div className="pt-8 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-white text-black px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_30px_rgba(168,85,247,0.3)] flex items-center gap-3 disabled:opacity-50"
                  >
                    <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AjustesView;