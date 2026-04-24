import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, LogOut, Shield, 
  Heart, ShoppingBag, Activity, FileText, Package, 
  PlusCircle, ImageIcon, Calendar, MapPin, Store,
  BookOpen, Video
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import VisitorDashboard from '../components/dashboard/VisitorDashboard';
import ArtistDashboard from '../components/dashboard/ArtistDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import EducatorDashboard from '../components/dashboard/EducatorDashboard'; 
import AjustesView from '../components/dashboard/AjustesView'; 
import FavoritosView from '../components/dashboard/FavoritosView'; 
import ComprasView from '../components/dashboard/ComprasView'; 
import UsuariosView from '../components/dashboard/UsuariosView';
import AuditoriaView from '../components/dashboard/AuditoriaView';

const Dashboard = () => {
  const navigate = useNavigate();

  // 🔥 ESTADO SEGURO: A prueba de fallos de JSON
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [seccionActiva, setSeccionActiva] = useState('escritorio');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const syncUserLocal = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser || savedUser === "undefined") {
          navigate('/login');
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        navigate('/login');
      }
    };

    window.addEventListener('storage', syncUserLocal);
    return () => window.removeEventListener('storage', syncUserLocal);
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const getAvatar = () => {
    if (user?.profile_picture) {
      return user.profile_picture.startsWith('http') 
        ? user.profile_picture 
        : `http://localhost:8000${user.profile_picture}`;
    }
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a855f7&color=fff&bold=true&size=128`;
  };

  // 🔥 LÓGICA DE ROLES: Limpia y directa
  const getRolEfectivo = (userData) => {
    if (!userData) return 'visitor';
    if (userData.user_type === 'admin') return 'admin';
    
    if (['artist', 'cultural_manager', 'educator'].includes(userData.user_type)) {
      const isVerified = userData.is_verified === true || userData.is_verified === 1 || userData.is_verified === "1";
      return isVerified ? userData.user_type : 'visitor';
    }
    
    return 'visitor';
  };

  const rolEfectivo = getRolEfectivo(user);

  const traducirRol = (userData) => {
    if (!userData) return { titulo: 'Visitante', color: '' };
    
    const isVerified = userData.is_verified === true || userData.is_verified === 1 || userData.is_verified === "1";
    const isPending = ['artist', 'cultural_manager', 'educator'].includes(userData.user_type) && !isVerified;

    const diccionario = {
      'admin': { titulo: 'Centro Comando', color: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
      'artist': { 
        titulo: isPending ? 'Artesano (Pendiente)' : 'Maestro Artesano', 
        color: isPending ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-[#a855f7]/50 text-[#a855f7] bg-[#a855f7]/10' 
      },
      'cultural_manager': { 
        titulo: isPending ? 'Gestor (Pendiente)' : 'Gestor Cultural', 
        color: isPending ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
      },
      'educator': { 
        titulo: isPending ? 'Educador (Pendiente)' : 'Educador', 
        color: isPending ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-rose-500/50 text-rose-400 bg-rose-500/10' 
      },
      'visitor': { 
        titulo: 'Visitante', 
        color: 'border-[#a855f7]/60 text-white bg-[#a855f7]/20 shadow-[0_0_20px_rgba(168,85,247,0.6)]' 
      }
    };
    return diccionario[userData.user_type] || diccionario['visitor'];
  };

  const configRol = traducirRol(user);

  // 🛡️ CORRECCIÓN MAESTRA APLICADA AQUÍ: 
  const menuConfig = {
    admin: [
      { id: 'escritorio', label: 'Centro Comando', icon: <LayoutDashboard size={18}/> },
      { id: 'usuarios', label: 'Usuarios', icon: <Shield size={18}/> },
      { id: 'auditoria', label: 'Auditoría', icon: <Activity size={18}/> },
    ],
    artist: [
      { id: 'escritorio', label: 'Mi Taller', icon: <LayoutDashboard size={18}/> },
      { id: 'galeria', label: 'Mis Obras', icon: <ImageIcon size={18}/> },
      { id: 'tienda', label: 'Mi Tienda', icon: <Store size={18}/> }, 
      { id: 'crear', label: 'Crear Obra', icon: <PlusCircle size={18}/> },
      // 🔥 ESTE ES EL BOTÓN QUE TE FALTABA
      { id: 'ventas', label: 'Gestión Ventas', icon: <Package size={18}/> }
    ],
    cultural_manager: [ 
      { id: 'escritorio', label: 'Panel Gestor', icon: <LayoutDashboard size={18}/> },
      { id: 'eventos', label: 'Agenda Cultural', icon: <Calendar size={18}/> }, 
      { id: 'locaciones', label: 'Espacios/Sitios', icon: <MapPin size={18}/> }, 
      { id: 'ventas', label: 'Mis Ventas', icon: <Package size={18}/> },
    ],
    educator: [
      { id: 'escritorio', label: 'Mi Aula', icon: <LayoutDashboard size={18}/> },
      { id: 'rutas', label: 'Rutas Educativas', icon: <BookOpen size={18}/> },
      { id: 'material', label: 'Material Didáctico', icon: <Video size={18}/> },
      { id: 'favoritos', label: 'Favoritos', icon: <Heart size={18}/> },
    ],
    visitor: [
      { id: 'escritorio', label: 'Mi Espacio', icon: <LayoutDashboard size={18}/> },
      { id: 'favoritos', label: 'Favoritos', icon: <Heart size={18}/> },
      { id: 'compras', label: 'Compras', icon: <ShoppingBag size={18}/> },
    ]
  };

  const menuActual = menuConfig[rolEfectivo] || menuConfig.visitor;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        
        <aside className="hidden lg:flex w-72 bg-[#111113] border-r border-white/5 flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20">
          <div className="p-8 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className={`w-24 h-24 rounded-full border-[3px] p-1 mb-5 shadow-[0_0_25px_rgba(168,85,247,0.3)] transition-all duration-500 ${rolEfectivo === 'admin' ? 'border-blue-500/50' : 'border-[#a855f7]/50'}`}>
              <img src={getAvatar()} className="w-full h-full object-cover rounded-full" alt="Avatar" onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=U&background=a855f7&color=fff`}} />
            </div>
            <h2 className="font-black text-[15px] uppercase tracking-tighter italic text-white truncate w-full text-center">
              {user?.name}
            </h2>
            <span className={`px-5 py-1.5 rounded-full mt-3 font-black text-[9px] uppercase tracking-[0.25em] border backdrop-blur-md ${configRol.color}`}>
              {configRol.titulo}
            </span>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
            {menuActual.map((item) => (
              <button key={item.id} onClick={() => setSeccionActiva(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${seccionActiva === item.id ? (rolEfectivo === 'admin' ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]') + ' text-white hover:-translate-y-1' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                {item.icon} {item.label}
              </button>
            ))}
            <div className="w-full h-px bg-white/5 my-4"></div>
            <button onClick={() => setSeccionActiva('ajustes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${seccionActiva === 'ajustes' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
              <Settings size={18} /> Ajustes de Cuenta
            </button>
          </nav>

          <button onClick={handleLogout} className="m-8 flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[20px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0A0A0C]">
           {seccionActiva === 'ajustes' ? <AjustesView user={user} setUser={setUser} /> : (
              <div className="animate-in fade-in duration-700">
                {rolEfectivo === 'admin' && seccionActiva === 'escritorio' && <AdminDashboard />}
                {rolEfectivo === 'admin' && seccionActiva === 'usuarios' && <UsuariosView />}
                {rolEfectivo === 'admin' && seccionActiva === 'auditoria' && <AuditoriaView />}
                
                {rolEfectivo === 'artist' && <ArtistDashboard user={user} seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} />}
                
                {rolEfectivo === 'cultural_manager' && <ManagerDashboard user={user} seccionActiva={seccionActiva} />}
                {rolEfectivo === 'visitor' && seccionActiva === 'escritorio' && <VisitorDashboard user={user} setSeccionActiva={setSeccionActiva} />}
                {rolEfectivo === 'visitor' && seccionActiva === 'favoritos' && <FavoritosView />}
                {rolEfectivo === 'visitor' && seccionActiva === 'compras' && <ComprasView />}
                {rolEfectivo === 'educator' && <EducatorDashboard user={user} seccionActiva={seccionActiva} />}
              </div>
           )}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;