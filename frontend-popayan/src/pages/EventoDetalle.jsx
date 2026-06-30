import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays, MapPin, Clock, Ticket, Sparkles,
  CheckCircle, Loader2, MessageCircle, User, ChevronRight,
  Building2, Users, Globe, ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Helper: parsea fechas como hora LOCAL colombiana (no UTC)
const parseLocalDate = (str) => {
  if (!str) return new Date();
  const clean = str.replace(' ', 'T').replace('Z', '').replace(/\+\d{2}:\d{2}$/, '');
  return new Date(clean);
};

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247';
    switch (user.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      default: return '168 85 247';
    }
  };

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541336318489-083c799fa774?q=80&w=2070";
  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvento = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        // Laravel devuelve el objeto directo (EventResource sin wrapper data)
        const data = res.data.data ?? res.data;
        setEvento(data);

        // ← Corregido: user_attendance (no user_ticket)
        if (data.user_attendance) setTicket(data.user_attendance);
      } catch (error) {
        console.error("Error cargando evento", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id]);

  const handleGenerarTicket = async () => {
    if (!token) return navigate('/login');
    setProcesando(true);
    try {
      // Laravel devuelve { status, message, data: ticket }
      const res = await api.post(`/events/${evento.id}/attend`);
      const ticketData = res.data.data ?? res.data.attendance ?? res.data;
      setTicket(ticketData);
    } catch (error) {
      console.error("Error generando ticket", error);
    } finally {
      setProcesando(false);
    }
  };

  const handleWhatsAppContact = () => {
    const telefono = evento.organizer?.phone || '573000000000';
    const mensaje = `Hola, necesito validar mi asistencia a "${evento.title}" (ID: ${ticket?.qr_code}).`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  if (loading) return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin mb-3 text-[rgb(var(--role-accent))]" size={32} />
      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">Cargando evento...</span>
    </div>
  );

  if (!evento) return null;

  const imageUrl  = evento.cover_image || evento.images?.[0] || FALLBACK_IMAGE;
  const mapQuery  = encodeURIComponent(`${evento.location?.name || 'Popayán'} Popayán, Colombia`);

  // ← Corregido: parseLocalDate evita el desfase de 5 horas UTC
  const eventDate = parseLocalDate(evento.start_date);
  const fecha     = eventDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const hora      = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const esGratuito = evento.is_free || evento.price === 0;

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col">
      <Navbar />

      <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        {/* HEADER */}
        <div className="mb-12 border-b border-[var(--border-color)] pb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[rgb(var(--role-accent))]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/70">Evento cultural</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            {evento.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-8 space-y-10">

            <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-md">
              <img src={imageUrl} className="w-full aspect-[16/9] object-cover" alt={evento.title} />
            </div>

            <div className="relative bg-[var(--bg-container)]/60 rounded-2xl p-8 border-l-4 border-[rgb(var(--role-accent))] shadow-sm">
              <div className="absolute -top-3 left-6 text-5xl text-[rgb(var(--role-accent))]/20 font-serif leading-none">"</div>
              <p className="text-base md:text-lg text-[var(--text-heading)]/90 italic leading-relaxed pl-4">
                {evento.description || evento.excerpt || 'La cultura es la huella de nuestra alma en el tiempo.'}
              </p>
              <div className="absolute -bottom-3 right-6 text-5xl text-[rgb(var(--role-accent))]/20 font-serif leading-none">"</div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-full text-xs font-medium text-[var(--text-body)]">
                <Users size={14} className="text-[rgb(var(--role-accent))]" />
                Aforo: {evento.max_capacity || 'Sin límite'}
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-full text-xs font-medium text-[var(--text-body)]">
                <Building2 size={14} className="text-[rgb(var(--role-accent))]" />
                {evento.location?.name || 'Por confirmar'}
              </span>
              {esGratuito && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
                  <Ticket size={14} /> Entrada libre
                </span>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <aside className="lg:col-span-4 space-y-8">

            {/* Detalles */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-body)]/60 border-b border-[var(--border-color)] pb-3">
                Detalles del evento
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center shrink-0">
                    <CalendarDays size={18} className="text-[rgb(var(--role-accent))]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">Fecha</p>
                    <p className="text-sm font-medium text-[var(--text-heading)]">{fecha}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-[rgb(var(--role-accent))]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">Hora</p>
                    <p className="text-sm font-medium text-[var(--text-heading)]">{hora}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[rgb(var(--role-accent))]" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">Lugar</p>
                    <p className="text-sm font-medium text-[var(--text-heading)]">{evento.location?.name || 'Popayán'}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border-color)] text-center">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">Inversión</p>
                <p className="text-2xl font-bold text-[var(--text-heading)] mt-1">
                  {esGratuito ? 'Entrada libre' : `$${Number(evento.price).toLocaleString('es-CO')} COP`}
                </p>
              </div>
            </div>

            {/* Ticket */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-body)]/60 border-b border-[var(--border-color)] pb-3 mb-4">
                {ticket ? 'Tu pase de acceso' : '¿Asistirás?'}
              </h3>
              {!ticket ? (
                <button
                  onClick={handleGenerarTicket}
                  disabled={procesando}
                  className="w-full bg-[rgb(var(--role-accent))] text-white py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-98 disabled:opacity-50 shadow-sm"
                >
                  {procesando ? <Loader2 size={18} className="animate-spin" /> : <Ticket size={18} />}
                  Obtener mi entrada
                </button>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    {ticket.status === 'confirmed' ? (
                      <CheckCircle size={18} className="text-emerald-500" />
                    ) : (
                      <Clock size={18} className="text-[rgb(var(--role-accent))] animate-pulse" />
                    )}
                    <span className={`text-xs font-medium ${ticket.status === 'confirmed' ? 'text-emerald-500' : 'text-[rgb(var(--role-accent))]'}`}>
                      {ticket.status === 'confirmed' ? 'Acceso confirmado' : 'Validación pendiente'}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <div className="bg-white p-3 rounded-xl shadow-md inline-block border border-gray-200">
                      <QRCodeSVG value={ticket.qr_code || ticket.ticket_code || 'N/A'} size={110} level="H" />
                    </div>
                  </div>
                  {ticket.status === 'interested' && (
                    <button
                      onClick={handleWhatsAppContact}
                      className="w-full bg-[#25D366] text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 hover:bg-[#20b859] transition"
                    >
                      <MessageCircle size={16} /> Solicitar validación por WhatsApp
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Organizador */}
            <Link
              to={`/artesanos/${evento.organizer?.username}`}
              className="block bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 hover:border-[rgb(var(--role-accent))]/40 transition group shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] border-2 border-[rgb(var(--role-accent))] overflow-hidden flex items-center justify-center shrink-0">
                  {evento.organizer?.profile_picture ? (
                    <img src={evento.organizer.profile_picture} className="w-full h-full object-cover" alt="organizer" />
                  ) : (
                    <User size={20} className="text-[rgb(var(--role-accent))]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition truncate">
                      {evento.organizer?.name || 'Autoridad local'}
                    </p>
                    <span className="text-[8px] font-mono uppercase tracking-widest bg-[rgb(var(--role-accent))]/10 text-[rgb(var(--role-accent))] px-2 py-0.5 rounded-full">
                      Organizador
                    </span>
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">
                    Curaduría del evento
                  </p>
                </div>
                <ChevronRight size={18} className="text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </aside>
        </div>

        {/* MAPA */}
        <div className="mt-16 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center">
              <MapPin size={16} className="text-[rgb(var(--role-accent))]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-heading)]">Ubicación del evento</h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">
                {evento.location?.name || 'Popayán'} • Cómo llegar
              </p>
            </div>
            <a
              href={`https://maps.google.com/maps?q=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-[rgb(var(--role-accent))] hover:underline font-medium"
            >
              Abrir en Google Maps <ExternalLink size={12} />
            </a>
          </div>
          <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            <iframe
              title="Mapa del evento"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventoDetalle;