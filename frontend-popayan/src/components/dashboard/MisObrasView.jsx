import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, AlertCircle, Loader2, Image as ImageIcon, Eye, Heart, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const MisObrasView = ({ initialTab, onEditRequest }) => {
  const { t } = useTranslation();
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab || 'published');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchMisObras = async () => {
      try {
        setLoading(true);
        const res = await api.get('/posts', { params: { my_posts: true } });
        setObras(res.data.data || res.data || []);
      } catch (err) {
        console.error("Error al recuperar catálogo:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMisObras();
  }, []);

  const filteredObras = obras.filter(obra => 
    obra.status === activeTab && 
    (obra.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     obra.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (window.confirm(t('misobras.deleteConfirm', '¿Estás seguro de que deseas destruir esta obra?'))) {
      try {
        await api.delete(`/posts/${id}`);
        setObras(obras.filter(o => o.id !== id));
      } catch (err) {
        alert(t('misobras.deleteError', 'Fallo en la eliminación.'));
      }
    }
  };

  const getCoverImage = (obra) => {
    if (obra.post_media && obra.post_media.length > 0) {
      const path = obra.post_media[0].file_path;
      return path.startsWith('http') ? path : `https://vivelarte.com/storage/${path.replace(/^\/+/, '')}`;
    }
    if (obra.image) return obra.image;
    return null;
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[rgb(var(--role-accent))] animate-pulse">
        <Loader2 className="animate-spin mb-4" size={28} />
        <p className="font-mono text-[9px] uppercase tracking-widest font-bold">
          {t('misobras.loading', 'Sincronizando Archivo Cultural...')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      
      <header className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-heading)] tracking-tighter italic">
          {t('misobras.title', 'Gestor de Catálogo')}
        </h2>
        <p className="text-[rgb(var(--role-accent))] text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] mt-1 font-bold flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
          {t('misobras.subtitle', 'Conexión directa con tu base de datos')}
        </p>
      </header>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 border-b border-[var(--border-color)] pb-4">
        <div className="flex bg-[var(--bg-container)] p-1 rounded-full border border-[var(--border-color)] shadow-sm w-full lg:w-auto">
          <button 
            onClick={() => setActiveTab('published')}
            className={`flex-1 lg:flex-none px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'published' ? 'bg-[rgb(var(--role-accent))] text-white shadow-sm' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--text-heading)]/5'
            }`}
          >
            {t('misobras.tabs.published', 'Públicas')} ({obras.filter(o => o.status === 'published').length})
          </button>
          <button 
            onClick={() => setActiveTab('draft')}
            className={`flex-1 lg:flex-none px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'draft' ? 'bg-[rgb(var(--role-accent))] text-white shadow-sm' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--text-heading)]/5'
            }`}
          >
            {t('misobras.tabs.draft', 'Borradores')} ({obras.filter(o => o.status === 'draft').length})
          </button>
        </div>

        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-body)]" size={14} />
          <input 
            type="text"
            placeholder={t('misobras.searchPlaceholder', 'BUSCAR EN EL ARCHIVO...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full py-2 pl-9 pr-3 text-[10px] font-mono focus:border-[rgb(var(--role-accent))]/50 outline-none transition"
          />
        </div>
      </div>

      {filteredObras.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredObras.map(obra => {
            const coverImage = getCoverImage(obra);
            const vistas = obra.view_count || 0;
            const likes = obra.reactions_count || obra.stats?.reactions || 0;

            return (
              <div key={obra.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl hover:border-[rgb(var(--role-accent))]/40 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                <div className="relative aspect-[4/3] bg-[var(--bg-primary)] overflow-hidden">
                  {coverImage ? (
                    <img 
                      src={coverImage} 
                      alt={obra.title || 'Obra'} 
                      className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-heading)]/10">
                      <ImageIcon size={28} strokeWidth={1} />
                      <span className="text-[7px] font-mono mt-1 uppercase tracking-widest">{t('misobras.noImage', 'Sin Imagen')}</span>
                    </div>
                  )}
                  
                  {/* Badge de estado */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${
                      obra.status === 'published' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {obra.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </div>

                  {/* Acciones overlay */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                    <button 
                      onClick={() => onEditRequest(obra)}
                      className="w-9 h-9 rounded-full bg-white text-gray-800 hover:bg-[rgb(var(--role-accent))] hover:text-white transition flex items-center justify-center shadow-md"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(obra.id)}
                      className="w-9 h-9 rounded-full bg-white text-gray-800 hover:bg-red-500 hover:text-white transition flex items-center justify-center shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-[var(--text-heading)] leading-tight line-clamp-1 group-hover:text-[rgb(var(--role-accent))] transition-colors">
                    {obra.title}
                  </h3>
                  <div className="mt-2 pt-2 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[var(--text-body)]">
                        <Eye size={12} className="text-[rgb(var(--role-accent))]" />
                        <span className="font-mono text-[9px] font-bold">{vistas}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--text-body)]">
                        <Heart size={12} className="text-[rgb(var(--role-accent))]" />
                        <span className="font-mono text-[9px] font-bold">{likes}</span>
                      </div>
                    </div>
                    <span className="text-[7px] font-mono text-[var(--text-body)]/50 uppercase tracking-wider">
                      #{obra.id.toString().padStart(4, '0')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 border-2 border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center bg-[var(--bg-container)]/30">
          <AlertCircle size={24} className="text-[var(--text-body)] opacity-50 mb-3" strokeWidth={1.5} />
          <h3 className="text-[var(--text-heading)] font-bold text-xl italic mb-1">{t('misobras.emptyTitle', 'Archivo Silencioso')}</h3>
          <p className="text-[var(--text-body)] text-[8px] font-mono uppercase tracking-widest text-center">
            {t('misobras.emptyMessage', 'No hay registros en')} <span className="text-[rgb(var(--role-accent))] font-bold">{activeTab === 'published' ? t('misobras.tabs.published', 'Públicas') : t('misobras.tabs.draft', 'Borradores')}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MisObrasView;