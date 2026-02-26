import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Clock, Ticket, ChevronRight, Filter, Bell } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [diaSeleccionado, setDiaSeleccionado] = useState('Día 01');

  // Datos de ejemplo basados en tu inspiración (Días de la agenda)
  const cronogramaDias = [
    { id: 'Día 01', fecha: '20 Abril 2026' },
    { id: 'Día 02', fecha: '21 Abril 2026' },
    { id: 'Día 03', fecha: '22 Abril 2026' },
  ];

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

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full">
        {/* =========================================
            🚀 HERO SECTION (Inspirado en EventFlow)
           ========================================= */}
        <section className="relative w-full h-[50vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          {/* Fondo con imagen y overlay oscuro */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1514525253344-99a4297ad322?q=80&w=2070&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-30 scale-110"
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#050505]/60 to-[#050505]"></div>
          </div>

          <div className="relative z-10 animate-in fade-in zoom-in duration-700">
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-white">
              AGENDA <span className="text-[#a855f7]">CULTURAL</span>
            </h1>
            <nav className="flex items-center justify-center gap-2 mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              <span className="hover:text-white cursor-pointer transition-colors">Inicio</span>
              <ChevronRight size={10} />
              <span className="text-[#a855f7]">Eventos</span>
            </nav>
          </div>
        </section>

        {/* =========================================
            📅 CRONOGRAMA Y LISTADO
           ========================================= */}
        <section className="max-w-6xl mx-auto px-6 md:px-16 py-20">
          
          {/* Cabecera del Cronograma */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-white/5 pb-10">
            <div className="text-left">
              <span className="text-[#a855f7] text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Agenda del Cauca</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic text-white leading-none">Sigue el Horario <br/> de Eventos</h2>
            </div>

            {/* Selector de Días (Inspirado en la imagen de referencia) */}
            <div className="flex gap-4">
              {cronogramaDias.map((dia) => (
                <button
                  key={dia.id}
                  onClick={() => setDiaSeleccionado(dia.id)}
                  className={`flex flex-col items-center p-4 rounded-3xl min-w-[100px] transition-all duration-300 border ${
                    diaSeleccionado === dia.id 
                    ? 'bg-[#a855f7] border-[#a855f7] shadow-[0_10px_30px_rgba(168,85,247,0.3)] scale-105' 
                    : 'bg-[#111] border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-widest ${diaSeleccionado === dia.id ? 'text-white' : 'text-gray-500'}`}>{dia.id}</span>
                  <span className={`text-[11px] font-bold mt-1 ${diaSeleccionado === dia.id ? 'text-white/80' : 'text-gray-400'}`}>{dia.fecha}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Listado de Tarjetas de Eventos */}
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(n => <div key={n} className="h-48 w-full bg-[#111] animate-pulse rounded-[32px]"></div>)
            ) : eventos.length > 0 ? (
              eventos.map((evento) => (
                <div 
                  key={evento.id} 
                  className="group relative bg-[#111] border border-white/5 rounded-[32px] overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 hover:border-[#a855f7]/40 hover:shadow-2xl transition-all duration-500"
                >
                  {/* Imagen del Evento */}
                  <div className="w-full md:w-64 h-44 rounded-2xl overflow-hidden relative shadow-xl">
                    <img 
                      src={evento.image_path || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={evento.title}
                    />
                    <div className="absolute top-3 left-3 bg-[#a855f7] text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {evento.category || 'Cultural'}
                    </div>
                  </div>

                  {/* Información del Evento */}
                  <div className="flex-1 text-left">
                    <h3 className="text-2xl font-black uppercase italic text-white group-hover:text-[#a855f7] transition-colors">{evento.title}</h3>
                    <p className="text-gray-500 text-xs mt-3 leading-relaxed line-clamp-2 max-w-xl">
                      {evento.description || "Un evento único donde la tradición y el arte se encuentran en el corazón de Popayán."}
                    </p>
                    
                    {/* Detalles (Hora y Ubicación) */}
                    <div className="flex flex-wrap gap-6 mt-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={14} className="text-[#a855f7]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{evento.start_time || '10:00 AM'} - {evento.end_time || '08:00 PM'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin size={14} className="text-[#a855f7]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{evento.location || 'Centro Histórico, Popayán'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Acción */}
                  <button className="w-full md:w-auto bg-[#a855f7] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all shadow-lg active:scale-95">
                    Asistir <Ticket size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[40px]">
                <Calendar className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.2em]">No hay eventos programados para este día</p>
              </div>
            )}
          </div>
        </section>

        {/* =========================================
            📧 NEWSLETTER (Inspirado en la franja morada de la imagen)
           ========================================= */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto rounded-[40px] bg-gradient-to-r from-[#a855f7] via-[#7c3aed] to-[#3b82f6] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
            {/* Círculos decorativos */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black uppercase italic text-white mb-6">¡No te pierdas de nada!</h2>
              <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-10">Suscríbete para recibir alertas de eventos y festivales en Popayán</p>
              
              <div className="max-w-lg mx-auto relative group">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico..."
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-5 px-8 pr-16 text-white outline-none focus:bg-white/20 transition-all placeholder:text-white/40 font-bold text-sm"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-[#a855f7] p-3 rounded-xl hover:scale-110 transition-transform">
                  <Bell size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Eventos;