import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, User, Save, Globe, Shield, 
  Image as ImageIcon, Bell, Phone, X, Check,
  Instagram, Facebook, Twitter, MessageCircle, MapPin, Link, Palette, Type,
  Sun, Moon, Loader2
} from 'lucide-react';
import api from '../../services/api';
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

  // ✅ Función para recargar el perfil desde la API y actualizar el estado global
  const refreshProfile = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.status === 'success') {
        const freshUser = response.data.user;
        // Actualizar el estado global del usuario
        if (setUser) setUser(freshUser);
        // Actualizar localStorage
        localStorage.setItem('user', JSON.stringify(freshUser));
        // Actualizar previsualizaciones con las URLs de Cloudinary
        setPreviewPerfil(freshUser.profile_picture || `https://ui-avatars.com/api/?name=${freshUser.name || 'U'}&background=a855f7&color=fff`);
        setPreviewPortada(freshUser.cover_picture || null);
        // Actualizar el formulario con los datos frescos
        setFormData({
          name: freshUser.name || '',
          username: freshUser.username || '',
          email: freshUser.email || '',
          birth_date: freshUser.birth_date || '',
          gender: freshUser.gender || '',
          phone: freshUser.phone || '',
          city: freshUser.city || 'Popayán',
          neighborhood: freshUser.neighborhood || '',
          bio: freshUser.bio || '',
          website: freshUser.website || '',
          social_media: {
            instagram: freshUser.social_media?.instagram || '',
            facebook: freshUser.social_media?.facebook || '',
            whatsapp: freshUser.social_media?.whatsapp || '',
            twitter: freshUser.social_media?.twitter || ''
          },
          settings: {
            public_profile: freshUser.settings?.public_profile ?? true,
            email_notifications: freshUser.settings?.email_notifications ?? true,
            nearby_events_notify: freshUser.settings?.nearby_events_notify ?? true,
            language: freshUser.settings?.language || 'es',
            visual_mode: freshUser.settings?.visual_mode || 'dark'
          }
        });
        return freshUser;
      }
    } catch (error) {
      console.error("Error al refrescar el perfil:", error);
    }
    return null;
  };

  useEffect(() => {
    if (user) {
      setPreviewPerfil(user.profile_picture || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=a855f7&color=fff`);
      setPreviewPortada(user.cover_picture || null);
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
      
      document.body.classList.toggle('dark', user.settings?.visual_mode !== 'light');
      document.body.classList.toggle('light', user.settings?.visual_mode === 'light');
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

    if (key === 'language') {
      i18n.changeLanguage(value);
      localStorage.setItem('app_lang', value);
    }

    if (key === 'visual_mode') {
      document.body.classList.toggle('dark', value === 'dark');
      document.body.classList.toggle('light', value === 'light');
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
      
      await Promise.all([
        api.post(`/profile/update`, profileData),
        api.post(`/profile/settings`, formData.settings)
      ]);
      
      // ✅ Recargar el perfil desde la API para obtener los datos actualizados (incluyendo URLs de Cloudinary)
      const freshUser = await refreshProfile();
      
      if (freshUser) {
        // ✅ Actualizar el estado global del usuario con los datos frescos
        if (setUser) setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        
        // ✅ Limpiar los archivos temporales después de guardar
        setFilePerfil(null);
        setFilePortada(null);
        
        // ✅ Mensaje de éxito
        alert(t('settings.success_save', '✅ Perfil y Ajustes sincronizados exitosamente.'));
      } else {
        // Si falla la recarga, al menos mostrar mensaje de éxito parcial
        alert(t('settings.success_save', '✅ Cambios guardados. Recarga la página para ver los cambios.'));
      }
    } catch (error) {
      console.error(error);
      alert(t('settings.error_save', '❌ Error al guardar.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col overflow-x-hidden pb-20 transition-colors duration-500">
      
      {/* MODAL DE RECORTE RESPONSIVO */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-4xl h-[80vh] md:h-[75vh] bg-[var(--bg-card)] rounded-[30px] md:rounded-[40px] border border-[var(--border-color)] flex flex-col overflow-hidden shadow-2xl transition-colors duration-500">
            <div className="p-4 md:p-5 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-[var(--text-heading)] font-bold italic uppercase tracking-widest text-[9px] md:text-[10px]">
                {t('settings.crop.title', 'Ajustar Imagen')}
              </h3>
              <button type="button" onClick={() => setCropModalOpen(false)} className="text-[var(--text-body)] hover:text-[var(--text-heading)] transition-colors">
                <X size={20} />
              </button>
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
            <div className="p-4 md:p-8 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="w-full md:flex-1 accent-[var(--text-heading)]" />
              <button type="button" onClick={handleCropSave} className="w-full md:w-auto bg-[var(--text-heading)] text-[var(--bg-primary)] px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                <Check size={14} /> {t('settings.crop.apply', 'Aplicar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO RESPONSIVO */}
      <div className="relative w-full h-[30vh] md:h-[40vh] min-h-[200px] bg-[var(--bg-container)] transition-colors duration-500 border-b border-[var(--border-color)]">
        <div className="absolute inset-0 overflow-hidden">
          {previewPortada ? (
            <img src={previewPortada} className="w-full h-full object-cover opacity-90" alt="Portada" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-primary)] opacity-50"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent"></div>
        </div>
        
        <label className="absolute bottom-4 right-4 md:bottom-6 md:right-8 bg-[var(--bg-card)]/40 backdrop-blur-md border border-[var(--border-color)] px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl cursor-pointer hover:bg-[var(--text-heading)] hover:text-[var(--bg-primary)] transition-all flex items-center gap-1.5 md:gap-2 text-[7px] md:text-[9px] font-black uppercase tracking-widest z-30 shadow-lg">
          <ImageIcon size={12} className="md:w-3.5 md:h-3.5" /> <span>{t('settings.cover_button', 'Cambiar Portada')}</span>
          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'portada')} />
        </label>

        <div className="absolute -bottom-10 left-4 md:-bottom-14 md:left-12 flex items-end gap-3 md:gap-8 z-20">
          <div className="relative group/avatar">
            <div className="w-20 h-20 md:w-44 md:h-44 rounded-[28px] md:rounded-[48px] border-[4px] md:border-[8px] border-[var(--bg-primary)] overflow-hidden shadow-2xl bg-[var(--bg-card)] transition-colors duration-500">
              <img 
                src={previewPerfil || `https://ui-avatars.com/api/?name=${formData.name || 'U'}&background=a855f7&color=fff`} 
                className="w-full h-full object-cover" 
                alt="Perfil" 
              />
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-all rounded-[28px] md:rounded-[40px] cursor-pointer backdrop-blur-sm">
              <Camera className="text-white" size={20} md:w-7 md:h-7 />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'perfil')} />
            </label>
          </div>
          <div className="mb-2 md:mb-6">
            <h2 className="text-xl md:text-5xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] leading-none">
              {formData.name || t('settings.loading', 'Cargando...')}
            </h2>
            <p className="text-[rgb(var(--role-accent))] font-mono text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] mt-1">
              @{formData.username}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-20 md:mt-28 px-4 md:px-12 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-16">
          
          {/* Pestañas laterales - scroll horizontal en móvil */}
          <div className="lg:w-64 xl:w-72 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 lg:overflow-visible">
            {[
              { id: 'perfil', label: t('settings.tabs.identity', 'Identidad'), icon: <User size={16} className="md:w-[18px] md:h-[18px]" /> },
              { id: 'social', label: t('settings.tabs.contact', 'Contacto'), icon: <Globe size={16} className="md:w-[18px] md:h-[18px]" /> },
              { id: 'seguridad', label: t('settings.tabs.privacy', 'Privacidad'), icon: <Shield size={16} className="md:w-[18px] md:h-[18px]" /> },
              { id: 'preferencias', label: t('settings.tabs.preferences', 'Preferencias'), icon: <Palette size={16} className="md:w-[18px] md:h-[18px]" /> }
            ].map((item) => (
              <button 
                type="button"
                key={item.id} 
                onClick={() => setTabActiva(item.id)} 
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-4 rounded-[20px] md:rounded-[24px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 border ${
                  tabActiva === item.id ? 'bg-[var(--text-heading)] border-[var(--text-heading)] text-[var(--bg-primary)] shadow-md scale-[1.02]' : 'bg-[var(--bg-container)] text-[var(--text-body)] border-[var(--border-color)] hover:border-[var(--text-heading)]/30 hover:text-[var(--text-heading)] shadow-sm'
                }`}
              >
                {item.icon} <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido dinámico */}
          <div className="flex-1">
            <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[30px] md:rounded-[45px] p-5 md:p-12 shadow-sm transition-colors duration-500">
              
              <form onSubmit={handleSave} className="space-y-8 md:space-y-12">
                
                {/* Pestaña PERFIL */}
                {tabActiva === 'perfil' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    {[
                      { label: t('settings.form.name', 'Nombre Real'), name: 'name', icon: <User size={12} className="md:w-3.5 md:h-3.5"/> },
                      { label: t('settings.form.phone', 'Teléfono'), name: 'phone', icon: <Phone size={12} className="md:w-3.5 md:h-3.5"/> },
                      { label: t('settings.form.city', 'Ciudad'), name: 'city', icon: <MapPin size={12} className="md:w-3.5 md:h-3.5"/> },
                      { label: t('settings.form.neighborhood', 'Barrio / Localidad'), name: 'neighborhood', icon: null }
                    ].map((f) => (
                      <div key={f.name} className="space-y-2">
                        <label className="text-[8px] md:text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                          {f.icon} {f.label}
                        </label>
                        <input type="text" name={f.name} value={formData[f.name]} onChange={handleInputChange} className="w-full p-3 md:p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[18px] md:rounded-[20px] text-[var(--text-heading)] text-xs md:text-sm outline-none focus:border-[var(--text-heading)] transition-all" />
                      </div>
                    ))}
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[8px] md:text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2">
                        {t('settings.form.bio', 'Biografía Cultural')}
                      </label>
                      <textarea 
                        name="bio" value={formData.bio} onChange={handleInputChange} rows="4" 
                        className="w-full p-4 md:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] md:rounded-[30px] text-[var(--text-heading)] text-xs md:text-sm outline-none focus:border-[var(--text-heading)] resize-none shadow-inner leading-relaxed transition-all" 
                        placeholder={t('settings.form.bio_placeholder', 'Cuéntale a Popayán sobre ti...')}
                      />
                    </div>
                  </div>
                )}
                
                {/* Pestaña SOCIAL */}
                {tabActiva === 'social' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[8px] md:text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Link size={12} className="md:w-3.5 md:h-3.5"/> {t('settings.social.website_label', 'Sitio Web / Portafolio')}
                      </label>
                      <input 
                        type="url" name="website" value={formData.website} onChange={handleInputChange} 
                        placeholder={t('settings.social.website_placeholder', 'https://miportafolio.com')} 
                        className="w-full p-3 md:p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[18px] md:rounded-[20px] text-[var(--text-heading)] text-xs md:text-sm outline-none focus:border-[var(--text-heading)] transition-all" 
                      />
                    </div>
                    {[
                      { icon: Instagram, key: 'instagram', placeholder: '@usuario', labelKey: 'instagram' },
                      { icon: Facebook, key: 'facebook', placeholder: t('settings.social.facebook_placeholder', 'Enlace a tu perfil'), labelKey: 'facebook' },
                      { icon: MessageCircle, key: 'whatsapp', placeholder: '+57 300 000 0000', labelKey: 'whatsapp' },
                      { icon: Twitter, key: 'twitter', placeholder: '@usuario', labelKey: 'twitter' }
                    ].map((social) => (
                      <div key={social.key} className="space-y-2">
                        <label className="text-[8px] md:text-[9px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                          <social.icon size={12} className="md:w-3.5 md:h-3.5"/> {t(`settings.social.${social.labelKey}`, social.key)}
                        </label>
                        <input 
                          type="text" name={`social_media.${social.key}`} value={formData.social_media[social.key]} onChange={handleInputChange} 
                          placeholder={social.placeholder} 
                          className="w-full p-3 md:p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[18px] md:rounded-[20px] text-[var(--text-heading)] text-xs md:text-sm outline-none focus:border-[var(--text-heading)] transition-all" 
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Pestaña SEGURIDAD / PRIVACIDAD */}
                {tabActiva === 'seguridad' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    {[
                      { key: 'public_profile', icon: Globe, label: t('settings.privacy.public_profile', 'Perfil Público'), desc: t('settings.privacy.public_profile_desc', 'Permite que otros te encuentren.') },
                      { key: 'email_notifications', icon: Bell, label: t('settings.privacy.email_notifications', 'Notificaciones de Red'), desc: t('settings.privacy.email_notifications_desc', 'Avisos sobre interacciones.') }
                    ].map((setting) => (
                      <div key={setting.key} className="p-4 md:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] md:rounded-[30px] shadow-inner flex items-center justify-between">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-[var(--bg-container)] flex items-center justify-center text-[var(--text-heading)] border border-[var(--border-color)]">
                            <setting.icon size={14} className="md:w-[18px] md:h-[18px]" strokeWidth={1.5}/>
                          </div>
                          <div>
                            <h4 className="text-[var(--text-heading)] font-bold italic uppercase tracking-[0.2em] text-[9px] md:text-xs">{setting.label}</h4>
                            <p className="text-[var(--text-body)] text-[7px] md:text-[8px] font-mono uppercase opacity-50 mt-0.5">{setting.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name={`settings.${setting.key}`} checked={formData.settings[setting.key]} onChange={handleInputChange} className="sr-only peer" />
                          <div className="w-10 h-5 md:w-12 md:h-6 bg-[var(--border-color)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] md:after:top-[3px] md:after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 md:after:h-4.5 md:after:w-4.5 after:transition-all peer-checked:bg-[rgb(var(--role-accent))]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pestaña PREFERENCIAS */}
                {tabActiva === 'preferencias' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 animate-in fade-in slide-in-from-right-4 duration-700">
                    {[
                      { 
                        id: 'visual_mode', 
                        label: t('settings.preferences.visual_mode', 'Entorno Visual'), 
                        icon: Sun, 
                        options: [
                          { id: 'light', label: t('settings.preferences.light', 'Claro'), icon: Sun },
                          { id: 'dark', label: t('settings.preferences.dark', 'Oscuro'), icon: Moon }
                        ] 
                      },
                      { 
                        id: 'language', 
                        label: t('settings.preferences.language', 'Idioma Sistema'), 
                        icon: Type, 
                        options: [
                          { id: 'es', label: t('settings.preferences.es', 'ES'), icon: null },
                          { id: 'en', label: t('settings.preferences.en', 'EN'), icon: null }
                        ] 
                      }
                    ].map((pref) => (
                      <div key={pref.id} className="p-4 md:p-6 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[24px] md:rounded-[30px] shadow-inner">
                        <h4 className="text-[var(--text-heading)] font-bold italic uppercase tracking-[0.2em] text-[9px] md:text-xs flex items-center gap-2 mb-4 md:mb-6">
                          <pref.icon className="text-[rgb(var(--role-accent))]" size={14} strokeWidth={2.5} /> 
                          {pref.label}
                        </h4>
                        <div className="flex gap-2 md:gap-3">
                          {pref.options.map((opt) => (
                            <button 
                              key={opt.id} 
                              type="button"
                              onClick={() => handleSettingChange(pref.id, opt.id)}
                              className={`flex-1 py-2 px-2 md:py-3 md:px-4 rounded-[14px] md:rounded-[15px] text-[8px] md:text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500 border flex items-center justify-center gap-1.5 ${
                                formData.settings[pref.id] === opt.id 
                                  ? 'bg-[var(--text-heading)] border-[var(--text-heading)] text-[var(--bg-primary)] shadow-md scale-[1.02]' 
                                  : 'bg-transparent border-[var(--border-color)] text-[var(--text-body)] opacity-40 hover:opacity-100 hover:border-[var(--text-heading)]/40'
                              }`}
                            >
                              {opt.icon && <opt.icon size={10} />} {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón Guardar */}
                <div className="pt-5 md:pt-8 flex justify-end border-t border-[var(--border-color)]">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-[var(--text-heading)] text-[var(--bg-primary)] px-8 py-3 md:px-12 md:py-4 rounded-full font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] hover:opacity-90 active:scale-95 transition-all duration-300 shadow-xl flex items-center gap-2 md:gap-4 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="md:w-4 md:h-4 animate-spin" /> : <Save size={14} className="md:w-4 md:h-4" />} 
                    {loading ? t('settings.saving', 'Sincronizando...') : t('settings.save', 'Guardar Cambios')}
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