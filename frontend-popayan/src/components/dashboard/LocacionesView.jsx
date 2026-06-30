import React, { useState, useEffect } from 'react';
import { 
  MapPin, PlusCircle, Search, Edit3, 
  Map, Theater, Landmark, TreePine, 
  Building2, School, Coffee, Users
} from 'lucide-react';
import api from '../../services/api'; // ✅ Ruta correcta desde dashboard

const LocacionesView = ({ user, onEditRequest }) => {
  const [locaciones, setLocaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  const fetchLocaciones = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/manager/locations'); // ✅ Usa api centralizada
      if (response.data.status === 'success') {
        setLocaciones(response.data.data);
      } else {
        console.error("Error al obtener locaciones:", response.data);
      }
    } catch (error) {
      console.error("Error cargando locaciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocaciones();
  }, []);

  const locacionesFiltradas = locaciones.filter(loc => 
    loc.name.toLowerCase().includes(busqueda.toLowerCase()) || 
    (loc.neighborhood && loc.neighborhood.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getLocationIcon = (type) => {
    switch(type) {
      case 'theater': return <Theater size={16} className="text-purple-500" />;
      case 'museum': 
      case 'gallery': return <Landmark size={16} className="text-amber-500" />;
      case 'park': 
      case 'street': return <TreePine size={16} className="text-emerald-500" />;
      case 'educational_center': 
      case 'library': return <School size={16} className="text-blue-500" />;
      case 'cultural_center':
      case 'auditorium': return <Building2 size={16} className="text-teal-500" />;
      default: return <MapPin size={16} className="text-[var(--text-body)]" />;
    }
  };

  return (
    <div className="p-8 lg:p-12 w-full animate-in fade-in zoom-in-95 duration-700 transition-colors duration-500">
      
      {/* HEADER DE LOCACIONES */}
      <header className="mb-10 max-w-[1400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm flex items-center gap-4 transition-colors">
              Gestión de <span className="text-[rgb(var(--role-accent))] drop-shadow-[0_0_15px_rgba(var(--role-accent),0.3)]">Espacios</span>
            </h1>
            <p className="text-[var(--text-body)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-[rgb(var(--role-accent))]/50 pl-4 transition-colors">
              Inventario de Recintos y Bienes Raíces Culturales
            </p>
          </div>
          
          <button 
            onClick={() => onEditRequest && onEditRequest(null)}
            className="flex items-center gap-3 bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all shadow-sm hover:shadow-[0_10px_30px_rgba(var(--role-accent),0.4)]"
          >
            <PlusCircle size={18} /> Registrar Espacio
          </button>
        </div>
      </header>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="mb-8 max-w-[1400px]">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nombre o barrio..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-xs font-mono rounded-[30px] pl-10 pr-4 py-3.5 focus:outline-none focus:border-[rgb(var(--role-accent))]/50 focus:ring-1 focus:ring-[rgb(var(--role-accent))]/30 transition-all placeholder-[var(--text-body)]/60 shadow-inner"
          />
        </div>
      </div>

      {/* GRID DE LOCACIONES */}
      <div className="max-w-[1400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] p-6 flex gap-6 animate-pulse">
                <div className="w-32 h-32 bg-[var(--bg-primary)] rounded-[16px] shrink-0 border border-[var(--border-color)]"></div>
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-6 bg-[var(--bg-primary)] rounded w-3/4"></div>
                  <div className="h-4 bg-[var(--bg-primary)] rounded w-1/2"></div>
                  <div className="h-3 bg-[var(--bg-primary)] rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : locacionesFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[var(--bg-container)]/50 rounded-[32px] border border-dashed border-[var(--border-color)] transition-colors duration-500">
            <div className="w-24 h-24 rounded-full bg-[rgb(var(--role-accent))]/5 flex items-center justify-center mb-6 border border-[rgb(var(--role-accent))]/20 shadow-inner">
              <Map size={40} className="text-[rgb(var(--role-accent))]/50"/>
            </div>
            <h3 className="text-xl font-bold italic text-[var(--text-heading)] uppercase mb-2 transition-colors">Bolsa de Espacios Vacía</h3>
            <p className="text-[11px] font-mono tracking-widest uppercase text-[var(--text-body)] max-w-md text-center transition-colors">
              No tienes locaciones registradas. Añade teatros, plazas o galerías para poder orquestar eventos en ellos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {locacionesFiltradas.map((loc) => {
              return (
                <div key={loc.id} className="bg-[var(--bg-card)] rounded-[24px] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 group flex flex-col sm:flex-row overflow-hidden relative shadow-sm hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))]">
                  
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0 bg-[var(--bg-primary)] border-b sm:border-b-0 sm:border-r border-[var(--border-color)] transition-colors duration-500">
                    {loc.photo ? (
                      <img 
                        src={loc.photo} 
                        alt={loc.name} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--text-heading)]/[0.02]">
                        <Building2 size={32} className="text-[var(--text-heading)]/20 mb-2" />
                        <span className="text-[8px] font-mono uppercase tracking-widest text-[var(--text-body)]">Sin Foto</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between relative z-10 bg-[var(--bg-card)] transition-colors duration-500">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-md bg-[var(--bg-container)] border border-[var(--border-color)] text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit shadow-sm transition-colors duration-500">
                          {getLocationIcon(loc.location_type)}
                          <span className="text-[var(--text-body)]">{loc.location_type?.replace('_', ' ') || 'General'}</span>
                        </span>
                        
                        {loc.is_accessible && (
                           <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20 font-bold tooltip shadow-sm" title="Espacio Accesible">
                              ♿
                           </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-[var(--text-heading)] leading-tight mb-1 group-hover:text-[rgb(var(--role-accent))] transition-colors">
                        {loc.name}
                      </h3>
                      
                      <div className="space-y-1 mt-3">
                        <p className="text-[11px] text-[var(--text-body)] flex items-center gap-2 font-mono transition-colors">
                          <MapPin size={12} className="text-[rgb(var(--role-accent))]/60 shrink-0"/> 
                          <span className="truncate">{loc.address} {loc.neighborhood ? `, ${loc.neighborhood}` : ''}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between transition-colors duration-500">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] shadow-inner transition-colors duration-500">
                          <Users size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-body)] transition-colors">Aforo Máx.</span>
                          <span className="text-sm font-mono text-[var(--text-heading)] leading-none transition-colors">{loc.capacity || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => onEditRequest && onEditRequest(loc)}
                        className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] hover:text-white hover:border-transparent hover:bg-[rgb(var(--role-accent))] transition-all shadow-sm group-hover:-translate-x-1"
                      >
                        <Edit3 size={16} />
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

export default LocacionesView;