import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { 
  LayoutDashboard, Settings, LogOut, Shield, 
  Heart, ShoppingBag, Activity, FileText, Package, 
  PlusCircle, ImageIcon, Calendar, MapPin, Store,
  BookOpen, Video, Scan, Menu, X 
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import VisitorDashboard from '../components/dashboard/VisitorDashboard';
import ArtistDashboard from '../components/dashboard/ArtistDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ModeracionView from '../components/dashboard/ModeracionView';
import MonitorContenido from '../components/dashboard/MonitorContenido'; // 🔥 NUEVO
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
import CrearMaterial from '../components/dashboard/CrearMaterial'; 
import RutasEducativasView from '../components/dashboard/RutasEducativasView'; 
import MaterialDidacticoView from '../components/dashboard/MaterialDidacticoView'; 
import EducatorFavoritosView from '../components/dashboard/EducatorFavoritosView'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); 

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      default: return '168 85 247';
    }
  };

  const navegarA = (idSeccion, datos = null) => {
    setItemParaEditar(datos);
    setSeccionActiva(idSeccion);
    setIsMobileSidebarOpen(false); 
  };

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileSidebarOpen]);

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

  const getTituloRol = (userData) => {
    if (!userData) return t('dashboard.roles.visitor', 'Visitante');
    const isVerified = userData.is_verified === true || userData.is_verified === 1 || userData.is_verified === "1";
    
    if (['artist', 'cultural_manager', 'educator'].includes(userData.user_type) && !isVerified) {
        return t(`dashboard.roles.${userData.user_type}_pending`);
    }

    const roles = {
      'admin': t('dashboard.roles.admin'),
      'artist': t('dashboard.roles.artist'),
      'cultural_manager': t('dashboard.roles.manager'),
      'educator': t('dashboard.roles.educator'),
      'visitor': t('dashboard.roles.visitor')
    };
    return roles[userData.user_type] || roles['visitor'];
  };

  const tituloRol = getTituloRol(user);

  const themeClasses = {
      border: 'border-[rgb(var(--role-accent))]/50 shadow-[0_0_25px_rgba(var(--role-accent),0.3)]',
      bgActive: 'bg-[rgb(var(--role-accent))] shadow-[0_0_15px_rgba(var(--role-accent),0.4)] text-white',
      badgeColor: 'border-[rgb(var(--role-accent))]/50 text-[rgb(var(--role-accent))] bg-[rgb(var(--role-accent))]/10'
  };

  const getAvatar = () => {
    if (user?.profile_picture) {
      return user.profile_picture.startsWith('http') ? user.profile_picture : `http://localhost:8000${user.profile_picture}`;
    }
    const name = user?.name || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A0A0C&color=fff&bold=true&size=128`;
  };

  const menuConfig = {
    admin: [
      { id: 'escritorio', label: t('dashboard.menu.admin.escritorio'), icon: <LayoutDashboard size={18}/> },
      { id: 'usuarios', label: t('dashboard.menu.admin.usuarios'), icon: <Shield size={18}/> },
      { id: 'auditoria', label: t('dashboard.menu.admin.auditoria'), icon: <Activity size={18}/> },
      { id: 'moderacion', label: 'Moderación', icon: <FileText size={18}/> },
      { id: 'monitor', label: 'Monitor de Contenido', icon: <FileText size={18}/> }, // 🔥 NUEVO
    ],
    artist: [
      { id: 'escritorio', label: t('dashboard.menu.artist.escritorio'), icon: <LayoutDashboard size={18}/> },
      { id: 'galeria', label: t('dashboard.menu.artist.galeria'), icon: <ImageIcon size={18}/> },
      { id: 'tienda', label: t('dashboard.menu.artist.tienda'), icon: <Store size={18}/> }, 
      { id: 'crear', label: t('dashboard.menu.artist.crear'), icon: <PlusCircle size={18}/> },
      { id: 'ventas', label: t('dashboard.menu.artist.ventas'), icon: <Package size={18}/> }
    ],
    cultural_manager: [ 
      { id: 'escritorio', label: t('dashboard.menu.manager.escritorio'), icon: <LayoutDashboard size={18}/> },
      { id: 'crear', label: t('dashboard.menu.manager.crear'), icon: <PlusCircle size={18}/> }, 
      { id: 'eventos', label: t('dashboard.menu.manager.eventos'), icon: <Calendar size={18}/> }, 
      { id: 'locaciones', label: t('dashboard.menu.manager.locaciones'), icon: <MapPin size={18}/> }, 
      { id: 'ventas', label: t('dashboard.menu.manager.ventas'), icon: <Package size={18}/> },
      { id: 'escaner_qr', label: t('dashboard.menu.manager.escaner'), icon: <Scan size={18}/> },
    ],
    educator: [
      { id: 'escritorio', label: t('dashboard.menu.educator.escritorio'), icon: <LayoutDashboard size={18}/> },
      { id: 'rutas', label: t('dashboard.menu.educator.rutas'), icon: <BookOpen size={18}/> },
      { id: 'material', label: t('dashboard.menu.educator.material'), icon: <Video size={18}/> },
      { id: 'favoritos', label: t('dashboard.menu.educator.favoritos'), icon: <Heart size={18}/> },
    ],
    visitor: [
      { id: 'escritorio', label: t('dashboard.menu.visitor.escritorio'), icon: <LayoutDashboard size={18}/> },
      { id: 'favoritos', label: t('dashboard.menu.visitor.favoritos'), icon: <Heart size={18}/> },
      { id: 'compras', label: t('dashboard.menu.visitor.compras'), icon: <ShoppingBag size={18}/> },
    ]
  };

  const menuActual = menuConfig[rolEfectivo] || menuConfig.visitor;

  return (
    <div key={i18n.language} style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans overflow-hidden transition-colors duration-500">
      <Navbar />
      <div className="flex flex-1 overflow-hidden relative">
        
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden transition-opacity duration-500 ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        ></div>

        <aside className={`fixed lg:relative top-0 bottom-0 left-0 z-[150] lg:z-20 w-[85%] max-w-[320px] lg:w-72 bg-[var(--bg-container)] border-r border-[var(--border-color)] flex flex-col shadow-2xl lg:shadow-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          
          <div className="p-8 flex flex-col items-center border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--text-heading)]/5 to-transparent relative">
            <button onClick={() => setIsMobileSidebarOpen(false)} className="absolute top-4 right-4 lg:hidden p-2 text-[var(--text-body)] hover:text-[var(--text-heading)] bg-[var(--text-heading)]/5 rounded-full active:scale-95 transition-all">
              <X size={18} />
            </button>

            <div className={`w-24 h-24 rounded-full border-[3px] p-1 mb-5 transition-all duration-500 ${themeClasses.border}`}>
              <img src={getAvatar()} className="w-full h-full object-cover rounded-full" alt="Avatar" />
            </div>
            <h2 className="font-black text-[15px] uppercase tracking-tighter italic text-[var(--text-heading)] truncate w-full text-center">{user?.name}</h2>
            <span className={`px-5 py-1.5 rounded-full mt-3 font-black text-[9px] uppercase tracking-[0.25em] border backdrop-blur-md ${themeClasses.badgeColor}`}>{tituloRol}</span>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
            {menuActual.map((item) => (
              <button 
                key={item.id} 
                onClick={() => navegarA(item.id)} 
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${seccionActiva === item.id ? `${themeClasses.bgActive} hover:-translate-y-1` : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)]'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
            <div className="w-full h-px bg-[var(--border-color)] my-4"></div>
            <button onClick={() => navegarA('ajustes')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${seccionActiva === 'ajustes' ? 'bg-[var(--text-heading)]/10 text-[var(--text-heading)] shadow-sm' : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)]'}`}>
              <Settings size={18} /> {t('dashboard.menu.ajustes', 'Ajustes de Cuenta')}
            </button>
          </nav>

          <button onClick={handleLogout} className="m-8 flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-[20px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={16} /> {t('dashboard.menu.logout', 'Cerrar Sesión')}
          </button>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-primary)] relative transition-colors duration-500">
          
          <div className="lg:hidden flex items-center justify-between bg-[var(--bg-container)] p-4 border-b border-[var(--border-color)] sticky top-0 z-40 transition-colors duration-500">
            <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full border-[2px] p-0.5 ${themeClasses.border}`}>
                 <img src={getAvatar()} className="w-full h-full object-cover rounded-full" alt="Avatar" />
               </div>
               <span className="font-black uppercase tracking-widest text-[10px] text-[var(--text-heading)]">{t('dashboard.title', 'Mi Panel')}</span>
            </div>
            <button onClick={() => setIsMobileSidebarOpen(true)} className="p-2 bg-[var(--text-heading)]/5 border border-[var(--border-color)] rounded-xl text-[var(--text-heading)] active:scale-95 transition-all">
               <Menu size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
             {seccionActiva === 'ajustes' ? <AjustesView user={user} setUser={setUser} /> : (
                <div className="animate-in fade-in duration-700 w-full h-full">
                  
                  {rolEfectivo === 'admin' && (
                    <>
                      {seccionActiva === 'escritorio' && <AdminDashboard />}
                      {seccionActiva === 'usuarios' && <UsuariosView />}
                      {seccionActiva === 'auditoria' && <AuditoriaView />}
                      {seccionActiva === 'moderacion' && <ModeracionView />}
                      {seccionActiva === 'monitor' && <MonitorContenido />} {/* 🔥 NUEVO */}
                    </>
                  )}
                  
                  {rolEfectivo === 'artist' && (
                    <>
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
                                  className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${modoVentas === 'productos' ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_15px_rgba(var(--role-accent),0.4)]' : 'bg-[var(--text-heading)]/5 text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
                              >
                                  {t('dashboard.ventas.obras', 'Venta de Obras')}
                              </button>
                              <button 
                                  onClick={() => setModoVentas('taquilla')}
                                  className={`px-8 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${modoVentas === 'taquilla' ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_15px_rgba(var(--role-accent),0.4)]' : 'bg-[var(--text-heading)]/5 text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
                              >
                                  {t('dashboard.ventas.tickets', 'Venta de Tickets')}
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
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;