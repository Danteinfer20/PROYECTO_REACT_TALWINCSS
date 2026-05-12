import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, User, Save, Globe, Shield, 
  Image as ImageIcon, Bell, Phone, X, Check,
  Instagram, Facebook, Twitter, MessageCircle, MapPin, Link, Palette, Type,
  Sun, Moon, Loader2, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { useTranslation } from 'react-i18next'; 

const AjustesView = ({ user, setUser }) => {
  const { t, i18n } = useTranslation(); 
  const [loading, setLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState('perfil');

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
    settings: { 
      public_profile: true, 
      email_notifications: true, 
      nearby_events_notify: true,
      language: 'es',
      visual_mode: 'dark' 
    }
  });

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
          nearby_events_notify: user.settings?.nearby_events_notify ?? true,
          language: user.settings?.language || 'es',
          visual_mode: user.settings?.visual_mode || 'dark'
        }
      });
      
      if (user.settings?.visual_mode === 'light') {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      } else {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      }
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

  const handleSettingChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      settings: { ...prev.settings, [key]: value }
    }));
    if (key === 'language') i18n.changeLanguage(value);
    if (key === 'visual_mode') {
      if (value === 'light') {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      } else {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      }
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

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const profileData = new FormData();
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
        nearby_events_notify: formData.settings.nearby_events_notify,
        language: formData.settings.language,
        visual_mode: formData.settings.visual_mode
      };
      const [profileResponse] = await Promise.all([
        axios.post(`${API_URL}/profile/update`, profileData, { headers: { 'Authorization': `Bearer ${token}` } }),
        axios.post(`${API_URL}/profile/settings`, settingsData, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } })
      ]);
      const updatedUser = profileResponse.data.user;
      updatedUser.settings = settingsData;
      if (setUser) setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
      setFilePerfil(null);
      setFilePortada(null);
      alert(t('settings.success_save', '✅ Perfil y Ajustes sincronizados exitosamente.'));
    } catch (error) {
      console.error(error);
      alert(t('settings.error_save', '❌ Error al guardar. Revisa la consola o tu conexión.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col overflow-x-hidden pb-20 transition-colors duration-500">
      
      {/* ✂️ MODAL DE RECORTE */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="w-full max-w-4xl h-[75vh] bg-[var(--bg-card)] rounded-[40px] border border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl transition-colors duration-500">
            <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between transition-colors">
              <h3 className="text-[var(--text-heading)] font-bold italic uppercase tracking-widest text-[10px]">Ajustar Imagen</h3>
              <button onClick={() => setCropModalOpen(false)} className="text-[var(--text-body)] hover:text-[var(--text-heading)] transition-colors"><X size={20} /></button>
            </div>
            <div className="relative flex-1 bg-black shadow-inner">
              <Cropper
                image={imageToCrop} crop={crop} zoom={zoom}
                aspect={cropType === 'perfil' ? 1 / 1 : 21 / 9}
                cropShape={cropType === 'perfil' ? 'round' : 'rect'}
                showGrid={false} onCropChange={setCrop}
                onCropComplete={onCropComplete} onZoomChange={setZoom}
              />
            </div>
            <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex items-center gap-8 transition-colors">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-1 accent-[var(--text-heading)]" />
              <button type="button" onClick={handleCropSave} className="bg-[var(--text-heading)] text-[var(--bg-primary)] px-8 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 transition-all"><Check size={14} /> Aplicar</button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ HERO DE IDENTIDAD */}
      <div className="relative w-full h-[35vh] md:h-[40vh] min-h-[250px] bg-[var(--bg-container)] transition-colors duration-500 border-b border-[var(--border-color)]">
        <div className="absolute inset-0 overflow-hidden">
          {previewPortada ? (
            <img src={previewPortada} className="w-full h-full object-cover opacity-90" alt="Portada" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] opacity-50"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent"></div>
        </div>
        
        <label className="absolute bottom-6 right-8 bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border-color)] px-5 py-2.5 rounded-xl cursor-pointer hover:bg-[var(--text-heading)] hover:text-[var(--bg-primary)] transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest z-30 shadow-lg">
          <ImageIcon size={14} /> <span>Cambiar Portada</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'portada')} />
        </label>

        <div className="absolute -bottom-14 left-12 flex items-end gap-8 z-20">
          <div className="relative group/avatar">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-[48px] border-[8px] border-[var(--bg-primary)] overflow-hidden shadow-2xl bg-[var(--bg-card)] transition-colors duration-500">
              <img 
                src={previewPerfil || `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=a855f7&color=fff`} 
                className="w-full h-full object-cover" 
                alt="Perfil" 
                onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=a855f7&color=fff`} 
              />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[40px] cursor-pointer backdrop-blur-sm">
              <Camera className="text-white" size={28} />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'perfil')} />
            </label>
          </div>
          <div className="mb-6">
            <h2 className="text-3xl md:text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] leading-none transition-colors duration-500">
              {formData.name || 'Cargando...'}
            </h2>
            <p className="text-[rgb(var(--role-accent))] font-mono text-[10px] font-black uppercase tracking-[0.4em] mt-2 transition-colors">
              @{formData.username}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-28 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
          
          {/* 🧭 NAVEGACIÓN */}
          <div className="lg:col-span-3 space-y-3">
            {[
              { id: 'perfil', label: t('settings.tabs.identity', 'Identidad'), icon: <User size={18} /> },
              { id: 'social', label: t('settings.tabs.contact', 'Contacto'), icon: <Globe size={18} /> },
              { id: 'seguridad', label: t('settings.tabs.privacy', 'Privacidad'), icon: <Shield size={18} /> },
              { id: 'preferencias', label: t('settings.tabs.preferences', 'Preferencias'), icon: <Palette size={18} /> }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setTabActiva(item.id)} 
                className={`w-full flex items-center gap-4 p-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${tabActiva === item.id ? 'bg-[var(--text-heading)] border-[var(--text-heading)] text-[var(--bg-primary)] shadow-xl scale-[1.03]' : 'bg-[var(--bg-container)] text-[var(--text-body)] border-[var(--border-color)] hover:border-[var(--text-heading)]/30 hover:text-[var(--text-heading)] shadow-sm'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {/* 🛠️ CONTENIDO DINÁMICO OPTIMIZADO */}
          <div className="lg:col-span-9">
            <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[45px] p-8 md:p-12 shadow-sm transition-colors duration-500">
              
              <form onSubmit={handleSave} className="space-y-12">
                
                {tabActiva === 'perfil' && (
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    {[
                      { label: 'Nombre Real', name: 'name', icon: <User size={14}/> },
                      { label: 'Teléfono', name: 'phone', icon: <Phone size={14}/> },
                      { label: 'Ciudad', name: 'city', icon: <MapPin size={14}/> },
                      { label: 'Barrio / Localidad', name: 'neighborhood' }
                    ].map((f) => (
                      <div key={f.name} className="space-y-2.5">
                        <label className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">{f.icon} {f.label}</label>
                        <input type="text" name={f.name} value={formData[f.name]} onChange={handleInputChange} className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] text-[var(--text-heading)] text-sm outline-none focus:border-[var(--text-heading)] transition-all" />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2">Biografía Cultural</label>
                      <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" className="w-full p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] text-[var(--text-heading)] text-sm outline-none focus:border-[var(--text-heading)] resize-none shadow-inner leading-relaxed transition-all placeholder:[var(--text-body)]/30" placeholder="Cuéntale a Popayán sobre ti..." />
                    </div>
                  </div>
                )}
                
                {tabActiva === 'social' && (
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="md:col-span-2 space-y-2.5">
                      <label className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><Link size={14}/> Sitio Web / Portafolio</label>
                      <input type="url" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://miportafolio.com" className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] text-[var(--text-heading)] text-sm outline-none focus:border-[var(--text-heading)] transition-all" />
                    </div>
                    {[
                      { icon: Instagram, key: 'instagram', placeholder: '@usuario' },
                      { icon: Facebook, key: 'facebook', placeholder: 'Enlace a tu perfil' },
                      { icon: MessageCircle, key: 'whatsapp', placeholder: '+57 300 000 0000' },
                      { icon: Twitter, key: 'twitter', placeholder: '@usuario' }
                    ].map((social) => (
                      <div key={social.key} className="space-y-2.5">
                        <label className="text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><social.icon size={14}/> {social.key}</label>
                        <input type="text" name={`social_media.${social.key}`} value={formData.social_media[social.key]} onChange={handleInputChange} placeholder={social.placeholder} className="w-full p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] text-[var(--text-heading)] text-sm outline-none focus:border-[var(--text-heading)] transition-all" />
                      </div>
                    ))}
                  </div>
                )}

                {tabActiva === 'seguridad' && (
                  <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    {[
                      { key: 'public_profile', icon: Globe, label: 'Perfil Público', desc: 'Permite que otros te encuentren.' },
                      { key: 'email_notifications', icon: Bell, label: 'Notificaciones de Red', desc: 'Avisos sobre interacciones.' }
                    ].map((setting) => (
                      <div key={setting.key} className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] shadow-inner transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-[var(--bg-container)] flex items-center justify-center text-[var(--text-heading)] border border-[var(--border-color)]"><setting.icon size={18} strokeWidth={1.5}/></div>
                          <div>
                            <h4 className="text-[var(--text-heading)] font-bold italic uppercase tracking-[0.2em] text-xs transition-colors">{setting.label}</h4>
                            <p className="text-[var(--text-body)] text-[8px] font-mono uppercase opacity-50 mt-0.5">{setting.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name={`settings.${setting.key}`} checked={formData.settings[setting.key]} onChange={handleInputChange} className="sr-only peer" />
                          <div className="w-12 h-6 bg-[var(--border-color)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[rgb(var(--role-accent))]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {tabActiva === 'preferencias' && (
                  <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    {[
                      { id: 'visual_mode', label: 'Entorno Visual', icon: Sun, options: [{ id: 'light', label: 'Claro', icon: Sun }, { id: 'dark', label: 'Oscuro', icon: Moon }] },
                      { id: 'language', label: 'Idioma Sistema', icon: Type, options: [{ id: 'es', label: 'ES', icon: null }, { id: 'en', label: 'EN', icon: null }] }
                    ].map((pref) => (
                      <div key={pref.id} className="p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] shadow-inner transition-colors">
                        <h4 className="text-[var(--text-heading)] font-bold italic uppercase tracking-[0.2em] text-xs flex items-center gap-2 mb-6 transition-colors">
                          <pref.icon className="text-[rgb(var(--role-accent))]" size={16} strokeWidth={2.5} /> 
                          {pref.label}
                        </h4>
                        <div className="flex gap-3">
                          {pref.options.map((opt) => (
                            <button 
                              key={opt.id} 
                              type="button"
                              onClick={() => handleSettingChange(pref.id, opt.id)}
                              className={`flex-1 py-3 px-4 rounded-[15px] text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 border flex items-center justify-center gap-2 ${
                                formData.settings[pref.id] === opt.id 
                                  ? 'bg-[var(--text-heading)] border-[var(--text-heading)] text-[var(--bg-primary)] shadow-md scale-[1.02]' 
                                  : 'bg-transparent border-[var(--border-color)] text-[var(--text-body)] opacity-40 hover:opacity-100 hover:border-[var(--text-heading)]/40'
                              }`}
                            >
                              {opt.icon && <opt.icon size={12} />} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-8 flex justify-end border-t border-[var(--border-color)]">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-[var(--text-heading)] text-[var(--bg-primary)] px-12 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:opacity-90 active:scale-95 transition-all duration-300 shadow-xl flex items-center gap-4 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                    {loading ? 'Sincronizando...' : 'Guardar Cambios'}
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