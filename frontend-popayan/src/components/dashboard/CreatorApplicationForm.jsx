import React, { useState } from 'react';
import axios from 'axios';
import { Send, CheckCircle2, AlertCircle, Link as LinkIcon, Briefcase, Scale, ChevronDown, ChevronUp } from 'lucide-react';

const CreatorApplicationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMode, setSuccessMode] = useState(false);

  // Estado del formulario (Sin archivos, solo texto y URL)
  const [formData, setFormData] = useState({
    proposed_type: 'artist',
    portfolio_url: '',
    message: ''
  });
  
  // Estado Legal
  const [isManifestoAccepted, setIsManifestoAccepted] = useState(false);
  const [showManifestoText, setShowManifestoText] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isManifestoAccepted) return; 

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      // 🔥 CIRUGÍA LEAN: Enviamos un JSON limpio, sin FormData pesados
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/creator-applications`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMode(true);
      if (onSuccess) setTimeout(onSuccess, 3000); 

    } catch (err) {
      console.error("Error completo:", err);
      let errorMessage = "Hubo un error al enviar tu solicitud.";
      
      if (err.response?.data?.errors) {
        const firstErrorKey = Object.keys(err.response.data.errors)[0];
        errorMessage = err.response.data.errors[firstErrorKey][0];
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (successMode) {
    return (
      <div className="bg-[#111113] border border-[#a855f7]/30 rounded-[40px] p-12 flex flex-col items-center text-center animate-in zoom-in duration-500 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        <div className="w-24 h-24 bg-[#a855f7]/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-[#a855f7]" />
        </div>
        <h3 className="text-3xl font-serif text-white mb-4 italic uppercase">Expediente Radicado</h3>
        <p className="text-gray-400 text-sm max-w-md leading-relaxed">
          Has aceptado el Manifiesto y tu portafolio ha sido enviado a la Corte de Curaduría. El Administrador evaluará tu trayectoria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111113] border border-white/5 rounded-[40px] p-8 md:p-12 text-left relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-[120px] opacity-10 pointer-events-none"></div>
      
      <div className="mb-10 relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tighter flex items-center gap-4 italic uppercase">
          <Briefcase className="text-[#a855f7]" size={28} /> Ascenso al Gremio
        </h2>
        <p className="text-gray-500 text-xs mt-3 font-mono uppercase tracking-[0.2em]">
          Presenta tu trayectoria para acceder al Taller Creativo.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-center gap-4 animate-in fade-in">
          <AlertCircle className="text-red-400 shrink-0" size={20} />
          <p className="text-red-400 font-mono text-[10px] uppercase tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-[0.2em]">¿Qué rol solicitas?</label>
          <select 
            name="proposed_type" 
            value={formData.proposed_type} 
            onChange={handleInputChange} 
            className="w-full p-5 bg-[#0A0A0C] border border-white/5 rounded-[20px] text-white outline-none focus:border-[#a855f7] appearance-none transition-colors"
          >
            <option value="artist">Artesano / Artista Visual</option>
            <option value="cultural_manager">Gestor Cultural (Organizador de Eventos)</option>
            <option value="educator">Educador / Tallerista</option>
          </select>
        </div>

        {/* 🔥 Enlace del Portafolio (Ahora toma el protagonismo) */}
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-[0.2em] flex items-center gap-2">
            <LinkIcon size={14} /> Enlace de tu Portafolio (Drive, Behance, Instagram) *
          </label>
          <input 
            type="url" 
            required
            name="portfolio_url" 
            placeholder="Ej: https://drive.google.com/..."
            value={formData.portfolio_url} 
            onChange={handleInputChange} 
            className="w-full p-5 bg-[#0A0A0C] border border-white/5 rounded-[20px] text-white outline-none focus:border-[#a855f7] placeholder:text-white/20 transition-colors" 
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-[0.2em]">Carta de Presentación / Trayectoria *</label>
          <textarea 
            required 
            rows="4" 
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full p-5 bg-[#0A0A0C] border border-white/5 rounded-[20px] text-white outline-none focus:border-[#a855f7] resize-none placeholder:text-white/20 transition-colors" 
            placeholder="Describe tu experiencia, técnicas que utilizas o por qué deseas unirte al ecosistema de Popayán Cultural... (Mínimo 20 caracteres)" 
          />
        </div>

        <hr className="border-white/5" />

        <div className="bg-[#0A0A0C] border border-amber-500/20 rounded-[24px] p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Scale size={20} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-serif text-lg italic mb-2">Pacto de Responsabilidad</h4>
              
              <button 
                type="button" 
                onClick={() => setShowManifestoText(!showManifestoText)}
                className="text-amber-500/80 font-mono text-[9px] uppercase tracking-widest flex items-center gap-2 hover:text-amber-400 transition-colors mb-4"
              >
                {showManifestoText ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showManifestoText ? 'Ocultar Manifiesto' : 'Leer Manifiesto de Popayán Cultural'}
              </button>

              {showManifestoText && (
                <div className="text-gray-400 text-xs leading-relaxed font-mono mb-6 bg-[#111113] p-4 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                  <p className="mb-2">1. Garantizo que todas las obras y productos registrados son de mi autoría intelectual o tengo los derechos legales para su comercialización.</p>
                  <p className="mb-2">2. Me comprometo a preservar el respeto, la ética y los valores patrimoniales de Popayán en cada publicación y evento organizado.</p>
                  <p>3. Entiendo que la Corte de Curaduría se reserva el derecho de suspender mi cuenta si la información proporcionada es falsa o viola los lineamientos de la comunidad.</p>
                </div>
              )}

              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={isManifestoAccepted}
                    onChange={(e) => setIsManifestoAccepted(e.target.checked)}
                    className="peer appearance-none w-6 h-6 border-2 border-white/20 rounded-md checked:bg-[#a855f7] checked:border-[#a855f7] transition-all cursor-pointer"
                  />
                  <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-gray-300 text-[11px] font-mono uppercase tracking-widest group-hover:text-white transition-colors">
                  He leído, comprendo y acepto el manifiesto.
                </span>
              </label>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || formData.message.length < 20 || !formData.portfolio_url || !isManifestoAccepted} 
          className="w-full py-6 bg-gradient-to-r from-[#a855f7] to-purple-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-[20px] hover:opacity-90 transition-all flex justify-center items-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</>
          ) : (
            <><Send size={18} /> Firmar y Radicar Solicitud</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatorApplicationForm; 