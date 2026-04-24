import React, { useState } from 'react';
import { 
  X, Shield, Award, Feather, CheckCircle2, FileSignature 
} from 'lucide-react';

const ManifestoModal = ({ isOpen, onClose, onAccept, isLoading }) => {
  const [bio, setBio] = useState('');
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (bio.length < 100) return; 
    if (!accepted) return;
    onAccept(bio);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Fondo Overlay Blur */}
      <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-2xl bg-[#0A0A0C] border border-white/10 rounded-[30px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#a855f7]/10 flex items-center justify-center border border-[#a855f7]/20">
              <FileSignature size={18} className="text-[#a855f7]"/>
            </div>
            <div>
              <h2 className="text-xl font-serif text-white tracking-tight">Manifiesto del Creador</h2>
              <p className="text-[#a855f7] font-mono text-[9px] uppercase tracking-widest">Protocolo de Ascenso</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Texto del Manifiesto (Estilo Editorial) */}
          <div className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-normal max-w-none mb-10">
            <p className="text-lg italic text-gray-300 border-l-2 border-[#a855f7]/50 pl-4 mb-8">
              "Al solicitar el ascenso a la categoría de Creador, asumes la responsabilidad de convertirte en un guardián del patrimonio material e inmaterial de nuestra región. Popayán Cultural no es solo una plataforma; es el archivo vivo de nuestra identidad."
            </p>

            <h3 className="text-white text-lg border-b border-white/5 pb-2 mb-4">Cláusulas de Honor</h3>
            <ul className="space-y-4 text-sm text-gray-400 list-none pl-0">
              <li className="flex items-start gap-3">
                <Shield size={16} className="text-[#a855f7] shrink-0 mt-1"/>
                <span><strong>Autenticidad y Origen:</strong> Declaro que todas las obras, productos o eventos que publique son de mi autoría intelectual, creación artesanal o están bajo mi gestión cultural legítima.</span>
              </li>
              <li className="flex items-start gap-3">
                <Award size={16} className="text-[#a855f7] shrink-0 mt-1"/>
                <span><strong>Respeto al Legado:</strong> Me comprometo a que mi contenido honrará, preservará y exaltará la riqueza histórica de Popayán y el Cauca.</span>
              </li>
              <li className="flex items-start gap-3">
                <Feather size={16} className="text-[#a855f7] shrink-0 mt-1"/>
                <span><strong>Excelencia Descriptiva:</strong> Entiendo que esta plataforma es una galería de alto nivel. Mantendré la máxima calidad visual y narrativa.</span>
              </li>
            </ul>
          </div>

          {/* Formulario de Biografía */}
          <div className="mb-8">
            <label className="block text-white font-serif text-lg mb-2">Tu Trayectoria <span className="text-[#a855f7]">*</span></label>
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-4">
              La Corte de Curaduría evaluará este texto. (Mín. 100 caracteres)
            </p>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe sobre tu experiencia, tu arte o tu labor cultural en la región..."
              className="w-full h-32 bg-[#111113] border border-white/10 rounded-2xl p-4 text-sm text-gray-300 focus:outline-none focus:border-[#a855f7]/50 focus:ring-1 focus:ring-[#a855f7]/20 transition-all resize-none placeholder:text-gray-700"
            ></textarea>
            <div className="flex justify-end mt-2">
              <span className={`text-[10px] font-mono ${bio.length < 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                {bio.length} / 100 min
              </span>
            </div>
          </div>

          {/* Checkbox de Aceptación */}
          <label className="flex items-start gap-4 cursor-pointer group p-4 border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors">
            <div className="relative flex items-center justify-center shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <div className="w-5 h-5 border-2 border-gray-600 rounded flex items-center justify-center peer-checked:bg-[#a855f7] peer-checked:border-[#a855f7] transition-all">
                <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3}/>
              </div>
            </div>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              He leído y acepto los términos del Manifiesto. Firmo con mi honor mi compromiso con Popayán Cultural.
            </p>
          </label>

        </div>

        {/* Footer del Modal (Botón de Envío) */}
        <div className="p-6 border-t border-white/5 bg-[#111113] flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-gray-400 font-mono text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!accepted || bio.length < 100 || isLoading}
            className="px-8 py-3 bg-[#a855f7] text-white rounded-full font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-[#9333ea] hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : 'Firmar y Enviar'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManifestoModal;