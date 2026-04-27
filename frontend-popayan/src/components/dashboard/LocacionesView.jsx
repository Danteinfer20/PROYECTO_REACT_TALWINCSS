import React, { useState, useEffect } from 'react';
import { 
  MapPin, PlusCircle, Search, Edit3, 
  Map, Theater, Landmark, TreePine, 
  Building2, School, Coffee, Users
} from 'lucide-react';

// 🔥 CORRECCIÓN 1: Recibimos onEditRequest en lugar de setSeccionActiva
const LocacionesView = ({ user, onEditRequest }) => {
  const [locaciones, setLocaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 🧠 Conexión Real con Laravel (Data-First)
  useEffect(() => {
    const fetchLocaciones = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No hay token de sesión");

        const response = await fetch('http://localhost:8000/api/v1/manager/locations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error("Error al obtener las locaciones");
        
        const json = await response.json();
        if (json.status === 'success') {
          setLocaciones(json.data);
        }
      } catch (error) {
        console.error("Error cargando locaciones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocaciones();
  }, []);

  // Filtrado de locaciones por la barra de búsqueda
  const locacionesFiltradas = locaciones.filter(loc => 
    loc.name.toLowerCase().includes(busqueda.toLowerCase()) || 
    (loc.neighborhood && loc.neighborhood.toLowerCase().includes(busqueda.toLowerCase()))
  );

  // Selector visual de Iconos según el location_type de PostgreSQL
  const getLocationIcon = (type) => {
    switch(type) {
      case 'theater': return <Theater size={16} className="text-purple-400" />;
      case 'museum': 
      case 'gallery': return <Landmark size={16} className="text-amber-400" />;
      case 'park': 
      case 'street': return <TreePine size={16} className="text-emerald-400" />;
      case 'educational_center': 
      case 'library': return <School size={16} className="text-blue-400" />;
      case 'cultural_center':
      case 'auditorium': return <Building2 size={16} className="text-teal-400" />;
      default: return <MapPin size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-8 lg:p-12 w-full animate-in fade-in zoom-in-95 duration-700">
      
      {/* HEADER DE LOCACIONES */}
      <header className="mb-10 max-w-[1400px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg flex items-center gap-4">
              Gestión de <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">Espacios</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-emerald-500/50 pl-4">
              Inventario de Recintos y Bienes Raíces Culturales
            </p>
          </div>
          
          <button 
            // 🔥 CORRECCIÓN 2: El botón ahora dispara onEditRequest(null) para abrir el form vacío
            onClick={() => onEditRequest && onEditRequest(null)}
            className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            <PlusCircle size={18} /> Registrar Espacio
          </button>
        </div>
      </header>

      {/* BARRA DE HERRAMIENTAS (Solo Buscador) */}
      <div className="mb-8 max-w-[1400px]">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nombre o barrio..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#111113] border border-white/5 text-white text-xs font-mono rounded-[30px] pl-10 pr-4 py-3.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* GRID DE LOCACIONES */}
      <div className="max-w-[1400px]">
        {isLoading ? (
          // Skeletons de Carga (Estilo Lista Bento)
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-[#111113] rounded-[24px] border border-white/5 p-6 flex gap-6 animate-pulse">
                <div className="w-32 h-32 bg-white/5 rounded-[16px] shrink-0"></div>
                <div className="flex-1 space-y-4 py-2">
                  <div className="h-6 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded w-1/2"></div>
                  <div className="h-3 bg-white/5 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : locacionesFiltradas.length === 0 ? (
          // Estado Vacío Real (Zero State)
          <div className="flex flex-col items-center justify-center py-24 bg-[#111113] rounded-[32px] border border-dashed border-white/10">
            <div className="w-24 h-24 rounded-full bg-emerald-500/5 flex items-center justify-center mb-6 border border-emerald-500/20">
              <Map size={40} className="text-emerald-500/50"/>
            </div>
            <h3 className="text-xl font-black italic text-white uppercase mb-2">Bolsa de Espacios Vacía</h3>
            <p className="text-[11px] font-mono tracking-widest uppercase text-gray-500 max-w-md text-center">
              No tienes locaciones registradas. Añade teatros, plazas o galerías para poder orquestar eventos en ellos.
            </p>
          </div>
        ) : (
          // Tarjetas de Locaciones (Lista Bento Detallada)
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {locacionesFiltradas.map((loc) => {
              return (
                <div key={loc.id} className="bg-[#111113] rounded-[24px] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 group flex flex-col sm:flex-row overflow-hidden relative">
                  
                  {/* Imagen del Recinto (Alineada a la Izquierda en Pantallas Grandes) */}
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden shrink-0 bg-black/50 border-r border-white/5">
                    {loc.photo ? (
                      <img 
                        src={loc.photo} 
                        alt={loc.name} 
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02]">
                        <Building2 size={32} className="text-white/20 mb-2" />
                        <span className="text-[8px] font-mono uppercase tracking-widest text-gray-600">Sin Foto</span>
                      </div>
                    )}
                  </div>

                  {/* Detalles del Espacio */}
                  <div className="p-6 flex-1 flex flex-col justify-between relative z-10">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {/* Tipo de Locación */}
                        <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                          {getLocationIcon(loc.location_type)}
                          <span className="text-gray-400">{loc.location_type?.replace('_', ' ') || 'General'}</span>
                        </span>
                        
                        {/* Indicador Accesibilidad */}
                        {loc.is_accessible && (
                           <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold tooltip" title="Espacio Accesible">
                             ♿
                           </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-white leading-tight mb-1 group-hover:text-emerald-400 transition-colors">
                        {loc.name}
                      </h3>
                      
                      <div className="space-y-1 mt-3">
                        <p className="text-[11px] text-gray-400 flex items-center gap-2 font-mono">
                          <MapPin size={12} className="text-emerald-500/50 shrink-0"/> 
                          <span className="truncate">{loc.address} {loc.neighborhood ? `, ${loc.neighborhood}` : ''}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer de Tarjeta (Aforo y Acción) */}
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <Users size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Aforo Máx.</span>
                          <span className="text-sm font-mono text-white leading-none">{loc.capacity || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <button 
                        // 🔥 CORRECCIÓN 3: El botón de la tarjeta dispara onEditRequest(loc) enviando los datos del recinto
                        onClick={() => onEditRequest && onEditRequest(loc)}
                        className="w-10 h-10 rounded-full bg-[#111113] border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all shadow-md group-hover:-translate-x-1"
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