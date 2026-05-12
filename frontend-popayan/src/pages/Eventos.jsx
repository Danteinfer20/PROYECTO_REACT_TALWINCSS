import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar as CalendarIcon, MapPin, Clock, Ticket, Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(new Date());
  const calendarRef = useRef(null);

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

  useEffect(() => {
    const formatForAPI = (date) => {
      const d = new Date(date);
      const month = '' + (d.getMonth() + 1);
      const day = '' + d.getDate();
      const year = d.getFullYear();
      return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
    };
    setDiaSeleccionado(formatForAPI(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const res = await axios.get(`${API_URL}/events`);
        setEventos(res.data.data || []);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, [API_URL]);

  const eventosFiltrados = eventos.filter(evento => {
    if (!evento.start_date) return false;
    return evento.start_date.startsWith(diaSeleccionado);
  });

  const extraerHora = (fechaString) => {
    if (!fechaString) return '--:--';
    const dateObj = new Date(fechaString);
    return dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const renderCalendarGrid = () => {
    const year = currentMonthView.getFullYear();
    const month = currentMonthView.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startingDay = getFirstDayOfMonth(year, month);
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      days.push(
        <button
          key={`day-${i}`}
          onClick={() => { setSelectedDate(new Date(year, month, i)); setIsCalendarOpen(false); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${isSelected ? 'bg-[rgb(var(--role-accent))] text-white shadow-md' : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/10 hover:text-[var(--text-heading)]'}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[rgb(var(--role-accent))]/30 transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-32">
        
        {/* HEADER REFINADO */}
        <section className="mb-16 border-b border-[var(--border-color)] pb-10 flex flex-col md:flex-row items-end justify-between gap-8 transition-colors duration-500">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-[var(--bg-container)] border border-[var(--border-color)] shadow-sm px-4 py-1.5 rounded-full w-fit transition-colors duration-500">
              <Sparkles size={12} className="text-[rgb(var(--role-accent))]" />
              <span className="text-[var(--text-body)] text-[9px] font-black uppercase tracking-[0.3em]">Cartelera Oficial</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-[var(--text-heading)] leading-none transition-colors duration-500">
              AGENDA <span className="text-[rgb(var(--role-accent))] italic">CULTURAL</span>
            </h1>
          </div>

          <div className="relative" ref={calendarRef}>
            <button 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-color)] px-6 py-4 rounded-[24px] hover:border-[rgb(var(--role-accent))]/50 transition-all shadow-sm"
            >
              <CalendarIcon size={18} className="text-[rgb(var(--role-accent))]" />
              <div className="flex flex-col items-start text-[10px] font-black uppercase tracking-widest text-[var(--text-body)]">
                <span>{selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </button>
            {isCalendarOpen && (
              <div className="absolute top-full right-0 mt-4 w-[320px] bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95 transition-colors duration-500">
                 <div className="flex justify-between items-center mb-4 text-[var(--text-heading)]">
                    <button className="hover:text-[rgb(var(--role-accent))] transition-colors" onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1))}><ChevronLeft size={16}/></button>
                    <span className="text-[10px] font-black uppercase">{currentMonthView.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                    <button className="hover:text-[rgb(var(--role-accent))] transition-colors" onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1))}><ChevronRight size={16}/></button>
                 </div>
                 <div className="grid grid-cols-7 gap-2">{renderCalendarGrid()}</div>
              </div>
            )}
          </div>
        </section>

        {/* 📚 GRID DE EVENTOS REPARADO */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => <div key={n} className="h-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] animate-pulse"></div>)}
            </div>
          ) : eventosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
              {eventosFiltrados.map((evento) => {
                let imageUrl = evento.images?.[0] || FALLBACK_IMAGE;
                if (imageUrl !== FALLBACK_IMAGE && !imageUrl.startsWith('http')) {
                    imageUrl = `http://localhost:8000/storage/${imageUrl}`;
                }

                return (
                  <Link to={`/evento/${evento.id}`} key={evento.id} className="group flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] overflow-hidden hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(var(--glass-shadow))]">
                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                      <img 
                        src={imageUrl} 
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                        alt={evento.title} 
                      />
                      <div className="absolute top-5 left-5 bg-[var(--bg-container)]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[var(--border-color)] text-[8px] font-black uppercase tracking-widest text-[var(--text-heading)] shadow-sm transition-colors duration-500">
                        {evento.event_type === 'free' ? 'Entrada Libre' : `$${evento.price} COP`}
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1 transition-colors duration-500">
                      <div className="flex gap-3 mb-4">
                        <span className="flex items-center gap-1.5 text-[9px] font-black text-[var(--text-body)] uppercase tracking-widest bg-[var(--text-heading)]/5 px-3 py-1.5 rounded-full border border-[var(--border-color)]">
                          <Clock size={10} className="text-[rgb(var(--role-accent))]" /> {extraerHora(evento.start_date)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold uppercase tracking-tighter text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors mb-4 line-clamp-2">
                        {evento.title}
                      </h3>
                      <p className="text-[var(--text-body)] text-xs leading-relaxed line-clamp-3 mb-8">
                        {evento.excerpt || evento.content || 'Sin descripción disponible.'}
                      </p>
                      <div className="mt-auto pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase text-[var(--text-body)]">Detalles de Agenda</span>
                         <div className="w-10 h-10 rounded-full bg-[var(--text-heading)]/5 flex items-center justify-center text-[var(--text-body)] group-hover:bg-[rgb(var(--role-accent))] group-hover:text-white transition-all shadow-sm">
                            <ChevronRight size={16} />
                         </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-40 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] shadow-sm transition-colors duration-500">
              <CalendarIcon size={32} className="mx-auto text-[var(--text-body)] opacity-50 mb-4" />
              <p className="text-[var(--text-body)] font-black uppercase text-[10px] tracking-widest">Agenda Vacía</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Eventos;