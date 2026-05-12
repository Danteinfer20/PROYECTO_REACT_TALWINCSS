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
    <div className="p-6 md:p-12 w-full h-full max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-700 transition-colors duration-500">
      
      {/* 🟠 HEADER TÁCTICO */}
      <header className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-[var(--border-color)] pb-10 transition-colors duration-500">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.6)]"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[rgb(var(--role-accent))]/80">Biblioteca Personal</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-[var(--text-heading)] transition-colors">
            Mis <span className="text-[rgb(var(--role-accent))]">Rutas</span>
          </h2>
          <p className="text-[var(--text-body)] text-[11px] font-mono uppercase tracking-[0.2em] mt-3 transition-colors">Inventario de Material Didáctico</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 xl:w-80">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-xs font-mono rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner placeholder-[var(--text-body)]/60"
            />
          </div>
          <button 
            onClick={() => setSeccionActiva('crear_ruta')}
            className="py-5 px-8 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(var(--role-accent),0.3)] shrink-0 active:scale-95"
          >
            <Plus size={16} /> Forjar Nueva
          </button>
        </div>
      </header>

      {/* ⚠️ MANEJO DE ESTADOS */}
      {error && (
        <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[24px] flex items-center gap-4 text-red-500 text-[10px] font-mono uppercase tracking-widest">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-[rgb(var(--role-accent))] mb-4" size={40} />
          <p className="text-[10px] font-mono text-[rgb(var(--role-accent))]/80 uppercase tracking-[0.4em]">Sincronizando Archivos...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-20 bg-[var(--bg-container)]/50 border border-[var(--border-color)] rounded-[40px] border-dashed transition-colors duration-500">
          <BookOpen size={64} className="text-[var(--text-body)] opacity-30 mb-6" />
          <h3 className="text-2xl font-black italic text-[var(--text-body)] uppercase tracking-tighter">Inventario Vacío</h3>
          <p className="text-[10px] font-mono text-[var(--text-body)] opacity-70 mt-2 uppercase tracking-widest">No se encontraron rutas educativas con esos parámetros.</p>
        </div>
      ) : (
        /* 📚 BENTO GRID DE MATERIALES */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtradas.map((ruta) => (
            <div key={ruta.id} className="group relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] overflow-hidden hover:border-[rgb(var(--role-accent))]/50 transition-all duration-500 shadow-sm hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))] flex flex-col">
              
              {/* IMAGEN PORTADA */}
              <div className="relative w-full aspect-video bg-[var(--bg-primary)] overflow-hidden border-b border-[var(--border-color)] transition-colors duration-500">
                {ruta.cover_image ? (
                  <img src={ruta.cover_image} alt={ruta.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[rgb(var(--role-accent))]/20 group-hover:text-[rgb(var(--role-accent))]/40 transition-colors">
                    <FileText size={48} strokeWidth={1} />
                  </div>
                )}
                
                {/* BADGES SOBREPUESTOS */}
                <div className="absolute top-5 left-5 flex gap-2">
                  <span className="px-3 py-1.5 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-full text-[8px] font-black uppercase tracking-widest text-[rgb(var(--role-accent))] shadow-sm transition-colors duration-500">
                    {ruta.difficulty_level}
                  </span>
                </div>
                <div className="absolute top-5 right-5">
                  <span className="px-3 py-1.5 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-full text-[8px] font-mono uppercase tracking-widest text-[var(--text-heading)] flex items-center gap-1.5 shadow-sm transition-colors duration-500">
                    <Clock size={10} className="text-[rgb(var(--role-accent))]" /> {ruta.estimated_read_time} min
                  </span>
                </div>
              </div>

              {/* CUERPO TÉCNICO */}
              <div className="p-8 flex-1 flex flex-col transition-colors duration-500">
                <div className="flex-1">
                  <span className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-[0.3em] block mb-3">{ruta.category?.name || 'Módulo'}</span>
                  <h3 className="text-2xl font-black text-[var(--text-heading)] italic uppercase tracking-tighter leading-tight mb-4 group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2">
                    {ruta.title}
                  </h3>
                  
                  {/* MÉTRICAS */}
                  <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[var(--border-color)] transition-colors duration-500">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-[var(--text-body)]" />
                      <div>
                        <span className="block text-[7px] font-black text-[var(--text-body)] uppercase tracking-widest">Impacto</span>
                        <span className="text-xs font-mono text-[var(--text-heading)]">{ruta.stats?.views || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={14} className="text-[var(--text-body)]" />
                      <div>
                        <span className="block text-[7px] font-black text-[var(--text-body)] uppercase tracking-widest">Guardados</span>
                        <span className="text-xs font-mono text-[var(--text-heading)]">{ruta.stats?.favorites || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCIONES (HOVER SLIDE UP) */}
              <div className="p-4 bg-[var(--bg-primary)]/50 border-t border-[var(--border-color)] flex items-center justify-between transition-colors duration-500">
                <button 
                  onClick={() => onEditRequest(ruta)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-heading)] hover:text-[rgb(var(--role-accent))] transition-colors"
                >
                  <Edit3 size={14} /> Editar
                </button>
                <div className="w-[1px] h-6 bg-[var(--border-color)]"></div>
                <button 
                  onClick={() => setRutaParaBorrar(ruta)}
                  className="flex-1 py-3 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] hover:text-red-500 transition-colors"
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setRutaParaBorrar(null)}></div>
          <div className="relative bg-[var(--bg-container)] border border-red-500/30 rounded-[40px] p-10 w-full max-w-lg shadow-[0_20px_50px_rgba(239,68,68,0.15)] animate-in zoom-in-95 duration-300 transition-colors duration-500">
            <button onClick={() => setRutaParaBorrar(null)} className="absolute top-6 right-6 text-[var(--text-body)] hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-8 shadow-inner">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-3xl font-black italic text-[var(--text-heading)] uppercase tracking-tighter mb-4 transition-colors">¿Destruir Archivo?</h3>
            <p className="text-[11px] font-mono text-[var(--text-body)] uppercase tracking-widest leading-relaxed mb-8 transition-colors">
              Estás a punto de archivar/eliminar la ruta <span className="text-[var(--text-heading)] font-bold">"{rutaParaBorrar.title}"</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setRutaParaBorrar(null)}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-[20px] bg-[var(--text-heading)]/5 hover:bg-[var(--text-heading)]/10 text-[var(--text-heading)] font-black text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarBorrado}
                disabled={isDeleting}
                className="flex-1 py-4 rounded-[20px] bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 shadow-md"
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