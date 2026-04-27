import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CheckCircle, AlertTriangle, Loader2, Plus, Save } from 'lucide-react';

import VisualMatrix from './creator/VisualMatrix';
import CoreFields from './creator/CoreFields';
import EventFields from './creator/EventFields';
import ProductFields from './creator/ProductFields';

const CrearObra = ({ user, data = null, obraExistente = null }) => {
  const activo = data || obraExistente;

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

  // 🔥 HIDRATACIÓN BLINDADA (Versión Senior - Anti ISO Error)
  useEffect(() => {
    if (activo) {
      if (activo.start_date || activo.event_type || activo.location) {
        setPostType('event');
        setTitle(activo.title || activo.name || '');
        setContent(activo.content || activo.description || '');
      } else if (activo.stock_quantity !== undefined || activo.product_type) {
        setPostType('product');
        setTitle(activo.name || '');
        setContent(activo.description || '');
      } else {
        setPostType('art');
        setTitle(activo.title || '');
        setContent(activo.content || '');
      }

      setCategoryId(activo.category?.id || activo.category_id || '');
      setContentTypeId(activo.content_type?.id || activo.content_type_id || '');
      setImagePreview(activo.cover_image || (activo.images && activo.images[0]) || activo.main_image || null);

      if (activo.price !== undefined) setPrice(activo.price);
      if (activo.stock_quantity !== undefined) setStock(activo.stock_quantity);
      if (activo.product_type) setProductType(activo.product_type);

      // 📅 REFINERÍA DE TEMPORALIDAD: Saneamos el string ISO de Laravel para el input HTML5
      if (activo.start_date) {
        // Normalizamos: Eliminamos la 'T' si existe, o usamos el espacio
        const cleanStart = activo.start_date.includes('T') ? activo.start_date.split('T') : activo.start_date.split(' ');
        const cleanEnd = activo.end_date?.includes('T') ? activo.end_date.split('T') : activo.end_date?.split(' ');

        setStartDate(cleanStart[0]); // Entrega 'YYYY-MM-DD' puro
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
      if (user?.user_type === 'cultural_manager') setPostType('event');
      else setPostType('art');
    }
  }, [activo, user]);

  // SINCRONIZACIÓN DE RED CON LARAVEL
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const catRes = await axios.get(`${API_URL}/categories?type=${postType === 'event' ? 'event' : postType}`);
        setCategories(catRes.data.data || []);
        
        const typeRes = await axios.get(`${API_URL}/content-types?type=${postType}`);
        setContentTypes(typeRes.data.data || []);
        
        if (postType === 'event') {
          const locRes = await axios.get(`${API_URL}/manager/locations`, { headers });
          setLocations(locRes.data.data || []);
        }
      } catch (err) { console.error(err); }
    };
    fetchCatalogs();
  }, [postType]);

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
      
      formData.append('status', status);
      formData.append('category_id', categoryId);

      let endpoint = "";

      if (postType === 'product') {
        endpoint = activo?.id ? `${API_URL}/products/${activo.id}` : `${API_URL}/products`;
        formData.append('name', title);
        formData.append('description', content);
        formData.append('price', price);
        formData.append('stock_quantity', stock);
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
        formData.append('price', price ? price : 0);
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

      if (response.data.status === 'success' || response.status === 201) {
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
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-in zoom-in duration-700">
          <CheckCircle size={64} className="text-[#a855f7] mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          <h2 className="text-4xl font-black italic text-white uppercase mb-2">{activo?.id ? 'MODIFICACIÓN EXITOSA' : 'CREACIÓN COMPLETADA'}</h2>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Sincronización total con Popayán Cultural.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] pr-6 md:pr-10 animate-in fade-in duration-700 pb-20">
      <header className="mb-10 flex flex-col gap-4 border-b border-white/5 pb-8 pt-4">
        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
            {postType === 'event' ? 'Orquestar Evento' : postType === 'product' ? 'Taller de Tienda' : 'Taller de Obra'}
        </h2>
        {!activo && (
            <div className="bg-[#111113] border border-white/5 p-1 rounded-[20px] flex w-fit mt-4">
            {allowedPostTypes.map((type) => (
                <button key={type} onClick={() => setPostType(type)} className={`px-8 py-2.5 rounded-[16px] font-black text-[9px] uppercase tracking-widest transition-all ${postType === type ? 'bg-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-white'}`}>
                {type === 'art' ? 'OBRA' : type === 'product' ? 'PRODUCTO' : 'EVENTO'}
                </button>
            ))}
            </div>
        )}
      </header>

      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-center gap-3 text-red-400 text-[10px] font-mono uppercase font-black animate-in slide-in-from-top-2"><AlertTriangle size={14} /> {error}</div>}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-[35%]">
          <VisualMatrix postType={postType} imageFile={imageFile} setImageFile={setImageFile} imagePreview={imagePreview} setImagePreview={setImagePreview} fileInputRef={fileInputRef} extraFile1={extraFile1} setExtraFile1={setExtraFile1} extraPreview1={extraPreview1} setExtraPreview1={setExtraPreview1} extraInputRef1={extraInputRef1} extraFile2={extraFile2} setExtraFile2={setExtraFile2} extraPreview2={extraPreview2} setExtraPreview2={setExtraPreview2} extraInputRef2={extraInputRef2} />
        </div>

        <div className="w-full lg:w-[65%] bg-[#111113] border border-white/5 rounded-[40px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
          <div className="space-y-8">
            <CoreFields title={title} setTitle={setTitle} categoryId={categoryId} setCategoryId={setCategoryId} categories={categories} contentTypeId={contentTypeId} setContentTypeId={setContentTypeId} contentTypes={contentTypes} postType={postType} />
            
            {postType === 'event' && <EventFields locationMode={locationMode} setLocationMode={setLocationMode} locationId={locationId} setLocationId={setLocationId} locations={locations} customLocationName={customLocationName} setCustomLocationName={setCustomLocationName} customAddress={customAddress} setCustomAddress={setCustomAddress} coords={coords} handleGetLocation={handleGetLocation} startDate={startDate} setStartDate={setStartDate} startHour={startHour} setStartHour={setStartHour} endDate={endDate} setEndDate={setEndDate} endHour={endHour} setEndHour={setEndHour} maxCapacity={maxCapacity} setMaxCapacity={setMaxCapacity} requiresRsvp={requiresRsvp} setRequiresRsvp={setRequiresRsvp} eventType={eventType} setEventType={setEventType} price={price} setPrice={setPrice} />}
            
            {postType === 'product' && <ProductFields price={price} setPrice={setPrice} stock={stock} setStock={setStock} productType={productType} setProductType={setProductType} />}
            
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Relato Cultural..." className="w-full min-h-[150px] bg-[#050505] border border-white/5 rounded-[30px] py-6 px-8 text-white outline-none resize-none shadow-inner focus:border-[#a855f7]/50 transition-all"></textarea>
            
            <button onClick={() => handleSubmit()} disabled={loading} className="w-full py-5 rounded-[30px] font-black text-xs uppercase tracking-[0.2em] bg-[#a855f7] hover:bg-purple-500 transition-all flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]">
              {loading ? <Loader2 className="animate-spin" /> : (activo?.id ? <Save size={20}/> : <Plus size={20}/>)}
              {activo?.id ? 'Guardar Cambios' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearObra;