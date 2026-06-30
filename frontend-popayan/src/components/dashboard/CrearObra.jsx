import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertTriangle, Loader2, Plus, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

import VisualMatrix from './creator/VisualMatrix';
import CoreFields from './creator/CoreFields';
import EventFields from './creator/EventFields';
import ProductFields from './creator/ProductFields';

const CrearObra = ({ user, data = null, obraExistente = null }) => {
  const { t } = useTranslation();
  const activo = data || obraExistente;

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

  // Estados maestros
  const [postType, setPostType] = useState('art');
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contentTypeId, setContentTypeId] = useState('');
  const [content, setContent] = useState('');
  
  // Producto
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [productType, setProductType] = useState('physical');

  // Evento
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
  
  // Imágenes
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [extraFile1, setExtraFile1] = useState(null);
  const [extraPreview1, setExtraPreview1] = useState(null);
  const extraInputRef1 = useRef(null);
  const [extraFile2, setExtraFile2] = useState(null);
  const [extraPreview2, setExtraPreview2] = useState(null);
  const extraInputRef2 = useRef(null);

  const [categories, setCategories] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMode, setSuccessMode] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (activo) {
      if (activo._modelType === 'EVENT' || activo.start_date || activo.event_type || activo.location) {
        setPostType('event');
        setTitle(activo.title || activo.name || '');
        setContent(activo.content || activo.description || '');
      } else if (activo._modelType === 'PRODUCT' || activo.stock !== undefined || activo.type) {
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
      setImagePreview(activo.main_image || activo.cover_image || (activo.images && activo.images[0]) || null);
      if (activo.images && activo.images[1]) setExtraPreview1(activo.images[1]);
      if (activo.images && activo.images[2]) setExtraPreview2(activo.images[2]);

      if (activo.price !== undefined) setPrice(activo.price);
      if (activo.stock !== undefined) setStock(activo.stock);
      if (activo.type) setProductType(activo.type);

      if (activo.start_date) {
        // ✅ FIX: El Resource ahora devuelve "2026-06-26T10:00:00" (ISO sin Z, hora Bogotá)
        // Separamos por T o espacio para obtener fecha y hora por separado
        const sepStart = activo.start_date.includes('T') ? 'T' : ' ';
        const [startDatePart, startTimePart] = activo.start_date.split(sepStart);
        setStartDate(startDatePart);
        setStartHour(startTimePart ? startTimePart.substring(0, 5) : '00:00');

        if (activo.end_date) {
          const sepEnd = activo.end_date.includes('T') ? 'T' : ' ';
          const [endDatePart, endTimePart] = activo.end_date.split(sepEnd);
          setEndDate(endDatePart);
          setEndHour(endTimePart ? endTimePart.substring(0, 5) : '23:59');
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
      // Reset al crear nuevo
      setTitle(''); setContent(''); setPrice(''); setStock(''); setProductType('physical');
      setContentTypeId(''); setCategoryId('');
      setImagePreview(null); setImageFile(null);
      setExtraPreview1(null); setExtraFile1(null);
      setExtraPreview2(null); setExtraFile2(null);
      if (user?.user_type === 'cultural_manager') setPostType('event');
      else setPostType('art');
    }
  }, [activo, user]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const catType = postType === 'event' ? 'event' : (postType === 'product' ? 'product' : 'art');
        
        const catRes = await api.get(`/categories?type=${catType}`);
        setCategories(catRes.data.data || []);
        
        const typeRes = await api.get('/content-types');
        setContentTypes(typeRes.data.data || []);
        
        if (postType === 'event') {
          const locRes = await api.get('/manager/locations');
          setLocations(locRes.data.data || []);
        }
      } catch (err) {
        console.error("Error cargando catálogos", err);
        setError("No se pudieron cargar las categorías o tipos de contenido.");
      }
    };
    fetchCatalogs();
  }, [postType]);

  const handleSubmit = async (status = 'published') => {
    if (!title.trim()) { setError(t('creator.error.title_required', 'IDENTIFICADOR REQUERIDO.')); return; }
    if (!categoryId) { setError(t('creator.error.category_required', 'TAXONOMÍA REQUERIDA.')); return; }
    if (postType === 'event') {
      if (!startDate) { setError(t('creator.error.start_date_required', 'FECHA DE INICIO REQUERIDA.')); return; }
      if (!endDate) { setError(t('creator.error.end_date_required', 'FECHA FINAL REQUERIDA.')); return; }
      if (locationMode === 'catalog' && !locationId) { setError(t('creator.error.location_catalog_required', 'SELECCIONA UN RECINTO DEL CATÁLOGO.')); return; }
      if (locationMode === 'custom' && !customLocationName.trim()) { setError(t('creator.error.custom_location_required', 'EL NOMBRE DE LA LOCACIÓN ES OBLIGATORIO.')); return; }
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
        endpoint = activo?.id ? `/products/${activo.id}` : '/products';
        formData.append('name', title);
        formData.append('description', content);
        formData.append('price', price === '' ? 0 : price);
        formData.append('stock_quantity', stock === '' ? 0 : stock);
        formData.append('product_type', productType);
        if (contentTypeId) formData.append('content_type_id', contentTypeId);
        if (imageFile) formData.append('images[]', imageFile);
        if (extraFile1) formData.append('images[]', extraFile1);
        if (extraFile2) formData.append('images[]', extraFile2);
      } else if (postType === 'event') {
        endpoint = activo?.id ? `/events/${activo.id}` : '/events';
        formData.append('title', title);
        formData.append('content', content);
        // ✅ FIX: enviamos la hora tal como la muestra el formulario (ya es hora Bogotá)
        // El backend la recibirá y convertirá a UTC correctamente
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
      } else {
        endpoint = activo?.id ? `/posts/${activo.id}` : '/posts';
        formData.append('title', title);
        formData.append('content', content);
        if (contentTypeId) formData.append('content_type_id', contentTypeId);
        if (imageFile) formData.append('image', imageFile);
      }

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.status === 'success' || response.status === 201 || response.status === 200) {
        setSuccessMode(true);
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      const apiMsg = err.response?.data?.errors ? Object.values(err.response.data.errors)[0][0] : err.response?.data?.message || "ERROR DEL SERVIDOR";
      setError(`${t('creator.error.submit_prefix', 'RECHAZO EN')} ${postType.toUpperCase()}: ${apiMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (successMode) {
    return (
      <div style={{ '--role-accent': getRoleAccentRGB() }} className="flex flex-col items-center justify-center h-full min-h-[400px] md:min-h-[600px] animate-in zoom-in duration-700">
        <CheckCircle size={48} className="md:w-16 md:h-16 text-[rgb(var(--role-accent))] mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(var(--role-accent),0.5)]" />
        <h2 className="text-2xl md:text-4xl font-bold italic text-[rgb(var(--role-accent))] uppercase mb-2 text-center">
          {activo?.id ? t('creator.success.edit', 'MODIFICACIÓN EXITOSA') : t('creator.success.create', 'CREACIÓN COMPLETADA')}
        </h2>
        <p className="text-[var(--text-body)] font-mono text-[9px] md:text-[10px] uppercase tracking-widest text-center">
          {t('creator.success.message', 'Sincronización total con Popayán Cultural.')}
        </p>
      </div>
    );
  }

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 md:py-8 pb-12 md:pb-20 transition-colors duration-500">
      <header className="mb-6 md:mb-8 flex flex-col gap-3 border-b border-[var(--border-color)] pb-4 md:pb-6">
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[rgb(var(--role-accent))]">
          {postType === 'event' ? t('creator.header.event', 'Orquestar Evento') : 
           postType === 'product' ? t('creator.header.product', 'Taller de Tienda') : 
           t('creator.header.art', 'Taller de Obra')}
        </h1>
        {!activo && (
          <div className="flex gap-2 flex-wrap mt-1 md:mt-2">
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
                className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full text-[10px] md:text-xs font-medium uppercase tracking-wider transition-all ${
                  postType === type
                    ? 'bg-[rgb(var(--role-accent))] text-white shadow-sm'
                    : 'bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-body)] hover:text-[var(--text-heading)] hover:border-[rgb(var(--role-accent))]/40'
                }`}
              >
                {type === 'art' ? t('creator.tabs.art', 'OBRA') : 
                 type === 'product' ? t('creator.tabs.product', 'PRODUCTO') : 
                 t('creator.tabs.event', 'EVENTO')}
              </button>
            ))}
          </div>
        )}
      </header>

      {error && (
        <div className="mb-5 md:mb-6 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 md:gap-3 text-red-500 text-[10px] md:text-xs font-mono font-semibold animate-in slide-in-from-top-2">
          <AlertTriangle size={12} className="md:w-3.5 md:h-3.5" /> {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="w-full lg:w-2/5">
          <VisualMatrix
            postType={postType}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            fileInputRef={fileInputRef}
            extraFile1={extraFile1}
            setExtraFile1={setExtraFile1}
            extraPreview1={extraPreview1}
            setExtraPreview1={setExtraPreview1}
            extraInputRef1={extraInputRef1}
            extraFile2={extraFile2}
            setExtraFile2={setExtraFile2}
            extraPreview2={extraPreview2}
            setExtraPreview2={setExtraPreview2}
            extraInputRef2={extraInputRef2}
          />
        </div>

        <div className="w-full lg:w-3/5 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 md:p-8 shadow-sm relative">
          <div className="space-y-5 md:space-y-6">
            <CoreFields
              title={title}
              setTitle={setTitle}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              categories={categories}
              contentTypeId={contentTypeId}
              setContentTypeId={setContentTypeId}
              contentTypes={contentTypes}
              postType={postType}
            />

            {postType === 'event' && (
              <EventFields
                locationMode={locationMode}
                setLocationMode={setLocationMode}
                locationId={locationId}
                setLocationId={setLocationId}
                locations={locations}
                customLocationName={customLocationName}
                setCustomLocationName={setCustomLocationName}
                customAddress={customAddress}
                setCustomAddress={setCustomAddress}
                coords={coords}
                handleGetLocation={handleGetLocation}
                startDate={startDate}
                setStartDate={setStartDate}
                startHour={startHour}
                setStartHour={setStartHour}
                endDate={endDate}
                setEndDate={setEndDate}
                endHour={endHour}
                setEndHour={setEndHour}
                maxCapacity={maxCapacity}
                setMaxCapacity={setMaxCapacity}
                requiresRsvp={requiresRsvp}
                setRequiresRsvp={setRequiresRsvp}
                eventType={eventType}
                setEventType={setEventType}
                price={price}
                setPrice={setPrice}
              />
            )}

            {postType === 'product' && (
              <ProductFields
                price={price}
                setPrice={setPrice}
                stock={stock}
                setStock={setStock}
                productType={productType}
                setProductType={setProductType}
              />
            )}

            <div>
              <label className="block text-[10px] md:text-xs font-mono uppercase tracking-wider text-[rgb(var(--role-accent))]/80 mb-1.5 md:mb-2">
                {t('creator.content_label', 'Contenido / Relato')}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('creator.content_placeholder', 'Escribe el relato cultural...')}
                rows={5}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 md:py-3 md:px-4 text-[var(--text-heading)] text-xs md:text-sm outline-none resize-none focus:border-[rgb(var(--role-accent))]/50 transition-all placeholder:text-[var(--text-body)]/40"
              />
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="w-full py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm uppercase tracking-wider bg-[rgb(var(--role-accent))] text-white hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-98"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (activo?.id ? <Save size={16} /> : <Plus size={16} />)}
              {activo?.id ? t('creator.save_button', 'Guardar Cambios') : t('creator.publish_button', 'Publicar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearObra;