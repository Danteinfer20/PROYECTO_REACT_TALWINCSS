import React from 'react';
import { Link } from 'react-router-dom';
import { X, Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SidebarDrawer = ({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  menuItems, 
  variant = 'public',
  activeItemId = null,
  onNavigate = null,
  roleAccentRGB,
  roleLabel,
  userAvatar
}) => {
  const { t } = useTranslation();

  const themeClasses = {
    border: `border-[rgb(var(--role-accent))]/50 shadow-[0_0_25px_rgba(var(--role-accent),0.3)]`,
    bgActive: `bg-[rgb(var(--role-accent))] shadow-[0_0_15px_rgba(var(--role-accent),0.4)] text-white`,
    badgeColor: `border-[rgb(var(--role-accent))]/50 text-[rgb(var(--role-accent))] bg-[rgb(var(--role-accent))]/10`
  };

  return (
    <div className={`fixed inset-0 z-[150] lg:hidden pointer-events-none`}>
      <div 
        onClick={onClose} 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      ></div>
      <div className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-[var(--bg-container)] border-r border-[var(--border-color)] flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full'}`}>
        
        <div className="p-8 flex flex-col items-center border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--text-heading)]/5 to-transparent relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-[var(--text-body)] hover:text-[var(--text-heading)] bg-[var(--text-heading)]/5 rounded-full active:scale-95 transition-all">
            <X size={18} />
          </button>
          <div className={`w-24 h-24 rounded-full border-[3px] p-1 mb-5 transition-all duration-500 ${themeClasses.border}`}>
            <img src={userAvatar} className="w-full h-full object-cover rounded-full" alt="Avatar" />
          </div>
          <h2 className="font-black text-[15px] uppercase tracking-tighter italic text-[var(--text-heading)] truncate w-full text-center">
            {user?.name || t('navbar.guest', 'Invitado')}
          </h2>
          {user && (
            <span className={`px-5 py-1.5 rounded-full mt-3 font-black text-[9px] uppercase tracking-[0.25em] border backdrop-blur-md ${themeClasses.badgeColor}`}>
              {roleLabel}
            </span>
          )}
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            if (variant === 'dashboard') {
              return (
                <button
                  key={item.id}
                  onClick={() => { onNavigate(item.id); onClose(); }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    activeItemId === item.id
                      ? themeClasses.bgActive + ' hover:-translate-y-1'
                      : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            } else {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className="w-full flex items-center gap-4 px-5 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)]"
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            }
          })}
        </nav>

        {user && (
          <button 
            onClick={() => { onLogout(); onClose(); }} 
            className="m-8 flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-[20px] font-black text-[9px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={16} /> {t('dashboard.menu.logout', 'Cerrar Sesión')}
          </button>
        )}
      </div>
    </div>
  );
};

export default SidebarDrawer;