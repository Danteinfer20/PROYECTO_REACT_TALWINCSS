import React from 'react';
import { BookOpen, Users, Video, PlusCircle, Play, ChevronRight, Award } from 'lucide-react';

const EducatorDashboard = ({ user, setSeccionActiva }) => {
  // 💡 Mock Data: Estadísticas y rutas simuladas del educador
  const estadisticas = [
    { id: 1, titulo: 'Estudiantes Activos', valor: '342', icono: Users, color: 'text-[#a855f7]', accion: 'escritorio' },
    { id: 2, titulo: 'Rutas Educativas', valor: '4', icono: BookOpen, color: 'text-blue-500', accion: 'rutas' },
    { id: 3, titulo: 'Material Didáctico', valor: '18', icono: Video, color: 'text-green-500', accion: 'material' },
  ];

  const rutasRecientes = [
    { 
      id: 1, 
      titulo: 'Historia de la Arquitectura Blanca', 
      nivel: 'Básico', 
      estudiantes: 124,
      imagen: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=500&auto=format&fit=crop' 
    },
    { 
      id: 2, 
      titulo: 'Técnicas de Orfebrería Tradicional', 
      nivel: 'Intermedio', 
      estudiantes: 89,
      imagen: 'https://images.unsplash.com/photo-1610992015732-2449b084936d?q=80&w=500&auto=format&fit=crop' 
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 animate-in fade-in duration-700">
      
      {/* HEADER DEL DASHBOARD */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[#a855f7] font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-2 block flex items-center gap-2">
            <Award size={14} className="text-[#a855f7]" /> Mi Aula Virtual
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
            Hola, <span className="text-[#a855f7] drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">Maestro</span>
          </h1>
          <p className="text-gray-500 font-mono text-xs mt-3 tracking-widest uppercase">
            Transformando mentes a través de la cultura
          </p>
        </div>
        
        {/* BOTONES DE ACCIÓN RÁPIDA */}
        <div className="flex gap-4">
          <button className="bg-[#111113] border border-white/10 hover:border-[#a855f7]/50 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Video size={14} className="text-[#a855f7]" /> Subir Material
          </button>
          <button className="bg-[#a855f7] text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_10px_20px_rgba(168,85,247,0.3)] hover:bg-purple-500">
            <PlusCircle size={14} /> Crear Ruta
          </button>
        </div>
      </header>

      {/* GRID DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {estadisticas.map((stat) => (
          <button 
            key={stat.id} 
            onClick={() => setSeccionActiva(stat.accion)}
            className="w-full text-left bg-[#111113] border border-white/5 rounded-[32px] p-8 flex items-center justify-between hover:border-white/10 hover:shadow-[0_10px_30px_rgba(168,85,247,0.05)] transition-all duration-500 group cursor-pointer"
          >
            <div>
              <span className="text-gray-500 font-mono text-[10px] font-black uppercase tracking-widest block mb-2">
                {stat.titulo}
              </span>
              <span className="text-4xl font-black italic text-white group-hover:text-[#a855f7] transition-colors">
                {stat.valor}
              </span>
            </div>
            <div className={`p-4 rounded-[24px] bg-[#0A0A0C] border border-white/5 shadow-inner ${stat.color}`}>
              <stat.icono size={28} />
            </div>
          </button>
        ))}
      </div>

      {/* SECCIÓN DE RUTAS EDUCATIVAS RECIENTES */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Rutas Activas</h2>
          <button 
            onClick={() => setSeccionActiva('rutas')}
            className="text-[#a855f7] font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
          >
            Administrar <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rutasRecientes.map((ruta) => (
            <div 
              key={ruta.id} 
              className="bg-[#111113] border border-white/5 rounded-[40px] p-4 flex flex-col sm:flex-row items-center gap-6 hover:border-[#a855f7]/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all duration-500 group"
            >
              <div className="w-full sm:w-32 h-32 rounded-[28px] overflow-hidden relative shrink-0">
                <img 
                  src={ruta.imagen} 
                  alt={ruta.titulo} 
                  className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Play className="text-white fill-white" size={24} />
                </div>
              </div>
              
              <div className="flex-1 text-left">
                <span className="text-[#a855f7] font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                  <BookOpen size={12} /> Nivel: {ruta.nivel}
                </span>
                <h3 className="text-xl font-black uppercase italic text-white line-clamp-1">{ruta.titulo}</h3>
                <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-2 flex items-center gap-1">
                  <Users size={10} /> {ruta.estudiantes} Alumnos inscritos
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default EducatorDashboard;