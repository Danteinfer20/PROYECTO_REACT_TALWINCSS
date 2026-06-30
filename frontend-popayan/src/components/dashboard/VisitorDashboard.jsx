import React, { useState } from 'react';
import { 
  MapPin, Heart, ShoppingBag, History, 
  ChevronRight, Shield, AlertTriangle, CheckCircle2, X 
} from 'lucide-react';
import CreatorApplicationForm from './CreatorApplicationForm';

const VisitorDashboard = ({ user, setSeccionActiva }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [applicationSent, setApplicationSent] = useState(false);

  const isInCuratorship = applicationSent || (user?.user_type === 'visitor' && user?.is_pending_verification);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleSuccess = () => {
    setApplicationSent(true);
    setIsFormOpen(false);
    showToast('Expediente radicado correctamente ante la Corte.');
  };

  return (
    <div className="w-full h-full text-[var(--text-heading)] p-4 md:p-8 lg:p-12 font-sans overflow-x-hidden animate-in fade-in duration-700 transition-colors">
      
      {/* Toast responsivo */}
      <div className={`fixed top-4 right-4 md:top-10 md:right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-xl border px-4 py-3 md:px-6 md:py-4 rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={14} className="md:w-4 md:h-4" /> : <CheckCircle2 size={14} className="md:w-4 md:h-4" />} 
          {toast.message}
        </div>
      </div>

      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-heading)] tracking-tight mb-2 uppercase italic">
          Portafolio <span className="text-[var(--text-body)] opacity-70">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-[var(--text-body)] font-mono text-[9px] md:text-[10px] uppercase tracking-[0.25em] md:tracking-[0.3em] flex items-center gap-2">
          <MapPin size={10} className="md:w-3 md:h-3 text-[rgb(var(--role-accent))]" /> Nodo Popayán
        </p>
      </header>

      {/* Sección de estatus */}
      <section className="mb-10 md:mb-12 relative overflow-hidden bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[30px] md:rounded-[40px] p-6 md:p-12 shadow-sm group transition-all duration-500 hover:border-[rgb(var(--role-accent))]/40 hover:shadow-[0_20px_40px_rgba(var(--glass-shadow))]">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[rgb(var(--role-accent))]/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <Shield size={16} className={`md:w-5 md:h-5 ${isInCuratorship ? "text-amber-500" : "text-[rgb(var(--role-accent))]"}`} strokeWidth={1.5}/>
              <span className={`font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] px-3 py-1 md:px-4 md:py-1.5 rounded-full border transition-colors ${isInCuratorship ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))]"}`}>
                {isInCuratorship ? 'Estatus: En Revisión de Curaduría' : 'Estatus: Ciudadano Cultural'}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-[var(--text-heading)] tracking-tighter mb-3 md:mb-4 italic uppercase">
              {isInCuratorship ? 'Tu Ascenso está en Proceso' : '¿Listo para el Taller de Creadores?'}
            </h2>
            
            <p className="text-[var(--text-body)] text-xs md:text-sm leading-relaxed max-w-xl">
              {isInCuratorship 
                ? "Hemos recibido tus evidencias. La Corte de Curaduría está validando tu trayectoria. Este proceso asegura la excelencia técnica de Popayán Cultural."
                : "Si eres artesano, gestor de eventos o educador, este es el momento de formalizar tu presencia. Envía tu portafolio y obtén acceso al Taller Creativo."}
            </p>
          </div>

          <div className="shrink-0">
            {isInCuratorship ? (
               <div className="flex flex-col items-center gap-2 md:gap-4">
                 <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                 <span className="font-mono text-[7px] md:text-[9px] text-amber-500/60 uppercase tracking-widest">Sincronizando</span>
               </div>
            ) : (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full md:w-auto px-6 py-3 md:px-10 md:py-5 bg-[rgb(var(--role-accent))] text-white rounded-[20px] font-mono text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:opacity-90 hover:scale-105 hover:shadow-[0_10px_30px_rgba(var(--role-accent),0.4)] transition-all duration-500 flex items-center justify-center gap-2 md:gap-3 group"
              >
                Iniciar Postulación <ChevronRight size={14} className="md:w-[18px] md:h-[18px] group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tarjetas de acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
        {[
          { id: 'favoritos', icon: Heart, label: 'Inspiración', desc: 'Obras y productos guardados', color: 'text-rose-500' },
          { id: 'compras', icon: ShoppingBag, label: 'Adquisiciones', desc: 'Historial de compras en tienda', color: 'text-emerald-500' },
          { id: 'rutas', icon: History, label: 'Trayectoria', desc: 'Eventos y lugares visitados', color: 'text-blue-500' }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => setSeccionActiva(item.id)}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[28px] md:rounded-[35px] p-5 md:p-8 hover:bg-[var(--bg-container)] hover:border-[rgb(var(--role-accent))]/30 transition-all cursor-pointer group shadow-sm hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))] duration-500"
          >
            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mb-5 md:mb-8 ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
              <item.icon size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-[var(--text-heading)] mb-1 md:mb-2 group-hover:text-[rgb(var(--role-accent))] transition-colors uppercase italic tracking-tighter">{item.label}</h3>
            <p className="text-[var(--text-body)] text-[10px] md:text-xs font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Modal de postulación */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsFormOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-in slide-in-from-bottom-10 duration-500 rounded-[30px] shadow-2xl">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-1.5 md:p-2 bg-[var(--text-heading)]/5 hover:bg-red-500/10 text-[var(--text-body)] hover:text-red-500 rounded-full transition-all border border-transparent hover:border-red-500/30"
            >
              <X size={16} className="md:w-5 md:h-5" />
            </button>
            
            <CreatorApplicationForm onSuccess={handleSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorDashboard;