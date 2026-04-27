import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Facebook, Instagram, Twitter, Mail, MapPin, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-[#0a0a0c] border-t border-white/5 pt-20 pb-10 px-6 md:px-16 mt-auto relative overflow-hidden">
      
      {/* Fondo sutil del footer para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent z-0"></div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          
          {/* COLUMNA 1: MARCA Y MENSAJE CULTURAL */}
          <div className="space-y-8">
            <img src={logo} alt="Logo Popayán Cultural" className="h-16 w-auto opacity-90 hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
            
            {/* Mensaje Editorial (Usa la fuente del navegador Serif para un look elegante sin imports bloqueantes) */}
            <div className="relative pl-5 border-l-2 border-[#a855f7]/50">
              <p className="text-gray-400 text-sm leading-relaxed font-serif italic tracking-wide">
                "El alma de la Ciudad Blanca, inmortalizada en el tiempo. Tejiendo memoria y futuro desde el corazón del Cauca."
              </p>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div>
            <h4 className="font-['Cinzel',_serif] text-xs font-black uppercase tracking-[0.3em] mb-8 text-[#a855f7]">Navegación</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <li><Link to="/" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Inicio</Link></li>
              <li><Link to="/artesanos" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Maestros Artesanos</Link></li>
              <li><Link to="/obras" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Galería de Obras</Link></li>
              <li><Link to="/tienda" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Tienda Oficial</Link></li>
              <li><Link to="/aprende" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Aprende Cultura</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL */}
          <div>
            <h4 className="font-['Cinzel',_serif] text-xs font-black uppercase tracking-[0.3em] mb-8 text-[#a855f7]">Legal</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <li><Link to="/privacidad" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Privacidad</Link></li>
              <li><Link to="/terminos" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Términos de Uso</Link></li>
              <li><Link to="/garantia" className="hover:text-white transition-colors hover:pl-2 duration-300 block">Garantía de Artesanías</Link></li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="font-['Cinzel',_serif] text-xs font-black uppercase tracking-[0.3em] mb-8 text-[#a855f7]">Conéctate</h4>
            <div className="space-y-5 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <p className="flex items-center gap-4 hover:text-white transition-colors cursor-default">
                <MapPin size={14} className="text-[#a855f7]" />
                Centro Histórico, Popayán
              </p>
              <p className="flex items-center gap-4">
                <Mail size={14} className="text-[#a855f7]" />
                <a href="mailto:hola@popayancultural.com" className="hover:text-white transition">hola@popayancultural.com</a>
              </p>
              
              <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                <a href="#" className="p-3 bg-[#111] border border-white/5 rounded-full hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition-all hover:scale-110"><Facebook size={16} /></a>
                <a href="#" className="p-3 bg-[#111] border border-white/5 rounded-full hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition-all hover:scale-110"><Instagram size={16} /></a>
                <a href="#" className="p-3 bg-[#111] border border-white/5 rounded-full hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition-all hover:scale-110"><Twitter size={16} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black">
          <p>© {new Date().getFullYear()} POPAYÁN CULTURAL. TODOS LOS DERECHOS RESERVADOS.</p>
          
          <p className="flex items-center gap-2 group cursor-default hover:text-white transition-colors">
            EXALTANDO EL PATRIMONIO VIVO
            <Sparkles 
              size={12} 
              className="text-[#a855f7] fill-[#a855f7] group-hover:rotate-180 transition-transform duration-700" 
            /> 
            DESDE EL CAUCA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;