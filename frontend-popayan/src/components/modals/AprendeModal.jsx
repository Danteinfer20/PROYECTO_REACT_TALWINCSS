import React, { useState, useEffect } from 'react';
import { X, Clock, Target, Loader2, ImageIcon, AlertCircle, ExternalLink, Youtube, Instagram, Video, MessageCircle, Mail, Eye, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

// Función mejorada para obtener URL de embed
const getEmbedUrl = (url) => {
  if (!url) return null;

  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const matchYoutube = url.match(youtubeRegex);
  if (matchYoutube) return `https://www.youtube.com/embed/${matchYoutube[1]}`;

  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const matchVimeo = url.match(vimeoRegex);
  if (matchVimeo) return `https://player.vimeo.com/video/${matchVimeo[1]}`;

  const tiktokRegex = /tiktok\.com\/@[\w.-]+\/video\/(\d+)/;
  const matchTikTok = url.match(tiktokRegex);
  if (matchTikTok) return `https://www.tiktok.com/embed/v2/${matchTikTok[1]}`;

  const instaRegex = /instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/;
  const matchInsta = url.match(instaRegex);
  if (matchInsta) return `https://www.instagram.com/${matchInsta[0].split('/').slice(-2).join('/')}/embed/`;

  return url;
};

const AprendeModal = ({ leccionId, onClose }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [leccion, setLeccion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    api.get(`/education/${leccionId}`)
      .then(res => setLeccion(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    return () => { document.body.style.overflow = 'auto'; };
  }, [leccionId]);

  const resolveLang = (field) => {
    if (!field) return '';
    try {
      const parsed = typeof field === 'string' ? JSON.parse(field) : field;
      return parsed[i18n.language] || parsed['es'] || '';
    } catch {
      return field;
    }
  };

  const embedUrl = leccion?.video_url ? getEmbedUrl(leccion.video_url) : null;
  const isInstagram = embedUrl && embedUrl.includes('instagram.com');
  const isYouTube = embedUrl && embedUrl.includes('youtube.com');
  const isTikTok = embedUrl && embedUrl.includes('tiktok.com');

  const getPlatformIcon = () => {
    if (isYouTube) return <Youtube size={14} className="text-red-500" />;
    if (isTikTok) return <Video size={14} className="text-[#00f2ea]" />;
    if (isInstagram) return <Instagram size={14} className="text-pink-500" />;
    return null;
  };

  const getPlatformName = () => {
    if (isYouTube) return 'YouTube';
    if (isTikTok) return 'TikTok';
    if (isInstagram) return 'Instagram';
    return 'Multimedia';
  };

  const handleVerDetalles = () => {
    onClose();
    navigate(`/aprende/${leccionId}`);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1566417712758-5bf8bd7b4a0a?q=80&w=2070&auto=format&fit=crop';

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[rgb(var(--role-accent))]" size={40} />
          <span className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-white/50">Cargando contenido</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--role-accent))]/5 via-transparent to-transparent pointer-events-none" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[90vh] sm:h-[85vh] md:h-[90vh] bg-[#0A0A0C] rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-white/10">
        
        {/* Header con botón cerrar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-end p-3 sm:p-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/80 hover:bg-[rgb(var(--role-accent))] hover:text-white hover:border-transparent transition-all duration-300 flex items-center justify-center group"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Hero: zona multimedia */}
        <div className="relative w-full h-[200px] sm:h-[240px] md:h-[300px] shrink-0 bg-[#050505]">
          {embedUrl && !iframeError ? (
            <>
              <iframe
                key={embedUrl}
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                title="Contenido Didáctico"
                onError={() => setIframeError(true)}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-white/10">
                {getPlatformIcon()}
                <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider text-white/80">
                  {getPlatformName()}
                </span>
              </div>
            </>
          ) : leccion?.cover_image ? (
            <>
              <img
                src={imageError ? fallbackImage : leccion.cover_image}
                className="w-full h-full object-cover"
                alt="Portada"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-black/30" />
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
              <ImageIcon size={36} className="sm:w-12 sm:h-12" strokeWidth={1} />
              <span className="text-[9px] sm:text-[10px] font-mono">Sin recurso visual</span>
            </div>
          )}

          {iframeError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 backdrop-blur-sm text-center p-4">
              <AlertCircle size={28} className="sm:w-9 sm:h-9 text-amber-500/70" />
              <p className="text-xs text-white/70 max-w-xs">
                {isInstagram
                  ? "El contenido de Instagram no se pudo cargar."
                  : "No se pudo cargar el video."}
              </p>
              {isInstagram && leccion.video_url && (
                <a
                  href={leccion.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 px-3 py-1.5 bg-[rgb(var(--role-accent))] rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:opacity-90 transition"
                >
                  <ExternalLink size={12} /> Ver en Instagram
                </a>
              )}
            </div>
          )}
        </div>

        {/* Área de contenido scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 sm:p-5 md:p-8">
            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[rgb(var(--role-accent))] bg-[rgb(var(--role-accent))]/10 px-2.5 py-1 rounded-full">
                {leccion.metadata?.knowledge_area || 'Cultura'}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono text-white/40 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                <Clock size={10} /> {leccion.metadata?.estimated_read_time || 5} min
              </span>
            </div>

            {/* Título */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold italic uppercase tracking-tight leading-tight mb-4 text-white">
              {resolveLang(leccion.title)}
            </h2>

            {/* Objetivos */}
            {leccion.metadata?.learning_objectives?.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 mb-6">
                <h4 className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white/50 mb-3 flex items-center gap-2">
                  <Target size={12} className="text-[rgb(var(--role-accent))]" />
                  Objetivos de Aprendizaje
                </h4>
                <ul className="space-y-2">
                  {leccion.metadata.learning_objectives.map((obj, i) => (
                    <li key={i} className="text-xs sm:text-sm text-white/80 flex items-start gap-2 break-words leading-relaxed">
                      <span className="text-[rgb(var(--role-accent))] font-bold mt-0.5">✦</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contenido */}
            <div className="text-xs sm:text-sm text-white/70 leading-relaxed prose prose-invert prose-p:my-3 prose-headings:text-white prose-strong:text-[rgb(var(--role-accent))] max-w-none break-words">
              {resolveLang(leccion.content)}
            </div>

            {/* Footer con contacto y botón "Ver más" */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Datos del autor y contacto */}
              {leccion.author && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--bg-primary)] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {leccion.author.avatar ? (
                      <img src={leccion.author.avatar} alt="Autor" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-[rgb(var(--role-accent))]" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/80">{leccion.author.name || 'Maestro'}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {leccion.author.phone && (
                        <a
                          href={`https://wa.me/${leccion.author.phone.replace(/\s+/g, '')}?text=Hola%20${encodeURIComponent(leccion.author.name)}%2C%20estoy%20interesado%20en%20el%20curso%20"${encodeURIComponent(leccion.title)}"`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      )}
                      {leccion.author.email && (
                        <a
                          href={`mailto:${leccion.author.email}?subject=Interés%20en%20la%20lección%20${encodeURIComponent(leccion.title)}`}
                          className="text-[rgb(var(--role-accent))] hover:text-[rgb(var(--role-accent))]/80 transition-colors"
                          title="Enviar correo"
                        >
                          <Mail size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Botón "Ver detalles completos" */}
              <button
                onClick={handleVerDetalles}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[rgb(var(--role-accent))] hover:opacity-90 text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                <Eye size={16} /> Ver detalles completos
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(var(--role-accent));
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AprendeModal;