import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Sparkles } from 'lucide-react';
import { ASSETS } from '../utils/constants'; // 🔥 INYECCIÓN CLOUD

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0a0a0c] border-t border-white/5 pt-20 pb-10 px-6 md:px-16 mt-auto relative overflow-hidden">
      
      {/* Fondo de profundidad con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none opacity-50 z-0"></div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          
          {/* COLUMNA 1: MARCA Y MENSAJE CULTURAL */}
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              {/* 🔥 CONSUMO DESDE CDN: Renderizado vectorial SVG */}
              <img 
                src={ASSETS.LOGO_PRINCIPAL} 
                alt="Popayán Cultural" 
                className="h-16 w-auto opacity-90 hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:scale-105" 
              />
            </Link>
            
            <div className="relative pl-5 border-l-2 border-[#a855f7]/30 group">
              <p className="text-gray-400 text-sm leading-relaxed font-serif italic tracking-wide group-hover:text-gray-300 transition-colors">
                "El alma de la Ciudad Blanca, inmortalizada en el tiempo. Tejiendo memoria y futuro desde el corazón del Cauca."
              </p>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[#a855f7]">Navegación</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              {['Inicio', 'Artesanos', 'Obras', 'Tienda', 'Aprende'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`} 
                    className="hover:text-white transition-all hover:pl-2 duration-300 block w-fit"
                  >
                    {item === 'Artesanos' ? 'Maestros Artesanos' : item === 'Obras' ? 'Galería de Obras' : item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[#a855f7]">Legal</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <li><Link to="/privacidad" className="hover:text-white transition-all hover:pl-2 duration-300 block w-fit">Privacidad</Link></li>
              <li><Link to="/terminos" className="hover:text-white transition-all hover:pl-2 duration-300 block w-fit">Términos de Uso</Link></li>
              <li><Link to="/garantia" className="hover:text-white transition-all hover:pl-2 duration-300 block w-fit">Garantía de Artesanías</Link></li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[#a855f7]">Conéctate</h4>
            <div className="space-y-5 text-gray-500 text-[11px] uppercase tracking-widest font-bold">
              <p className="flex items-center gap-4 hover:text-white transition-colors cursor-default group">
                <MapPin size={14} className="text-[#a855f7] group-hover:scale-110 transition-transform" />
                Centro Histórico, Popayán
              </p>
              <p className="flex items-center gap-4 group">
                <Mail size={14} className="text-[#a855f7] group-hover:scale-110 transition-transform" />
                <a href="mailto:hola@popayancultural.com" className="hover:text-white transition-colors italic lowercase font-medium tracking-normal text-xs">
                  hola@popayancultural.com
                </a>
              </p>
              
              <div className="flex gap-4 mt-8 pt-8 border-t border-white/5">
                {[
                  { icon: Facebook, href: '#' },
                  { icon: Instagram, href: '#' },
                  { icon: Twitter, href: '#' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.href} 
                    className="p-3 bg-white/5 border border-white/5 rounded-full text-gray-400 hover:bg-[#a855f7] hover:border-[#a855f7] hover:text-white transition-all hover:scale-110 active:scale-90"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black">
          <p>© {currentYear} POPAYÁN CULTURAL. TODOS LOS DERECHOS RESERVADOS.</p>
          
          <div className="flex items-center gap-3 group cursor-default hover:text-white transition-colors">
            <span className="opacity-50">EXALTANDO EL PATRIMONIO VIVO</span>
            <Sparkles 
              size={12} 
              className="text-[#a855f7] fill-[#a855f7]/20 group-hover:rotate-180 transition-transform duration-1000" 
            /> 
            <span className="opacity-50">DESDE EL CAUCA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;