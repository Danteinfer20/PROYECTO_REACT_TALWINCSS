import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, GraduationCap, LogOut, ShieldCheck } from 'lucide-react';
import logo from '../assets/Logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/'); 
    window.location.reload();
  };

  // ✅ SOLUCIÓN: Generador de avatar por iniciales para evitar errores de placeholder
  const getAvatar = () => {
    if (user?.profile_picture) return user.profile_picture;
    const name = user?.name || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a855f7&color=fff&bold=true`;
  };

  const getRoleLabel = () => {
    switch (user?.user_type) {
      case 'artist': return { text: 'Maestro Artesano', color: 'text-[#a855f7]' };
      case 'cultural_manager': return { text: 'Gestor Cultural', color: 'text-[#a855f7]' };
      case 'admin': return { text: 'Administrador', color: 'text-blue-500' };
      case 'visitor': return { text: 'Explorador', color: 'text-gray-500' };
      default: return { text: 'Visitante', color: 'text-gray-500' };
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <nav className="w-full bg-[#0a0a0c] border-b border-white/5 px-6 md:px-16 py-6 z-50 sticky top-0 backdrop-blur-md bg-opacity-90">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        
        <div className="flex-shrink-0">
          <Link to="/"><img src={logo} alt="Logo" className="h-12 md:h-16 w-auto transition-transform hover:scale-105" /></Link>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {['Inicio', 'Artesanos', 'Obras', 'Eventos'].map((item) => (
            <Link key={item} to={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`} className="text-xs font-bold text-gray-400 hover:text-white uppercase tracking-widest relative group transition-colors">
              {item}
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#a855f7] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
          <div className="h-4 w-[1px] bg-white/10 mx-2"></div>
          <Link to="/tienda" className="text-[#a855f7] hover:text-white px-3 py-2 rounded-md text-xs font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#a855f7]/10"><ShoppingBag size={14} /> Tienda</Link>
          <Link to="/aprende" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-xs font-bold tracking-widest uppercase flex items-center gap-2 hover:bg-white/5"><GraduationCap size={16} /> Aprende</Link>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {token && user ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className={`flex items-center gap-4 group bg-white/5 hover:bg-white/10 p-2 pr-6 rounded-full transition-all border border-white/5 shadow-xl ${user?.user_type === 'admin' ? 'hover:border-blue-500/40' : 'hover:border-[#a855f7]/40'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white overflow-hidden border-2 transition-all duration-300 ${user?.user_type === 'admin' ? 'bg-blue-600 border-white/10 group-hover:border-blue-500 shadow-blue-500/20' : 'bg-[#a855f7] border-white/10 group-hover:border-[#a855f7]'}`}>
                  <img src={getAvatar()} alt="Profile" className="w-full h-full object-cover" onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=U&background=a855f7&color=fff`}} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-black uppercase tracking-wider text-white transition-colors leading-tight ${user?.user_type === 'admin' ? 'group-hover:text-blue-500' : 'group-hover:text-[#a855f7]'}`}>{user?.name?.split(' ')[0]}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 ${roleInfo.color}`}>{roleInfo.text}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-300"><LogOut size={20} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" state={{ action: 'login' }} className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white">Entrar</Link>
              <Link to="/login" state={{ action: 'register' }} className="bg-white text-black px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:text-white transition-all shadow-white/10">Unirse</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;