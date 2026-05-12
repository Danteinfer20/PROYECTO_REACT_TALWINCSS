import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, GraduationCap, LogOut, User, Bell, CheckCheck, CircleAlert } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 🔥 INYECCIÓN POLÍGLOTA
import { ASSETS } from '../utils/constants';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isOpen, setIsOpen] = useState(false); 
  const { t } = useTranslation(); // 🔥 CEREBRO DE IDIOMAS ACTIVO
  
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // CORTAFUEGOS ANTI-SCROLL
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

  // SINCRONIZADOR DE USUARIO
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

  // SINCRONIZADOR DE NOTIFICACIONES CON LARAVEL
  useEffect(() => {
    if (token && user) {
      fetchNotifications();
    }
  }, [token, user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error("Error al cargar notificaciones", err);
    }
  };

  const markAsRead = async (id, actionUrl) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      setIsNotifOpen(false);
      if (actionUrl) navigate(actionUrl);

    } catch (err) { console.error("Error marcando notificación", err); }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error("Error limpiando notificaciones", err); }
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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsOpen(false);
    navigate('/login');
  };

  const getAvatar = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=0A0A0C&color=fff&bold=true`;
    if (!user?.profile_picture) return defaultAvatar;
    if (user.profile_picture.startsWith('http://') || user.profile_picture.startsWith('https://')) {
      return user.profile_picture;
    }
    return defaultAvatar;
  };

  // 🔥 MOTOR MATEMÁTICO DE SEGMENTACIÓN CROMÁTICA
  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; // Púrpura Premium (Base)
    switch (user.user_type) {
      case 'admin': return '59 130 246';             // Blue-500
      case 'cultural_manager': return '16 185 129';  // Emerald-500
      case 'educator': return '245 158 11';          // Amber-500
      case 'artist': return '244 63 94';             // Rose-500
      case 'visitor': return '168 85 247';           // Purple-500
      default: return '168 85 247';                  // Fallback seguro
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
    { path: '/', label: t('navbar.home') },
    { path: '/artesanos', label: t('navbar.artisans') },
    { path: '/obras', label: t('navbar.artworks') },
    { path: '/eventos', label: t('navbar.events') }
  ];

  // 🔔 COMPONENTE DE CAMPANA (Mutación de Color Integrada)
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
    // 🔥 INYECCIÓN DE ÁMBITO: --role-accent se calcula dinámicamente y se propaga a todo el DOM del Navbar.
    <nav style={{ '--role-accent': getRoleAccentRGB() }} className="w-full bg-[var(--bg-container)]/90 border-b border-[var(--border-color)] px-6 md:px-16 py-4 md:py-6 z-[100] sticky top-0 backdrop-blur-xl transition-colors duration-500">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        
        {/* LOGO */}
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

        {/* NAVEGACIÓN DESKTOP */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link key={item.path} to={item.path} className={`text-[11px] font-bold uppercase tracking-widest relative group transition-colors duration-300 ${isActive(item.path) ? '!text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
              {item.label}
              <span className={`absolute -bottom-2 left-0 h-[2px] transition-all duration-300 ${isActive(item.path) ? 'w-full !bg-[rgb(var(--role-accent))] shadow-[0_0_8px_rgba(var(--role-accent),0.5)]' : 'w-0 bg-[var(--text-heading)] group-hover:w-full'}`}></span>
            </Link>
          ))}
          
          <div className="h-4 w-[1px] bg-[var(--border-color)] mx-2"></div>
          
          {/* BOTONES ESPECIALES (Acoplados a la Matemática Cromática) */}
          <Link to="/tienda" className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${isActive('/tienda') ? 'text-white bg-[rgb(var(--role-accent))] shadow-[0_0_15px_rgba(var(--role-accent),0.4)]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))]/10 border border-transparent hover:border-[rgb(var(--role-accent))]/50'}`}>
            <ShoppingBag size={14} /> {t('navbar.store')}
          </Link>
          <Link to="/aprende" className={`px-5 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 transition-all duration-300 ${isActive('/aprende') ? 'text-[var(--bg-primary)] bg-[var(--text-heading)] shadow-md' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))]/10 border border-transparent hover:border-[rgb(var(--role-accent))]/50'}`}>
            <GraduationCap size={16} /> {t('navbar.learn')}
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
              <Link to="/login" state={{ action: 'login' }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-body)] hover:text-[var(--text-heading)] transition-colors">{t('navbar.login')}</Link>
              <Link to="/login" state={{ action: 'register' }} className="bg-[var(--text-heading)] text-[var(--bg-primary)] px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-all shadow-sm">{t('navbar.join')}</Link>
            </div>
          )}
        </div>

        {/* BOTONES MÓVILES (Hamburguesa + Campana) */}
        <div className="lg:hidden flex items-center gap-2 z-[160]">
          {token && user && (
            <NotificationBell isMobile={true} />
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-heading)] p-2 rounded-full active:scale-95 transition-transform">
            <Menu size={26} />
          </button>
        </div>
      </div>

      {/* 📱 SIDE DRAWER MÓVIL */}
      <div className={`fixed inset-0 z-[150] lg:hidden pointer-events-none`}>
        {/* Overlay oscuro estándar para modales */}
        <div onClick={() => setIsOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}></div>

        <div className={`absolute top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-[var(--bg-container)] border-l border-[var(--border-color)] flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full'}`}>
          <div className="p-6 flex justify-end border-b border-[var(--border-color)]">
            <button onClick={() => setIsOpen(false)} className="p-2 text-[var(--text-body)] hover:text-[var(--text-heading)] bg-[var(--text-heading)]/5 rounded-full active:scale-95 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-8 p-8">
            {navLinks.concat([
              { path: '/tienda', label: t('navbar.store') },
              { path: '/aprende', label: t('navbar.learn') }
            ]).map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsOpen(false)} 
                className={`text-sm font-bold uppercase tracking-[0.2em] transition-colors flex items-center gap-4 ${isActive(item.path) ? '!text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
              >
                {isActive(item.path) && <span className="w-1.5 h-1.5 rounded-full !bg-[rgb(var(--role-accent))] shadow-[0_0_8px_rgba(var(--role-accent),0.5)]"></span>}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
            {token && user ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full overflow-hidden border-2 border-[rgb(var(--role-accent))] shrink-0`}>
                    <img 
                      src={getAvatar()} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=0A0A0C&color=fff` }}
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold text-[var(--text-heading)] uppercase tracking-wider truncate">{user.name}</span>
                    <span className={`text-[9px] uppercase font-mono tracking-widest mt-0.5 ${roleInfo.color}`}>{roleInfo.text}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={`flex items-center justify-center gap-2 py-3 rounded-xl bg-[rgb(var(--role-accent))]/10 text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/20 text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-all`}>
                    <User size={14} /> {t('navbar.panel', 'Panel')}
                  </Link>
                  <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-all">
                    <LogOut size={14}/> {t('navbar.logout', 'Salir')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link to="/login" state={{ action: 'login' }} onClick={() => setIsOpen(false)} className="w-full text-center py-3.5 text-[10px] text-[var(--text-body)] font-bold uppercase tracking-widest border border-[var(--border-color)] rounded-xl bg-[var(--bg-card)] active:scale-95 transition-transform">{t('navbar.login')}</Link>
                <Link to="/login" state={{ action: 'register' }} onClick={() => setIsOpen(false)} className="w-full text-center bg-[var(--text-heading)] text-[var(--bg-primary)] py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform">{t('navbar.join')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;