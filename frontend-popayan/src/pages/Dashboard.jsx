import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, LogOut, Shield, 
  Heart, ShoppingBag, Activity, FileText, Package, 
  PlusCircle, ImageIcon, Calendar, MapPin, Store,
  BookOpen, Video, Scan
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
import GestionVentasView from '../components/dashboard/GestionVentasView'; 
import GestionTaquillaView from '../components/dashboard/GestionTaquillaView'; 
import ControlAccesosView from '../components/dashboard/ControlAccesosView';
import MisEventosView from '../components/dashboard/MisEventosView';
import LocacionesView from '../components/dashboard/LocacionesView';
import CrearObra from '../components/dashboard/CrearObra'; 
import CrearLocacion from '../components/dashboard/CrearLocacion'; 

// 🔥 COMPONENTES DEL EDUCADOR
import CrearMaterial from '../components/dashboard/CrearMaterial'; 
import RutasEducativasView from '../components/dashboard/RutasEducativasView'; 
import MaterialDidacticoView from '../components/dashboard/MaterialDidacticoView'; 
import EducatorFavoritosView from '../components/dashboard/EducatorFavoritosView'; 

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [seccionActiva, setSeccionActiva] = useState('escritorio');
  const [itemParaEditar, setItemParaEditar] = useState(null);
  const [modoVentas, setModoVentas] = useState('productos');

  // 🔥 NAVEGACIÓN REFORZADA: Soporta la inyección de metadatos de modelo para hidratación blindada
  const navegarA = (idSeccion, datos = null) => {
    setItemParaEditar(datos);
    setSeccionActiva(idSeccion);
  };

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
    if (!userData) return { titulo: 'Visitante', themeClass: 'purple' };
    const isVerified = userData.is_verified === true || userData.is_verified === 1 || userData.is_verified === "1";
    const isPending = ['artist', 'cultural_manager', 'educator'].includes(userData.user_type) && !isVerified;

    if (isPending) {
        return {
            titulo: `${userData.user_type === 'artist' ? 'Artesano' : userData.user_type === 'cultural_manager' ? 'Gestor' : 'Educador'} (Pendiente)`,
            badgeColor: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
            themeClass: 'amber'
        };
    }

    const diccionario = {
      'admin': { titulo: 'Centro Comando', badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/5', themeClass: 'blue' },
      'artist': { titulo: 'Maestro Artesano', badgeColor: 'border-[#a855f7]/50 text-[#a855f7] bg-[#a855f7]/10', themeClass: 'purple' },
      'cultural_manager': { titulo: 'Gestor Cultural', badgeColor: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10', themeClass: 'emerald' },
      'educator': { titulo: 'Educador', badgeColor: 'border-amber-500/50 text-amber-400 bg-amber-500/10', themeClass: 'amber' },
      'visitor': { titulo: 'Visitante', badgeColor: 'border-[#a855f7]/60 text-white bg-[#a855f7]/20 shadow-[0_0_20px_rgba(168,85,247,0.6)]', themeClass: 'purple' }
    };
    return diccionario[userData.user_type] || diccionario['visitor'];
  };

  const configRol = traducirRol(user);

  const getThemeClasses = (theme) => {
      const themes = {
          'purple': { border: 'border-[#a855f7]/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]', bgActive: 'bg-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.4)]', avatarBg: 'a855f7' },
          'emerald': { border: 'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]', bgActive: 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]', avatarBg: '10b981' },
          'blue': { border: 'border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.3)]', bgActive: 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]', avatarBg: '3b82f6' },
          'amber': { border: 'border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.3)]', bgActive: 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]', avatarBg: 'f59e0b' }
      };
      return themes[theme] || themes['purple'];
  };

  const themeClasses = getThemeClasses(configRol.themeClass);

  const getAvatar = () => {
    if (user?.profile_picture) {
      return user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`;
    }
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${themeClasses.avatarBg}&color=fff&bold=true&size=128`;
  };

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
      { id: 'ventas', label: 'Gestión Ventas', icon: <Package size={18}/> }
    ],
    cultural_manager: [ 
      { id: 'escritorio', label: 'Panel Gestor', icon: <LayoutDashboard size={18}/> },
      { id: 'crear', label: 'Nueva Creación', icon: <PlusCircle size={18}/> }, 
      { id: 'eventos', label: 'Agenda Cultural', icon: <Calendar size={18}/> }, 
      { id: 'locaciones', label: 'Espacios/Sitios', icon: <MapPin size={18}/> }, 
      { id: 'ventas', label: 'Mis Ventas', icon: <Package size={18}/> },
      { id: 'escaner_qr', label: 'Control Accesos', icon: <Scan size={18}/> },
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
            <div className={`w-24 h-24 rounded-full border-[3px] p-1 mb-5 transition-all duration-500 ${themeClasses.border}`}>
              <img src={getAvatar()} className="w-full h-full object-cover rounded-full" alt="Avatar" />
            </div>
            <h2 className="font-black text-[15px] uppercase tracking-tighter italic text-white truncate w-full text-center">{user?.name}</h2>
            <span className={`px-5 py-1.5 rounded-full mt-3 font-black text-[9px] uppercase tracking-[0.25em] border backdrop-blur-md ${configRol.badgeColor}`}>{configRol.titulo}</span>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
            {menuActual.map((item) => (
              <button 
                key={item.id} 
                onClick={() => navegarA(item.id)} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${seccionActiva === item.id ? `${themeClasses.bgActive} text-white hover:-translate-y-1 shadow-lg` : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <div className="w-full h-px bg-white/5 my-4"></div>
            <button onClick={() => navegarA('ajustes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${seccionActiva === 'ajustes' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
              <Settings size={18} /> Ajustes de Cuenta
            </button>
          </nav>

          <button onClick={handleLogout} className="m-8 flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[20px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto bg-[#0A0A0C]">
           {seccionActiva === 'ajustes' ? <AjustesView user={user} setUser={setUser} /> : (
              <div className="animate-in fade-in duration-700 w-full h-full">
                
                {rolEfectivo === 'admin' && (
                  <>
                    {seccionActiva === 'escritorio' && <AdminDashboard />}
                    {seccionActiva === 'usuarios' && <UsuariosView />}
                    {seccionActiva === 'auditoria' && <AuditoriaView />}
                  </>
                )}
                
                {rolEfectivo === 'artist' && (
                  <>
                    {/* 🔥 INYECCIÓN DE DATOS: Aseguramos que CrearObra reciba el flag de modelo correcto en edición */}
                    {seccionActiva === 'crear' ? (
                      <CrearObra user={user} data={itemParaEditar} />
                    ) : (
                      <ArtistDashboard 
                        user={user} 
                        seccionActiva={seccionActiva} 
                        setSeccionActiva={navegarA}
                        onEditObra={(obra) => navegarA('crear', { ...obra, _modelType: 'ART' })}
                        onEditProduct={(prod) => navegarA('crear', { ...prod, _modelType: 'PRODUCT' })}
                      />
                    )}
                  </>
                )}
                
                {rolEfectivo === 'cultural_manager' && (
                  <>
                    {seccionActiva === 'escritorio' && <ManagerDashboard user={user} setSeccionActiva={navegarA} />}
                    {seccionActiva === 'crear' && <CrearObra user={user} data={itemParaEditar} />} 
                    
                    {seccionActiva === 'ventas' && (
                      <div className="flex flex-col h-full">
                        <div className="px-8 lg:px-12 pt-8 flex gap-4">
                            <button 
                                onClick={() => setModoVentas('productos')}
                                className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${modoVentas === 'productos' ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                            >
                                Venta de Obras
                            </button>
                            <button 
                                onClick={() => setModoVentas('taquilla')}
                                className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${modoVentas === 'taquilla' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                            >
                                Venta de Tickets
                            </button>
                        </div>
                        
                        {modoVentas === 'taquilla' ? <GestionTaquillaView user={user} /> : <GestionVentasView user={user} />}
                      </div>
                    )} 

                    {seccionActiva === 'eventos' && (
                      <MisEventosView user={user} onEditRequest={(evento) => navegarA('crear', { ...evento, _modelType: 'EVENT' })} />
                    )}
                    
                    {seccionActiva === 'locaciones' && (
                      <LocacionesView user={user} onEditRequest={(loc) => navegarA('registrar_locacion', loc)} />
                    )}

                    {seccionActiva === 'registrar_locacion' && (
                      <CrearLocacion user={user} setSeccionActiva={navegarA} locacionExistente={itemParaEditar} />
                    )}

                    {seccionActiva === 'escaner_qr' && <ControlAccesosView />}
                  </>
                )}
                
                {rolEfectivo === 'educator' && (
                  <>
                    {seccionActiva === 'escritorio' && <EducatorDashboard user={user} seccionActiva={seccionActiva} setSeccionActiva={navegarA} />}
                    {seccionActiva === 'crear_ruta' && <CrearMaterial user={user} materialExistente={itemParaEditar} setSeccionActiva={navegarA} />}
                    {seccionActiva === 'rutas' && <RutasEducativasView user={user} setSeccionActiva={navegarA} onEditRequest={(ruta) => navegarA('crear_ruta', ruta)} />}
                    {seccionActiva === 'material' && <MaterialDidacticoView user={user} setSeccionActiva={navegarA} onEditRequest={(item) => navegarA('crear_ruta', item)} />}
                    {seccionActiva === 'favoritos' && <EducatorFavoritosView user={user} />}
                  </>
                )}

                {rolEfectivo === 'visitor' && seccionActiva === 'escritorio' && <VisitorDashboard user={user} setSeccionActiva={navegarA} />}
                {rolEfectivo === 'visitor' && seccionActiva === 'favoritos' && <FavoritosView />}
                {rolEfectivo === 'visitor' && seccionActiva === 'compras' && <ComprasView />}
              </div>
           )}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;