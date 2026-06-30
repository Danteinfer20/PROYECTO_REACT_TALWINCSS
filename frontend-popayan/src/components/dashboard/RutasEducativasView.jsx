import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  const [rutaParaBorrar, setRutaParaBorrar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchRutas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/education?dashboard=true');
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
      await api.delete(`/education/${rutaParaBorrar.id}`);
      setRutas(rutas.filter(r => r.id !== rutaParaBorrar.id));
      setRutaParaBorrar(null);
      showToast('Ruta eliminada correctamente.');
    } catch (err) {
      showToast('Error al eliminar la ruta.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtradas = rutas.filter(ruta => 
    ruta.title.toLowerCase().includes(busqueda.toLowerCase()) ||
    ruta.category?.name.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-xl border px-6 py-3.5 rounded-[16px] shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} className="shrink-0" /> : <span className="shrink-0">✅</span>}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[rgb(var(--role-accent))]/80">Biblioteca Personal</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)]">
            Mis <span className="text-[rgb(var(--role-accent))]">Rutas</span>
          </h2>
          <p className="text-[var(--text-body)] text-xs font-mono uppercase tracking-wider mt-1 opacity-60">Inventario de Material Didáctico</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar material..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner placeholder:text-[var(--text-body)]/60"
            />
          </div>
          <button 
            onClick={() => setSeccionActiva('crear_ruta')}
            className="px-5 py-2.5 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
          >
            <Plus size={16} /> Forjar Nueva
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-mono uppercase tracking-widest">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin text-[rgb(var(--role-accent))] mb-3" size={32} />
          <p className="text-[10px] font-mono text-[rgb(var(--role-accent))]/80 uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-[var(--bg-container)]/50 border border-[var(--border-color)] rounded-2xl border-dashed">
          <BookOpen size={48} className="text-[var(--text-body)] opacity-30 mb-4" />
          <h3 className="text-xl font-bold italic text-[var(--text-body)] uppercase tracking-tighter">Inventario Vacío</h3>
          <p className="text-xs text-[var(--text-body)]/60 mt-1">No se encontraron rutas educativas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtradas.map((ruta) => (
            <div key={ruta.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:border-[rgb(var(--role-accent))]/40 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
              <div className="relative aspect-video bg-[var(--bg-primary)] overflow-hidden">
                {ruta.cover_image ? (
                  <img src={ruta.cover_image} alt={ruta.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[rgb(var(--role-accent))]/20">
                    <FileText size={36} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className="px-2 py-0.5 bg-[var(--bg-container)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-full text-[7px] font-black uppercase tracking-wider text-[rgb(var(--role-accent))] shadow-sm">
                    {ruta.difficulty_level || 'Intermedio'}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 bg-[var(--bg-container)]/80 backdrop-blur-sm border border-[var(--border-color)] rounded-full text-[7px] font-mono uppercase tracking-wider text-[var(--text-heading)] flex items-center gap-1 shadow-sm">
                    <Clock size={10} /> {ruta.estimated_read_time || 5} min
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-wider block mb-1 opacity-60">{ruta.category?.name || 'Módulo'}</span>
                <h3 className="text-sm font-bold text-[var(--text-heading)] leading-tight line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-colors mb-2">
                  {ruta.title}
                </h3>
                <div className="flex items-center gap-4 mt-auto pt-3 border-t border-[var(--border-color)] text-[var(--text-body)] text-[10px]">
                  <span className="flex items-center gap-1"><Users size={12} /> {ruta.stats?.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {ruta.stats?.favorites || 0}</span>
                </div>
              </div>

              <div className="flex border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
                <button onClick={() => onEditRequest(ruta)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-heading)] hover:text-[rgb(var(--role-accent))] transition-colors">
                  <Edit3 size={14} /> Editar
                </button>
                <button onClick={() => setRutaParaBorrar(ruta)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-body)] hover:text-red-500 transition-colors">
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación */}
      {rutaParaBorrar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[var(--text-heading)]">Confirmar eliminación</h3>
            </div>
            <p className="text-sm text-[var(--text-body)] mb-6">
              ¿Estás seguro de eliminar la ruta "<span className="font-bold text-[var(--text-heading)]">{rutaParaBorrar.title}</span>"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setRutaParaBorrar(null)} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 transition">
                Cancelar
              </button>
              <button onClick={confirmarBorrado} disabled={isDeleting} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2">
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutasEducativasView;