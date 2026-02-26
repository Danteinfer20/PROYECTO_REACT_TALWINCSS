import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShoppingCart, Filter, Search } from 'lucide-react';

const Tienda = () => {
  // Datos falsos para visualizar el diseño
  const productos = [
    { id: 1, nombre: "Ruana Payanesa Tejida", precio: "$250.000", autor: "Maestro Ordoñez", img: "https://via.placeholder.com/400" },
    { id: 2, nombre: "Cerámica Colonial", precio: "$120.000", autor: "Taller Santa Clara", img: "https://via.placeholder.com/400" },
    { id: 3, nombre: "Lienzo Semana Santa", precio: "$800.000", autor: "Elena Artista", img: "https://via.placeholder.com/400" },
    { id: 4, nombre: "Joyería en Filigrana", precio: "$180.000", autor: "Joyas del Cauca", img: "https://via.placeholder.com/400" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <Navbar />
      
      {/* HEADER TIENDA */}
      <div className="pt-32 pb-10 px-6 md:px-16 text-center">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4">
          Tienda <span className="text-[#a855f7]">Oficial</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Adquiere piezas únicas directamente de las manos de los maestros artesanos del Cauca. Sin intermediarios.
        </p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="px-6 md:px-16 mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3 text-gray-500" size={20} />
          <input type="text" placeholder="Buscar artesanías..." className="w-full bg-[#111] border border-white/10 rounded-full py-3 pl-12 pr-6 focus:border-[#a855f7] outline-none transition-colors" />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full hover:bg-white/5 transition-all">
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* GRILLA DE PRODUCTOS */}
      <div className="flex-1 px-6 md:px-16 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1600px] mx-auto">
          {productos.map((prod) => (
            <div key={prod.id} className="group bg-[#111] rounded-2xl border border-white/5 overflow-hidden hover:border-[#a855f7]/50 transition-all duration-300 hover:-translate-y-2">
              <div className="h-64 overflow-hidden relative">
                <img src={prod.img} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <button className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg translate-y-20 group-hover:translate-y-0 transition-transform duration-300 hover:bg-[#a855f7] hover:text-white">
                  <ShoppingCart size={20} />
                </button>
              </div>
              <div className="p-6">
                <p className="text-[#a855f7] text-[10px] font-bold uppercase tracking-widest mb-1">{prod.autor}</p>
                <h3 className="text-lg font-bold mb-2">{prod.nombre}</h3>
                <p className="text-xl font-black text-gray-300">{prod.precio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Tienda;