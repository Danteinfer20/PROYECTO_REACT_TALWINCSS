import React, { useState } from 'react';
import { 
  MapPin, Heart, ShoppingBag, History, 
  ChevronRight, Shield, AlertTriangle, CheckCircle2, X 
} from 'lucide-react';

// 🔥 IMPORTACIÓN DEL NUEVO FORMULARIO (Que ya incluye el Manifiesto)
import CreatorApplicationForm from './CreatorApplicationForm';

const VisitorDashboard = ({ user, setSeccionActiva }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Sincronización de estado para reflejar cambios tras la postulación
  const [applicationSent, setApplicationSent] = useState(false);

  // Un usuario está "En Curaduría" si ya envió la solicitud en esta sesión
  // O si el backend ya nos indica que tiene verificación pendiente
  const isInCuratorship = applicationSent || (user?.user_type === 'visitor' && user?.is_pending_verification);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Esta función la llama el formulario cuando Laravel responde con éxito (201)
  const handleSuccess = () => {
    setApplicationSent(true);
    setIsFormOpen(false);
    showToast('Expediente radicado correctamente ante la Corte.');
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 font-sans overflow-x-hidden animate-in fade-in duration-700">
      
      {/* 🚀 TOAST DE NOTIFICACIONES */}
      <div className={`fixed top-10 right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-xl border px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />} 
          {toast.message}
        </div>
      </div>

      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight mb-2 uppercase italic">
          Portafolio <span className="text-gray-500">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
          <MapPin size={12} className="text-[#a855f7]" /> Nodo Popayán
        </p>
      </header>

      {/* 🛡️ SECCIÓN DE ESTATUS Y POSTULACIÓN */}
      <section className="mb-12 relative overflow-hidden bg-[#111113] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl group transition-all hover:border-[#a855f7]/20">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#a855f7]/5 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className={isInCuratorship ? "text-amber-500" : "text-[#a855f7]"} strokeWidth={1.5}/>
              <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${isInCuratorship ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-[#a855f7]/10 border-[#a855f7]/20 text-[#a855f7]"}`}>
                {isInCuratorship ? 'Estatus: En Revisión de Curaduría' : 'Estatus: Ciudadano Cultural'}
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tighter mb-4 italic uppercase">
              {isInCuratorship ? 'Tu Ascenso está en Proceso' : '¿Listo para el Taller de Creadores?'}
            </h2>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl">
              {isInCuratorship 
                ? "Hemos recibido tus evidencias. La Corte de Curaduría está validando tu trayectoria. Este proceso asegura la excelencia técnica de Popayán Cultural."
                : "Si eres artesano, gestor de eventos o educador, este es el momento de formalizar tu presencia. Envía tu portafolio y obtén acceso al Taller Creativo."}
            </p>
          </div>

          <div className="shrink-0">
            {isInCuratorship ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                 <span className="font-mono text-[9px] text-amber-500/60 uppercase tracking-widest">Sincronizando</span>
               </div>
            ) : (
              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full md:w-auto px-10 py-5 bg-[#a855f7] text-white rounded-[20px] font-mono text-[10px] font-black uppercase tracking-widest hover:bg-[#9333ea] hover:scale-105 hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all duration-500 flex items-center justify-center gap-3 group"
              >
                Iniciar Postulación <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 📊 ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'favoritos', icon: Heart, label: 'Inspiración', desc: 'Obras y productos guardados', color: 'text-rose-500' },
          { id: 'compras', icon: ShoppingBag, label: 'Adquisiciones', desc: 'Historial de compras en tienda', color: 'text-emerald-500' },
          { id: 'rutas', icon: History, label: 'Trayectoria', desc: 'Eventos y lugares visitados', color: 'text-blue-500' }
        ].map((item, i) => (
          <div 
            key={i} 
            onClick={() => setSeccionActiva(item.id)}
            className="bg-[#111113] border border-white/5 rounded-[35px] p-8 hover:bg-[#161618] hover:border-white/10 transition-all cursor-pointer group shadow-lg"
          >
            <div className={`w-14 h-14 rounded-2xl bg-[#0A0A0C] border border-white/5 flex items-center justify-center mb-8 ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
              <item.icon size={24} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif text-white mb-2 group-hover:text-[#a855f7] transition-colors uppercase italic tracking-tighter">{item.label}</h3>
            <p className="text-gray-500 text-xs font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 🌫️ MODAL DE POSTULACIÓN (OVERLAY) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#0A0A0C]/90 backdrop-blur-md" onClick={() => setIsFormOpen(false)}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-in slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="absolute top-6 right-6 z-50 p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-all"
            >
              <X size={20} />
            </button>
            
            {/* INYECCIÓN DEL FORMULARIO MAESTRO */}
            <CreatorApplicationForm onSuccess={handleSuccess} />
          </div>
        </div>
      )}

    </div>
  );
};

export default VisitorDashboard;