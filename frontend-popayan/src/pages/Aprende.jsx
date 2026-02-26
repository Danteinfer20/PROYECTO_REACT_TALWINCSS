import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { PlayCircle } from 'lucide-react';

const Aprende = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <Navbar />
      <div className="pt-32 px-6 max-w-7xl mx-auto w-full pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
             <span className="text-[#a855f7] font-black tracking-[0.2em] uppercase text-xs">Aula Virtual</span>
             <h1 className="text-5xl md:text-7xl font-black mt-4 mb-6 leading-tight">Aprende el <br/>Legado.</h1>
             <p className="text-gray-400 text-lg mb-8">Descubre tutoriales, historia y talleres sobre las técnicas ancestrales de Popayán.</p>
             <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-[#a855f7] hover:text-white transition-all">Ver todos los cursos</button>
          </div>
          <div className="relative rounded-[32px] overflow-hidden border border-white/10 group cursor-pointer">
             <img src="https://via.placeholder.com/800x600" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500"/>
             <div className="absolute inset-0 flex items-center justify-center">
                <PlayCircle size={80} className="text-white drop-shadow-lg group-hover:scale-110 transition-transform"/>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Aprende;