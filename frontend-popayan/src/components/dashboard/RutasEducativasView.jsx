import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Search, Edit3, Trash2, 
  Clock, Users, Heart, AlertTriangle, 
  Plus, X, Loader2, FileText, ChevronRight
} from 'lucide-react';

const RutasEducativasView = ({ user, setSeccionActiva, onEditRequest }) => {
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState(null);
  
  // Estado para el Modal de Confirmación de Borrado
  const [rutaParaBorrar, setRutaParaBorrar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const fetchRutas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Usamos el flag dashboard=true para traer solo las del educador actual
      const response = await axios.get(`${API_URL}/education?dashboard=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setRutas(response.data.data);
      }
    } catch (err) {
      setError("Fallo al sincronizar el inventario académico.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  const confirmarBorrado = async () => {
    if (!rutaParaBorrar) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/education/${rutaParaBorrar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filtrar visualmente sin recargar
      setRutas(rutas.filter(r => r.id !== rutaParaBorrar.id));
      setRutaParaBorrar(null);
    } catch (err) {
      alert("Error al eliminar la ruta. Verifique su conexión.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtradas = rutas.filter(ruta => 
    ruta.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    ruta.category?.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-12 w-full max-w-[1600px] animate-in fade-in zoom-in-95 duration-700">
      
      {/* 🟠 HEADER TÁCTICO */}
      <header className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-amber-500/60">Biblioteca Personal</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white">
            Mis <span className="text-amber-500">Rutas</span>
          </h2>
          <p className="text-gray-500 text-[11px] font-mono uppercase tracking-[0.2em] mt-3">Inventario de Material Didáctico</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 xl:w-80">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#111113] border border-white/5 text-white text-xs font-mono rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-amber-500/30 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => setSeccionActiva('crear_ruta')}
            className="py-5 px-8 bg-amber-500 hover:bg-amber-400 text-black rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] shrink-0"
          >
            <Plus size={16} /> Forjar Nueva
          </button>
        </div>
      </header>

      {/* ⚠️ MANEJO DE ESTADOS */}
      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center gap-4 text-red-400 text-[10px] font-mono uppercase tracking-widest">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
          <p className="text-[10px] font-mono text-amber-500/50 uppercase tracking-[0.4em]">Sincronizando Archivos...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-20 bg-[#111113] border border-white/5 rounded-[40px] border-dashed">
          <BookOpen size={64} className="text-white/10 mb-6" />
          <h3 className="text-2xl font-black italic text-gray-500 uppercase tracking-tighter">Inventario Vacío</h3>
          <p className="text-[10px] font-mono text-gray-600 mt-2 uppercase tracking-widest">No se encontraron rutas educativas con esos parámetros.</p>
        </div>
      ) : (
        /* 📚 BENTO GRID DE MATERIALES */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtradas.map((ruta) => (
            <div key={ruta.id} className="group relative bg-[#0D0D0F] border border-white/5 rounded-[40px] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col">
              
              {/* IMAGEN PORTADA */}
              <div className="relative w-full aspect-video bg-black overflow-hidden border-b border-white/5">
                {ruta.cover_image ? (
                  <img src={ruta.cover_image} alt={ruta.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-500/20 group-hover:text-amber-500/40 transition-colors">
                    <FileText size={48} strokeWidth={1} />
                  </div>
                )}
                
                {/* BADGES SOBREPUESTOS */}
                <div className="absolute top-5 left-5 flex gap-2">
                  <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-amber-400">
                    {ruta.difficulty_level}
                  </span>
                </div>
                <div className="absolute top-5 right-5">
                  <span className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-mono uppercase tracking-widest text-white flex items-center gap-1.5">
                    <Clock size={10} className="text-amber-500" /> {ruta.estimated_read_time} min
                  </span>
                </div>
              </div>

              {/* CUERPO TÉCNICO */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex-1">
                  <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] block mb-3">{ruta.category?.name || 'Módulo'}</span>
                  <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-tight mb-4 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {ruta.title}
                  </h3>
                  
                  {/* MÉTRICAS */}
                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-500" />
                      <div>
                        <span className="block text-[7px] font-black text-gray-600 uppercase tracking-widest">Impacto</span>
                        <span className="text-xs font-mono text-white">{ruta.stats?.views || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-gray-500" />
                      <div>
                        <span className="block text-[7px] font-black text-gray-600 uppercase tracking-widest">Guardados</span>
                        <span className="text-xs font-mono text-white">{ruta.stats?.favorites || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCIONES (HOVER SLIDE UP) */}
              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <button 
                  onClick={() => onEditRequest(ruta)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white hover:text-amber-400 transition-colors"
                >
                  <Edit3 size={14} /> Editar
                </button>
                <div className="w-[1px] h-6 bg-white/10"></div>
                <button 
                  onClick={() => setRutaParaBorrar(ruta)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} /> Archivar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🚨 MODAL DE SEGURIDAD (BORRADO) */}
      {rutaParaBorrar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setRutaParaBorrar(null)}></div>
          <div className="relative bg-[#111113] border border-red-500/20 rounded-[40px] p-10 w-full max-w-lg shadow-[0_0_50px_rgba(239,68,68,0.1)] animate-in zoom-in-95 duration-300">
            <button onClick={() => setRutaParaBorrar(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-8">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">¿Destruir Archivo?</h3>
            <p className="text-[11px] font-mono text-gray-400 uppercase tracking-widest leading-relaxed mb-8">
              Estás a punto de archivar/eliminar la ruta <span className="text-white font-bold">"{rutaParaBorrar.title}"</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setRutaParaBorrar(null)}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-[20px] bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarBorrado}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-[20px] bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutasEducativasView;