import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Repeat, Share2, MessageCircle, Send, CheckCircle, Clock, Eye, ChevronRight, Loader2, Star, Sparkles, Award } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const ObraDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('relato'); 
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const [hasReaccionado, setHasReaccionado] = useState(false);
  const [hasGuardado, setHasGuardado] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0); 
    const fetchObra = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${API_URL}/posts/${id}`, config);
        const data = res.data.data;
        setObra(data);
        setHasReaccionado(data.user_interaction?.has_reacted || false);
        setHasGuardado(data.user_interaction?.is_saved || false);
      } catch (error) {
        console.error("Obra no encontrada", error);
        navigate('/obras'); 
      } finally {
        setLoading(false);
      }
    };
    fetchObra();
  }, [id, token, navigate, API_URL]);

  const handleInspirar = async () => {
    if (!token) return navigate('/login');
    const nuevoEstado = !hasReaccionado;
    setHasReaccionado(nuevoEstado);
    setObra(prev => ({
      ...prev,
      stats: { ...prev.stats, reactions: nuevoEstado ? prev.stats.reactions + 1 : Math.max(0, prev.stats.reactions - 1) }
    }));
    try {
      await axios.post(`${API_URL}/reactions/toggle`, { post_id: obra.id, reaction_type: 'inspire' }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) { setHasReaccionado(!nuevoEstado); }
  };

  const handleGuardar = async () => {
    if (!token) return navigate('/login');
    try {
      const res = await axios.post(`${API_URL}/saved-items/toggle`, { post_id: obra.id }, { headers: { Authorization: `Bearer ${token}` } });
      const isSaved = res.data.status === 'added';
      setHasGuardado(isSaved); 
      showToast(isSaved ? "⭐ Añadida a tu colección" : "🗑️ Eliminada de la colección");
    } catch (error) { showToast("❌ Error al sincronizar."); }
  };

  // 🔥 FUSIÓN MAESTRA: Compartir y Repostear en un solo flujo
  const handleShareMaster = async () => {
    let actionSuccessful = false;

    // 1. Intentar la acción de compartir (Nativa o Portapapeles)
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: obra.title, 
          text: `Explora el lienzo: ${obra.title}`, 
          url: window.location.href 
        });
        actionSuccessful = true;
      } catch (e) {
        // El usuario canceló el menú nativo, no hacemos nada.
        console.log("Acción de compartir cancelada por el usuario.");
        return; 
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        showToast("🔗 Enlace copiado. ¡Listo para compartir!");
        actionSuccessful = true;
      } catch (e) {
        showToast("❌ No se pudo copiar el enlace.");
      }
    }

    // 2. Si la acción se completó, disparamos la métrica al backend
    if (actionSuccessful) {
      try {
        await axios.post(`${API_URL}/posts/${obra.id}/share`);
        
        // Actualizamos el contador visual optimísticamente
        setObra(prev => ({ 
          ...prev, 
          stats: { 
            ...prev.stats, 
            shares: (prev.stats?.shares || 0) + 1 
          } 
        }));
        
        // Si usamos el API nativa, mostramos el Toast (el portapapeles ya lo muestra arriba)
        if (navigator.share) {
          showToast("🔄 ¡Repost registrado con éxito!");
        }
      } catch (error) {
        console.error("Error silencioso al registrar el repost en la base de datos", error);
      }
    }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !token) return;
    setEnviando(true);
    try {
      const res = await axios.post(`${API_URL}/comments`, { post_id: obra.id, content: nuevoComentario }, { headers: { Authorization: `Bearer ${token}` } });
      setObra(prev => ({ ...prev, comments: [res.data.data, ...(prev.comments || [])] }));
      setNuevoComentario('');
      showToast("💬 Aporte registrado.");
    } catch (error) { showToast("❌ Error al comentar."); } finally { setEnviando(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center font-mono text-[#a855f7] text-[10px] uppercase tracking-widest gap-4">
      <Loader2 size={32} className="animate-spin text-[#a855f7]" /> Descifrando Lienzo...
    </div>
  );

  if (!obra) return null;

  const imageUrl = (obra.images && obra.images.length > 0) ? obra.images[0] : (obra.post_media && obra.post_media.length > 0) ? (obra.post_media[0].file_path.startsWith('http') ? obra.post_media[0].file_path : `http://localhost:8000/storage/${obra.post_media[0].file_path}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(obra.title)}&background=0A0A0C&color=a855f7&size=800`;

  const visualizacionesReales = obra.stats?.views || obra.view_count || 0;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans selection:bg-[#A855F7]/30 overflow-x-hidden">
      <Navbar />

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#111113]/90 backdrop-blur-xl border border-[#A855F7]/30 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
          <CheckCircle size={16} className="text-[#A855F7]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full relative pt-12 md:pt-14 pb-20">
        
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img src={imageUrl} alt="Fondo" className="w-full h-full object-cover scale-125 blur-[150px] opacity-15 grayscale-[10%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C]/40 via-[#0A0A0C]/80 to-[#0A0A0C]"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 md:px-12 mt-4">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
            
            {/* 🖼️ DASHBOARD IZQUIERDO ULTRA-COMPACTO */}
            <div className="w-full lg:w-[40%] xl:w-[35%] flex flex-col gap-3 lg:sticky lg:top-20">
              
              <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden bg-[#111113] border border-white/5 shadow-2xl group">
                <img src={imageUrl} alt={obra.title} className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              </div>

              {/* BENTO BOX: MAESTRO */}
              <Link to={`/artesanos/${obra.author?.username || ''}`} className="w-full bg-[#111113]/50 backdrop-blur-2xl rounded-[18px] p-3 border border-white/5 shadow-lg flex items-center justify-between group hover:border-[#A855F7]/40 transition-all duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#0A0A0C] border border-white/10 shrink-0">
                    <img src={obra.author?.avatar || `https://ui-avatars.com/api/?background=050505&color=a855f7&bold=true&name=${obra.author?.name}`} className="w-full h-full object-cover" alt={obra.author?.name} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1"><Award size={8} className="text-[#a855f7]"/> Maestro</span>
                    <span className="text-xs font-bold text-white tracking-tight group-hover:text-[#a855f7] transition-colors">{obra.author?.name || 'Anónimo'}</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[#A855F7] flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                  <ChevronRight size={14} />
                </div>
              </Link>

              {/* BENTO BOX: BOTONES */}
              <div className="flex gap-3 w-full">
                <button onClick={handleGuardar} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-[16px] font-bold uppercase tracking-[0.2em] text-[9px] transition-all ${hasGuardado ? 'bg-[#A855F7]/20 border border-[#A855F7] text-[#A855F7]' : 'bg-[#111113]/50 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/20'}`}>
                    <Star size={14} fill={hasGuardado ? "currentColor" : "none"} /> 
                    {hasGuardado ? 'Guardada' : 'Coleccionar'}
                </button>
                {/* 🔥 FUSIÓN: Botón Share conectdo a handleShareMaster */}
                <button onClick={handleShareMaster} className="w-[45px] shrink-0 flex items-center justify-center rounded-[16px] bg-[#111113]/50 backdrop-blur-md border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all" title="Compartir Obra">
                    <Share2 size={14} />
                </button>
              </div>

              {/* BENTO BOX: MÉTRICAS */}
              <div className="flex items-center justify-between px-5 py-4 rounded-[18px] bg-[#111113]/30 backdrop-blur-md border border-white/5 mb-10 lg:mb-0">
                <div className="flex flex-col items-center group cursor-pointer w-1/3 border-r border-white/5" onClick={handleInspirar}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart size={14} className={`transition-colors ${hasReaccionado ? "text-[#A855F7]" : "text-gray-400 group-hover:text-white"}`} fill={hasReaccionado ? "currentColor" : "none"} />
                    <span className="text-xs font-bold text-white">{obra.stats?.reactions || 0}</span>
                  </div>
                  <span className="text-[7px] font-medium tracking-[0.2em] text-gray-500 uppercase">Inspiración</span>
                </div>
                {/* 🔥 FUSIÓN: Contador de Repost conectado a handleShareMaster */}
                <div className="flex flex-col items-center group cursor-pointer w-1/3 border-r border-white/5" onClick={handleShareMaster}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Repeat size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-xs font-bold text-white">{obra.stats?.shares || 0}</span>
                  </div>
                  <span className="text-[7px] font-medium tracking-[0.2em] text-gray-500 uppercase" title="Clic para Compartir">Repost</span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Eye size={14} className="text-[#a855f7]" />
                    <span className="text-xs font-bold text-white">{visualizacionesReales}</span>
                  </div>
                  <span className="text-[7px] font-medium tracking-[0.2em] text-gray-500 uppercase">Vistas</span>
                </div>
              </div>

            </div>

            {/* 📝 COLUMNA DERECHA: TÍTULO Y RELATO */}
            <div className="w-full lg:w-[60%] xl:w-[65%] flex flex-col pt-0">
              
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] px-3 py-1.5 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(168,85,247,0.1)] mb-4">
                  <Sparkles size={10} /> {obra.category?.name || 'Arte Local'}
                </span>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-tight text-white drop-shadow-xl">
                  {obra.title}
                </h1>
              </div>

              <div className="w-full max-w-[400px] bg-[#111113]/60 backdrop-blur-xl rounded-full p-1.5 flex items-center border border-white/5 shadow-lg mb-5">
                <button onClick={() => setActiveTab('relato')} className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'relato' ? 'bg-[#A855F7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-white'}`}>
                  Relato Visual
                </button>
                <button onClick={() => setActiveTab('comunidad')} className={`flex-1 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'comunidad' ? 'bg-[#A855F7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-white'}`}>
                  Perspectivas ({obra.comments?.length || 0})
                </button>
              </div>

              <div className="w-full">
                  {activeTab === 'relato' && (
                  <div className="animate-in fade-in duration-500">
                      <div className="text-gray-300 text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap bg-white/5 p-6 md:p-8 rounded-[24px] border border-white/5 shadow-inner">
                        {obra.content || 'Este registro visual no cuenta con un relato extendido adjunto.'}
                      </div>
                  </div>
                  )}

                  {activeTab === 'comunidad' && (
                  <div className="animate-in fade-in duration-500 flex flex-col gap-6">
                      {token ? (
                      <form onSubmit={enviarComentario} className="relative shadow-2xl">
                          <textarea 
                            value={nuevoComentario}
                            onChange={(e) => setNuevoComentario(e.target.value)}
                            placeholder="Escribe tu interpretación..."
                            className="w-full bg-[#111113]/60 backdrop-blur-2xl border border-white/5 focus:border-[#A855F7]/50 rounded-[24px] py-5 pl-6 pr-20 text-sm font-medium text-white outline-none transition-all resize-none min-h-[120px] placeholder:text-gray-600"
                          ></textarea>
                          <button type="submit" disabled={enviando || !nuevoComentario.trim()} className="absolute bottom-4 right-4 bg-[#A855F7] text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-purple-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                            <Send size={14} className="-ml-0.5" />
                          </button>
                      </form>
                      ) : (
                      <div className="bg-[#111113]/40 backdrop-blur-2xl p-6 md:p-8 rounded-[24px] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                          <div className="flex items-center gap-4 text-left">
                            <MessageCircle size={28} className="text-[#A855F7]" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Inicia sesión para comentar.</p>
                          </div>
                          <Link to="/login" className="bg-white text-black hover:bg-[#A855F7] hover:text-white px-8 py-3 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-lg">
                            Ingresar
                          </Link>
                      </div>
                      )}

                      <div className="flex flex-col gap-3">
                        {obra.comments?.map((com) => (
                          <div key={com.id} className="bg-[#111113]/30 backdrop-blur-xl border border-white/5 hover:border-[#A855F7]/20 rounded-[20px] p-5 flex flex-col gap-3 transition-colors">
                              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">{com.user?.name}</span>
                                  <div className="flex items-center gap-1.5 text-[8px] font-mono text-[#a855f7] uppercase tracking-wider"><Clock size={10}/> {com.human_time}</div>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{com.content}</p>
                          </div>
                        ))}
                      </div>
                  </div>
                  )}
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ObraDetalle;