import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FileText, Search, Plus, Play, Clock, Eye, 
  Trash2, Edit3, Loader2, AlertTriangle, X, Heart,
  BookOpen, Activity, Zap
} from 'lucide-react';

const MaterialDidacticoView = ({ user, setSeccionActiva, onEditRequest }) => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('all');
  const [itemParaBorrar, setItemParaBorrar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [videoEnVista, setVideoEnVista] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchMateriales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/education?dashboard=true');
      if (response.data.status === 'success') {
        setMateriales(response.data.data);
      }
    } catch (err) {
      setError("Fallo crítico de sincronización.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriales();
  }, []);

  const confirmarBorrado = async () => {
    if (!itemParaBorrar) return;
    try {
      setIsDeleting(true);
      await api.delete(`/education/${itemParaBorrar.id}`);
      setMateriales(prev => prev.filter(m => m.id !== itemParaBorrar.id));
      setItemParaBorrar(null);
      showToast('Material eliminado correctamente.');
    } catch (err) {
      showToast('Error al eliminar el material.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  const filtrados = materiales.filter(item => {
    const coincidenciaTexto = item.title.toLowerCase().includes(busqueda.toLowerCase()) ||
                              item.metadata?.knowledge_area?.toLowerCase().includes(busqueda.toLowerCase());
    const coincidenciaNivel = filtroActivo === 'all' || item.metadata?.difficulty_level === filtroActivo;
    return coincidenciaTexto && coincidenciaNivel;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-xl border px-6 py-3.5 rounded-[16px] shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} className="shrink-0" /> : <span className="shrink-0">✅</span>}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      <header className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[rgb(var(--role-accent))]/80">Sistema de Gestión</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)]">
            Material <span className="text-[rgb(var(--role-accent))]">Didáctico</span>
          </h2>
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

      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-[var(--border-color)]">
        {[
          { id: 'all', label: 'Todo', icon: <FileText size={14} /> },
          { id: 'beginner', label: 'Básico', icon: <BookOpen size={14} /> },
          { id: 'intermediate', label: 'Intermedio', icon: <Activity size={14} /> },
          { id: 'advanced', label: 'Avanzado', icon: <Zap size={14} /> }
        ].map(filtro => (
          <button
            key={filtro.id}
            onClick={() => setFiltroActivo(filtro.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${
              filtroActivo === filtro.id 
                ? 'bg-[rgb(var(--role-accent))] text-white shadow-sm' 
                : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-body)] hover:border-[rgb(var(--role-accent))]/40 hover:text-[var(--text-heading)]'
            }`}
          >
            {filtro.icon} {filtro.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-mono uppercase tracking-widest">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="animate-spin text-[rgb(var(--role-accent))] mb-3" size={32} />
          <p className="text-[10px] font-mono text-[rgb(var(--role-accent))]/80 uppercase tracking-widest">Cargando...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-[var(--bg-container)]/50 border border-[var(--border-color)] rounded-2xl border-dashed">
          <FileText size={48} className="text-[var(--text-body)] opacity-30 mb-4" />
          <h3 className="text-xl font-bold italic text-[var(--text-body)] uppercase tracking-tighter">Sin Contenido</h3>
          <p className="text-xs text-[var(--text-body)]/60 mt-1">Aún no hay material didáctico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filtrados.map((item) => (
            <div key={item.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:border-[rgb(var(--role-accent))]/40 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
              <div className="relative aspect-video bg-[#0A0A0A] overflow-hidden">
                {item.cover_image ? (
                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[rgb(var(--role-accent))]/20">
                    <FileText size={36} strokeWidth={1} />
                  </div>
                )}
                {item.video_url && (
                  <button 
                    onClick={() => setVideoEnVista(item)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-[rgb(var(--role-accent))] flex items-center justify-center text-white shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                      <Play fill="currentColor" size={18} />
                    </div>
                  </button>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[8px] font-bold text-[rgb(var(--role-accent))]/80 uppercase tracking-wider block mb-1">
                  {item.metadata?.knowledge_area || 'Área General'}
                </span>
                <h3 className="text-sm font-bold text-[var(--text-heading)] leading-tight line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-4 mt-auto pt-3 border-t border-[var(--border-color)] text-[var(--text-body)] text-[10px]">
                  <span className="flex items-center gap-1"><Eye size={12} /> {item.stats?.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {item.stats?.favorites || 0}</span>
                </div>
              </div>

              <div className="flex border-t border-[var(--border-color)] divide-x divide-[var(--border-color)]">
                <button onClick={() => onEditRequest(item)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-heading)] hover:text-[rgb(var(--role-accent))] transition-colors">
                  <Edit3 size={14} /> Editar
                </button>
                <button onClick={() => setItemParaBorrar(item)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-body)] hover:text-red-500 transition-colors">
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de borrado */}
      {itemParaBorrar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[var(--text-heading)]">Confirmar eliminación</h3>
            </div>
            <p className="text-sm text-[var(--text-body)] mb-6">
              ¿Estás seguro de eliminar "<span className="font-bold text-[var(--text-heading)]">{itemParaBorrar.title}</span>"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setItemParaBorrar(null)} className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 transition">
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

      {/* Modal de video */}
      {videoEnVista && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setVideoEnVista(null)} />
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setVideoEnVista(null)} 
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-[rgb(var(--role-accent))] transition-all active:scale-95 flex items-center justify-center"
            >
              <X size={18} />
            </button>
            <div className="aspect-video w-full">
              <iframe 
                src={getEmbedUrl(videoEnVista.video_url)}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={videoEnVista.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDidacticoView;