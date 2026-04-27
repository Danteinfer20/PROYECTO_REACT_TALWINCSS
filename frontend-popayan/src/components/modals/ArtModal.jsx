import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MessageCircle, Send, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArtModal = ({ obraId, onClose, token }) => {
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1541336318489-083c799fa774?q=80&w=2070";
  const API_BASE = "http://localhost:8000";

  // 🛡️ TANQUE BLINDADO DE RESOLUCIÓN DE IMAGEN
  const resolverImagen = (objeto) => {
    if (!objeto) return FALLBACK_IMAGE;

    // 1. Escaneo agresivo de todas las propiedades posibles del JSON
    const path = 
      objeto.file_path || 
      objeto.imagen || 
      objeto.image || 
      objeto.media?.[0]?.file_path || 
      objeto.images?.[0] || 
      objeto.profile_picture;

    if (!path) return FALLBACK_IMAGE;
    if (path.startsWith('http')) return path;

    // 2. Saneamiento matemático de la ruta (Evita /storage//storage)
    const cleanPath = path.replace(/^\/+/, '').replace(/^storage\//, '');
    
    return `${API_BASE}/storage/${cleanPath}`;
  };

  useEffect(() => {
    const fetchObra = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_BASE}/api/v1/posts/${obraId}`, config);
        setObra(res.data.data);
      } catch (error) {
        console.error("Fallo estructural al cargar obra");
      } finally {
        setLoading(false);
      }
    };
    fetchObra();
  }, [obraId, token]);

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !token || !obra) return;
    setEnviando(true);
    try {
      const res = await axios.post(
        `${API_BASE}/api/v1/comments`,
        { post_id: obra.id, content: nuevoComentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setObra(prev => ({
        ...prev,
        comments: [res.data.data, ...(prev.comments || [])]
      }));
      setNuevoComentario('');
    } catch (error) {
      console.error("Error en flujo de comentarios");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <Loader2 className="animate-spin text-[#a855f7]" size={40} />
    </div>
  );

  if (!obra) return null;

  // Resolución de la imagen principal pasando el objeto completo
  const mainImg = resolverImagen(obra);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative bg-[#0d0d0f] border border-white/10 w-full max-w-7xl h-[90vh] md:h-[85vh] rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-500">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-white/10 rounded-2xl text-white transition-all z-50 border border-white/10 ring-1 ring-white/5 backdrop-blur-xl">
          <X size={20} />
        </button>

        {/* 🖼️ VISOR DE ARTE: AMBIENT BACKDROP */}
        <div className="w-full md:w-[65%] h-[40%] md:h-full bg-black relative flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <img src={mainImg} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[80px] scale-150" alt="ambient" />
          <img 
            src={mainImg} 
            className="relative z-10 max-w-full max-h-full object-contain p-6 md:p-12 drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]" 
            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            alt={obra.title}
          />
        </div>

        {/* 📝 CURADURÍA Y COMUNIDAD */}
        <div className="w-full md:w-[35%] h-[60%] md:h-full flex flex-col bg-[#0d0d0f]">
          <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-full">
                <Sparkles size={12} className="text-[#a855f7]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#a855f7]">{obra.category?.name || 'Patrimonio'}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-[0.9] text-white">{obra.title}</h2>
              
              <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-[24px] ring-1 ring-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-black">
                  <img src={resolverImagen(obra.user)} className="w-full h-full object-cover grayscale" alt="Autor"/>
                </div>
                <div>
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-[0.2em] mb-0.5">Maestro</p>
                  <p className="text-sm font-bold text-gray-200 uppercase tracking-tight">{obra.user?.name || 'Artesano Local'}</p>
                </div>
              </div>
            </header>

            <div className="space-y-4 text-gray-400 text-sm leading-relaxed italic font-light">
              <h4 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.3em]">El Relato</h4>
              <p>"{obra.content || 'Obra del archivo patrimonial.'}"</p>
            </div>

            <div className="space-y-6 pb-20">
              <h4 className="text-[10px] font-black uppercase text-gray-600 tracking-[0.3em] flex items-center gap-3 border-t border-white/5 pt-8">
                <MessageCircle size={14} className="text-[#a855f7]"/> Voces ({obra.comments?.length || 0})
              </h4>
              <div className="space-y-4">
                {obra.comments?.map(com => (
                  <div key={com.id} className="flex gap-4 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <img src={resolverImagen(com.user)} className="w-8 h-8 rounded-full object-cover shrink-0" alt="U"/>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-[#a855f7] uppercase">{com.user?.name}</p>
                      <p className="text-xs text-gray-300 leading-snug">{com.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#0d0d0f] border-t border-white/10 backdrop-blur-xl">
            {token ? (
              <form onSubmit={enviarComentario} className="relative">
                <textarea 
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Escribe tu huella..."
                  className="w-full bg-black/50 text-white border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-xs outline-none focus:border-[#a855f7] transition-all resize-none h-14"
                />
                <button disabled={!nuevoComentario.trim() || enviando} type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#a855f7] text-white p-2.5 rounded-xl hover:scale-105 transition-all shadow-lg">
                  {enviando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            ) : (
              <Link to="/login" className="flex items-center justify-center w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#a855f7]">Inicia sesión para comentar</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtModal;