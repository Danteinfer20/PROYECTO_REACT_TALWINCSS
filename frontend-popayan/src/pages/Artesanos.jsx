import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Artesanos = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <Navbar />
      <div className="pt-32 px-6 text-center">
        <h1 className="text-5xl font-black italic uppercase mb-4">Maestros <span className="text-[#a855f7]">Artesanos</span></h1>
        <p className="text-gray-400 mb-16">Conoce las manos que tejen la historia.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto pb-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center group cursor-pointer">
              <div className="w-40 h-40 rounded-full border-4 border-white/5 overflow-hidden mb-4 group-hover:border-[#a855f7] transition-all duration-300 shadow-2xl">
                <img src={`https://i.pravatar.cc/300?img=${i + 10}`} alt="Artesano" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
              </div>
              <h3 className="font-bold text-lg group-hover:text-[#a855f7] transition-colors">Nombre Artesano</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Especialidad</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Artesanos;