import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { Facebook, Instagram, Twitter, Mail, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0a0c] border-t border-white/5 pt-16 pb-8 px-6 md:px-16 mt-auto relative overflow-hidden">
      
      {/* ✒️ IMPORTAMOS LA FUENTE CULTURAL (Cinzel) DIRECTAMENTE AQUÍ */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Playfair+Display:ital@0;1&display=swap');
          .font-cultural { font-family: 'Cinzel', serif; }
          .font-editorial { font-family: 'Playfair Display', serif; }
        `}
      </style>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUMNA 1: MARCA Y MENSAJE CULTURAL */}
          <div className="space-y-6">
            <img src={logo} alt="Logo Popayán Cultural" className="h-16 w-auto opacity-90 hover:opacity-100 transition-opacity" />
            
            {/* --- AQUÍ ESTÁ EL MENSAJE MEJORADO --- */}
            <div className="relative pl-4 border-l-2 border-[#a855f7]/50">
              <p className="text-gray-400 text-sm leading-relaxed font-editorial italic">
                "El alma de la Ciudad Blanca, inmortalizada en el tiempo. Tejiendo memoria y futuro desde el corazón del Cauca."
              </p>
            </div>
            {/* ------------------------------------- */}
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div>
            <h4 className="text-white font-cultural font-bold text-xs uppercase tracking-[0.2em] mb-6 text-[#a855f7]">Navegación</h4>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li><Link to="/" className="hover:text-[#a855f7] transition-colors hover:pl-2 duration-300">Inicio</Link></li>
              <li><Link to="/artesanos" className="hover:text-[#a855f7] transition-colors hover:pl-2 duration-300">Maestros Artesanos</Link></li>
              <li><Link to="/obras" className="hover:text-[#a855f7] transition-colors hover:pl-2 duration-300">Galería de Obras</Link></li>
              <li><Link to="/tienda" className="text-[#a855f7] font-bold hover:text-white transition-colors hover:pl-2 duration-300">Tienda Oficial</Link></li>
              <li><Link to="/aprende" className="hover:text-[#a855f7] transition-colors hover:pl-2 duration-300">Aprende Cultura</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL */}
          <div>
            <h4 className="text-white font-cultural font-bold text-xs uppercase tracking-[0.2em] mb-6 text-[#a855f7]">Legal</h4>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-white cursor-pointer transition hover:pl-2 duration-300">Política de Privacidad</li>
              <li className="hover:text-white cursor-pointer transition hover:pl-2 duration-300">Términos de Uso</li>
              <li className="hover:text-white cursor-pointer transition hover:pl-2 duration-300">Garantía de Artesanías</li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="text-white font-cultural font-bold text-xs uppercase tracking-[0.2em] mb-6 text-[#a855f7]">Conéctate</h4>
            <div className="space-y-4 text-gray-500 text-sm font-medium">
              <p className="flex items-center gap-3 hover:text-white transition-colors cursor-default">
                <MapPin size={16} className="text-[#a855f7]" />
                Centro Histórico, Popayán
              </p>
              <p className="flex items-center gap-3">
                <Mail size={16} className="text-[#a855f7]" />
                <a href="mailto:hola@popayancultural.com" className="hover:text-white transition">hola@popayancultural.com</a>
              </p>
              
              <div className="flex gap-4 mt-6 pt-6 border-t border-white/5">
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-[#a855f7] hover:text-white transition-all hover:scale-110"><Facebook size={18} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-[#a855f7] hover:text-white transition-all hover:scale-110"><Instagram size={18} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-[#a855f7] hover:text-white transition-all hover:scale-110"><Twitter size={18} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <p>© 2026 POPAYÁN CULTURAL. TODOS LOS DERECHOS RESERVADOS.</p>
          
          <p className="flex items-center gap-2 group cursor-default hover:text-white transition-colors">
            EXALTANDO EL PATRIMONIO VIVO
            <Sparkles 
              size={14} 
              className="text-yellow-500 fill-yellow-500 group-hover:rotate-180 transition-transform duration-700" 
            /> 
            DESDE EL CAUCA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;