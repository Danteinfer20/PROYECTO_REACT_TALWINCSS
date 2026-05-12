import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarDays, Landmark, Hourglass, Ticket, Sparkles, 
  CheckCircle, Clock, Loader2, MessageCircle, User, ChevronRight 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; 

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [procesando, setProcesando] = useState(false);

  // 🔥 MOTOR DE ESTADO PARA ROL CROMÁTICO
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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvento = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/events/${id}`, config);
        setEvento(res.data.data);
        if (res.data.data.user_ticket) setTicket(res.data.data.user_ticket);
      } catch (error) {
        console.error("Error cargando evento");
      } finally {
        setLoading(false);
      }
    };
    fetchEvento();
  }, [id, token, API_URL]);

  const handleGenerarTicket = async () => {
    if (!token) return navigate('/login');
    setProcesando(true);
    try {
      const res = await axios.post(`${API_URL}/events/${evento.id}/attend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicket(res.data.data);
    } catch (error) {
      console.error("Error generando ticket");
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
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-mono text-[rgb(var(--role-accent))] tracking-[0.5em] uppercase text-[10px] transition-colors duration-500">
      <Loader2 className="animate-spin mb-4" size={32} />
      Sincronizando Obra...
    </div>
  );

  if (!evento) return null;

  let imageUrl = evento.images?.[0] || FALLBACK_IMAGE;
  if (imageUrl !== FALLBACK_IMAGE && !imageUrl.startsWith('http')) {
    imageUrl = `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/storage/${imageUrl}`;
  }

  const mapQuery = encodeURIComponent(`${evento.location?.name || ''} Popayán, Colombia`);
  const eventDate = new Date(evento.start_date);
  const fecha = eventDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const hora = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[rgb(var(--role-accent))]/30 overflow-x-hidden transition-colors duration-500">
      <Navbar />

      {/* ATMÓSFERA INMERSIVA (Sincronizada con el modo) */}
      <div className="absolute top-0 left-0 w-full h-[80vh] pointer-events-none overflow-hidden z-0">
        <img src={imageUrl} className="w-full h-full object-cover blur-[180px] opacity-[0.15] scale-125" alt="Atmósfera" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/40 via-[var(--bg-primary)]/80 to-[var(--bg-primary)] transition-colors duration-500"></div>
      </div>

      <main className="flex-1 w-full relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 pt-24 pb-40">
        
        {/* HEADER */}
        <header className="mb-12 space-y-3">
          <div className="inline-flex items-center gap-3 bg-[var(--bg-container)]/80 border border-[var(--border-color)] px-4 py-1.5 rounded-full backdrop-blur-xl shadow-sm">
            <Sparkles size={14} className="text-[rgb(var(--role-accent))]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-body)]">Propuesta Cultural</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold italic uppercase tracking-tighter leading-tight text-[var(--text-heading)] drop-shadow-sm max-w-[1000px] transition-colors duration-500">
            {evento.title}
          </h1>
        </header>

        {/* DISTRIBUCIÓN BENTO 8 / 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* COLUMNA 8: AFICHE Y NARRATIVA */}
          <div className="lg:col-span-8 space-y-10">
            <div className="relative rounded-[40px] overflow-hidden bg-[var(--bg-card)] shadow-lg border border-[var(--border-color)] transition-colors duration-500">
              <img
                src={imageUrl}
                className="w-full aspect-[16/10] object-cover"
                alt={evento.title}
              />
            </div>

            <div className="space-y-6 max-w-[700px] pl-4 border-l-2 border-[rgb(var(--role-accent))]/30 transition-colors duration-500">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--text-body)] italic">El Manifiesto</h3>
              <p className="text-[var(--text-heading)] text-xl md:text-2xl leading-relaxed font-light italic transition-colors duration-500">
                “{evento.content || evento.excerpt || 'La cultura es la huella de nuestra alma en el tiempo.'}”
              </p>
              <div className="flex gap-4 pt-2">
                <div className="px-5 py-2 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-xl text-[9px] font-bold text-[var(--text-body)] uppercase tracking-widest shadow-sm">
                  Aforo: {evento.max_capacity || 'Controlado'}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 4: TAQUILLA COMPACTA */}
          <aside className="lg:col-span-4 w-full lg:sticky lg:top-32 space-y-6">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] p-8 shadow-sm space-y-8 transition-colors duration-500">
              
              <div className="space-y-6">
                {[
                  { icon: CalendarDays, label: 'Cronología', value: fecha },
                  { icon: Hourglass, label: 'Horario', value: hora },
                  { icon: Landmark, label: 'Sede Oficial', value: evento.location?.name || 'Popayán' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center shrink-0 shadow-inner">
                      <item.icon size={18} className="text-[rgb(var(--role-accent))]" />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-[var(--text-body)] uppercase tracking-widest mb-0.5">{item.label}</p>
                      <p className="text-sm font-bold text-[var(--text-heading)] uppercase transition-colors">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-[var(--border-color)]"></div>

              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-[9px] font-bold text-[rgb(var(--role-accent))] tracking-[0.4em] uppercase mb-1">Inversión</p>
                  <p className="text-2xl font-bold italic text-[var(--text-heading)] tracking-tighter transition-colors">
                    {evento.event_type === 'free' ? 'ENTRADA LIBRE' : `$${evento.price} COP`}
                  </p>
                </div>

                {!ticket ? (
                  <button
                    onClick={handleGenerarTicket}
                    disabled={procesando}
                    className="w-full bg-[rgb(var(--role-accent))] text-white hover:opacity-90 py-4 rounded-xl font-bold italic uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(var(--role-accent),0.3)]"
                  >
                    {procesando ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={18} />}
                    Vincular Pase
                  </button>
                ) : (
                  <div className="bg-[var(--bg-primary)]/50 p-6 rounded-2xl border border-[var(--border-color)] flex flex-col items-center gap-5 shadow-inner">
                    <div className="flex items-center gap-2">
                      {ticket.status === 'confirmed' ? <CheckCircle size={16} className="text-emerald-500" /> : <Clock size={16} className="text-[rgb(var(--role-accent))] animate-pulse" />}
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${ticket.status === 'confirmed' ? 'text-emerald-500' : 'text-[rgb(var(--role-accent))]'}`}>
                        {ticket.status === 'confirmed' ? 'Acceso Autorizado' : 'En Validación'}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200">
                      <QRCodeSVG value={ticket.qr_code} size={120} level="H" />
                    </div>
                    {ticket.status === 'interested' && (
                      <button onClick={handleWhatsAppContact} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 shadow-lg">
                        <MessageCircle size={14}/> Solicitar Validación
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CURADURÍA */}
            <Link to={`/artesanos/${evento.organizer?.username}`} className="flex items-center justify-between bg-[var(--bg-container)] border border-[var(--border-color)] rounded-3xl p-5 hover:border-[rgb(var(--role-accent))]/40 transition-all shadow-sm group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden shrink-0 shadow-inner p-0.5">
                  {evento.organizer?.profile_picture ? (
                    <img src={evento.organizer.profile_picture} className="w-full h-full object-cover rounded-full" alt="organizer" />
                  ) : (
                    <User className="p-2 text-[rgb(var(--role-accent))] w-full h-full" />
                  )}
                </div>
                <div>
                  <p className="text-[8px] font-bold text-[var(--text-body)] uppercase tracking-widest">Curaduría</p>
                  <p className="text-xs font-bold text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors">{evento.organizer?.name || 'Autoridad Local'}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[var(--text-body)] group-hover:text-[rgb(var(--role-accent))] group-hover:translate-x-1 transition-all" />
            </Link>
          </aside>
        </div>

        {/* CARTOGRAFÍA LOCAL */}
        <section className="mt-12 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-[rgb(var(--role-accent))]/40"></div>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--text-body)] italic">Geometría de la Obra</h2>
          </div>
          <div className="w-full h-[450px] rounded-[40px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
            <iframe
              title="Mapa"
              src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full opacity-80 mix-blend-luminosity dark:filter dark:grayscale dark:invert-[90%] dark:contrast-[110%] transition-all duration-500"
              loading="lazy"
            />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default EventoDetalle;