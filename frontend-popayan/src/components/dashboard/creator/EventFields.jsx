import React from 'react';
import { MapPin, Navigation, CalendarDays, Clock, Users, Scan, DollarSign } from 'lucide-react';

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
  return (
    <div className="space-y-10 p-8 bg-[#a855f7]/[0.02] border border-[#a855f7]/10 rounded-[40px] animate-in zoom-in-95 duration-500">
      
      {/* REFERENCIA ESPACIAL */}
      <div className="space-y-4">
        <label className="text-[10px] font-black italic uppercase tracking-[0.3em] text-[#a855f7] block">Referencia Espacial</label>
        <div className="grid grid-cols-12 gap-4 bg-[#050505] p-1.5 border border-white/5 rounded-[30px]">
          <button 
            onClick={() => setLocationMode('catalog')} 
            className={`col-span-6 py-4 rounded-[24px] text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${locationMode === 'catalog' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            Registrado
          </button>
          <button 
            onClick={() => setLocationMode('custom')} 
            className={`col-span-6 py-4 rounded-[24px] text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${locationMode === 'custom' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-gray-600 hover:text-gray-400'}`}
          >
            Referencia Libre
          </button>
        </div>
      </div>

      {/* UBICACIÓN DINÁMICA */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
        {locationMode === 'catalog' ? (
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-2 tracking-widest"><MapPin size={12}/> Recinto del Catálogo</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] p-5 text-white text-sm outline-none focus:border-[#a855f7]/30 transition-all appearance-none cursor-pointer shadow-inner">
              <option value="">Selecciona un recinto...</option>
              {locations.length > 0 ? locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>) : <option disabled>Cargando espacios...</option>}
            </select>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7">
                <input type="text" value={customLocationName} onChange={(e) => setCustomLocationName(e.target.value)} placeholder="Nombre del sitio" className="w-full bg-[#050505] border border-white/5 rounded-[30px] p-5 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
              </div>
              <div className="col-span-5 flex gap-3">
                <div className="flex-1 bg-[#050505] border border-white/5 rounded-[30px] p-5 flex items-center shadow-inner overflow-hidden">
                   <span className="text-[10px] font-mono text-[#a855f7]/50 truncate">{coords.lat ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Sin GPS'}</span>
                </div>
                <button onClick={handleGetLocation} className="w-14 h-14 bg-[#a855f7] rounded-[24px] flex items-center justify-center text-white hover:bg-purple-500 transition-all shadow-lg shrink-0"><Navigation size={18} /></button>
              </div>
            </div>
            <input type="text" value={customAddress} onChange={(e) => setCustomAddress(e.target.value)} placeholder="Dirección detallada o puntos de referencia..." className="w-full bg-[#050505] border border-white/5 rounded-[30px] p-5 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
          </div>
        )}
      </div>

      {/* BENTO CHRONOS */}
      <div className="grid grid-cols-12 gap-8 pt-8 border-t border-white/5">
        <div className="col-span-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[#a855f7] tracking-[0.2em] flex items-center gap-2"><CalendarDays size={12}/> Fecha Inicio</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] p-5 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[#a855f7] tracking-[0.2em] flex items-center gap-2"><Clock size={12}/> Hora Apertura</label>
            <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] p-5 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
          </div>
        </div>
        <div className="col-span-6 space-y-6">
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[#a855f7] tracking-[0.2em] flex items-center gap-2"><CalendarDays size={12}/> Fecha Final</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-[30px] p-5 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
          </div>
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase text-[#a855f7] tracking-[0.2em] flex items-center gap-2"><Scan size={12}/> Control QR</label>
            <button 
              onClick={() => setRequiresRsvp(!requiresRsvp)} 
              className={`w-full py-5 rounded-[30px] text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${requiresRsvp ? 'bg-[#a855f7] border-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-transparent border-white/10 text-gray-600'}`}
            >
              {requiresRsvp ? 'QR ACTIVADO' : 'SIN RESERVA'}
            </button>
          </div>
        </div>
      </div>

      {/* MONETIZACIÓN Y AFORO */}
      <div className="pt-8 border-t border-white/5 space-y-6">
        <label className="text-[10px] font-black italic uppercase tracking-[0.3em] text-[#a855f7] block">Monetización y Aforo</label>
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-4 bg-[#050505] p-1.5 border border-white/5 rounded-[26px] flex">
            <button onClick={() => { setEventType('free'); setPrice(''); }} className={`flex-1 py-4 rounded-[20px] text-[8px] font-black uppercase transition-all duration-500 ${eventType === 'free' ? 'bg-[#a855f7] text-white' : 'text-gray-700'}`}>Libre</button>
            <button onClick={() => setEventType('paid')} className={`flex-1 py-4 rounded-[20px] text-[8px] font-black uppercase transition-all duration-500 ${eventType === 'paid' ? 'bg-[#a855f7] text-white' : 'text-gray-700'}`}>Pago</button>
          </div>

          {eventType === 'paid' && (
            <div className="col-span-4 relative animate-in slide-in-from-left-4 duration-500">
              <DollarSign size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a855f7]" />
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Valor COP" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
            </div>
          )}

          <div className={`${eventType === 'paid' ? 'col-span-4' : 'col-span-8'} relative transition-all duration-500`}>
            <Users size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(e.target.value)} placeholder="Tickets / Aforo Total" className="w-full bg-[#050505] border border-white/5 rounded-[30px] py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#a855f7]/30 shadow-inner" />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default EventFields;