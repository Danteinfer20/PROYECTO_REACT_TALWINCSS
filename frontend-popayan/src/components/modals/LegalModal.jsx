import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const LegalModal = ({ isOpen, onClose, title, children }) => {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 transition-all duration-300">
      {/* Fondo oscuro con blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Contenedor del modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] bg-[var(--bg-container)]/50">
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-[rgb(var(--role-accent))]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] hover:border-[rgb(var(--role-accent))] transition-all"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 text-[var(--text-body)] text-sm leading-relaxed">
          {children}
        </div>
        
        {/* Pie (botón cerrar) */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-container)]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[rgb(var(--role-accent))] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;