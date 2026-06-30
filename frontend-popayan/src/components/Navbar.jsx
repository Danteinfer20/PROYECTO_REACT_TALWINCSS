import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, GraduationCap, LogOut, User, Bell, CheckCheck, CircleAlert, LayoutDashboard, Users, ImageIcon, Calendar, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ASSETS } from '../utils/constants';
import api from '../services/api'; // ✅ Usamos la instancia api

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isOpen, setIsOpen] = useState(false); 
  const { t } = useTranslation();
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const token = localStorage.getItem('token');

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    }
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
    window.addEventListener('userUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
    }
  }, [token, user]);

  const fetchNotifications = async () => {
    try {
      // ✅ Usamos api.get con ruta relativa
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Error al cargar notificaciones", err);
    }
  };

  const markAsRead = async (id, actionUrl) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      setIsNotifOpen(false);
      if (actionUrl) navigate(actionUrl);
    } catch (err) {
      console.error("Error marcando notificación", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error limpiando notificaciones", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsOpen(false);
      navigate('/login');
    }
  };

  const getAvatar = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0A0A0C&color=fff&bold=true`;
    if (!user?.profile_picture) return defaultAvatar;
    if (user.profile_picture.startsWith('http://') || user.profile_picture.startsWith('https://')) {
      return user.profile_picture;
    }
    return defaultAvatar;
  };

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user.user_type) {
      case 'admin': return '59 130 246';             
      case 'cultural_manager': return '16 185 129';  
      case 'educator': return '245 158 11';          
      case 'artist': return '244 63 94';             
      case 'visitor': return '168 85 247';           
      default: return '168 85 247';                  
    }
  };

  const getRoleLabel = () => {
    switch (user?.user_type) {
      case 'artist': return { text: t('roles.artist', 'Artista'), color: 'text-[rgb(var(--role-accent))]' }; 
      case 'cultural_manager': return { text: t('roles.manager', 'Gestor'), color: 'text-[rgb(var(--role-accent))]' };
      case 'admin': return { text: t('roles.admin', 'Admin'), color: 'text-[rgb(var(--role-accent))]' };
      case 'visitor': return { text: t('roles.explorer', 'Explorador'), color: 'text-[var(--text-body)]' };
      case 'educator': return { text: t('roles.educator', 'Educador'), color: 'text-[rgb(var(--role-accent))]' };
      default: return { text: t('roles.visitor', 'Visitante'), color: 'text-[var(--text-body)]' };
    }
  };

  const roleInfo = getRoleLabel();
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('navbar.home', 'Inicio') },
    { path: '/artesanos', label: t('navbar.artisans', 'Artesanos') },
    { path: '/obras', label: t('navbar.artworks', 'Obras') },
    { path: '/eventos', label: t('navbar.events', 'Eventos') },
    { path: '/tienda', label: t('navbar.store', 'Tienda') },
    { path: '/aprende', label: t('navbar.learn', 'Aprende') }
  ];

  const menuItemsPublicos = [
    { path: '/', label: t('navbar.home', 'Inicio'), icon: <LayoutDashboard size={18}/> },
    { path: '/artesanos', label: t('navbar.artisans', 'Artesanos'), icon: <Users size={18}/> },
    { path: '/obras', label: t('navbar.artworks', 'Obras'), icon: <ImageIcon size={18}/> },
    { path: '/eventos', label: t('navbar.events', 'Eventos'), icon: <Calendar size={18}/> },
    { path: '/tienda', label: t('navbar.store', 'Tienda'), icon: <ShoppingBag size={18}/> },
    { path: '/aprende', label: t('navbar.learn', 'Aprende'), icon: <GraduationCap size={18}/> }
  ];

  const getPrivateLinks = () => {
    if (!user) return [];
    switch (user.user_type) {
      case 'artist':
        return [
          { path: '/dashboard', label: 'Mi Taller', icon: <LayoutDashboard size={18}/> },
          { path: '/dashboard?tab=obras', label: 'Mis Obras', icon: <ImageIcon size={18}/> },
          { path: '/dashboard?tab=tienda', label: 'Mi Tienda', icon: <ShoppingBag size={18}/> }
        ];
      case 'admin':
        return [
          { path: '/dashboard', label: 'Centro Mando', icon: <LayoutDashboard size={18}/> },
          { path: '/dashboard/usuarios', label: 'Usuarios', icon: <Users size={18}/> },
          { path: '/dashboard/auditoria', label: 'Auditoría', icon: <CheckCheck size={18}/> }
        ];
      case 'cultural_manager':
        return [
          { path: '/dashboard', label: 'Panel Gestor', icon: <LayoutDashboard size={18}/> },
          { path: '/dashboard/eventos', label: 'Mis Eventos', icon: <Calendar size={18}/> },
          { path: '/dashboard/locaciones', label: 'Locaciones', icon: <LayoutDashboard size={18}/> }
        ];
      case 'educator':
        return [
          { path: '/dashboard', label: 'Mi Aula', icon: <LayoutDashboard size={18}/> },
          { path: '/dashboard/rutas', label: 'Rutas', icon: <GraduationCap size={18}/> },
          { path: '/dashboard/material', label: 'Material', icon: <LayoutDashboard size={18}/> }
        ];
      default:
        return [];
    }
  };
  
  const privateLinks = getPrivateLinks();

  const NotificationBell = ({ isMobile }) => (
    <div className="relative z-[200]" ref={isMobile ? null : notifRef}>
      <button 
        onClick={() => setIsNotifOpen(!isNotifOpen)} 
        className={`relative p-3 rounded-full transition-all duration-300 ${isNotifOpen ? 'bg-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--text-heading)]/5'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[rgb(var(--role-accent))] rounded-full animate-pulse border-2 border-[var(--bg-container)]"></span>
        )}
      </button>

      {isNotifOpen && (
        <div className={`absolute top-full mt-4 bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-[30px] shadow-2xl overflow-hidden flex flex-col transition-all animate-in slide-in-from-top-4 duration-300 ${isMobile ? 'fixed left-4 right-4 max-w-none w-auto origin-top' : 'right-0 w-[350px] origin-top-right'}`}>
          <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-primary)]/50">
            <h3 className="text-[var(--text-heading)] font-bold italic uppercase tracking-widest text-xs flex items-center gap-2">
              <Bell size={14} className="text-[rgb(var(--role-accent))]" /> {t('navbar.alerts', 'Alertas')}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-[9px] text-[rgb(var(--role-accent))] font-bold uppercase tracking-widest flex items-center gap-1 hover:text-[var(--text-heading)] transition-colors">
                <CheckCheck size={12} /> {t('navbar.clear', 'Limpiar')}
              </button>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-[var(--text-heading)]/10 scrollbar-track-transparent">
            {notifications.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-[var(--text-body)]">
                <CircleAlert size={30} className="mb-3 opacity-20" />
                <p className="text-[10px] uppercase font-mono tracking-widest text-center">{t('navbar.no_interactions', 'Sin interacciones recientes')}</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => markAsRead(notif.id, notif.action_url)}
                  className={`p-4 border-b border-[var(--border-color)] cursor-pointer transition-colors flex gap-4 ${notif.is_read ? 'hover:bg-[var(--text-heading)]/5 opacity-70' : 'bg-[rgb(var(--role-accent))]/5 hover:bg-[rgb(var(--role-accent))]/10'}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.is_read ? 'bg-transparent border border-gray-500' : 'bg-[rgb(var(--role-accent))]'}`}></div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs font-bold ${notif.is_read ? 'text-[var(--text-body)]' : 'text-[var(--text-heading)]'}`}>{notif.title}</span>
                    <span className="text-[11px] text-[var(--text-body)] opacity-80 leading-tight">{notif.message}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav style={{ '--role-accent': getRoleAccentRGB() }} className="w-full bg-[var(--bg-container)]/90 border-b border-[var(--border-color)] px-6 md:px-16 py-4 md:py-6 z-[100] sticky top-0 backdrop-blur-xl transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        
        {/* LADO IZQUIERDO: HAMBURGUESA + LOGO */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="lg:hidden text-[var(--text-heading)] p-2 rounded-full transition-transform active:scale-95 z-[160]"
          >
            <Menu size={26} />
          </button>
          <div className="flex-shrink-0 z-[110]">
            <Link to="/" onClick={() => setIsOpen(false)}>
              <img 
                src={ASSETS.LOGO_PRINCIPAL} 
                alt="Popayán Cultural" 
                className="h-10 md:h-16 w-auto transition-transform duration-500 hover:scale-105 active:scale-95" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "https://ui-avatars.com/api/?name=Popayan+Cultural&background=0A0A0C&color=fff";
                }}
              />
            </Link>
          </div>
        </div>

        {/* NAVEGACIÓN DESKTOP */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.slice(0, 4).map((item) => (
            <Link key={item.path} to={item.path} className={`text-[11px] font-bold uppercase tracking-widest relative group transition-colors duration-300 ${isActive(item.path) ? '!text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
              {item.label}
              <span className={`absolute -bottom-2 left-0 h-[2px] transition-all duration-300 ${isActive(item.path) ? 'w-full !bg-[rgb(var(--role-accent))] shadow-[0_0_8px_rgba(var(--role-accent),0.5)]' : 'w-0 bg-[var(--text-heading)] group-hover:w-full'}`}></span>
            </Link>
          ))}
          <div className="h-4 w-[1px] bg-[var(--border-color)] mx-2"></div>
          <Link to="/tienda" className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${isActive('/tienda') ? 'text-white bg-[rgb(var(--role-accent))] shadow-[0_0_15px_rgba(var(--role-accent),0.4)]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))]/10 border border-transparent hover:border-[rgb(var(--role-accent))]/50'}`}>
            <ShoppingBag size={14} /> {t('navbar.store', 'Tienda')}
          </Link>
          <Link to="/aprende" className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${isActive('/aprende') ? 'text-[var(--bg-primary)] bg-[var(--text-heading)] shadow-md' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))]/10 border border-transparent hover:border-[rgb(var(--role-accent))]/50'}`}>
            <GraduationCap size={16} /> {t('navbar.learn', 'Aprende')}
          </Link>
        </div>

        {/* PERFIL DESKTOP Y CAMPANA */}
        <div className="hidden lg:flex items-center gap-8 z-[110]">
          {token && user ? (
            <div className="flex items-center gap-4">
              <NotificationBell isMobile={false} />
              <div className="h-6 w-[1px] bg-[var(--border-color)] mx-2"></div>
              <Link to="/dashboard" className={`flex items-center gap-4 group bg-[var(--bg-card)] hover:bg-[var(--bg-primary)] p-2 pr-6 rounded-full transition-all border border-[var(--border-color)] shadow-sm hover:border-[rgb(var(--role-accent))]/40`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden border-2 transition-all duration-300 bg-[rgb(var(--role-accent))] border-transparent group-hover:border-[rgb(var(--role-accent))] shadow-[0_0_10px_rgba(var(--role-accent),0.2)]`}>
                  <img 
                    src={getAvatar()} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=0A0A0C&color=fff` }} 
                  />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold uppercase tracking-wider text-[var(--text-heading)] transition-colors leading-tight group-hover:text-[rgb(var(--role-accent))]`}>{user?.name?.split(' ')[0]}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 ${roleInfo.color}`}>{roleInfo.text}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="p-3 text-[var(--text-body)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-300" title={t('navbar.logout', 'Cerrar Sesión')}>
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" state={{ action: 'login' }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-body)] hover:text-[var(--text-heading)] transition-colors">{t('navbar.login', 'Entrar')}</Link>
              <Link to="/login" state={{ action: 'register' }} className="bg-[var(--text-heading)] text-[var(--bg-primary)] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all shadow-sm">{t('navbar.join', 'Unirse')}</Link>
            </div>
          )}
        </div>

        {/* BOTONES MÓVILES: CAMPANA + AVATAR (PERFIL) */}
        <div className="lg:hidden flex items-center gap-3 z-[110]">
          {token && user && (
            <>
              <NotificationBell isMobile={true} />
              <Link to="/dashboard" className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 border-[rgb(var(--role-accent))]">
                <img src={getAvatar()} alt="Profile" className="w-full h-full object-cover" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* CAPA DE BLOQUEO (OVERLAY) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* PANEL LATERAL IZQUIERDO MÓVIL (NATIVO DARK PREMIUM) */}
      <div className={`fixed top-0 left-0 h-screen w-[280px] sm:w-[320px] bg-[#0A0A0C] border-r border-white/10 z-[200] transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden shadow-[4px_0_24px_rgba(0,0,0,0.5)] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* HEADER DEL SLIDER */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <img 
            src={ASSETS.LOGO_PRINCIPAL} 
            alt="Popayán Cultural" 
            className="h-10 w-auto" 
            onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Popayan&background=0A0A0C&color=fff"; }}
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <X size={24} />
          </button>
        </div>

        {/* CONTENEDOR DE NAVEGACIÓN (CON SCROLL INTERNO) */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar flex flex-col gap-8">
          
          {/* SECCIÓN 1: NAVEGACIÓN PÚBLICA */}
          <div>
            <h3 className="text-[rgb(var(--role-accent))] font-bold italic uppercase tracking-widest text-xs mb-4 px-2 leading-tight">Explorar</h3>
            <div className="flex flex-col gap-2">
              {menuItemsPublicos.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${isActive(item.path) ? 'bg-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/30' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                >
                  {item.icon}
                  <span className="text-sm font-bold tracking-wider">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* SECCIÓN 2: NAVEGACIÓN PRIVADA DINÁMICA (SOLO SI HAY SESIÓN Y RUTAS) */}
          {user && privateLinks.length > 0 && (
            <div>
              <h3 className="text-[rgb(var(--role-accent))] font-bold italic uppercase tracking-widest text-xs mb-4 px-2 leading-tight">Módulo {roleInfo.text}</h3>
              <div className="flex flex-col gap-2">
                {privateLinks.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:bg-[rgb(var(--role-accent))]/10 hover:text-[rgb(var(--role-accent))] border border-transparent hover:border-[rgb(var(--role-accent))]/20`}
                  >
                    {item.icon}
                    <span className="text-sm font-bold tracking-wider">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER DEL SLIDER: IDENTIDAD Y ACCIÓN */}
        {user ? (
          <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img src={getAvatar()} alt="Profile" className="w-12 h-12 rounded-full border-2 border-[rgb(var(--role-accent))]" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white uppercase tracking-wider">{user.name.split(' ')[0]}</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ${roleInfo.color}`}>{roleInfo.text}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-red-500/20 transition-all text-sm font-bold uppercase tracking-widest mt-2"
            >
              <LogOut size={18} /> Cerrar Sesión
            </button>
          </div>
        ) : (
          <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col gap-3">
            <Link to="/login" state={{ action: 'login' }} onClick={() => setIsOpen(false)} className="w-full py-3 rounded-xl text-center text-gray-300 hover:text-white border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest">
              Entrar
            </Link>
            <Link to="/login" state={{ action: 'register' }} onClick={() => setIsOpen(false)} className="w-full py-3 rounded-xl text-center bg-white text-black hover:bg-gray-200 transition-all text-xs font-bold uppercase tracking-widest">
              Unirse
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;