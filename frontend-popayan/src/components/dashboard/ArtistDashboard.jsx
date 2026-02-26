import React from 'react';
import { 
  Palette, UploadCloud, ShoppingCart, Eye, 
  Star, Heart, Package, Plus, 
  ArrowUpRight, BarChart3, Image as ImageIcon 
} from 'lucide-react';

const ArtistDashboard = ({ user }) => {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-left-4 duration-700">
      
      {/* HEADER DE AUTOR */}
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Taller <span className="text-[#a855f7]">Creativo</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-[#a855f7] pl-4">
            Maestro: {user?.name} | Popayán, Ciudad Creativa
          </p>
        </div>
        <button className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:text-white transition-all shadow-xl shadow-white/5">
          <UploadCloud size={18} /> Lanzar Nueva Obra
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* COLUMNA IZQUIERDA: Stats de Rendimiento (1/4) */}
        <div className="space-y-6">
          <div className="bg-[#111] p-8 rounded-[32px] border border-white/5">
            <BarChart3 className="text-[#a855f7] mb-6" size={24} />
            <div className="space-y-6">
              <div>
                <span className="block text-3xl font-black text-white">24</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Obras Publicadas</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-white">158</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Apreciaciones (Likes)</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-white">12</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Ventas Totales</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a1a1c] to-[#111] p-8 rounded-[32px] border border-white/5">
            <Star className="text-yellow-500 mb-4" size={24} />
            <h4 className="text-white font-black uppercase italic tracking-tighter text-lg">Reputación</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Maestro Destacado</p>
            <div className="flex gap-1 mt-4">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className="fill-yellow-500 text-yellow-500" />)}
            </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: Gestión de Inventario (2/4) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#111] rounded-[32px] border border-white/5 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                <Package className="text-[#a855f7]" size={20}/> Mi Inventario
              </h3>
              <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest">Gestionar todo</button>
            </div>

            {/* Grid de Productos Pequeño */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((obra) => (
                <div key={obra} className="bg-[#1a1a1c] border border-white/5 rounded-2xl overflow-hidden group hover:border-[#a855f7]/40 transition-all">
                  <div className="h-32 bg-gray-800 relative">
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[8px] font-black text-white uppercase">Stock: 5</div>
                    <ImageIcon className="absolute inset-0 m-auto text-gray-700" size={30} />
                  </div>
                  <div className="p-4">
                    <h5 className="font-bold text-sm text-white truncate">Jarrón de Barro Negro</h5>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#a855f7] font-black text-xs">$85.000</span>
                      <button className="text-gray-600 hover:text-white"><Plus size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips para el Artista */}
          <div className="bg-[#a855f7]/10 border border-[#a855f7]/20 p-6 rounded-3xl flex items-start gap-4">
            <div className="bg-[#a855f7] p-2 rounded-lg text-white">
               <Palette size={20} />
            </div>
            <div>
              <h5 className="text-sm font-black text-white uppercase tracking-tighter">Consejo del Día</h5>
              <p className="text-[11px] text-gray-400 mt-1">Las obras con historias detalladas en su descripción suelen recibir un 40% más de interés por parte de los visitantes.</p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Perfil y Pedidos (1/4) */}
        <div className="space-y-8">
          <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 text-center shadow-2xl">
            <div className="w-24 h-24 rounded-full border-2 border-[#a855f7] mx-auto mb-4 p-1">
              <img 
                src={user?.profile_picture || 'https://via.placeholder.com/150'} 
                className="w-full h-full object-cover rounded-full" 
                alt="Artist"
              />
            </div>
            <h3 className="font-black text-white uppercase italic tracking-tighter leading-tight">{user?.name}</h3>
            <div className="mt-6 space-y-3">
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Editar Biografía</button>
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Ver Perfil Público</button>
            </div>
          </div>

          {/* Últimos Pedidos */}
          <div className="bg-[#111] border border-white/5 rounded-[32px] p-8">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShoppingCart size={14} className="text-[#a855f7]"/> Ventas Recientes
            </h4>
            <div className="text-center py-6 border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-[10px] text-gray-600 font-bold uppercase italic">Sin pedidos pendientes</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArtistDashboard;