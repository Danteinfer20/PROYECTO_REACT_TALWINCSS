import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle, Loader2, Plus, Save } from 'lucide-react';

import VisualMatrix from './creator/VisualMatrix';
import CoreFields from './creator/CoreFields';
import EventFields from './creator/EventFields';
import ProductFields from './creator/ProductFields';

const CrearObra = ({ user, data = null, obraExistente = null }) => {
  const activo = data || obraExistente;

  // 🔥 MOTOR DE ACENTO DINÁMICO (Heredado del Dashboard)
  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      default: return '168 85 247';
    }
  };

  // ESTADOS MAESTROS
  const [postType, setPostType] = useState('art'); 
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contentTypeId, setContentTypeId] = useState(''); 
  const [content, setContent] = useState('');
  
  // ESTADOS DE PRODUCTO
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [productType, setProductType] = useState('physical');

  // ESTADOS DE EVENTO
  const [locationMode, setLocationMode] = useState('catalog'); 
  const [locationId, setLocationId] = useState('');
  const [customLocationName, setCustomLocationName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endHour, setEndHour] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [eventType, setEventType] = useState('free');
  const [requiresRsvp, setRequiresRsvp] = useState(false);
  
  // ESTADOS VISUALES
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [extraFile1, setExtraFile1] = useState(null);
  const [extraPreview1, setExtraPreview1] = useState(null);
  const extraInputRef1 = useRef(null);
  const [extraFile2, setExtraFile2] = useState(null);
  const [extraPreview2, setExtraPreview2] = useState(null);
  const extraInputRef2 = useRef(null);

  // RED Y CONTROL
  const [categories, setCategories] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [locations, setLocations] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const allowedPostTypes = user?.user_type === 'cultural_manager' 
    ? ['art', 'product', 'event'] 
    : ['art', 'product'];

  const handleGetLocation = (e) => {
    e?.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
        (error) => console.error("Fallo GPS:", error)
      );
    }
  };

  // 🔥 HIDRATACIÓN BLINDADA
  useEffect(() => {
    if (activo) {
      if (activo._modelType === 'EVENT' || activo.start_date || activo.event_type || activo.location) {
        setPostType('event');
        setTitle(activo.title || activo.name || '');
        setContent(activo.content || activo.description || '');
      } 
      else if (activo._modelType === 'PRODUCT' || activo.stock !== undefined || activo.type) {
        setPostType('product');
        setTitle(activo.name || '');
        setContent(activo.description || '');
      } 
      else {
        setPostType('art');
        setTitle(activo.title || '');
        setContent(activo.content || '');
      }

      setCategoryId(activo.category?.id || activo.category_id || '');
      setContentTypeId(activo.content_type?.id || activo.content_type_id || '');
      
      setImagePreview(activo.main_image || activo.cover_image || (activo.images && activo.images[0]) || null);
      if (activo.images && activo.images.length > 1) {
        setExtraPreview1(activo.images[1] || null);
      } else {
        setExtraPreview1(null);
      }
      if (activo.images && activo.images.length > 2) {
        setExtraPreview2(activo.images[2] || null);
      } else {
        setExtraPreview2(null);
      }

      if (activo.price !== undefined) setPrice(activo.price);
      if (activo.stock !== undefined) setStock(activo.stock);
      if (activo.type) setProductType(activo.type);

      if (activo.start_date) {
        const cleanStart = activo.start_date.includes('T') ? activo.start_date.split('T') : activo.start_date.split(' ');
        const cleanEnd = activo.end_date?.includes('T') ? activo.end_date.split('T') : activo.end_date?.split(' ');

        setStartDate(cleanStart[0]); 
        setStartHour(cleanStart[1] ? cleanStart[1].substring(0, 5) : '00:00');

        if (cleanEnd) {
            setEndDate(cleanEnd[0]);
            setEndHour(cleanEnd[1] ? cleanEnd[1].substring(0, 5) : '23:59');
        }

        setMaxCapacity(activo.max_capacity || '');
        setEventType(activo.event_type || 'free');
        setRequiresRsvp(activo.requires_rsvp === 1 || activo.requires_rsvp === true);
        
        if (activo.location?.id) {
          setLocationId(activo.location.id);
          setLocationMode('catalog');
        } else {
          setLocationMode('custom');
          setCustomLocationName(activo.location?.name || '');
          setCustomAddress(activo.location?.address || '');
          if (activo.location?.latitude) {
            setCoords({ lat: parseFloat(activo.location.latitude), lng: parseFloat(activo.location.longitude) });
          }
        }
      }
    } else {
      setTitle(''); setContent(''); setPrice(''); setStock(''); setProductType('physical');
      setContentTypeId(''); setCategoryId(''); 
      setImagePreview(null); setImageFile(null);
      setExtraPreview1(null); setExtraFile1(null);
      setExtraPreview2(null); setExtraFile2(null);
      
      if (user?.user_type === 'cultural_manager') setPostType('event');
      else setPostType('art');
    }
  }, [activo, user]);

  // SINCRONIZACIÓN DE RED
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const catType = postType === 'event' ? 'event' : (postType === 'product' ? 'product' : 'art');
        const catRes = await axios.get(`${API_URL}/categories?type=${catType}`);
        setCategories(catRes.data.data || []);
        
        const typeRes = await axios.get(`${API_URL}/content-types`); 
        setContentTypes(typeRes.data.data || []);
        
        if (postType === 'event') {
          const locRes = await axios.get(`${API_URL}/manager/locations`, { headers });
          setLocations(locRes.data.data || []);
        }
      } catch (err) { console.error("Error cargando catálogos", err); }
    };
    fetchCatalogs();
  }, [postType, API_URL]);

  const handleSubmit = async (status = 'published') => {
    if (!title.trim()) { setError("IDENTIFICADOR REQUERIDO."); return; }
    if (!categoryId) { setError("TAXONOMÍA REQUERIDA."); return; }

    if (postType === 'event') {
        if (!startDate) { setError("FECHA DE INICIO REQUERIDA."); return; }
        if (!endDate) { setError("FECHA FINAL REQUERIDA."); return; }
        if (locationMode === 'catalog' && !locationId) { setError("SELECCIONA UN RECINTO DEL CATÁLOGO."); return; }
        if (locationMode === 'custom' && !customLocationName.trim()) { setError("EL NOMBRE DE LA LOCACIÓN ES OBLIGATORIO."); return; }
    }

    try {
      setLoading(true); setError(null);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (activo?.id) formData.append('_method', 'PUT');
      
      const finalStatus = (postType === 'product' && status === 'published') ? 'available' : status;
      formData.append('status', finalStatus);
      formData.append('category_id', categoryId);

      let endpoint = "";

      if (postType === 'product') {
        endpoint = activo?.id ? `${API_URL}/products/${activo.id}` : `${API_URL}/products`;
        formData.append('name', title);
        formData.append('description', content);
        formData.append('price', price === '' ? 0 : price);
        formData.append('stock_quantity', stock === '' ? 0 : stock);
        formData.append('product_type', productType);
        
        if (contentTypeId) formData.append('content_type_id', contentTypeId); 
        if (imageFile) formData.append('images[]', imageFile);
        if (extraFile1) formData.append('images[]', extraFile1);
        if (extraFile2) formData.append('images[]', extraFile2);
      } 
      else if (postType === 'event') {
        endpoint = activo?.id ? `${API_URL}/events/${activo.id}` : `${API_URL}/events`;
        formData.append('title', title);
        formData.append('content', content);
        
        const finalStartDate = `${startDate} ${startHour || '00:00'}:00`;
        const finalEndDate = `${endDate} ${endHour || '23:59'}:00`;
        formData.append('start_date', finalStartDate);
        formData.append('end_date', finalEndDate);
        
        if (maxCapacity) formData.append('max_capacity', maxCapacity);
        if (eventType) formData.append('event_type', eventType);
        formData.append('price', price === '' ? 0 : price);
        formData.append('requires_rsvp', requiresRsvp ? 1 : 0);
        
        if (locationMode === 'catalog' && locationId) {
          formData.append('location_id', locationId);
        } else if (locationMode === 'custom') {
          formData.append('custom_location_name', customLocationName);
          if (customAddress) formData.append('custom_address', customAddress);
          if (coords.lat) {
            formData.append('latitude', coords.lat);
            formData.append('longitude', coords.lng);
          }
        }
        if (contentTypeId) formData.append('content_type_id', contentTypeId);
        if (imageFile) formData.append('image', imageFile);
      }
      else {
        endpoint = activo?.id ? `${API_URL}/posts/${activo.id}` : `${API_URL}/posts`;
        formData.append('title', title);
        formData.append('content', content);
        if (contentTypeId) formData.append('content_type_id', contentTypeId);
        if (imageFile) formData.append('image', imageFile);
      }

      const response = await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' }
      });

      if (response.data.status === 'success' || response.status === 201 || response.status === 200) {
        setSuccessMode(true);
        setTimeout(() => window.location.reload(), 2000); 
      }
    } catch (err) {
      const apiMsg = err.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : err.response?.data?.message || "ERROR DEL SERVIDOR";
      setError(`RECHAZO EN ${postType.toUpperCase()}: ${apiMsg}`);
    } finally { setLoading(false); }
  };

  if (successMode) {
    return (
      <div style={{ '--role-accent': getRoleAccentRGB() }} className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in zoom-in duration-700">
          <CheckCircle size={64} className="text-[rgb(var(--role-accent))] mb-6 drop-shadow-[0_0_15px_rgba(var(--role-accent),0.5)]" />
          <h2 className="text-4xl font-black italic text-[var(--text-heading)] uppercase mb-2 transition-colors">{activo?.id ? 'MODIFICACIÓN EXITOSA' : 'CREACIÓN COMPLETADA'}</h2>
          <p className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-widest transition-colors">Sincronización total con Popayán Cultural.</p>
      </div>
    );
  }

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="w-full max-w-[1600px] pr-6 md:pr-10 animate-in fade-in duration-700 pb-20 transition-colors duration-500">
      <header className="mb-10 flex flex-col gap-4 border-b border-[var(--border-color)] pb-8 pt-4">
        <h2 className="text-4xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter transition-colors">
            {postType === 'event' ? 'Orquestar Evento' : postType === 'product' ? 'Taller de Tienda' : 'Taller de Obra'}
        </h2>
        {!activo && (
            <div className="bg-[var(--bg-container)] border border-[var(--border-color)] p-1 rounded-[20px] flex w-fit mt-4 flex-wrap shadow-inner transition-colors">
            {allowedPostTypes.map((type) => (
                <button 
                  key={type} 
                  onClick={() => {
                    if (postType !== type) {
                      setPostType(type);
                      setCategoryId('');
                      setContentTypeId('');
                    }
                  }} 
                  className={`px-8 py-2.5 rounded-[16px] font-black text-[9px] uppercase tracking-widest transition-all ${postType === type ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_10px_rgba(var(--role-accent),0.4)]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
                >
                  {type === 'art' ? 'OBRA' : type === 'product' ? 'PRODUCTO' : 'EVENTO'}
                </button>
            ))}
            </div>
        )}
      </header>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-center gap-3 text-red-500 text-[10px] font-mono uppercase font-black animate-in slide-in-from-top-2"><AlertTriangle size={14} /> {error}</div>}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[35%]">
          <VisualMatrix postType={postType} imageFile={imageFile} setImageFile={setImageFile} imagePreview={imagePreview} setImagePreview={setImagePreview} fileInputRef={fileInputRef} extraFile1={extraFile1} setExtraFile1={setExtraFile1} extraPreview1={extraPreview1} setExtraPreview1={setExtraPreview1} extraInputRef1={extraInputRef1} extraFile2={extraFile2} setExtraFile2={setExtraFile2} extraPreview2={extraPreview2} setExtraPreview2={setExtraPreview2} extraInputRef2={extraInputRef2} />
        </div>

        <div className="w-full lg:w-[65%] bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 lg:p-12 shadow-sm relative overflow-hidden transition-colors">
          <div className="space-y-8">
            <CoreFields title={title} setTitle={setTitle} categoryId={categoryId} setCategoryId={setCategoryId} categories={categories} contentTypeId={contentTypeId} setContentTypeId={setContentTypeId} contentTypes={contentTypes} postType={postType} />
            
            {postType === 'event' && <EventFields locationMode={locationMode} setLocationMode={setLocationMode} locationId={locationId} setLocationId={setLocationId} locations={locations} customLocationName={customLocationName} setCustomLocationName={setCustomLocationName} customAddress={customAddress} setCustomAddress={setCustomAddress} coords={coords} handleGetLocation={handleGetLocation} startDate={startDate} setStartDate={setStartDate} startHour={startHour} setStartHour={setStartHour} endDate={endDate} setEndDate={setEndDate} endHour={endHour} setEndHour={setEndHour} maxCapacity={maxCapacity} setMaxCapacity={setMaxCapacity} requiresRsvp={requiresRsvp} setRequiresRsvp={setRequiresRsvp} eventType={eventType} setEventType={setEventType} price={price} setPrice={setPrice} />}
            
            {postType === 'product' && <ProductFields price={price} setPrice={setPrice} stock={stock} setStock={setStock} productType={productType} setProductType={setProductType} />}
            
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Relato Cultural..." 
                className="w-full min-h-[150px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-6 px-8 text-[var(--text-heading)] outline-none resize-none shadow-inner focus:border-[rgb(var(--role-accent))]/50 transition-all placeholder:[var(--text-body)]/40"
            ></textarea>
            
            <button onClick={() => handleSubmit()} disabled={loading} className="w-full py-5 rounded-[30px] font-black text-[11px] uppercase tracking-[0.2em] bg-[rgb(var(--role-accent))] text-white hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-[0_10px_20px_rgba(var(--role-accent),0.3)] disabled:opacity-50 active:scale-95">
              {loading ? <Loader2 className="animate-spin" size={20} /> : (activo?.id ? <Save size={20}/> : <Plus size={20}/>)}
              {activo?.id ? 'Guardar Cambios' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearObra;