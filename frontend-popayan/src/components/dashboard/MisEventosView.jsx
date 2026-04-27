import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, MapPin, Users, Trash2, 
  Edit3, Search
} from 'lucide-react';

const MisEventosView = ({ user, onEditRequest }) => { // 🔥 Cambiado para usar el estándar onEditRequest
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchEventos = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/manager/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const json = await response.json();
        if (json.status === 'success') setEventos(json.data);
      } catch (error) {
        console.error("Error en Agenda:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEventos();
  }, [API_URL]);

  // 🔥 SOLUCIÓN A LA PANTALLA NEGRA:
  // Ahora envía el evento directamente al orquestador maestro que ya sabe manejarlo.
  const handleEditar = (evento) => {
    if (onEditRequest) {
      onEditRequest(evento); 
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Confirmas la eliminación de este evento?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEventos(eventos.filter(ev => ev.id !== id));
      }
    } catch (error) {
      console.error("Fallo en la eliminación:", error);
    }
  };

  const eventosFiltrados = eventos.filter(ev => 
    ev.title.toLowerCase().includes(busqueda.toLowerCase()) || 
    (ev.location?.name && ev.location.name.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-8 w-full animate-in fade-in duration-700">
      
      <header className="mb-6 max-w-[1400px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="border-l-4 border-[#10B981] pl-4">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Agenda <span className="text-[#10B981]">Cultural</span>
          </h1>
          <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
            CATÁLOGO DE OBRAS Y EVENTOS DEL GESTOR
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#111113] px-4 py-2 rounded-lg border border-white/5">
          <Users size={12} className="text-[#10B981]" />
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
            {eventos.length} ACTIVOS
          </span>
        </div>
      </header>

      <div className="mb-8 max-w-sm">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#10B981] transition-colors" />
          <input 
            type="text" 
            placeholder="Filtrar por título o recinto..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#111113] border border-white/5 text-white text-[10px] font-mono rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#10B981]/40 transition-all placeholder:text-gray-700"
          />
        </div>
      </div>

      <div className="max-w-[1400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-[#111113] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {eventosFiltrados.map((evento) => {
              const eventDate = new Date(evento.start_date);
              const asistentes = (evento.max_capacity || 0) - (evento.available_slots || 0);

              return (
                <div key={evento.id} className="bg-[#111113] rounded-[24px] border border-white/5 overflow-hidden group hover:border-[#10B981]/40 transition-all duration-500 flex flex-col shadow-2xl">
                  
                  <div className="relative h-32 w-full overflow-hidden bg-black">
                    <img 
                        src={evento.cover_image || 'https://via.placeholder.com/600x400/0A0A0C/FFFFFF?text=POPAYÁN'} 
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                        alt={evento.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent" />
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#10B981]/20 border border-[#10B981]/30 text-[7px] font-black text-[#10B981] uppercase tracking-widest backdrop-blur-sm">
                            {evento.event_type === 'free' ? 'GRATIS' : 'PAGO'}
                        </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center justify-center">
                        <span className="text-[6px] font-black text-[#10B981] uppercase leading-none mb-0.5">
                            {eventDate.toLocaleString('es-ES', { month: 'short' })}
                        </span>
                        <span className="text-sm font-black text-white leading-none">{eventDate.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-[#10B981] transition-colors truncate">
                          {evento.title}
                        </h3>
                        <p className="text-[8px] text-gray-600 flex items-center gap-1 font-mono mt-1 uppercase truncate">
                          <MapPin size={8} className="text-[#10B981]/60"/> {evento.location?.name || 'POR CONFIRMAR'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-[#0A0A0C] border border-white/5 py-2 px-1 rounded-xl flex flex-col items-center">
                        <span className="text-[6px] text-gray-700 uppercase font-black mb-0.5 tracking-tighter">Inscritos</span>
                        <span className="text-white text-[10px] font-black">
                            {asistentes}<span className="text-gray-700 mx-0.5">/</span>{evento.max_capacity || '∞'}
                        </span>
                      </div>
                      <div className="bg-[#0A0A0C] border border-white/5 py-2 px-1 rounded-xl flex flex-col items-center">
                        <span className="text-[6px] text-gray-700 uppercase font-black mb-0.5 tracking-tighter">Costo</span>
                        <span className="text-[#10B981] text-[10px] font-black">{evento.price > 0 ? `$${evento.price}` : 'GRATIS'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEliminar(evento.id)}
                          className="p-2 rounded-lg bg-red-500/5 text-red-500/60 hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleEditar(evento)}
                          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-[#10B981] hover:text-white transition-all border border-white/10"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                      <button className="text-[8px] font-black text-[#10B981] uppercase tracking-widest px-4 py-2 bg-[#10B981]/5 rounded-lg hover:bg-[#10B981] hover:text-white transition-all border border-[#10B981]/10">
                        GESTIONAR
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisEventosView;