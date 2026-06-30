import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, RefreshCw, Loader2, CheckCircle2, XCircle,
  Eye, EyeOff, ExternalLink, AlertTriangle, Send, X,
  FileText, Calendar, User
} from 'lucide-react';
import api from '../../services/api';

const MonitorContenido = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', moderation_status: '', search: '' });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Estado para el modal de rechazo
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    postId: null,
    reason: '',
    isSubmitting: false,
  });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const params = { ...filters, page };
      const res = await api.get('/admin/posts', { params });
      if (res.data.status === 'success') {
        setPosts(res.data.data.data);
        setPagination({
          current_page: res.data.data.current_page,
          last_page: res.data.data.last_page,
          total: res.data.data.total
        });
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar publicaciones.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchPosts(page);
    }
  };

  const handleToggleStatus = async (postId, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      setActionLoading(`status-${postId}`);
      await api.patch(`/admin/posts/${postId}/status`, { status: newStatus });
      showToast(`Estado actualizado a ${newStatus}`, 'success');
      fetchPosts(pagination.current_page);
    } catch (e) {
      showToast('Error al cambiar estado', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveModeration = async (postId) => {
    try {
      setActionLoading(`moderate-${postId}`);
      await api.post(`/admin/content/${postId}/approve`);
      showToast('Contenido aprobado y publicado.', 'success');
      fetchPosts(pagination.current_page);
    } catch (e) {
      showToast('Error al aprobar', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (postId) => {
    setRejectModal({
      isOpen: true,
      postId,
      reason: '',
      isSubmitting: false,
    });
  };

  const closeRejectModal = () => {
    setRejectModal({
      isOpen: false,
      postId: null,
      reason: '',
      isSubmitting: false,
    });
  };

  const submitReject = async () => {
    const reason = rejectModal.reason.trim();
    if (reason.length < 10) {
      showToast('El motivo debe tener al menos 10 caracteres.', 'error');
      return;
    }
    try {
      setRejectModal(prev => ({ ...prev, isSubmitting: true }));
      await api.post(`/admin/content/${rejectModal.postId}/reject`, { reason });
      showToast('Contenido rechazado correctamente.', 'success');
      closeRejectModal();
      fetchPosts(pagination.current_page);
    } catch (e) {
      showToast('Error al rechazar', 'error');
      setRejectModal(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'published': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'draft': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
      'archived': 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    return styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getModerationBadge = (status) => {
    const styles = {
      'pending': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'approved': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'manual_review': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'rejected': 'bg-red-500/10 text-red-500 border-red-500/20'
    };
    return styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  if (loading && posts.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-[rgb(var(--role-accent))]">
        <Loader2 className="animate-spin mb-6" size={32} />
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] opacity-50">Cargando publicaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] backdrop-blur-xl border px-6 py-4 rounded-[20px] shadow-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 max-w-[90vw] ${
          toast.type === 'error' 
            ? 'bg-red-500/10 border-red-500/30 text-red-500' 
            : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'
        }`}>
          {toast.type === 'error' ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />} 
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap items-start sm:items-center bg-[var(--bg-container)] p-4 sm:p-5 rounded-[20px] border border-[var(--border-color)]">
        <div className="flex-1 min-w-[150px] w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-mono text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="w-full sm:w-36 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all"
        >
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="rejected">Rechazado</option>
          <option value="archived">Archivado</option>
        </select>
        <select
          value={filters.moderation_status}
          onChange={(e) => handleFilterChange('moderation_status', e.target.value)}
          className="w-full sm:w-44 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all"
        >
          <option value="">Todos los estados de moderación</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="manual_review">Revisión manual</option>
          <option value="rejected">Rechazado</option>
        </select>
        <button
          onClick={() => fetchPosts(1)}
          className="w-full sm:w-auto px-6 py-2.5 bg-[rgb(var(--role-accent))] text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} /> Aplicar filtros
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--text-heading)]/[0.03]">
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-left">ID</th>
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-left">Título</th>
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-left hidden md:table-cell">Autor</th>
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-left">Estado</th>
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-left hidden lg:table-cell">Moderación</th>
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-left hidden sm:table-cell">Fecha</th>
                <th className="p-4 text-[8px] font-black uppercase text-[var(--text-body)] opacity-50 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[var(--text-heading)]/[0.02] transition-colors group">
                  <td className="p-4 text-xs font-mono text-[var(--text-body)] opacity-60">{post.id}</td>
                  <td className="p-4 max-w-[180px]">
                    <p className="text-sm font-bold text-[var(--text-heading)] truncate">{post.title}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs text-[var(--text-body)]">{post.user?.name || 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase border ${getStatusBadge(post.status)}`}>
                      {post.status || 'draft'}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className={`px-2.5 py-1 rounded-full text-[7px] font-black uppercase border ${getModerationBadge(post.moderation_status)}`}>
                      {post.moderation_status || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-[9px] font-mono text-[var(--text-body)] opacity-60">
                      {new Date(post.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Cambiar estado de publicación */}
                      <button
                        onClick={() => handleToggleStatus(post.id, post.status)}
                        disabled={actionLoading === `status-${post.id}`}
                        className={`p-1.5 rounded-lg transition-all ${post.status === 'published' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                        title={post.status === 'published' ? 'Ocultar' : 'Publicar'}
                      >
                        {actionLoading === `status-${post.id}` ? <Loader2 className="animate-spin w-3 h-3" /> : post.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      {/* Aprobar moderación (solo si está en manual_review) */}
                      {post.moderation_status === 'manual_review' && (
                        <>
                          <button
                            onClick={() => handleApproveModeration(post.id)}
                            disabled={actionLoading === `moderate-${post.id}`}
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                            title="Aprobar"
                          >
                            {actionLoading === `moderate-${post.id}` ? <Loader2 className="animate-spin w-3 h-3" /> : <CheckCircle2 size={14} />}
                          </button>
                          <button
                            onClick={() => openRejectModal(post.id)}
                            disabled={actionLoading === `moderate-${post.id}`}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                            title="Rechazar"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {/* Ver detalle */}
                      <Link
                        to={`/obra/${post.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-[var(--text-body)] hover:bg-[var(--text-heading)]/10 transition-all"
                        title="Ver obra"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-widest opacity-40">No hay publicaciones que coincidan con los filtros</p>
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(pagination.current_page - 1)}
            disabled={pagination.current_page === 1}
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 transition-all disabled:opacity-30"
          >
            Anterior
          </button>
          <span className="text-xs font-mono text-[var(--text-body)]">
            {pagination.current_page} / {pagination.last_page}
          </span>
          <button
            onClick={() => handlePageChange(pagination.current_page + 1)}
            disabled={pagination.current_page === pagination.last_page}
            className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 transition-all disabled:opacity-30"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de rechazo */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-heading)] flex items-center gap-2">
                <XCircle size={20} className="text-red-500" />
                Rechazar contenido
              </h3>
              <button
                onClick={closeRejectModal}
                className="p-1 rounded-full hover:bg-[var(--bg-primary)] transition-colors"
              >
                <X size={20} className="text-[var(--text-body)]" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-[var(--text-body)]">
                Indica el motivo del rechazo. El autor recibirá esta notificación.
              </p>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Escribe el motivo (mínimo 10 caracteres)..."
                className="w-full min-h-[120px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-4 text-[var(--text-heading)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[rgb(var(--role-accent))]/50 transition-all"
              />
              <div className="text-xs text-[var(--text-body)]/60 flex justify-between">
                <span>{rejectModal.reason.length} / 1000 caracteres</span>
                {rejectModal.reason.length > 0 && rejectModal.reason.length < 10 && (
                  <span className="text-red-400">Mínimo 10 caracteres</span>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={closeRejectModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-body)] hover:bg-[var(--bg-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={submitReject}
                disabled={rejectModal.isSubmitting || rejectModal.reason.trim().length < 10}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
              >
                {rejectModal.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                Enviar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorContenido;