import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, GraduationCap, LogOut, User } from 'lucide-react';
import { ASSETS } from '../utils/constants';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isOpen, setIsOpen] = useState(false); 
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const token = localStorage.getItem('token');

  // 🔥 CORTAFUEGOS ANTI-SCROLL (UX Roto solucionado)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsOpen(false);
    navigate('/login');
  };

  // 🛡️ ESCUDO ANTI-CORB: Amputación de almacenamiento local
  const getAvatar = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=a855f7&color=fff&bold=true`;
    
    if (!user?.profile_picture) return defaultAvatar;
    
    // Solo permitimos URLs absolutas seguras (Cloudinary u otras externas)
    if (user.profile_picture.startsWith('http://') || user.profile_picture.startsWith('https://')) {
      return user.profile_picture;
    }
    
    // Abortamos lectura de /storage/ para evitar Error 404 y CORB
    return defaultAvatar;
  };

  const getRoleLabel = () => {
    switch (user?.user_type) {
      case 'artist': return { text: 'Artista', color: 'text-[#a855f7]' };
      case 'cultural_manager': return { text: 'Gestor', color: 'text-[#a855f7]' };
      case 'admin': return { text: 'Admin', color: 'text-blue-500' };
      case 'visitor': return { text: 'Explorador', color: 'text-gray-500' };
      case 'educator': return { text: 'Educador', color: 'text-rose-500' };
      default: return { text: 'Visitante', color: 'text-gray-500' };
    }
  };

  const roleInfo = getRoleLabel();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-[#0A0A0C]/90 border-b border-white/5 px-6 md:px-16 py-4 md:py-6 z-[100] sticky top-0 backdrop-blur-xl">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        
        <div className="flex-shrink-0 z-[110]">
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img 
              src={ASSETS.LOGO_PRINCIPAL} 
              alt="Popayán Cultural" 
              className="h-10 md:h-16 w-auto transition-transform duration-500 hover:scale-105 active:scale-95" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://ui-avatars.com/api/?name=Popayan+Cultural&background=a855f7&color=fff";
              }}
            />
          </Link>
        </div>

        {/* NAVEGACIÓN DESKTOP */}
        <div className="hidden lg:flex items-center gap-8">
          {['Inicio', 'Artesanos', 'Obras', 'Eventos'].map((item) => {
            const path = item === 'Inicio' ? '/' : `/${item.toLowerCase()}`;
            return (
              <Link key={item} to={path} className={`text-[11px] font-black uppercase tracking-widest relative group transition-colors duration-300 ${isActive(path) ? 'text-[#a855f7]' : 'text-gray-400 hover:text-white'}`}>
                {item}
                <span className={`absolute -bottom-2 left-0 h-[2px] transition-all duration-300 ${isActive(path) ? 'w-full bg-[#a855f7]' : 'w-0 bg-white group-hover:w-full'}`}></span>
              </Link>
            );
          })}
          
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          
          <Link to="/tienda" className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${isActive('/tienda') ? 'text-white bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-300 hover:text-white hover:bg-[#a855f7]/20 border border-transparent hover:border-[#a855f7]/50'}`}>
            <ShoppingBag size={14} /> Tienda
          </Link>
          <Link to="/aprende" className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${isActive('/aprende') ? 'text-black bg-white shadow-lg' : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20'}`}>
            <GraduationCap size={16} /> Aprende
          </Link>
        </div>

        {/* PERFIL DESKTOP */}
        <div className="hidden lg:flex items-center gap-8 z-[110]">
          {token && user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className={`flex items-center gap-4 group bg-white/5 hover:bg-[#151515] p-2 pr-6 rounded-full transition-all border border-white/5 shadow-xl ${user?.user_type === 'admin' ? 'hover:border-blue-500/40' : 'hover:border-[#a855f7]/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white overflow-hidden border-2 transition-all duration-300 ${user?.user_type === 'admin' ? 'bg-blue-600 border-white/10 group-hover:border-blue-500 shadow-blue-500/20' : 'bg-[#a855f7] border-white/10 group-hover:border-[#a855f7]'}`}>
                  <img 
                    src={getAvatar()} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=a855f7&color=fff` }} 
                  />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-black uppercase tracking-wider text-white transition-colors leading-tight ${user?.user_type === 'admin' ? 'group-hover:text-blue-500' : 'group-hover:text-[#a855f7]'}`}>{user?.name?.split(' ')[0]}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 ${roleInfo.color}`}>{roleInfo.text}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-300" title="Cerrar Sesión">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" state={{ action: 'login' }} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors">Entrar</Link>
              <Link to="/login" state={{ action: 'register' }} className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">Unirse</Link>
            </div>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA MÓVIL */}
        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2 z-[160] bg-white/5 rounded-full border border-white/10 active:scale-95 transition-transform">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 📱 DRAWER MÓVIL (Dark Premium Overlay con Scroll Nativo) */}
      <div className={`fixed inset-0 bg-[#0A0A0C]/98 backdrop-blur-3xl z-[150] transition-opacity duration-500 lg:hidden flex flex-col ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* 🔥 CONTENEDOR FLEXIBLE DE DESBORDAMIENTO (Solución del Scroll) */}
        <div className={`flex-1 overflow-y-auto w-full flex flex-col justify-start pt-32 pb-12 px-8 transition-transform duration-700 delay-100 ${isOpen ? 'translate-y-0' : 'translate-y-12'}`}>
          
          <div className="flex flex-col gap-6 items-center">
            {['Inicio', 'Artesanos', 'Obras', 'Eventos', 'Tienda', 'Aprende'].map((item) => {
               const path = item === 'Inicio' ? '/' : `/${item.toLowerCase()}`;
               return (
                <Link key={item} to={path} onClick={() => setIsOpen(false)} className={`text-2xl font-black uppercase tracking-widest transition-colors ${isActive(path) ? 'text-[#a855f7]' : 'text-gray-300 hover:text-white'}`}>
                  {item}
                </Link>
               )
            })}
          </div>
          
          <div className="w-full h-[1px] min-h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-10 flex-shrink-0"></div>

          {/* Tarjeta de Perfil Móvil */}
          {token && user ? (
            <div className="flex flex-col items-center bg-[#111113] p-6 rounded-[30px] border border-white/5 shadow-2xl w-full max-w-sm mx-auto flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#a855f7] mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                 <img 
                    src={getAvatar()} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=a855f7&color=fff` }}
                 />
              </div>
              <h3 className="text-white font-bold uppercase tracking-widest text-sm text-center">{user.name}</h3>
              <span className={`text-[9px] uppercase font-mono tracking-widest mt-1 ${roleInfo.color}`}>{roleInfo.text}</span>
              
              <div className="flex flex-col w-full gap-3 mt-6">
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all">
                  <User size={14} /> Mi Panel
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/5 text-red-500 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all">
                  <LogOut size={14}/> Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center w-full max-w-xs mx-auto mt-4 flex-shrink-0">
              <Link to="/login" state={{ action: 'login' }} onClick={() => setIsOpen(false)} className="w-full text-center py-4 text-[11px] text-gray-400 font-black uppercase tracking-widest border border-white/5 rounded-full bg-white/5 active:scale-95 transition-transform">Entrar</Link>
              <Link to="/login" state={{ action: 'register' }} onClick={() => setIsOpen(false)} className="w-full text-center bg-white text-black py-4 rounded-full text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-transform">Unirse</Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;