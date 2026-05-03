import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, GraduationCap, LogOut } from 'lucide-react';
import { ASSETS } from '../utils/constants'; // 🔥 INYECCIÓN CLOUD

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

  const getAvatar = () => {
    if (user?.profile_picture) {
      return user.profile_picture.startsWith('http') 
        ? user.profile_picture 
        : `http://localhost:8000${user.profile_picture}`;
    }
    const name = user?.name || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a855f7&color=fff&bold=true`;
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
    <nav className="w-full bg-[#0a0a0c]/90 border-b border-white/5 px-6 md:px-16 py-4 md:py-6 z-[200] sticky top-0 backdrop-blur-xl">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        
        <div className="flex-shrink-0 z-50">
          <Link to="/">
            {/* 🔥 CONSUMO DESDE CDN: Renderizado vectorial SVG */}
            <img 
              src={ASSETS.LOGO_PRINCIPAL} 
              alt="Popayán Cultural" 
              className="h-12 md:h-16 w-auto transition-transform duration-500 hover:scale-105 active:scale-95" 
            />
          </Link>
        </div>

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

        <div className="hidden lg:flex items-center gap-8 z-50">
          {token && user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className={`flex items-center gap-4 group bg-white/5 hover:bg-[#151515] p-2 pr-6 rounded-full transition-all border border-white/5 shadow-xl ${user?.user_type === 'admin' ? 'hover:border-blue-500/40' : 'hover:border-[#a855f7]/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white overflow-hidden border-2 transition-all duration-300 ${user?.user_type === 'admin' ? 'bg-blue-600 border-white/10 group-hover:border-blue-500 shadow-blue-500/20' : 'bg-[#a855f7] border-white/10 group-hover:border-[#a855f7]'}`}>
                  <img 
                    src={getAvatar()} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=U&background=a855f7&color=fff`}} 
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

        <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white p-2 z-50">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <div className={`fixed inset-0 bg-[#0a0a0c]/95 backdrop-blur-2xl z-40 transition-all duration-500 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
          {['Inicio', 'Artesanos', 'Obras', 'Eventos', 'Tienda', 'Aprende'].map((item) => {
             const path = item === 'Inicio' ? '/' : `/${item.toLowerCase()}`;
             return (
              <Link key={item} to={path} onClick={() => setIsOpen(false)} className={`text-2xl font-black uppercase tracking-widest ${isActive(path) ? 'text-[#a855f7]' : 'text-white'}`}>
                {item}
              </Link>
             )
          })}
          
          <div className="w-full h-[1px] bg-white/10 my-4 max-w-xs"></div>

          {token && user ? (
            <div className="flex flex-col items-center gap-6">
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-[#a855f7] font-black uppercase tracking-widest text-lg">Mi Perfil</Link>
              <button onClick={handleLogout} className="text-red-500 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><LogOut size={16}/> Cerrar Sesión</button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 items-center">
              <Link to="/login" state={{ action: 'login' }} onClick={() => setIsOpen(false)} className="text-gray-400 font-black uppercase tracking-widest">Entrar</Link>
              <Link to="/login" state={{ action: 'register' }} onClick={() => setIsOpen(false)} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase tracking-widest">Unirse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;