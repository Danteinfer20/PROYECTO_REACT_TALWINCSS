import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Link as LinkIcon, Briefcase, Scale, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '../../services/api'; // ✅ Usamos la instancia api

const CreatorApplicationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMode, setSuccessMode] = useState(false);

  const [formData, setFormData] = useState({
    proposed_type: 'artist',
    portfolio_url: '',
    message: ''
  });
  
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
      // ✅ Usamos api, no axios directo
      await api.post('/creator-applications', formData);

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
      <div className="bg-[var(--bg-container)] border border-[rgb(var(--role-accent))]/30 rounded-[40px] p-12 flex flex-col items-center text-center animate-in zoom-in duration-500 shadow-sm transition-colors duration-500">
        <div className="w-24 h-24 bg-[rgb(var(--role-accent))]/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle2 size={48} className="text-[rgb(var(--role-accent))]" />
        </div>
        <h3 className="text-3xl font-bold text-[var(--text-heading)] mb-4 italic uppercase transition-colors">Expediente Radicado</h3>
        <p className="text-[var(--text-body)] text-sm max-w-md leading-relaxed transition-colors">
          Has aceptado el Manifiesto y tu portafolio ha sido enviado a la Corte de Curaduría. El Administrador evaluará tu trayectoria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[40px] p-8 md:p-12 text-left relative overflow-hidden shadow-sm transition-colors duration-500">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[rgb(var(--role-accent))]/5 rounded-full blur-[120px] pointer-events-none transition-colors"></div>
      
      <div className="mb-10 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-heading)] tracking-tighter flex items-center gap-4 italic uppercase transition-colors">
          <Briefcase className="text-[rgb(var(--role-accent))]" size={28} /> Ascenso al Gremio
        </h2>
        <p className="text-[var(--text-body)] text-xs mt-3 font-mono uppercase tracking-[0.2em] opacity-60">
          Presenta tu trayectoria para acceder al Taller Creativo.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-[20px] flex items-center gap-4 animate-in fade-in">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-[var(--text-body)] ml-2 tracking-[0.2em] opacity-60 transition-colors">¿Qué rol solicitas?</label>
          <div className="relative group">
            <select 
              name="proposed_type" 
              value={formData.proposed_type} 
              onChange={handleInputChange} 
              className="w-full p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))] appearance-none transition-all cursor-pointer shadow-inner"
            >
              <option value="artist">Artesano / Artista Visual</option>
              <option value="cultural_manager">Gestor Cultural (Organizador de Eventos)</option>
              <option value="educator">Educador / Tallerista</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] pointer-events-none opacity-40" size={16} />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-[var(--text-body)] ml-2 tracking-[0.2em] flex items-center gap-2 opacity-60 transition-colors">
            <LinkIcon size={14} /> Enlace de tu Portafolio (Drive, Behance, Instagram) *
          </label>
          <input 
            type="url" 
            required
            name="portfolio_url" 
            placeholder="Ej: https://drive.google.com/..."
            value={formData.portfolio_url} 
            onChange={handleInputChange} 
            className="w-full p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))] placeholder:[var(--text-body)]/20 transition-all shadow-inner" 
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-[var(--text-body)] ml-2 tracking-[0.2em] opacity-60 transition-colors">Carta de Presentación / Trayectoria *</label>
          <textarea 
            required 
            rows="4" 
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className="w-full p-5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[20px] text-[var(--text-heading)] outline-none focus:border-[rgb(var(--role-accent))] resize-none placeholder:[var(--text-body)]/20 transition-all shadow-inner" 
            placeholder="Describe tu experiencia, técnicas que utilizas o por qué deseas unirte al ecosistema de Popayán Cultural... (Mínimo 20 caracteres)" 
          />
        </div>

        <hr className="border-[var(--border-color)]" />

        <div className="bg-[var(--bg-primary)] border border-amber-500/20 rounded-[24px] p-6 shadow-inner transition-colors duration-500">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <Scale size={20} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-[var(--text-heading)] font-bold text-lg italic mb-2 transition-colors">Pacto de Responsabilidad</h4>
              
              <button 
                type="button" 
                onClick={() => setShowManifestoText(!showManifestoText)}
                className="text-amber-500/80 font-mono text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:text-amber-400 transition-colors mb-4"
              >
                {showManifestoText ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showManifestoText ? 'Ocultar Manifiesto' : 'Leer Manifiesto de Popayán Cultural'}
              </button>

              {showManifestoText && (
                <div className="text-[var(--text-body)] text-xs leading-relaxed font-mono mb-6 bg-[var(--bg-container)] p-4 rounded-xl border border-[var(--border-color)] animate-in slide-in-from-top-2 transition-colors duration-500">
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
                    className="peer appearance-none w-6 h-6 border-2 border-[var(--border-color)] rounded-md checked:bg-[rgb(var(--role-accent))] checked:border-[rgb(var(--role-accent))] transition-all cursor-pointer shadow-inner bg-[var(--bg-container)]"
                  />
                  <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-[var(--text-body)] text-[11px] font-mono uppercase tracking-widest group-hover:text-[var(--text-heading)] transition-colors">
                  He leído, comprendo y acepto el manifiesto.
                </span>
              </label>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || formData.message.length < 20 || !formData.portfolio_url || !isManifestoAccepted} 
          className="w-full py-6 bg-[rgb(var(--role-accent))] text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-[20px] hover:opacity-90 transition-all flex justify-center items-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_0_30px_rgba(var(--role-accent),0.3)] active:scale-95"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
          ) : (
            <><Send size={18} /> Firmar y Radicar Solicitud</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreatorApplicationForm;