import React, { useState, useEffect } from 'react';
import { 
  Heart, ShoppingBag, Star, ArrowRight, Bell, 
  Clock, Package, CheckCircle, ChevronRight, Bookmark, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VisitorDashboard = ({ user, seccionActiva }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(seccionActiva || 'inicio');
  
  const [favoritos, setFavoritos] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ favoritos: 0, compras: 0, unread: 0 });

  useEffect(() => {
    if (seccionActiva === 'escritorio') {
      setActiveTab('inicio');
    } else if (seccionActiva) {
      setActiveTab(seccionActiva);
    }
  }, [seccionActiva]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resFavs, resNotifs] = await Promise.all([
        axios.get('http://localhost:8000/api/v1/saved-items', { headers }),
        axios.get('http://localhost:8000/api/v1/notifications', { headers })
      ]);

      setFavoritos(resFavs.data.data);
      setNotificaciones(resNotifs.data.data);
      
      setStats({
        favoritos: resFavs.data.data.length,
        compras: 0,
        unread: resNotifs.data.unread_count
      });
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const quitarFavorito = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8000/api/v1/saved-items/toggle', 
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'removed') {
        const nuevaLista = favoritos.filter(fav => fav.post_id !== postId);
        setFavoritos(nuevaLista);
        setStats(prev => ({ ...prev, favoritos: nuevaLista.length }));
      }
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
    }
  };

  const getAvatar = () => {
    if (user?.profile_picture) return user.profile_picture;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=a855f7&color=fff&bold=true`;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'favoritos':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-white">Mis Obras Guardadas</h3>
              <button onClick={() => setActiveTab('inicio')} className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest">← Volver</button>
            </div>
            
            {loading ? (
              <p className="text-gray-500 text-[10px] font-black tracking-widest animate-pulse uppercase">Cargando colección...</p>
            ) : favoritos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favoritos.map((fav) => (
                  <div key={fav.id} className="bg-[#111] border border-white/5 rounded-[24px] p-4 flex gap-4 hover:border-[#a855f7]/30 transition-all group relative">
                    
                    <img 
                      src={fav.post.media?.[0]?.file_path 
                        ? (fav.post.media[0].file_path.startsWith('http') ? fav.post.media[0].file_path : `http://localhost:8000/storage/${fav.post.media[0].file_path}`) 
                        : 'https://via.placeholder.com/150'} 
                      className="w-20 h-20 object-cover rounded-xl shadow-lg" 
                      alt="Obra"
                    />
                    
                    <div className="flex flex-col justify-center flex-1">
                      <h4 className="text-white font-bold text-sm uppercase leading-tight line-clamp-1">{fav.post.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">Por {fav.post.user?.name}</p>
                      
                      <button 
                        onClick={() => quitarFavorito(fav.post.id)}
                        className="flex items-center gap-1 text-[9px] text-red-500 font-bold mt-2 uppercase hover:text-white transition-colors w-fit"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#111] border border-dashed border-white/10 rounded-[32px] py-20 text-center">
                <Bookmark className="mx-auto text-gray-800 mb-4" size={48} />
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Tu colección está vacía</p>
                {/* ✅ AQUÍ ESTÁ EL CAMBIO PARA REDIRIGIR A /obras O AL HOME (/) */}
                <button 
                  onClick={() => navigate('/')} 
                  className="mt-6 bg-white text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all"
                >
                  Explorar Obras
                </button>
              </div>
            )}
          </div>
        );

      case 'compras':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-white">Historial de Compras</h3>
              <button onClick={() => setActiveTab('inicio')} className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest">← Volver</button>
            </div>
            <div className="bg-[#111] border border-white/5 rounded-[32px] p-8 text-center">
              <Package className="mx-auto text-gray-800 mb-4" size={48} />
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No has realizado pedidos aún</p>
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-white">Alertas Culturales</h3>
              <button onClick={() => setActiveTab('inicio')} className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest">← Volver</button>
            </div>
            
            {notificaciones.length > 0 ? notificaciones.map((n) => (
              <div key={n.id} className={`p-6 rounded-2xl flex gap-4 items-start border ${n.is_read ? 'bg-[#111] border-white/5' : 'bg-[#1a1a1c] border-[#a855f7]/30 shadow-lg shadow-[#a855f7]/5'}`}>
                <div className={`p-3 rounded-xl ${n.is_read ? 'bg-gray-800 text-gray-500' : 'bg-[#a855f7]/10 text-[#a855f7]'}`}>
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className={`text-sm font-bold ${n.is_read ? 'text-gray-400' : 'text-white'}`}>{n.title}</h4>
                    <span className="text-[9px] font-black text-gray-600 uppercase">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-10">No tienes notificaciones nuevas.</p>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-[#111] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#a855f7] blur-[120px] opacity-10 group-hover:opacity-20 transition-all duration-1000"></div>
              <div className="relative z-10">
                <span className="bg-[#a855f7] text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]">Cauca Patrimonio Vivo</span>
                <h2 className="text-3xl font-black text-white mt-4 mb-3 uppercase italic leading-none">Descubre el arte <br /> de <span className="text-[#a855f7]">Popayán</span></h2>
                <p className="text-gray-400 text-sm max-w-md mb-8">Explora piezas únicas creadas por manos artesanas del Cauca y asiste a los eventos más importantes.</p>
                <button onClick={() => navigate('/')} className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:text-white transition-all shadow-xl">
                  Comenzar Exploración <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => setActiveTab('favoritos')} className="bg-[#111] border border-white/5 p-8 rounded-[32px] flex items-center justify-between group hover:border-[#a855f7]/40 transition-all">
                <div className="flex items-center gap-6">
                  <div className="bg-red-500/10 p-4 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
                    <Heart size={24} fill={stats.favoritos > 0 ? "currentColor" : "none"} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl font-black text-white leading-none">{stats.favoritos}</h4>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Obras Guardadas</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-800" />
              </button>

              <button onClick={() => setActiveTab('compras')} className="bg-[#111] border border-white/5 p-8 rounded-[32px] flex items-center justify-between group hover:border-[#a855f7]/40 transition-all">
                <div className="flex items-center gap-6">
                  <div className="bg-[#a855f7]/10 p-4 rounded-2xl text-[#a855f7] group-hover:scale-110 transition-transform">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl font-black text-white leading-none">{stats.compras}</h4>
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Pedidos Activos</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-800" />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Panel del <span className="text-[#a855f7]">Explorador</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-[#a855f7] pl-4">{user?.city || 'Popayán'} • Identidad Cultural</p>
        </div>
        
        <button onClick={() => setActiveTab('notificaciones')} className="relative bg-[#111] border border-white/5 p-4 rounded-2xl hover:bg-white/5 transition-all group">
          <Bell size={20} className={stats.unread > 0 ? "text-[#a855f7]" : "text-gray-500"} />
          {stats.unread > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-[#a855f7] rounded-full animate-pulse shadow-[0_0_10px_#a855f7]"></span>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">{renderContent()}</div>

        <div className="space-y-8">
          <div className="bg-[#111] border border-white/5 rounded-[40px] p-8 text-center relative overflow-hidden shadow-2xl">
            <div className="w-24 h-24 rounded-[32px] border-2 border-[#a855f7] p-1.5 mx-auto mb-6 transition-transform hover:rotate-3 shadow-xl">
              <img src={getAvatar()} className="w-full h-full object-cover rounded-[24px]" alt="Profile" />
            </div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">{user?.name}</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 opacity-60">{user?.user_type?.replace('_', ' ')}</p>

            <div className="mt-10 bg-white/[0.02] border border-white/5 rounded-3xl p-6">
              <div className="flex items-center justify-center gap-3 mb-4"><Star className="text-yellow-500" size={18} fill="currentColor" /><span className="text-xs font-black uppercase text-white tracking-widest">Nivel 1</span></div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-[#a855f7] to-blue-500 h-full w-[15%]"></div></div>
              <p className="text-[9px] text-gray-600 font-bold uppercase mt-4 tracking-tighter">Faltan 850 XP para Nivel 2</p>
            </div>

            <button onClick={() => navigate('/ajustes')} className="mt-8 w-full py-4 border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white hover:bg-white/5 transition-all shadow-sm">Configurar Identidad</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;