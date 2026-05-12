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

  // 🔥 MOTOR DE ESTADO PARA ROL CROMÁTICO
  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      default: return '168 85 247';
    }
  };

  const getAvatarUrl = (userObj) => {
    if (!userObj?.profile_picture) return `https://ui-avatars.com/api/?background=0A0A0C&color=fff&bold=true&name=${encodeURIComponent(userObj?.name || 'U')}`;
    if (userObj.profile_picture.startsWith('http')) return userObj.profile_picture;
    return `http://localhost:8000/storage/${userObj.profile_picture.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSantuario = async () => {
      try {
        setLoading(true);
        const resArtista = await axios.get(`${API_URL}/artists/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const maestro = resArtista.data.data;
        setArtista(maestro);
        setFollowersCount(maestro.follower_count || 0);
        setIsFollowing(maestro.is_following_by_me || false);

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
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center font-mono text-[rgb(var(--role-accent))] text-[10px] uppercase tracking-[0.4em] transition-colors duration-500">
      <Loader2 size={32} className="animate-spin mb-4" />
      Sincronizando Archivo...
    </div>
  );

  if (!artista) return null;

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col relative overflow-x-hidden transition-colors duration-500">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[400px] bg-[rgb(var(--role-accent))]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <Navbar />

      <main className="flex-1 w-full relative pb-24 pt-32 md:pt-40 z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* INFO HEADER */}
        <div className="flex flex-col lg:flex-row gap-12 items-start border-b border-[var(--border-color)] pb-16 mb-12 transition-colors duration-500">
          <div className="shrink-0 relative group">
            <div className="absolute inset-0 bg-[rgb(var(--role-accent))]/20 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-32 h-32 md:w-56 md:h-56 rounded-[48px] bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-md overflow-hidden relative z-10 ring-1 ring-[var(--border-color)] transition-colors duration-500">
              <img src={getAvatarUrl(artista)} alt={artista.name} className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-body)] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md shadow-sm">
                    <Sparkles size={10} className="text-[rgb(var(--role-accent))]" /> 
                    {artista.user_type === 'cultural_manager' ? 'Gestor Cultural' : 'Maestro Artesano'}
                  </span>
                  {artista.is_verified && <CheckCircle size={16} className="text-blue-500" />}
                </div>
                <h1 className="text-5xl md:text-6xl font-bold italic uppercase tracking-tighter leading-[0.95] text-[var(--text-heading)] drop-shadow-sm transition-colors duration-500">{artista.name}</h1>
                <p className="text-[rgb(var(--role-accent))] font-mono text-xs uppercase tracking-[0.3em] font-black">@{artista.username}</p>
              </div>

              <div className="flex gap-10 bg-[var(--bg-container)] border border-[var(--border-color)] backdrop-blur-xl p-6 rounded-[32px] ring-1 ring-[var(--border-color)] shadow-sm transition-colors duration-500">
                <div className="text-center">
                  <p className="text-2xl font-bold tracking-tighter">{obras.length}</p>
                  <p className="text-[8px] font-black uppercase text-[var(--text-body)] tracking-widest mt-1">Obras</p>
                </div>
                <div className="w-px h-10 bg-[var(--border-color)]"></div>
                <div className="text-center">
                  <p className="text-2xl font-bold tracking-tighter">{followersCount}</p>
                  <p className="text-[8px] font-black uppercase text-[var(--text-body)] tracking-widest mt-1">Comunidad</p>
                </div>
              </div>
            </div>

            <p className="text-[var(--text-body)] text-base leading-relaxed max-w-3xl font-light italic transition-colors duration-500">
              “{artista.bio || 'Este custodio del legado forja su historia en el corazón del Cauca.'}”
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-body)] bg-[var(--bg-container)] border border-[var(--border-color)] px-4 py-2.5 rounded-full shadow-sm transition-colors duration-500">
                <MapPin size={12} className="text-[rgb(var(--role-accent))]" /> {artista.city || 'Popayán'}
              </div>

              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
                  isFollowing ? 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-heading)]' : 'bg-[rgb(var(--role-accent))] text-white hover:opacity-90 active:scale-95'
                }`}
              >
                {followLoading ? <Loader2 size={14} className="animate-spin"/> : isFollowing ? <><UserCheck size={14}/> Siguiendo</> : <><UserPlus size={14}/> Seguir</>}
              </button>

              <button onClick={handleShare} className="p-2.5 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-container)] transition-all text-[var(--text-body)] hover:text-[rgb(var(--role-accent))] shadow-sm">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* FEED AREA */}
        <div className="space-y-10">
          <div className="flex items-center gap-8 border-b border-[var(--border-color)] pb-4 transition-colors duration-500">
            <button onClick={() => setActiveTab('obras')} className={`relative py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'obras' ? 'text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
               Obras Maestras
               {activeTab === 'obras' && <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-[rgb(var(--role-accent))] shadow-[0_0_10px_rgba(var(--role-accent),0.5)]"></div>}
            </button>
            <button onClick={() => setActiveTab('tienda')} className={`relative py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${activeTab === 'tienda' ? 'text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
               Pop Store
               {activeTab === 'tienda' && <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-[rgb(var(--role-accent))] shadow-[0_0_10px_rgba(var(--role-accent),0.5)]"></div>}
            </button>
          </div>

          <div className="min-h-[40vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 animate-in fade-in duration-700">
              {activeTab === 'obras' ? (
                obras.length > 0 ? obras.map(obra => <ArtCard key={obra.id} obra={obra} onClickCard={() => navigate(`/obra/${obra.id}`)} />) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-[var(--border-color)] rounded-[40px] opacity-50 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)]">Sin registro de obras</div>
                )
              ) : (
                productos.length > 0 ? productos.map(prod => <ProductCard key={prod.id} producto={prod} onClickCard={(id) => navigate(`/tienda/${id}`)} />) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-[var(--border-color)] rounded-[40px] opacity-50 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)]">Sin piezas comerciales</div>
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