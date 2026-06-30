import React from 'react';
import { MapPin, Navigation, CalendarDays, Clock, Users, Scan, DollarSign, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EventFields = ({
  locationMode, setLocationMode,
  locationId, setLocationId, locations,
  customLocationName, setCustomLocationName,
  customAddress, setCustomAddress,
  coords, handleGetLocation,
  startDate, setStartDate,
  startHour, setStartHour,
  endDate, setEndDate,
  endHour, setEndHour,
  maxCapacity, setMaxCapacity,
  requiresRsvp, setRequiresRsvp,
  eventType, setEventType,
  price, setPrice
}) => {
  const { t } = useTranslation();

  const getLocationTranslation = (loc) => {
    // Si los nombres de ubicaciones también están traducidos, podrías mapearlos aquí.
    // Por ahora, mostramos el nombre original.
    return loc.name;
  };

  return (
    <div className="space-y-10 p-8 bg-[rgb(var(--role-accent))]/[0.03] border border-[rgb(var(--role-accent))]/10 rounded-[40px] animate-in zoom-in-95 duration-500 transition-colors duration-500 shadow-inner">
      
      {/* REFERENCIA ESPACIAL */}
      <div className="space-y-4">
        <label className="text-[10px] font-black italic uppercase tracking-[0.3em] text-[rgb(var(--role-accent))] block transition-colors">
          {t('creator.event.location_ref', 'Referencia Espacial')}
        </label>
        <div className="grid grid-cols-12 gap-4 bg-[var(--bg-primary)] p-1.5 border border-[var(--border-color)] rounded-[30px] shadow-inner transition-colors">
          <button 
            type="button"
            onClick={() => setLocationMode('catalog')} 
            className={`col-span-6 py-4 rounded-[24px] text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${locationMode === 'catalog' ? 'bg-[rgb(var(--role-accent))] text-white shadow-lg' : 'text-[var(--text-body)] opacity-50 hover:opacity-100'}`}
          >
            {t('creator.event.catalog_location', 'Registrado')}
          </button>
          <button 
            type="button"
            onClick={() => setLocationMode('custom')} 
            className={`col-span-6 py-4 rounded-[24px] text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${locationMode === 'custom' ? 'bg-[rgb(var(--role-accent))] text-white shadow-lg' : 'text-[var(--text-body)] opacity-50 hover:opacity-100'}`}
          >
            {t('creator.event.custom_location', 'Referencia Libre')}
          </button>
        </div>
      </div>

      {/* UBICACIÓN DINÁMICA */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        {locationMode === 'catalog' ? (
          <div className="space-y-3 group">
            <label className="text-[9px] font-black uppercase text-[rgb(var(--role-accent))] flex items-center gap-2 tracking-widest transition-colors">
              <MapPin size={12}/> {t('creator.event.venue_label', 'Recinto del Catálogo')}
            </label>
            <div className="relative">
              <select 
                value={locationId} 
                onChange={(e) => setLocationId(e.target.value)} 
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all appearance-none cursor-pointer shadow-inner"
              >
                <option value="">{t('creator.event.select_venue', 'Selecciona un recinto...')}</option>
                {locations.length > 0 
                  ? locations.map(loc => <option key={loc.id} value={loc.id}>{getLocationTranslation(loc)}</option>)
                  : <option disabled>{t('creator.event.loading_venues', 'Cargando espacios...')}</option>}
              </select>
              <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] opacity-40 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7">
                <input 
                  type="text" 
                  value={customLocationName} 
                  onChange={(e) => setCustomLocationName(e.target.value)} 
                  placeholder={t('creator.event.place_name', 'Nombre del sitio')} 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:[var(--text-body)]/20" 
                />
              </div>
              <div className="col-span-5 flex gap-3">
                <div className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 flex items-center shadow-inner overflow-hidden transition-colors">
                   <span className="text-[10px] font-mono text-[rgb(var(--role-accent))]/50 truncate">
                     {coords.lat ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : t('creator.event.no_gps', 'Sin GPS')}
                   </span>
                </div>
                <button 
                  type="button" 
                  onClick={handleGetLocation} 
                  className="w-14 h-14 bg-[rgb(var(--role-accent))] rounded-[24px] flex items-center justify-center text-white hover:opacity-90 transition-all shadow-lg shrink-0 active:scale-90"
                >
                  <Navigation size={18} />
                </button>
              </div>
            </div>
            <input 
              type="text" 
              value={customAddress} 
              onChange={(e) => setCustomAddress(e.target.value)} 
              placeholder={t('creator.event.address_placeholder', 'Dirección detallada o puntos de referencia...')} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder:[var(--text-body)]/20" 
            />
          </div>
        )}
      </div>

      {/* BENTO CHRONOS */}
      <div className="grid grid-cols-12 gap-8 pt-8 border-t border-[var(--border-color)] transition-colors">
        <div className="col-span-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.2em] flex items-center gap-2 transition-colors opacity-70">
              <CalendarDays size={12}/> {t('creator.event.start_date', 'Fecha Inicio')}
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 shadow-inner transition-all color-scheme-dark" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.2em] flex items-center gap-2 transition-colors opacity-70">
              <Clock size={12}/> {t('creator.event.start_time', 'Hora Apertura')}
            </label>
            <input 
              type="time" 
              value={startHour} 
              onChange={(e) => setStartHour(e.target.value)} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 shadow-inner transition-all" 
            />
          </div>
        </div>
        <div className="col-span-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.2em] flex items-center gap-2 transition-colors opacity-70">
              <CalendarDays size={12}/> {t('creator.event.end_date', 'Fecha Final')}
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] p-5 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 shadow-inner transition-all" 
            />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[rgb(var(--role-accent))] tracking-[0.2em] flex items-center gap-2 transition-colors opacity-70">
              <Scan size={12}/> {t('creator.event.qr_control', 'Control QR')}
            </label>
            <button 
              type="button"
              onClick={() => setRequiresRsvp(!requiresRsvp)} 
              className={`w-full py-5 rounded-[30px] text-[10px] font-black uppercase tracking-widest border transition-all duration-500 shadow-sm ${requiresRsvp ? 'bg-[rgb(var(--role-accent))] border-[rgb(var(--role-accent))] text-white shadow-[0_0_20px_rgba(var(--role-accent),0.2)]' : 'bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-body)] opacity-50'}`}
            >
              {requiresRsvp ? t('creator.event.qr_active', 'QR ACTIVADO') : t('creator.event.qr_inactive', 'SIN RESERVA')}
            </button>
          </div>
        </div>
      </div>

      {/* MONETIZACIÓN Y AFORO */}
      <div className="pt-8 border-t border-[var(--border-color)] space-y-6 transition-colors">
        <label className="text-[10px] font-black italic uppercase tracking-[0.3em] text-[rgb(var(--role-accent))] block transition-colors">
          {t('creator.event.monetization', 'Monetización y Aforo')}
        </label>
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-4 bg-[var(--bg-primary)] p-1.5 border border-[var(--border-color)] rounded-[26px] flex transition-colors shadow-inner">
            <button 
              type="button" 
              onClick={() => { setEventType('free'); setPrice(''); }} 
              className={`flex-1 py-4 rounded-[20px] text-[8px] font-black uppercase transition-all duration-500 ${eventType === 'free' ? 'bg-[rgb(var(--role-accent))] text-white' : 'text-[var(--text-body)] opacity-40'}`}
            >
              {t('creator.event.free', 'Libre')}
            </button>
            <button 
              type="button" 
              onClick={() => setEventType('paid')} 
              className={`flex-1 py-4 rounded-[20px] text-[8px] font-black uppercase transition-all duration-500 ${eventType === 'paid' ? 'bg-[rgb(var(--role-accent))] text-white' : 'text-[var(--text-body)] opacity-40'}`}
            >
              {t('creator.event.paid', 'Pago')}
            </button>
          </div>

          {eventType === 'paid' && (
            <div className="col-span-4 relative animate-in slide-in-from-left-4 duration-500">
              <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[rgb(var(--role-accent))] opacity-60" />
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder={t('creator.event.price_placeholder', 'Valor COP')} 
                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-4 pl-12 pr-4 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 shadow-inner placeholder:[var(--text-body)]/20" 
              />
            </div>
          )}

          <div className={`${eventType === 'paid' ? 'col-span-4' : 'col-span-8'} relative transition-all duration-500`}>
            <Users size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-body)] opacity-30" />
            <input 
              type="number" 
              value={maxCapacity} 
              onChange={(e) => setMaxCapacity(e.target.value)} 
              placeholder={t('creator.event.capacity_placeholder', 'Tickets / Aforo Total')} 
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[30px] py-4 pl-12 pr-4 text-[var(--text-heading)] text-sm outline-none focus:border-[rgb(var(--role-accent))]/40 shadow-inner placeholder:[var(--text-body)]/20" 
            />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EventFields;