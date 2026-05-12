import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, MapPin, Users, Trash2, 
  Edit3, Search
} from 'lucide-react';

const MisEventosView = ({ user, onEditRequest }) => { 
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
    <div className="p-6 lg:p-8 w-full animate-in fade-in duration-700 transition-colors duration-500">
      
      <header className="mb-6 max-w-[1400px] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="border-l-4 border-[rgb(var(--role-accent))] pl-4 transition-colors duration-500">
          <h1 className="text-2xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] transition-colors">
            Agenda <span className="text-[rgb(var(--role-accent))]">Cultural</span>
          </h1>
          <p className="text-[var(--text-body)] text-[8px] font-black uppercase tracking-[0.2em] mt-0.5 opacity-80">
            CATÁLOGO DE OBRAS Y EVENTOS DEL GESTOR
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[var(--bg-container)] px-4 py-2 rounded-lg border border-[var(--border-color)] transition-colors duration-500 shadow-sm">
          <Users size={12} className="text-[rgb(var(--role-accent))]" />
          <span className="text-[9px] font-bold text-[var(--text-body)] uppercase tracking-widest">
            {eventos.length} ACTIVOS
          </span>
        </div>
      </header>

      <div className="mb-8 max-w-sm">
        <div className="relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
          <input 
            type="text" 
            placeholder="Filtrar por título o recinto..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-[10px] font-mono rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all placeholder:text-[var(--text-body)]/60 shadow-inner"
          />
        </div>
      </div>

      <div className="max-w-[1400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {eventosFiltrados.map((evento) => {
              const eventDate = new Date(evento.start_date);
              const asistentes = (evento.max_capacity || 0) - (evento.available_slots || 0);

              return (
                <div key={evento.id} className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] overflow-hidden group hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 flex flex-col shadow-sm hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))]">
                  
                  <div className="relative h-32 w-full overflow-hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)] transition-colors duration-500">
                    <img 
                        src={evento.cover_image || 'https://via.placeholder.com/600x400/0A0A0C/FFFFFF?text=POPAYÁN'} 
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                        alt={evento.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent transition-colors duration-500" />
                    <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-md bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/20 text-[7px] font-black text-[rgb(var(--role-accent))] uppercase tracking-widest backdrop-blur-sm shadow-sm">
                            {evento.event_type === 'free' ? 'GRATIS' : 'PAGO'}
                        </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col transition-colors duration-500">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col items-center justify-center shadow-inner transition-colors duration-500">
                        <span className="text-[6px] font-black text-[rgb(var(--role-accent))] uppercase leading-none mb-0.5">
                            {eventDate.toLocaleString('es-ES', { month: 'short' })}
                        </span>
                        <span className="text-sm font-black text-[var(--text-heading)] leading-none">{eventDate.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[var(--text-heading)] uppercase italic tracking-tighter leading-tight group-hover:text-[rgb(var(--role-accent))] transition-colors truncate">
                          {evento.title}
                        </h3>
                        <p className="text-[8px] text-[var(--text-body)] flex items-center gap-1 font-mono mt-1 uppercase truncate">
                          <MapPin size={8} className="text-[rgb(var(--role-accent))]/60"/> {evento.location?.name || 'POR CONFIRMAR'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 px-1 rounded-xl flex flex-col items-center shadow-inner transition-colors duration-500">
                        <span className="text-[6px] text-[var(--text-body)] uppercase font-black mb-0.5 tracking-tighter">Inscritos</span>
                        <span className="text-[var(--text-heading)] text-[10px] font-black transition-colors">
                            {asistentes}<span className="text-[var(--text-body)] mx-0.5">/</span>{evento.max_capacity || '∞'}
                        </span>
                      </div>
                      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] py-2 px-1 rounded-xl flex flex-col items-center shadow-inner transition-colors duration-500">
                        <span className="text-[6px] text-[var(--text-body)] uppercase font-black mb-0.5 tracking-tighter">Costo</span>
                        <span className="text-[rgb(var(--role-accent))] text-[10px] font-black">{evento.price > 0 ? `$${evento.price}` : 'GRATIS'}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between transition-colors duration-500">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEliminar(evento.id)}
                          className="p-2 rounded-lg bg-red-500/5 text-red-500/80 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 shadow-sm"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleEditar(evento)}
                          className="p-2 rounded-lg bg-[var(--text-heading)]/5 text-[var(--text-body)] hover:bg-[rgb(var(--role-accent))] hover:text-white hover:border-transparent transition-all border border-[var(--border-color)] shadow-sm"
                        >
                          <Edit3 size={12} />
                        </button>
                      </div>
                      <button onClick={() => handleEditar(evento)} className="text-[8px] font-black text-[rgb(var(--role-accent))] uppercase tracking-widest px-4 py-2 bg-[rgb(var(--role-accent))]/10 rounded-lg hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all border border-[rgb(var(--role-accent))]/20 shadow-sm">
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