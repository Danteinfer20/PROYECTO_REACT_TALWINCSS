import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  CheckCircle, XCircle, AlertCircle, Loader2, 
  Clock, MessageSquare, User, FileText, 
  Shield, ChevronDown, ChevronUp, Send, X
} from 'lucide-react';

const ModeracionView = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Estado para el modal de rechazo
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    postId: null,
    reason: '',
    isSubmitting: false,
  });

  const fetchPendingContent = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/content/pending');
      if (response.data.status === 'success') {
        setPendingPosts(response.data.data.data);
      } else {
        setError('No se pudo cargar el contenido pendiente.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al cargar el contenido.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const handleModerationAction = async (postId, action, reason = null) => {
    setActionLoading(postId);
    try {
      const url = `/admin/content/${postId}/${action}`;
      const payload = action === 'reject' ? { reason } : {};
      const response = await api.post(url, payload);
      if (response.data.status === 'success') {
        setPendingPosts(prev => prev.filter(post => post.id !== postId));
        // Cerrar modal si estaba abierto
        if (action === 'reject') {
          setRejectModal({ isOpen: false, postId: null, reason: '', isSubmitting: false });
        }
      } else {
        alert(`Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} el contenido.`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Error al procesar la solicitud.`);
    } finally {
      setActionLoading(null);
      setRejectModal(prev => ({ ...prev, isSubmitting: false }));
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

  const submitReject = () => {
    const reason = rejectModal.reason.trim();
    if (reason.length < 10) {
      alert('La razón debe tener al menos 10 caracteres.');
      return;
    }
    setRejectModal(prev => ({ ...prev, isSubmitting: true }));
    handleModerationAction(rejectModal.postId, 'reject', reason);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--role-accent))]" />
        <p className="ml-3 text-[var(--text-body)] font-mono text-xs">Cargando contenido pendiente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (pendingPosts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-heading)]">Todo está en orden</h3>
        <p className="text-[var(--text-body)] font-mono mt-2 text-sm">
          No hay contenido pendiente de moderación en este momento.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-[var(--border-color)] pb-6">
          <h2 className="text-3xl font-bold text-[var(--text-heading)] tracking-tight">
            Moderación de Contenido
          </h2>
          <p className="text-[var(--text-body)] font-mono text-sm mt-1 flex items-center gap-2">
            <Shield size={14} className="text-[rgb(var(--role-accent))]" />
            Revisa y aprueba el contenido marcado por la IA.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 bg-[rgb(var(--role-accent))]/10 px-4 py-1.5 rounded-full border border-[rgb(var(--role-accent))]/20">
            <span className="text-xs font-mono text-[rgb(var(--role-accent))]">
              {pendingPosts.length} {pendingPosts.length === 1 ? 'obra pendiente' : 'obras pendientes'}
            </span>
          </div>
        </div>

        {/* Lista de posts */}
        <div className="grid grid-cols-1 gap-6">
          {pendingPosts.map((post) => (
            <div
              key={post.id}
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                {/* Contenido principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <Clock size={12} />
                      Revisión Manual
                    </span>
                    <span className="text-xs text-[var(--text-body)] font-mono flex items-center gap-1">
                      <FileText size={12} />
                      {new Date(post.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-xs text-[var(--text-body)] font-mono flex items-center gap-1">
                      <User size={12} />
                      {post.user?.name || 'Autor desconocido'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-heading)] mb-2 leading-tight">
                    {post.title}
                  </h3>

                  <p className="text-[var(--text-body)] text-sm line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Detalles de IA */}
                  {post.ai_moderation_result && post.ai_moderation_result.flagged && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-[var(--text-body)] uppercase tracking-wider mb-2">
                        Categorías detectadas por IA
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(post.ai_moderation_result.categories)
                          .filter(([_, flagged]) => flagged)
                          .map(([category]) => (
                            <span
                              key={category}
                              className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-medium border border-red-500/20"
                            >
                              {category.replace(/_/g, ' ')}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0 items-center lg:items-stretch">
                  <button
                    onClick={() => handleModerationAction(post.id, 'approve')}
                    disabled={actionLoading === post.id}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 min-w-[120px]"
                  >
                    {actionLoading === post.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Aprobar
                  </button>
                  <button
                    onClick={() => openRejectModal(post.id)}
                    disabled={actionLoading === post.id}
                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95 min-w-[120px]"
                  >
                    <XCircle size={16} />
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                {rejectModal.isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Enviar rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModeracionView;