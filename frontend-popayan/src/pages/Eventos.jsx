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
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${isSelected ? 'bg-[#A855F7] text-white' : 'text-gray-400 hover:bg-white/10'}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#A855F7]/30">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-32">
        
        {/* HEADER REFINADO */}
        <section className="mb-16 border-b border-white/5 pb-10 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/10 px-4 py-1.5 rounded-full w-fit">
              <Sparkles size={12} className="text-[#A855F7]" />
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-[0.3em]">Cartelera Oficial</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-white leading-none">
              AGENDA <span className="text-[#A855F7]">CULTURAL</span>
            </h1>
          </div>

          <div className="relative" ref={calendarRef}>
            <button 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-4 bg-[#111113] border border-white/10 px-6 py-4 rounded-[24px] hover:border-[#A855F7]/50 transition-all shadow-xl"
            >
              <CalendarIcon size={18} className="text-[#A855F7]" />
              <div className="flex flex-col items-start text-[10px] font-black uppercase tracking-widest text-gray-300">
                <span>{selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
            </button>
            {isCalendarOpen && (
              <div className="absolute top-full right-0 mt-4 w-[320px] bg-[#0F0F11] border border-white/10 rounded-[24px] p-6 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                 {/* Calendario interno omitido por brevedad, se mantiene igual */}
                 <div className="flex justify-between mb-4">
                    <button onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1))}><ChevronLeft size={16}/></button>
                    <span className="text-[10px] font-black uppercase">{currentMonthView.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1))}><ChevronRight size={16}/></button>
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
              {[1, 2, 3].map(n => <div key={n} className="h-96 bg-white/[0.02] rounded-[40px] animate-pulse"></div>)}
            </div>
          ) : eventosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
              {eventosFiltrados.map((evento) => {
                
                // 🔥 SOLUCIÓN AL ERROR FATAL: Sincronización de rutas con Laravel Storage
                let imageUrl = evento.images?.[0] || FALLBACK_IMAGE;
                if (imageUrl !== FALLBACK_IMAGE && !imageUrl.startsWith('http')) {
                    imageUrl = `http://localhost:8000/storage/${imageUrl}`;
                }

                return (
                  <Link to={`/evento/${evento.id}`} key={evento.id} className="group flex flex-col h-full bg-[#0F0F11] border border-white/5 rounded-[40px] overflow-hidden hover:border-[#A855F7]/40 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(168,85,247,0.1)]">
                    <div className="w-full aspect-[4/3] relative overflow-hidden bg-[#0A0A0C]">
                      <img 
                        src={imageUrl} 
                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                        alt={evento.title} 
                      />
                      <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest">
                        {evento.event_type === 'free' ? 'Entrada Libre' : `$${evento.price} COP`}
                      </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-1">
                      <div className="flex gap-3 mb-4">
                        <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/5">
                          <Clock size={10} className="text-[#A855F7]" /> {extraerHora(evento.start_date)}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold uppercase tracking-tighter text-white group-hover:text-[#A855F7] transition-colors mb-4 line-clamp-2">
                        {evento.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-8">
                        {evento.excerpt || evento.content || 'Sin descripción disponible.'}
                      </p>
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-black uppercase text-gray-500">Detalles de Agenda</span>
                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#A855F7] transition-all">
                            <ChevronRight size={16} />
                         </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-40 bg-[#0F0F11] border border-white/5 rounded-[40px]">
              <CalendarIcon size={32} className="mx-auto text-gray-800 mb-4" />
              <p className="text-gray-600 font-black uppercase text-[10px] tracking-widest">Agenda Vacía</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Eventos;