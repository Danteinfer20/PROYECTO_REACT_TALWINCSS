import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Grid, ShoppingBag, Loader2, Award, CheckCircle, 
  Share2, Instagram, Globe, Twitter, Check, UserPlus, UserCheck 
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

  // 🔥 Estados para el Sistema de Comunidad
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        const resArtista = await axios.get(`${API_URL}/artists/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        const maestroData = resArtista.data.data;
        setArtista(maestroData);
        setFollowersCount(maestroData.follower_count || 0);
        setIsFollowing(maestroData.is_following_by_me || false);

        const resObras = await axios.get(`${API_URL}/posts?user_id=${maestroData.id}`);
        setObras(resObras.data.data || []);

        try {
            const resProductos = await axios.get(`${API_URL}/products?user_id=${maestroData.id}`);
            setProductos(resProductos.data.data || []);
        } catch (e) {
            setProductos([]);
        }

      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        navigate('/artesanos');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchPerfil();
  }, [username, navigate, API_URL, token]);

  const handleFollowToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

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
    } catch (error) {
      console.error("Error en la conexión de comunidad:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${artista.name} - Popayán Cultural`,
      text: `Explora el portafolio maestro de ${artista.name} en Popayán Cultural.`,
      url: window.location.href
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Cancelado'); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center font-mono text-[#a855f7] text-[10px] uppercase tracking-widest gap-4">
        <Loader2 size={32} className="animate-spin text-[#a855f7]" />
        Abriendo Santuario...
      </div>
    );
  }

  if (!artista) return null;

  const avatar = artista.profile_picture || `https://ui-avatars.com/api/?background=151518&color=a855f7&bold=true&name=${encodeURIComponent(artista.name)}`;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col relative overflow-x-hidden selection:bg-[#a855f7]/30">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#a855f7]/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <Navbar className="z-50 relative" />

      <main className="flex-1 w-full relative pb-24 pt-28 md:pt-36 z-10 max-w-[1400px] mx-auto px-6 md:px-12">
        
        <div className="flex flex-col lg:flex-row gap-10 items-start border-b border-white/5 pb-12 mb-10">
          
          <div className="shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-[36px] bg-[#111113] border border-white/10 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[#a855f7]/20 blur-xl mix-blend-overlay group-hover:opacity-100 opacity-50 transition-opacity"></div>
            <img src={avatar} alt={artista.name} className="w-full h-full object-cover relative z-10 grayscale-[30%] hover:grayscale-0 transition-all duration-500" />
          </div>

          <div className="flex-1 flex flex-col w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Award size={10} /> Maestro Artesano
                  </span>
                  {artista.is_verified && <CheckCircle size={14} className="text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]" title="Perfil Verificado" />}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none text-white mb-2 italic">
                  {artista.name}
                </h1>
                
                <p className="text-[#a855f7] font-mono text-[11px] uppercase tracking-widest font-bold">
                  @{artista.username}
                </p>
              </div>

              <div className="flex items-center gap-6 bg-[#111113]/50 backdrop-blur-md p-4 rounded-[24px] border border-white/5 w-max shadow-xl">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white leading-none tracking-tighter">{obras.length}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 mt-1">Obras</span>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white leading-none tracking-tighter">{followersCount}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 mt-1">Comunidad</span>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-4xl mb-6">
              {artista.bio || 'Este maestro artesano forja su legado en el silencio de su taller. Su obra y sus piezas detalladas en el catálogo de Popayán Cultural hablan por él.'}
            </p>

            {/* 🔥 BARRA DE ACCIÓN RESTAURADA A SU ESCALA FINA */}
            <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-6 w-full">
              
              {/* Ubicación original */}
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-400 bg-white/5 px-4 py-2.5 rounded-full border border-white/5">
                <MapPin size={12} className="text-[#a855f7]" /> {artista.city || 'Popayán'}, {artista.neighborhood || 'Centro Histórico'}
              </div>
              
              <div className="w-px h-6 bg-white/10 hidden sm:block"></div>
              
              {/* Botón Seguir calibrado */}
              <button 
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  isFollowing 
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400' 
                  : 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:-translate-y-0.5'
                }`}
              >
                {followLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : isFollowing ? (
                  <><UserCheck size={12} /> Siguiendo</>
                ) : (
                  <><UserPlus size={12} /> Seguir Artista</>
                )}
              </button>

              {/* Botón Compartir original */}
              <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                  copied 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {copied ? <Check size={12} /> : <Share2 size={12} />} {copied ? 'Copiado' : 'Compartir'}
              </button>
              
              <div className="w-px h-6 bg-white/10 hidden sm:block mx-1"></div>
              
              {/* Redes Sociales originales (w-9 h-9) con Twitter */}
              <div className="flex items-center gap-2">
                <a href="#" className="w-9 h-9 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#a855f7] hover:text-white hover:border-[#a855f7] transition-all"><Instagram size={14} /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#a855f7] hover:text-white hover:border-[#a855f7] transition-all"><Twitter size={14} /></a>
                <a href="#" className="w-9 h-9 rounded-full bg-[#111113] border border-white/5 flex items-center justify-center text-gray-400 hover:bg-[#a855f7] hover:text-white hover:border-[#a855f7] transition-all"><Globe size={14} /></a>
              </div>
            </div>
          </div>
        </div>

        {/* 🗂️ TABS Y CATÁLOGO RESTAURADOS (py-2.5) */}
        <div className="w-full">
          <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-4">
            <button onClick={() => setActiveTab('obras')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'obras' ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-[#111113] border border-white/5 text-gray-400 hover:text-white'}`}>
              <Grid size={14} /> Obras Maestras
            </button>
            <button onClick={() => setActiveTab('tienda')} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tienda' ? 'bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-[#111113] border border-white/5 text-gray-400 hover:text-white'}`}>
              <ShoppingBag size={14} /> Pop Store
            </button>
          </div>

          <div className="w-full min-h-[30vh]">
            {activeTab === 'obras' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {obras.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {obras.map(obra => (
                      <ArtCard key={obra.id} obra={obra} onClickCard={() => navigate(`/obra/${obra.id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center bg-[#111113]/30 border border-dashed border-white/5 rounded-[36px]">
                    <Grid size={32} className="text-gray-700 mb-4" />
                    <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Sin obras en la galería oficial.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tienda' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {productos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                     {productos.map(prod => (
                        <ProductCard key={prod.id} producto={prod} onClickCard={(id) => navigate(`/tienda/${id}`)} />
                     ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center bg-[#111113]/30 border border-dashed border-white/5 rounded-[36px]">
                    <ShoppingBag size={32} className="text-gray-700 mb-4" />
                    <p className="text-gray-500 text-[10px] font-mono uppercase tracking-widest">Sin piezas comerciales disponibles.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default PerfilArtista;