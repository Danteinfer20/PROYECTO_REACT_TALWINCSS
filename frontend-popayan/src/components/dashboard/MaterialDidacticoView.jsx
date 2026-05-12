import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Video, FileText, Link as LinkIcon, Search, 
  Plus, Play, Clock, Eye, Trash2, Edit3, 
  FileArchive, Loader2, AlertTriangle, X, Heart,
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const fetchMateriales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/education?dashboard=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setMateriales(response.data.data);
      }
    } catch (err) {
      setError("Fallo crítico de sincronización. Verifique conexión con el servidor.");
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/education/${itemParaBorrar.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMateriales(prev => prev.filter(m => m.id !== itemParaBorrar.id));
      setItemParaBorrar(null);
    } catch (err) {
      alert("Error de red: No se pudo eliminar el registro educativo.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtrados = materiales.filter(item => {
    const coincidenciaTexto = item.title.toLowerCase().includes(busqueda.toLowerCase()) || 
                              item.knowledge_area?.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincidenciaNivel = filtroActivo === 'all' || item.difficulty_level === filtroActivo;
    return coincidenciaTexto && coincidenciaNivel;
  });

  return (
    <div className="p-8 lg:p-12 w-full max-w-[1600px] animate-in fade-in zoom-in-95 duration-700 transition-colors duration-500">
      
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.8)]"></span>
          <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[rgb(var(--role-accent))]/80">Sistema de Gestión de Rutas</span>
        </div>
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <h2 className="text-5xl lg:text-6xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm transition-colors duration-500">
            Material <span className="text-[rgb(var(--role-accent))]">Didáctico</span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            <div className="relative group flex-1 xl:w-80">
              <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar material real..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-xs font-mono rounded-[24px] pl-14 pr-6 py-5 outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder-[var(--text-body)]/60"
              />
            </div>
            <button 
              onClick={() => setSeccionActiva('crear_ruta')}
              className="py-5 px-8 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(var(--role-accent),0.3)] shrink-0 active:scale-95"
            >
              <Plus size={16} /> Forjar Nueva
            </button>
          </div>
        </div>
      </header>

      {/* 🎛️ FILTROS DE ARQUITECTURA */}
      <div className="flex flex-wrap gap-3 mb-10 pb-8 border-b border-[var(--border-color)] transition-colors duration-500">
        {[
          { id: 'all', label: 'Todo el Nivel', icon: <FileArchive size={14}/> },
          { id: 'beginner', label: 'Básico', icon: <BookOpen size={14}/> },
          { id: 'intermediate', label: 'Intermedio', icon: <Activity size={14}/> },
          { id: 'advanced', label: 'Avanzado', icon: <Zap size={14}/> }
        ].map(filtro => (
          <button
            key={filtro.id}
            onClick={() => setFiltroActivo(filtro.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm border ${
              filtroActivo === filtro.id 
                ? 'bg-[rgb(var(--role-accent))] border-[rgb(var(--role-accent))] text-white shadow-[0_0_15px_rgba(var(--role-accent),0.4)]' 
                : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-body)] hover:text-[var(--text-heading)] hover:border-[rgb(var(--role-accent))]/40'
            }`}
          >
            {filtro.icon} {filtro.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[400px]">
          <Loader2 className="animate-spin text-[rgb(var(--role-accent))] mb-4" size={40} />
          <p className="text-[10px] font-mono text-[rgb(var(--role-accent))]/80 uppercase tracking-[0.4em]">Sincronizando con Popayán Cultural...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-20 bg-[var(--bg-container)]/50 border border-[var(--border-color)] rounded-[40px] border-dashed transition-colors duration-500">
          <FileArchive size={64} className="text-[var(--text-body)] opacity-30 mb-6" />
          <h3 className="text-2xl font-bold italic text-[var(--text-body)] uppercase tracking-tighter">Sin Contenido</h3>
          <p className="text-[10px] font-mono text-[var(--text-body)] mt-2 uppercase tracking-widest opacity-70">No hay registros educativos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {filtrados.map((item) => (
            <div key={item.id} className="group relative flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[30px] overflow-hidden hover:border-[rgb(var(--role-accent))]/40 hover:-translate-y-1 transition-all duration-500 shadow-sm hover:shadow-[0_15px_40px_rgba(var(--glass-shadow))]">
              
              <div className="relative w-full aspect-video bg-[var(--bg-primary)] overflow-hidden border-b border-[var(--border-color)] transition-colors duration-500">
                {item.cover_image ? (
                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[rgb(var(--role-accent))]/20 bg-gradient-to-br from-[var(--text-heading)]/[0.02] to-transparent transition-colors duration-500">
                    <FileText size={40} strokeWidth={1} />
                  </div>
                )}
                
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1.5 bg-[var(--bg-container)]/80 backdrop-blur-md border border-[var(--border-color)] rounded-[10px] text-[8px] font-black uppercase tracking-widest text-[var(--text-heading)] shadow-sm transition-colors duration-500">
                    {item.difficulty_level}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4">
                  <span className="px-2 py-1 bg-[var(--bg-primary)]/90 backdrop-blur-md rounded-md text-[9px] font-mono text-[var(--text-heading)] tracking-widest uppercase border border-[var(--border-color)] shadow-sm transition-colors duration-500">
                    {item.estimated_read_time} MIN
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col transition-colors duration-500">
                <div className="flex-1">
                  <span className="text-[7px] font-black text-[rgb(var(--role-accent))]/80 uppercase tracking-[0.2em] block mb-1">{item.knowledge_area || 'Área General'}</span>
                  <h3 className="text-sm font-bold text-[var(--text-heading)] leading-snug group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2 mb-4 uppercase">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[var(--text-body)] text-[9px] font-mono uppercase border-t border-[var(--border-color)] pt-4 transition-colors duration-500">
                    <span className="flex items-center gap-1"><Eye size={12}/> {item.stats?.views || 0}</span>
                    <span className="flex items-center gap-1"><Heart size={12}/> {item.stats?.favorites || 0}</span>
                  </div>
                </div>
              </div>

              {/* BARRA DE ACCIÓN TÁCTICA */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-[var(--bg-container)]/95 backdrop-blur-xl border-t border-[var(--border-color)] flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <button 
                  onClick={() => onEditRequest(item)}
                  className="flex-1 py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-heading)] hover:text-[rgb(var(--role-accent))] transition-colors border-r border-[var(--border-color)]"
                >
                  <Edit3 size={14}/> Editar
                </button>
                <button 
                  onClick={() => setItemParaBorrar(item)} 
                  className="flex-1 py-2 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14}/> Eliminar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 🚨 MODAL DE BORRADO */}
      {itemParaBorrar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setItemParaBorrar(null)}></div>
          <div className="relative bg-[var(--bg-container)] border border-red-500/30 rounded-[40px] p-10 w-full max-w-lg animate-in zoom-in-95 duration-300 shadow-[0_20px_60px_rgba(239,68,68,0.15)] transition-colors duration-500">
            <button onClick={() => setItemParaBorrar(null)} className="absolute top-6 right-6 text-[var(--text-body)] hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mb-8 mx-auto shadow-inner border border-red-500/20">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-3xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter mb-4 text-center transition-colors">Eliminar Recurso</h3>
            <p className="text-[11px] font-mono text-[var(--text-body)] uppercase tracking-widest leading-relaxed mb-8 text-center transition-colors">
              ¿Confirmar eliminación de <span className="text-[var(--text-heading)] font-bold">"{itemParaBorrar.title}"</span>? Esta acción es irreversible.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setItemParaBorrar(null)} 
                className="flex-1 py-4 rounded-[20px] bg-[var(--text-heading)]/5 text-[var(--text-heading)] font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-[var(--text-heading)]/10"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarBorrado} 
                disabled={isDeleting} 
                className="flex-1 py-4 rounded-[20px] bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:bg-red-600 shadow-md"
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

export default MaterialDidacticoView;