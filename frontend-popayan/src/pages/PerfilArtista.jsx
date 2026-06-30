import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Grid, ShoppingBag, Loader2, Award, CheckCircle, 
  Share2, Instagram, Globe, Twitter, Check, UserPlus, UserCheck, Sparkles 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api'; // ✅ Usamos la instancia api
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ArtCard from '../components/cards/ArtCard.jsx'; 
import ProductCard from '../components/cards/ProductCard.jsx'; 

const PerfilArtista = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [artista, setArtista] = useState(null);
  const [obras, setObras] = useState([]);
  const [productos, setProductos] = useState([]);
  const [activeTab, setActiveTab] = useState('obras');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const token = localStorage.getItem('token');

  const [user] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247'; 
    switch (user?.user_type) {
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
    // Si es ruta relativa, asumimos que está en storage (pero idealmente se usa URL completa)
    return `https://vivelarte.com/storage/${userObj.profile_picture.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        // ✅ Usamos api.get
        const resArtista = await api.get(`/artists/${username}`);
        const maestro = resArtista.data.data;
        setArtista(maestro);
        setFollowersCount(maestro.follower_count || 0);
        setIsFollowing(maestro.is_following_by_me || false);

        const [resObras, resProd] = await Promise.all([
          api.get('/posts', { params: { user_id: maestro.id } }),
          api.get('/products', { params: { user_id: maestro.id } }).catch(() => ({ data: { data: [] } }))
        ]);

        setObras(resObras.data.data || []);
        setProductos(resProd.data.data || []);

      } catch (error) {
        console.error("Fallo en perfil:", error);
        navigate('/artesanos');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchPerfil();
  }, [username, navigate, token]);

  const handleFollowToggle = async () => {
    if (!token) return navigate('/login');
    try {
      setFollowLoading(true);
      const res = await api.post(`/follow/${artista.id}`, {});
      if (res.data.status === 'success') {
        const following = res.data.message.includes('followed');
        setIsFollowing(following);
        setFollowersCount(prev => following ? prev + 1 : prev - 1);
      }
    } catch (e) { console.error("Error al seguir:", e); } finally { setFollowLoading(false); }
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
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center">
      <Loader2 size={28} className="animate-spin mb-3 text-[rgb(var(--role-accent))]" />
      <p className="text-[rgb(var(--role-accent))] text-[9px] font-mono uppercase tracking-wider">
        {t('profile.loading', 'Sincronizando Archivo...')}
      </p>
    </div>
  );

  if (!artista) return null;

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full pt-24 sm:pt-28 md:pt-32 pb-16 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
        
        {/* Header del perfil */}
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-start border-b border-[var(--border-color)] pb-8 md:pb-12 mb-8 md:mb-12">
          <div className="shrink-0 relative group mx-auto lg:mx-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden shadow-sm">
              <img src={getAvatarUrl(artista)} alt={artista.name} className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-5 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <span className="bg-[var(--bg-container)] border border-[var(--border-color)] px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={10} className="text-[rgb(var(--role-accent))]" />
                {artista.user_type === 'cultural_manager' ? t('profile.roles.manager', 'Gestor Cultural') : t('profile.roles.artisan', 'Maestro Artesano')}
              </span>
              {artista.is_verified && <CheckCircle size={14} className="text-blue-500" />}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold italic uppercase tracking-tighter leading-tight text-[var(--text-heading)]">
              {artista.name}
            </h1>
            <p className="text-[rgb(var(--role-accent))] font-mono text-[10px] md:text-xs uppercase tracking-wider font-black">
              @{artista.username}
            </p>

            <div className="flex justify-center lg:justify-start gap-8 bg-[var(--bg-container)]/50 border border-[var(--border-color)] rounded-2xl p-4 w-fit mx-auto lg:mx-0">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold tracking-tighter">{obras.length}</p>
                <p className="text-[7px] md:text-[8px] font-black uppercase tracking-wider text-[var(--text-body)]">{t('profile.stats.artworks', 'Obras')}</p>
              </div>
              <div className="w-px h-8 bg-[var(--border-color)]"></div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold tracking-tighter">{followersCount}</p>
                <p className="text-[7px] md:text-[8px] font-black uppercase tracking-wider text-[var(--text-body)]">{t('profile.stats.community', 'Comunidad')}</p>
              </div>
            </div>

            <p className="text-[var(--text-body)] text-sm md:text-base leading-relaxed max-w-3xl italic">
              “{artista.bio || t('profile.default_bio', 'Este custodio del legado forja su historia en el corazón del Cauca.')}”
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--text-body)] bg-[var(--bg-container)] border border-[var(--border-color)] px-3 py-2 rounded-full">
                <MapPin size={12} className="text-[rgb(var(--role-accent))]" /> {artista.city || 'Popayán'}
              </div>
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                  isFollowing ? 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-heading)]' : 'bg-[rgb(var(--role-accent))] text-white hover:opacity-90'
                }`}
              >
                {followLoading ? <Loader2 size={12} className="animate-spin"/> : isFollowing ? <><UserCheck size={12}/> {t('profile.actions.following', 'Siguiendo')}</> : <><UserPlus size={12}/> {t('profile.actions.follow', 'Seguir')}</>}
              </button>
              <button onClick={handleShare} className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-container)] transition">
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs y contenido */}
        <div className="space-y-8">
          <div className="flex items-center gap-6 border-b border-[var(--border-color)] pb-3">
            <button onClick={() => setActiveTab('obras')} className={`relative py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-colors ${activeTab === 'obras' ? 'text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
              {t('profile.tabs.artworks', 'Obras Maestras')}
              {activeTab === 'obras' && <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-[rgb(var(--role-accent))]"></div>}
            </button>
            <button onClick={() => setActiveTab('tienda')} className={`relative py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-colors ${activeTab === 'tienda' ? 'text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}>
              {t('profile.tabs.store', 'Pop Store')}
              {activeTab === 'tienda' && <div className="absolute -bottom-3 left-0 w-full h-0.5 bg-[rgb(var(--role-accent))]"></div>}
            </button>
          </div>

          <div className="min-h-[40vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6 animate-in fade-in duration-500">
              {activeTab === 'obras' ? (
                obras.length > 0 ? obras.map(obra => <ArtCard key={obra.id} obra={obra} onClickCard={() => navigate(`/obra/${obra.id}`)} />) : (
                  <div className="col-span-full py-16 text-center border border-dashed border-[var(--border-color)] rounded-2xl opacity-70">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--text-body)]">
                      {t('profile.empty.artworks', 'Sin registro de obras')}
                    </p>
                  </div>
                )
              ) : (
                productos.length > 0 ? productos.map(prod => <ProductCard key={prod.id} producto={prod} onClickCard={(id) => navigate(`/tienda/${id}`)} />) : (
                  <div className="col-span-full py-16 text-center border border-dashed border-[var(--border-color)] rounded-2xl opacity-70">
                    <p className="text-[9px] font-black uppercase tracking-wider text-[var(--text-body)]">
                      {t('profile.empty.store', 'Sin piezas comerciales')}
                    </p>
                  </div>
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