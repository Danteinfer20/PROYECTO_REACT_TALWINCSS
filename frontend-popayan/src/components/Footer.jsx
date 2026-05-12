import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Sparkles } from 'lucide-react';
import { ASSETS } from '../utils/constants'; // 🔥 INYECCIÓN CLOUD

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // 🔥 MOTOR DE ESTADO (Para sincronización de rol)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser || savedUser === "undefined") {
          setUser(null);
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🔥 MOTOR MATEMÁTICO ACTUALIZADO (Sin anidamientos peligrosos)
  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; // Púrpura Premium (No logueado)
    switch (user.user_type) {
      case 'admin': return '59 130 246';             // Blue-500
      case 'cultural_manager': return '16 185 129';  // Emerald-500
      case 'educator': return '245 158 11';          // Amber-500
      case 'artist': return '244 63 94';             // Rose-500 (Rojo Carmesí)
      case 'visitor': return '168 85 247';           // Purple-500
      default: return '168 85 247';                  // Fallback seguro
    }
  };

  return (
    // 🔥 INYECCIÓN DE ÁMBITO: --role-accent y transición de fondos
    <footer style={{ '--role-accent': getRoleAccentRGB() }} className="w-full bg-[var(--bg-container)] border-t border-[var(--border-color)] pt-20 pb-10 px-6 md:px-16 mt-auto relative overflow-hidden transition-colors duration-500">
      
      {/* Fondo de profundidad con gradiente dinámico */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none opacity-80 z-0 transition-colors duration-500"></div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          
          {/* COLUMNA 1: MARCA Y MENSAJE CULTURAL */}
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              <img 
                src={ASSETS.LOGO_PRINCIPAL} 
                alt="Popayán Cultural" 
                className="h-16 w-auto opacity-90 hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_15px_rgba(var(--role-accent),0.2)] hover:scale-105 filter var(--logo-filter)" 
                // 🛡️ ESCUDO ANTI-IMAGEN ROTA
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=Popayan+Cultural&background=0A0A0C&color=fff`;
                }}
              />
            </Link>
            
            <div className="relative pl-5 border-l-2 border-[rgb(var(--role-accent))]/30 group transition-colors duration-500">
              <p className="text-[var(--text-body)] opacity-90 text-sm leading-relaxed font-serif italic tracking-wide group-hover:text-[var(--text-heading)] transition-colors">
                "El alma de la Ciudad Blanca, inmortalizada en el tiempo. Tejiendo memoria y futuro desde el corazón del Cauca."
              </p>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[rgb(var(--role-accent))] transition-colors duration-500">Navegación</h4>
            <ul className="space-y-4 text-[var(--text-body)] text-[11px] uppercase tracking-widest font-bold">
              {['Inicio', 'Artesanos', 'Obras', 'Tienda', 'Aprende'].map((item) => (
                <li key={item}>
                  <Link 
                    to={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`} 
                    className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit"
                  >
                    {item === 'Artesanos' ? 'Maestros Artesanos' : item === 'Obras' ? 'Galería de Obras' : item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[rgb(var(--role-accent))] transition-colors duration-500">Legal</h4>
            <ul className="space-y-4 text-[var(--text-body)] text-[11px] uppercase tracking-widest font-bold">
              <li><Link to="/privacidad" className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit">Privacidad</Link></li>
              <li><Link to="/terminos" className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit">Términos de Uso</Link></li>
              <li><Link to="/garantia" className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit">Garantía de Artesanías</Link></li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[rgb(var(--role-accent))] transition-colors duration-500">Conéctate</h4>
            <div className="space-y-5 text-[var(--text-body)] text-[11px] uppercase tracking-widest font-bold">
              <p className="flex items-center gap-4 hover:text-[var(--text-heading)] transition-colors cursor-default group">
                <MapPin size={14} className="text-[rgb(var(--role-accent))] group-hover:scale-110 transition-transform" />
                Centro Histórico, Popayán
              </p>
              <p className="flex items-center gap-4 group">
                <Mail size={14} className="text-[rgb(var(--role-accent))] group-hover:scale-110 transition-transform" />
                <a href="mailto:hola@popayancultural.com" className="hover:text-[var(--text-heading)] transition-colors italic lowercase font-medium tracking-normal text-xs">
                  hola@popayancultural.com
                </a>
              </p>
              
              <div className="flex gap-4 mt-8 pt-8 border-t border-[var(--border-color)] transition-colors duration-500">
                {[
                  { icon: Facebook, href: '#' },
                  { icon: Instagram, href: '#' },
                  { icon: Twitter, href: '#' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.href} 
                    className="p-3 bg-[var(--text-heading)]/5 border border-[var(--border-color)] rounded-full text-[var(--text-body)] hover:bg-[rgb(var(--role-accent))] hover:border-[rgb(var(--role-accent))] hover:text-white transition-all hover:scale-110 active:scale-90"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="border-t border-[var(--border-color)] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-[var(--text-body)] uppercase tracking-[0.2em] font-bold transition-colors duration-500">
          <p className="opacity-80">© {currentYear} POPAYÁN CULTURAL. TODOS LOS DERECHOS RESERVADOS.</p>
          
          <div className="flex items-center gap-3 group cursor-default hover:text-[var(--text-heading)] transition-colors">
            <span className="opacity-60">EXALTANDO EL PATRIMONIO VIVO</span>
            <Sparkles 
              size={12} 
              className="text-[rgb(var(--role-accent))] fill-[rgb(var(--role-accent))]/20 group-hover:rotate-180 transition-transform duration-1000" 
            /> 
            <span className="opacity-60">DESDE EL CAUCA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;