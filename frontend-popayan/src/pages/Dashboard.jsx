import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, Palette, Ticket, Shield, Heart, ShoppingBag, Activity, FileText, Package } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import VisitorDashboard from '../components/dashboard/VisitorDashboard';
import ArtistDashboard from '../components/dashboard/ArtistDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import AjustesView from '../components/dashboard/AjustesView'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [seccionActiva, setSeccionActiva] = useState('escritorio');

  useEffect(() => {
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (!updatedUser) navigate('/login');
      setUser(updatedUser);
    };
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  // ✅ SOLUCIÓN: Avatar dinámico para el Sidebar
  const getAvatar = () => {
    if (user?.profile_picture) return user.profile_picture;
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=a855f7&color=fff&bold=true&size=128`;
  };

  const menuConfig = {
    admin: [
      { id: 'escritorio', label: 'Centro Comando', icon: <LayoutDashboard size={18}/> },
      { id: 'seguridad', label: 'Seguridad', icon: <Shield size={18}/> },
      { id: 'auditoria', label: 'Auditoría', icon: <Activity size={18}/> },
    ],
    artist: [
      { id: 'escritorio', label: 'Mi Taller', icon: <LayoutDashboard size={18}/> },
      { id: 'obras', label: 'Mis Obras', icon: <Palette size={18}/> },
    ],
    visitor: [
      { id: 'escritorio', label: 'Mi Espacio', icon: <LayoutDashboard size={18}/> },
      { id: 'favoritos', label: 'Favoritos', icon: <Heart size={18}/> },
      { id: 'compras', label: 'Compras', icon: <ShoppingBag size={18}/> },
    ]
  };

  const menuActual = menuConfig[user?.user_type] || menuConfig.visitor;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        
        <aside className="hidden lg:flex w-72 bg-[#111] border-r border-white/5 flex-col shadow-2xl z-20">
          <div className="p-8 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
            <div className={`w-20 h-20 rounded-full border-2 p-1 mb-4 shadow-xl transition-all duration-500 ${user?.user_type === 'admin' ? 'border-blue-500' : 'border-[#a855f7]'}`}>
              <img src={getAvatar()} className="w-full h-full object-cover rounded-full" alt="Avatar" onError={(e) => {e.target.src = `https://ui-avatars.com/api/?name=U&background=a855f7&color=fff`}} />
            </div>
            <h2 className="font-black text-sm uppercase tracking-tighter italic text-white truncate w-full text-center">{user?.name}</h2>
            <span className={`text-[8px] font-black px-3 py-1 rounded-full mt-2 uppercase border ${user?.user_type === 'admin' ? 'text-blue-500 border-blue-500/20' : 'text-[#a855f7] border-[#a855f7]/20'}`}>{user?.user_type?.replace('_', ' ')}</span>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            {menuActual.map((item) => (
              <button key={item.id} onClick={() => setSeccionActiva(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${seccionActiva === item.id ? (user?.user_type === 'admin' ? 'bg-blue-600' : 'bg-[#a855f7]') + ' text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
                {item.icon} {item.label}
              </button>
            ))}
            <button onClick={() => setSeccionActiva('ajustes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${seccionActiva === 'ajustes' ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}><Settings size={18} /> Ajustes</button>
          </nav>

          <button onClick={handleLogout} className="m-8 flex items-center justify-center gap-3 bg-red-500/10 text-red-500 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"><LogOut size={16} /> Cerrar Sesión</button>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0d0d0f]">
           {seccionActiva === 'ajustes' ? <AjustesView user={user} setUser={setUser} /> : (
              <>
                {user?.user_type === 'admin' && <AdminDashboard user={user} />}
                {user?.user_type === 'artist' && <ArtistDashboard user={user} />}
                {user?.user_type === 'visitor' && <VisitorDashboard user={user} seccionActiva={seccionActiva} />}
              </>
           )}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;