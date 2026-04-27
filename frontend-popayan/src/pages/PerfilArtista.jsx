import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Grid, ShoppingBag, Loader2, Award, CheckCircle, 
  Share2, Instagram, Globe, Twitter, Check, UserPlus, UserCheck, Sparkles 
} from 'lucide-react';

import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx'; 
import ProductCard from '../components/cards/ProductCard.jsx'; 

const PerfilArtista = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [artista, setArtista] = useState(null);
  const [obras, setObras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [activeTab, setActiveTab] = useState('obras');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  // 🛡️ RESOLVER DE IMAGEN: Gestión nativa Cloudinary / Local
  const getAvatarUrl = (user) => {
    if (!user?.profile_picture) return `https://ui-avatars.com/api/?background=151518&color=a855f7&bold=true&name=${encodeURIComponent(user?.name || 'U')}`;
    if (user.profile_picture.startsWith('http')) return user.profile_picture;
    return `http://localhost:8000/storage/${user.profile_picture.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSantuario = async () => {
      try {
        setLoading(true);
        // 1. Obtener Perfil (Saneado para Artistas, Gestores y Admins)
        const resArtista = await axios.get(`${API_URL}/artists/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const maestro = resArtista.data.data;
        setArtista(maestro);
        setFollowersCount(maestro.follower_count || 0);
        setIsFollowing(maestro.is_following_by_me || false);

        // 2. Carga Atómica Segmentada (Confianza plena en el Query Parameter del Backend)
        const [resObras, resProd] = await Promise.all([
          axios.get(`${API_URL}/posts`, { params: { user_id: maestro.id } }),
          axios.get(`${API_URL}/products`, { params: { user_id: maestro.id } }).catch(() => ({ data: { data: [] } }))
        ]);

        setObras(resObras.data.data || []);
        setProductos(resProd.data.data || []);

      } catch (error) {
        console.error("Fallo estructural en carga de perfil:", error);
        navigate('/artesanos');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchSantuario();
  }, [username, navigate, API_URL, token]);

  const handleFollowToggle = async () => {
    if (!token) return navigate('/login');
    try {
      setFollowLoading(true);
      const res = await axios.post(`${API_URL}/follow/${artista.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        const following = res.data.message.includes('followed');
        setIsFollowing(following);
        setFollowersCount(prev => following ? prev + 1 : prev - 1);
      }
    } catch (e) { console.error("Error en enlace social:", e); } finally { setFollowLoading(false); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: artista.name, url: window.location.href }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono text-[#a855f7] text-[10px] uppercase tracking-[0.4em]">
      <Loader2 size={32} className="animate-spin mb-4" />
      Sincronizando Archivo...
    </div>
  );

  if (!artista) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-[#a855f7]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <Navbar />

      <main className="flex-1 w-full relative pb-24 pt-32 md:pt-40 z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* INFO HEADER */}
        <div className="flex flex-col lg:flex-row gap-12 items-start border-b border-white/5 pb-16 mb-12">
          <div className="shrink-0 relative group">
            <div className="absolute inset-0 bg-[#a855f7]/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-32 h-32 md:w-56 md:h-56 rounded-[48px] bg-[#0A0A0C] border border-white/10 shadow-2xl overflow-hidden relative z-10 ring-1 ring-white/5">
              <img src={getAvatarUrl(artista)} alt={artista.name} className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-white/[0.03] border border-white/10 text-gray-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md">
                    <Sparkles size={10} className="text-[#a855f7]" /> 
                    {artista.user_type === 'cultural_manager' ? 'Gestor Cultural' : 'Maestro Artesano'}
                  </span>
                  {artista.is_verified && <CheckCircle size={16} className="text-blue-500" />}
                </div>
                <h1 className="text-5xl md:text-6xl font-bold italic uppercase tracking-tighter leading-[0.95] text-white">{artista.name}</h1>
                <p className="text-[#a855f7] font-mono text-xs uppercase tracking-[0.3em] font-black">@{artista.username}</p>
              </div>

              <div className="flex gap-10 bg-[#0A0A0C] border border-white/5 backdrop-blur-xl p-6 rounded-[32px] ring-1 ring-white/5 shadow-2xl">
                <div className="text-center">
                  <p className="text-2xl font-bold tracking-tighter">{obras.length}</p>
                  <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mt-1">Obras</p>
                </div>
                <div className="w-px h-10 bg-white/5"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold tracking-tighter">{followersCount}</p>
                  <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest mt-1">Comunidad</p>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-base leading-relaxed max-w-3xl font-light italic">
              “{artista.bio || 'Este custodio del legado forja su historia en el corazón de Popayán.'}”
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-full">
                <MapPin size={12} className="text-[#a855f7]" /> {artista.city || 'Popayán'}
              </div>

              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                  isFollowing ? 'bg-white/5 border border-white/10 text-white' : 'bg-[#a855f7] text-white shadow-lg hover:scale-105 active:scale-95'
                }`}
              >
                {followLoading ? <Loader2 size={14} className="animate-spin"/> : isFollowing ? <><UserCheck size={14}/> Siguiendo</> : <><UserPlus size={14}/> Seguir</>}
              </button>

              <button onClick={handleShare} className="p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* FEED AREA */}
        <div className="space-y-10">
          <div className="flex items-center gap-8 border-b border-white/5 pb-4">
            <button onClick={() => setActiveTab('obras')} className={`relative py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'obras' ? 'text-[#a855f7]' : 'text-gray-500 hover:text-white'}`}>
               Obras Maestras
               {activeTab === 'obras' && <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>}
            </button>
            <button onClick={() => setActiveTab('tienda')} className={`relative py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'tienda' ? 'text-[#a855f7]' : 'text-gray-500 hover:text-white'}`}>
               Pop Store
               {activeTab === 'tienda' && <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div>}
            </button>
          </div>

          <div className="min-h-[40vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 animate-in fade-in duration-700">
              {activeTab === 'obras' ? (
                obras.length > 0 ? obras.map(obra => <ArtCard key={obra.id} obra={obra} onClickCard={() => navigate(`/obra/${obra.id}`)} />) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[40px] opacity-30 text-[9px] font-black uppercase tracking-widest">Sin registro de obras</div>
                )
              ) : (
                productos.length > 0 ? productos.map(prod => <ProductCard key={prod.id} producto={prod} onClickCard={(id) => navigate(`/tienda/${id}`)} />) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[40px] opacity-30 text-[9px] font-black uppercase tracking-widest">Sin piezas comerciales</div>
                )
              )}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default PerfilArtista;