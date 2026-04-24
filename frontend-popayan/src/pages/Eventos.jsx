import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar as CalendarIcon, MapPin, Clock, Ticket, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // 🔥 URL de respaldo premium
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541336318489-083c799fa774?q=80&w=2070";

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
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/v1/events');
        setEventos(res.data.data || []);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  const eventosFiltrados = eventos.filter(evento => {
    if (!evento.start_date) return false;
    return evento.start_date.startsWith(diaSeleccionado);
  });

  const extraerHora = (fechaString) => {
    if (!fechaString) return '--:--';
    try {
      const dateObj = new Date(fechaString);
      return dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '--:--';
    }
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

    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year;
      
      days.push(
        <button
          key={`day-${i}`}
          onClick={() => {
            setSelectedDate(new Date(year, month, i));
            setIsCalendarOpen(false);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
            isSelected 
              ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
              : isToday 
                ? 'border border-[#a855f7] text-[#a855f7]' 
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const nextMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1));

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#a855f7]/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#a855f7]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <Navbar className="relative z-50" />

      <main className="flex-1 w-full relative z-10 pt-24 md:pt-32 pb-24">
        
        {/* 🔥 HERO: ALINEACIÓN MILIMÉTRICA */}
        <section className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 mb-10 border-b border-white/5 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center gap-2 bg-[#111113]/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full shadow-sm">
              <Sparkles size={12} className="text-[#a855f7] animate-pulse" />
              <span className="text-gray-300 text-[9px] font-black uppercase tracking-[0.4em]">Cartelera Oficial</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black uppercase italic tracking-tighter text-white flex flex-wrap lg:flex-nowrap items-baseline gap-3 leading-none">
              AGENDA <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#a855f7] to-[#a855f7]">CULTURAL</span>
            </h1>
          </div>

          <div className="relative w-full md:w-auto" ref={calendarRef}>
            <button 
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className="flex items-center gap-4 bg-[#111113]/80 backdrop-blur-md border border-white/10 hover:border-[#a855f7]/50 px-6 py-4 rounded-[20px] shadow-lg transition-all group w-full md:w-auto"
            >
              <div className="bg-white/5 p-2 rounded-full group-hover:bg-[#a855f7]/20 transition-colors">
                <CalendarIcon size={20} className="text-[#a855f7]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-gray-400">Fecha Seleccionada</span>
                <span className="text-sm font-black uppercase tracking-tight text-white whitespace-nowrap">
                  {selectedDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </button>

            {isCalendarOpen && (
              <div className="absolute top-full right-0 lg:right-0 left-0 lg:left-auto mt-4 w-full md:w-[320px] bg-[#111113]/95 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={prevMonth} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={16} /></button>
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    {currentMonthView.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextMonth} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={16} /></button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                    <span key={day} className="text-[9px] font-mono font-bold text-gray-500">{day}</span>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2 justify-items-center">
                  {renderCalendarGrid()}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* LISTADO DE EVENTOS */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(n => (
                <div key={n} className="h-48 w-full bg-[#111113]/50 border border-white/5 animate-pulse rounded-[40px]"></div>
              ))
            ) : eventosFiltrados.length > 0 ? (
              eventosFiltrados.map((evento) => {
                
                // 🔥 PROTECCIÓN ESTRICTA DE TIPOS CONTRA EL ERROR DE CONSOLA
                let imageUrl = evento.media?.[0]?.url || FALLBACK_IMAGE;

                // Solo si es un string válido, validamos la regla de moracastilla
                if (typeof imageUrl === 'string' && imageUrl.includes('moracastilla.com')) {
                  imageUrl = FALLBACK_IMAGE;
                }

                return (
                  <Link to={`/evento/${evento.id}`} key={evento.id} className="block group">
                    <div className="relative bg-[#111113]/80 backdrop-blur-sm border border-white/5 rounded-[40px] overflow-hidden p-6 flex flex-col md:flex-row items-center gap-6 hover:border-[#a855f7]/40 hover:bg-[#151518] hover:shadow-[0_15px_40px_rgba(168,85,247,0.1)] transition-all duration-500">
                      
                      <div className="w-full md:w-72 h-56 md:h-full min-h-[200px] rounded-[30px] overflow-hidden relative bg-[#0A0A0C] shrink-0">
                        <img 
                          src={imageUrl} 
                          className="w-full h-full object-cover grayscale-[30%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0 relative z-10"
                          alt={evento.title}
                          onError={(e) => { 
                            if(e.target.src !== FALLBACK_IMAGE) {
                              e.target.src = FALLBACK_IMAGE;
                            } else {
                              e.target.style.display = 'none'; 
                              e.target.parentNode.classList.add('bg-gradient-to-br', 'from-[#111113]', 'to-[#a855f7]/20'); 
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent opacity-80 z-20"></div>
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest z-30 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse"></span>
                          {evento.event_type === 'free' ? 'Entrada Libre' : `$${evento.price}`}
                        </div>
                      </div>

                      <div className="flex-1 text-left w-full py-4">
                        <h3 className="text-3xl lg:text-4xl font-black uppercase italic text-white group-hover:text-[#a855f7] transition-colors leading-[0.9] tracking-tighter mb-4">{evento.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 max-w-2xl font-medium">
                          {evento.excerpt || evento.content || 'Únete a nosotros en esta experiencia cultural única en Popayán.'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                          <div className="flex items-center gap-3 bg-[#0A0A0C]/50 px-5 py-3 rounded-full border border-white/5">
                            <Clock size={14} className="text-[#a855f7]" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-white">
                              {extraerHora(evento.start_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 bg-[#0A0A0C]/50 px-5 py-3 rounded-full border border-white/5">
                            <MapPin size={14} className="text-gray-500" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-gray-300">
                              {evento.location?.name || 'Centro Histórico'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-auto mt-6 md:mt-0 flex justify-end">
                        <div className="bg-white/5 group-hover:bg-[#a855f7] border border-white/10 text-white px-8 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all duration-300 shadow-lg">
                          Ver Detalles <Ticket size={16} className="group-hover:rotate-12 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="w-full flex flex-col justify-center items-center py-24 bg-[#111113]/30 backdrop-blur-sm border border-dashed border-white/5 rounded-[40px]">
                <div className="bg-white/5 p-6 rounded-full mb-6">
                  <CalendarIcon className="text-[#a855f7] opacity-80" size={32} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white mb-3">Agenda Despejada</h3>
                <p className="text-gray-500 font-mono font-bold uppercase text-[10px] tracking-[0.3em]">No hay eventos programados para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}.</p>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Eventos;