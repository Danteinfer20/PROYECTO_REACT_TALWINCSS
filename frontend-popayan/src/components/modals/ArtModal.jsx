import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MessageCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArtModal = ({ obraId, onClose, token }) => {
  const [obra, setObra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  // 🛡️ SEGURO ANTI-CAÍDAS PARA IMÁGENES
  const resolverImagen = (path, tipo = 'obra') => {
    if (!path) return tipo === 'perfil' ? 'https://ui-avatars.com/api/?name=User&background=111&color=fff' : '/default.jpg';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  // 📡 CARGAR LA OBRA Y SUS COMENTARIOS
  useEffect(() => {
    const fetchObra = async () => {
      try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`http://localhost:8000/api/v1/posts/${obraId}`, config);
        setObra(res.data.data);
      } catch (error) {
        console.error("Error cargando la obra", error);
      } finally {
        setLoading(false);
      }
    };
    fetchObra();
  }, [obraId, token]);

  // 💬 ENVIAR COMENTARIO AL BACKEND
  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim() || !token || !obra) return;

    setEnviando(true);
    try {
      const res = await axios.post(
        'http://localhost:8000/api/v1/comments',
        { post_id: obra.id, content: nuevoComentario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualiza la lista de comentarios en tiempo real en la pantalla
      setObra(prev => ({
        ...prev,
        comments: [res.data.data, ...(prev.comments || [])]
      }));
      setNuevoComentario('');
    } catch (error) {
      console.error("Error al comentar", error);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      {/* Fondo oscuro desenfocado */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Contenedor Principal del Modal */}
      <div className="relative bg-[#0d0d0f] border border-white/10 w-full max-w-6xl h-[90vh] md:h-[80vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 animate-in zoom-in-95 duration-300">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-3 bg-black/50 hover:bg-white/10 rounded-full text-white transition-all z-50 backdrop-blur-md border border-white/10"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-t-2 border-[#a855f7] animate-spin rounded-full"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sincronizando...</p>
          </div>
        ) : !obra ? (
           <div className="w-full h-full flex items-center justify-center text-gray-500 uppercase font-black text-xs tracking-widest">Obra no disponible</div>
        ) : (
          <>
            {/* 🖼️ MITAD IZQ: Imagen (Tailwind: w-1/2 en desktop, w-full en móvil) */}
            <div className="w-full md:w-1/2 h-64 md:h-full bg-[#111] relative">
              <img 
                src={resolverImagen(obra.media?.[0]?.file_path)} 
                className="w-full h-full object-cover" 
                alt={obra.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0f] via-transparent to-transparent md:bg-gradient-to-r"></div>
            </div>

            {/* 📝 MITAD DER: Comentarios e Info (Tailwind: overflow-y-auto para scroll interno) */}
            <div className="w-full md:w-1/2 h-full flex flex-col p-6 md:p-10 overflow-y-auto custom-scrollbar">
              
              <span className="text-[#a855f7] text-[9px] font-black uppercase tracking-[0.3em] mb-2">{obra.category?.name || 'Arte'}</span>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none mb-6 text-white">{obra.title}</h2>
              
              {/* Tarjeta del Autor */}
              <div className="flex items-center gap-3 mb-8 p-4 bg-[#111] rounded-2xl border border-white/5">
                 <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-900 border border-white/10">
                   <img src={resolverImagen(obra.user?.profile_picture, 'perfil')} className="w-full h-full object-cover grayscale" alt="Autor"/>
                 </div>
                 <div>
                   <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Maestro</p>
                   <p className="text-xs font-bold uppercase tracking-tight text-white">{obra.user?.name}</p>
                 </div>
              </div>

              <div className="mb-10">
                <h4 className="text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] mb-3">Relato Cultural</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{obra.content}</p>
              </div>

              <hr className="border-white/5 mb-8" />

              {/* 💬 SECCIÓN DE COMENTARIOS */}
              <div className="flex-1 flex flex-col">
                <h4 className="text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] mb-6 flex items-center gap-2">
                  <MessageCircle size={14}/> Comunidad ({obra.comments?.length || 0})
                </h4>

                {token ? (
                  <form onSubmit={enviarComentario} className="relative mb-8">
                    <textarea 
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      placeholder="Deja tu huella..."
                      className="w-full bg-[#111] text-white border border-white/10 rounded-2xl py-3 pl-4 pr-14 text-sm font-medium outline-none focus:border-[#a855f7] transition-all resize-none h-20"
                    />
                    <button disabled={!nuevoComentario.trim() || enviando} type="submit" className="absolute bottom-3 right-3 bg-[#a855f7] text-white p-2 rounded-xl disabled:opacity-50 hover:bg-purple-500 transition-colors">
                      <Send size={14} />
                    </button>
                  </form>
                ) : (
                  <div className="bg-[#111] p-4 rounded-2xl border border-white/5 text-center mb-8">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Únete para comentar</p>
                    <Link to="/login" className="text-[#a855f7] text-xs font-black underline tracking-widest hover:text-white transition-colors">Iniciar Sesión</Link>
                  </div>
                )}

                {/* Lista de Comentarios pintada con JSX dinámico */}
                <div className="space-y-4 pb-8">
                  {obra.comments?.length > 0 ? (
                    obra.comments.map(com => (
                      <div key={com.id} className="flex gap-3 bg-[#111] p-4 rounded-2xl border border-white/5">
                         <img src={resolverImagen(com.user?.profile_picture, 'perfil')} className="w-8 h-8 rounded-full object-cover" alt="User"/>
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-bold uppercase text-[#a855f7]">{com.user?.name}</span>
                             <span className="text-[8px] text-gray-600">{new Date(com.created_at).toLocaleDateString()}</span>
                           </div>
                           <p className="text-xs text-gray-300">{com.content}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">Aún no hay voces en esta obra.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArtModal;