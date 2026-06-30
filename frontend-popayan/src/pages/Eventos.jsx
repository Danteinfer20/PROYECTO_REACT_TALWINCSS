import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Helper: parsea "YYYY-MM-DD" o "YYYY-MM-DD HH:mm:ss" como hora LOCAL (no UTC)
const parseLocalDate = (str) => {
  if (!str) return new Date();
  // Reemplaza espacio por T para ISO, y quita cualquier Z o +00:00
  const clean = str.replace(' ', 'T').replace('Z', '').replace(/\+\d{2}:\d{2}$/, '');
  return new Date(clean);
};

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(new Date());
  const calendarRef = useRef(null);

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

  // Formatear fecha seleccionada para comparar con start_date (YYYY-MM-DD)
  useEffect(() => {
    const d = selectedDate;
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    setDiaSeleccionado(`${year}-${month}-${day}`);
  }, [selectedDate]);

  // Cargar eventos
  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const res = await api.get('/events');
        setEventos(res.data.data || []);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarEventos();
  }, []);

  // Filtrar por fecha — compara solo la parte YYYY-MM-DD del start_date
  const eventosFiltrados = eventos.filter(evento => {
    if (!evento.start_date) return false;
    // start_date puede venir como "2026-06-25" o "2026-06-25T19:00:00"
    const soloFecha = evento.start_date.split('T')[0].split(' ')[0];
    return soloFecha === diaSeleccionado;
  });

  // Extraer hora legible SIN conversión UTC (hora local colombiana)
  const extraerHora = (fechaString) => {
    if (!fechaString) return '--:--';
    const d = parseLocalDate(fechaString);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Calendario
  const getDaysInMonth   = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };
  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const renderCalendarGrid = () => {
    const year  = currentMonthView.getFullYear();
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
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-200 ${
            isSelected
              ? 'bg-[rgb(var(--role-accent))] text-white shadow-sm'
              : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/10 hover:text-[var(--text-heading)]'
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setIsCalendarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">

        {/* Header */}
        <div className="mb-12 border-b border-[var(--border-color)] pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[rgb(var(--role-accent))]" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/70">
                  Cartelera oficial
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Agenda <span className="text-[rgb(var(--role-accent))]">Cultural</span>
              </h1>
              <p className="text-sm text-[var(--text-body)]/60 mt-2">
                Descubre los eventos que transforman Popayán
              </p>
            </div>

            {/* Selector de fecha */}
            <div className="relative" ref={calendarRef}>
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/40 rounded-xl px-4 py-2.5 transition-all shadow-sm"
              >
                <CalendarIcon size={16} className="text-[rgb(var(--role-accent))]" />
                <span className="text-xs font-medium text-[var(--text-heading)]">
                  {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </button>

              {isCalendarOpen && (
                <div className="absolute top-full right-0 mt-3 w-[280px] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--text-heading)]/10 transition"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-semibold uppercase">
                      {currentMonthView.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--text-heading)]/10 transition"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {daysOfWeek.map((day, i) => (
                      <span key={i} className="text-[9px] font-mono text-[var(--text-body)]/50 uppercase">{day}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 place-items-center">
                    {renderCalendarGrid()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de eventos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(n => (
              <div key={n} className="h-80 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : eventosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento) => {
              const imageUrl    = evento.cover_image || evento.images?.[0] || FALLBACK_IMAGE;
              const fechaEvento = parseLocalDate(evento.start_date); // ← hora local, no UTC
              const esGratuito  = evento.is_free || evento.price === 0;

              return (
                <Link
                  to={`/evento/${evento.id}`}
                  key={evento.id}
                  className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[var(--bg-primary)]">
                    <img
                      src={imageUrl}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={evento.title}
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                      {esGratuito ? 'Gratuito' : `$${Number(evento.price).toLocaleString('es-CO')}`}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-body)]/70 mb-2">
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={12} className="text-[rgb(var(--role-accent))]" />
                        <span>{fechaEvento.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-[rgb(var(--role-accent))]" />
                        <span>{extraerHora(evento.start_date)}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors line-clamp-2 mb-2">
                      {evento.title}
                    </h3>
                    {evento.location?.name && (
                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-body)]/60 mt-1">
                        <MapPin size={10} />
                        <span className="truncate">{evento.location.name}</span>
                      </div>
                    )}
                    <p className="text-xs text-[var(--text-body)]/70 mt-3 line-clamp-2">
                      {evento.description || evento.excerpt || 'Sin descripción disponible.'}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-end">
                      <span className="text-[10px] font-medium text-[rgb(var(--role-accent))] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Ver más <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <CalendarIcon size={40} className="mx-auto text-[var(--text-body)]/30 mb-3" />
            <p className="text-sm text-[var(--text-body)]/60">No hay eventos programados para esta fecha.</p>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="mt-4 text-xs text-[rgb(var(--role-accent))] hover:underline"
            >
              Ver eventos de hoy
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Eventos;