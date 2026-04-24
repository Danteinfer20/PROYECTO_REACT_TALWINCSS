import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CalendarDays, Landmark, Hourglass, Ticket, AlertCircle, 
  MessageCircle, User, Palette, Sparkles, Compass, Users, 
  QrCode, CheckCircle, Clock, Loader2, Share2, Heart, Eye, ChevronRight 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EventoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [ticket, setTicket] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541336318489-083c799fa774?q=80&w=2070";
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvento = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/events/${id}`, config);
        setEvento(res.data.data);
        if (res.data.data.user_ticket) setTicket(res.data.data.user_ticket);
      } catch (error) {
        console.error("Fallo en la sincronización del evento");
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
      showToast("⭐ Pase Digital Vinculado");
    } catch (error) {
      showToast(error.response?.data?.message || "❌ Error en terminal");
    } finally {
      setProcesando(false);
    }
  };

  const handleWhatsAppContact = () => {
    const telefono = evento.organizer?.phone || '573000000000'; 
    const mensaje = `Saludos. Soy usuario de Popayán Cultural. Requiero validación P2P para el evento "${evento.title}" (ID: ${ticket?.qr_code}).`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center font-mono text-[#A855F7] text-[10px] uppercase tracking-[0.3em]">
      <Loader2 size={32} className="animate-spin mb-4" /> Desplegando Agenda...
    </div>
  );

  if (!evento) return null;

  let imageUrl = evento.images?.[0] || FALLBACK_IMAGE;
  if (imageUrl !== FALLBACK_IMAGE && !imageUrl.startsWith('http')) imageUrl = `http://localhost:8000/storage/${imageUrl}`;

  const mapQuery = encodeURIComponent(`${evento.location?.name || ''} ${evento.location?.address || ''} Popayán`);
  const eventDate = new Date(evento.start_date);
  const fechaLimpia = eventDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const horaLimpia = eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#A855F7]/30 overflow-x-hidden">
      <Navbar />

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#111113]/90 backdrop-blur-xl border border-[#A855F7]/30 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
          <CheckCircle size={16} className="text-[#A855F7]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full relative pt-16 md:pt-20">
        
        {/* ATMÓSFERA VISUAL */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[70vh]">
          <img src={imageUrl} className="w-full h-full object-cover scale-110 blur-[100px] opacity-15 grayscale-[30%]" alt="aura" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C]/20 via-[#0A0A0C]/80 to-[#0A0A0C]"></div>
        </div>

        <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12">
          
          {/* HEADER MONUMENTAL: Diseño Neo-Tradición */}
          <div className="flex flex-col items-start gap-4 mb-10 border-b border-white/5 pb-8">
            <span className="inline-flex items-center gap-1.5 bg-[#A855F7]/10 border border-[#A855F7]/20 text-[#A855F7] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.25em]">
              <Sparkles size={10} className="animate-pulse" /> {evento.category?.name || 'AGENDA CULTURAL'}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter leading-[0.9] text-white drop-shadow-2xl">
              {evento.title}
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* COLUMNA IZQUIERDA: Relato e Identidad (65%) */}
            <div className="w-full lg:w-[65%] flex flex-col gap-12">
              
              {/* Afiche de Gran Formato */}
              <div className="relative w-full aspect-video rounded-[40px] overflow-hidden bg-[#111113] border border-white/5 shadow-2xl group">
                <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" alt={evento.title} />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0A0A0C]/40 to-transparent"></div>
              </div>

              {/* Logística en Píldoras (Optimizado) */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-3 bg-[#111113]/40 backdrop-blur-md px-5 py-3 rounded-full border border-white/5 shadow-lg w-fit">
                   <Compass size={16} className="text-[#A855F7]" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Llegar 15min antes</span>
                </div>
                <div className="flex items-center gap-3 bg-[#111113]/40 backdrop-blur-md px-5 py-3 rounded-full border border-white/5 shadow-lg w-fit">
                   <Users size={16} className="text-[#A855F7]" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Aforo: {evento.max_capacity || 'Cupo Limitado'}</span>
                </div>
              </div>

              {/* Relato del Evento */}
              <div className="bg-[#111113]/20 backdrop-blur-sm p-8 md:p-12 rounded-[40px] border border-white/5 shadow-inner">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#A855F7]"></div> Manifiesto del Evento
                </h3>
                <div className="text-gray-300 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                  {evento.content || evento.excerpt || 'Este evento aún no ha publicado su manifiesto detallado.'}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Taquilla Flotante (35%) */}
            <div className="w-full lg:w-[35%] flex flex-col gap-6 lg:sticky lg:top-24">
              
              {/* Bento de Resumen */}
              <div className="bg-[#111113]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-2xl flex flex-col gap-8">
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-[20px] bg-black/40 flex items-center justify-center border border-white/5">
                      <CalendarDays size={20} className="text-[#A855F7]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Fecha</p>
                      <p className="text-sm font-black text-white uppercase">{fechaLimpia}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-[20px] bg-black/40 flex items-center justify-center border border-white/5">
                      <Hourglass size={20} className="text-[#A855F7]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Hora de Apertura</p>
                      <p className="text-sm font-black text-white uppercase">{horaLimpia}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-[20px] bg-black/40 flex items-center justify-center border border-white/5">
                      <Landmark size={20} className="text-[#A855F7]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Recinto</p>
                      <p className="text-sm font-black text-white">{evento.location?.name || 'Por confirmar'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#A855F7]/10 p-6 rounded-[30px] border border-[#A855F7]/20 flex flex-col gap-1">
                   <span className="text-[9px] font-black text-[#A855F7] uppercase tracking-[0.2em]">Inversión Cultural</span>
                   <span className="text-2xl font-black text-white">
                     {evento.event_type === 'free' ? 'ENTRADA LIBRE' : `$${evento.price} COP`}
                   </span>
                </div>

                {/* TERMINAL DE TICKETING */}
                {!ticket ? (
                  <button 
                    onClick={handleGenerarTicket}
                    disabled={procesando}
                    className="w-full bg-white text-black hover:bg-[#A855F7] hover:text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {procesando ? <Loader2 size={18} className="animate-spin" /> : <Ticket size={18} />}
                    Vincular Pase Digital
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className={`p-8 rounded-[40px] border-2 flex flex-col items-center gap-4 ${ticket.status === 'confirmed' ? 'bg-[#25D366]/5 border-[#25D366]/20' : 'bg-[#A855F7]/5 border-[#A855F7]/20'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        {ticket.status === 'confirmed' ? <CheckCircle size={18} className="text-[#25D366]" /> : <Clock size={18} className="text-[#A855F7] animate-pulse" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ticket.status === 'confirmed' ? 'text-[#25D366]' : 'text-[#A855F7]'}`}>
                          {ticket.status === 'confirmed' ? 'Acceso Autorizado' : 'Validación P2P Requerida'}
                        </span>
                      </div>
                      <div className="bg-white p-5 rounded-[30px] shadow-2xl">
                        <QrCode size={110} className="text-black" />
                      </div>
                      <span className="font-mono text-[10px] tracking-[0.5em] text-gray-500 mt-2">{ticket.qr_code}</span>
                    </div>
                    {ticket.status === 'interested' && (
                       <button onClick={handleWhatsAppContact} className="w-full bg-[#25D366] hover:bg-[#1fa851] text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-lg flex items-center justify-center gap-3">
                         <MessageCircle size={18} /> Validar Pago
                       </button>
                    )}
                  </div>
                )}
              </div>

              {/* Autoría del Evento */}
              <Link to={`/artesanos/${evento.organizer?.username}`} className="bg-[#111113]/50 backdrop-blur-xl border border-white/5 rounded-full p-3 pr-6 flex items-center justify-between group hover:border-[#A855F7]/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden shrink-0">
                     {evento.organizer?.profile_picture ? <img src={evento.organizer.profile_picture} className="w-full h-full object-cover" /> : <User className="p-2 text-[#A855F7]" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Organiza</span>
                      <span className="text-xs font-black text-white group-hover:text-[#A855F7] transition-colors">{evento.organizer?.name}</span>
                   </div>
                </div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* MAPA PANORÁMICO (Full-Width al final) */}
          <div className="mt-20 mb-20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-8 flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-[#A855F7]"></div> Ubicación Geográfica
            </h3>
            <div className="w-full h-[500px] rounded-[50px] overflow-hidden border border-white/5 shadow-2xl relative group/map bg-[#111113]">
               <div className="absolute inset-0 border-[8px] border-[#A855F7]/5 rounded-[50px] pointer-events-none z-20"></div>
               <iframe 
                  title="Mapa Panorámico" 
                  src={`https://maps.google.com/maps?q=${mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`} 
                  className="w-full h-full filter grayscale-[50%] invert-[90%] contrast-[110%] opacity-80 hover:opacity-100 transition-opacity duration-1000 relative z-10" 
                  allowFullScreen="" 
                  loading="lazy">
               </iframe>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EventoDetalle;