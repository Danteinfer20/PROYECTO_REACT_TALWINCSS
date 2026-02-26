import React, { useState } from 'react';
import { 
  CalendarRange, Ticket, MapPin, Users, 
  PlusCircle, Search, Clock, ChevronRight,
  TrendingUp, Calendar, DollarSign
} from 'lucide-react';

const ManagerDashboard = ({ user }) => {
  // Estados para el formulario de creación de eventos
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [precio, setPrecio] = useState(0);

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in zoom-in-95 duration-700">
      
      {/* HEADER DE GESTIÓN */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              Agenda <span className="text-[#a855f7]">Cultural</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-[#a855f7] pl-4">
              Gestor: {user?.name} | Popayán, Cauca
            </p>
          </div>
          <button className="flex items-center gap-3 bg-[#a855f7] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-lg shadow-[#a855f7]/20">
            <PlusCircle size={18} /> Crear Gran Evento
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA: Formulario y Control (66%) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Dashboard de Métricas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111] p-6 rounded-[28px] border border-white/5 group hover:border-[#a855f7]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <Calendar className="text-[#a855f7]" size={20} />
                <span className="text-[9px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded">ACTIVO</span>
              </div>
              <h4 className="text-3xl font-black text-white">12</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Eventos este mes</p>
            </div>

            <div className="bg-[#111] p-6 rounded-[28px] border border-white/5 group hover:border-[#a855f7]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <Users className="text-[#a855f7]" size={20} />
                <TrendingUp className="text-blue-500" size={16} />
              </div>
              <h4 className="text-3xl font-black text-white">450</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">RSVPs Totales</p>
            </div>

            <div className="bg-[#111] p-6 rounded-[28px] border border-white/5 group hover:border-[#a855f7]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <Ticket className="text-[#a855f7]" size={20} />
                <DollarSign className="text-yellow-500" size={16} />
              </div>
              <h4 className="text-3xl font-black text-white">$2.4M</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Recaudación Estimada</p>
            </div>
          </div>

          {/* Lista de Eventos Recientes (Vista Previa) */}
          <div className="bg-[#111] rounded-[32px] border border-white/5 p-8">
            <h3 className="text-lg font-black text-white mb-6 uppercase italic flex items-center gap-3">
              <Clock size={20} className="text-[#a855f7]"/> Próximos en Agenda
            </h3>
            
            <div className="space-y-4">
              {/* Ejemplo de Item de Evento */}
              {[1, 2].map((item) => (
                <div key={item} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-[#1a1a1c] flex flex-col items-center justify-center border border-white/5">
                      <span className="text-[10px] font-black text-[#a855f7] uppercase">Oct</span>
                      <span className="text-xl font-black text-white">24</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-[#a855f7] transition-colors">Festival de la Chirimía</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> Parque Caldas, Popayán
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-700 group-hover:text-white transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Perfil y Acciones Rápidas (33%) */}
        <div className="space-y-8">
          {/* Card de Perfil Gestor */}
          <div className="bg-[#111] border border-white/5 rounded-[40px] p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#a855f7] to-blue-500"></div>
            <div className="w-28 h-28 rounded-full border-4 border-[#a855f7]/20 mx-auto mb-6 p-1">
              <img 
                src={user?.profile_picture || 'https://via.placeholder.com/150'} 
                className="w-full h-full object-cover rounded-full" 
                alt="Manager"
              />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">{user?.name}</h3>
            <span className="text-[9px] font-black bg-white/5 text-gray-400 px-3 py-1 rounded-full uppercase tracking-widest mt-2 inline-block">
              Gestor Verificado
            </span>
            
            <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-black text-white">08</p>
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Lugares Activos</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">24</p>
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Convenios</p>
              </div>
            </div>
          </div>

          {/* Quick Action: Mapa de Sedes */}
          <div className="bg-gradient-to-br from-[#a855f7] to-[#7c3aed] rounded-[32px] p-8 text-white group cursor-pointer hover:shadow-2xl hover:shadow-[#a855f7]/20 transition-all">
            <MapPin size={32} className="mb-4 group-hover:animate-bounce" />
            <h4 className="text-xl font-black uppercase italic leading-none">Explorar<br/>Ubicaciones</h4>
            <p className="text-[10px] opacity-80 mt-2 font-bold uppercase tracking-widest">Gestionar Sedes Culturales</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManagerDashboard;