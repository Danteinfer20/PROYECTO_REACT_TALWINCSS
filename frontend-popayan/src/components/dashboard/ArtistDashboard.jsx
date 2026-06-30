import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Eye, Heart, Image as ImageIcon, Store, 
  PlusCircle, Activity, AlertTriangle, ChevronRight, Calendar
} from 'lucide-react';
import api from '../../services/api';
import MisObrasView from './MisObrasView'; 
import MiTiendaView from './MiTiendaView'; 
import GestionVentasView from './GestionVentasView';

const ArtistDashboard = ({ user, seccionActiva, setSeccionActiva }) => {
  const { t, i18n } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const roleAccent = '244 63 94'; // Carmesí para artista

  const getLocalizedTitle = (title) => {
    if (!title) return '';
    try {
      const parsed = JSON.parse(title);
      return parsed[i18n.language] || parsed.en || title;
    } catch {
      return title;
    }
  };

  useEffect(() => {
    if (seccionActiva !== 'escritorio') {
      setLoading(false);
      return;
    }

    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/artist/dashboard');
        if (res.data.status === 'success') {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error("Error cargando el taller:", err);
        setError(t('artist.dashboard.error_sync', "Fallo de sincronización con el núcleo creativo."));
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [seccionActiva, t]);

  const handleEditRequest = (item) => {
    setSeccionActiva('crear', item);
  };

  if (loading) {
    return (
      <div style={{ '--role-accent': roleAccent }} className="w-full h-[80vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[rgb(var(--role-accent))]/20 border-t-[rgb(var(--role-accent))] rounded-full animate-spin mb-3"></div>
        <p className="text-[rgb(var(--role-accent))] text-[10px] font-mono uppercase tracking-wider animate-pulse">
          {t('artist.dashboard.loading', 'Cargando taller...')}
        </p>
      </div>
    );
  }

  if (error && seccionActiva === 'escritorio') {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 md:p-4 flex items-center gap-2 text-red-500">
          <AlertTriangle size={14} className="md:w-4 md:h-4" />
          <p className="text-[10px] md:text-xs font-mono">{error}</p>
        </div>
      </div>
    );
  }

  const kpis = dashboardData?.kpis || { total_works: 0, followers: 0, sales: 0, revenue: 0 };
  const recentWorks = dashboardData?.recent_works || [];

  return (
    <div style={{ '--role-accent': roleAccent }} className="transition-colors duration-300">
      {seccionActiva === 'escritorio' && (
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-5 md:py-8">
          
          {/* Header compacto y responsivo */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))]"></span>
              <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-wider text-[rgb(var(--role-accent))]">
                {t('artist.dashboard.verified', 'Artista Verificado')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-[var(--text-heading)]">
              {t('artist.dashboard.greeting', 'Hola,')} <span className="font-medium">{user?.name?.split(' ')[0] || 'Artista'}</span>
            </h1>
            <p className="text-[10px] md:text-xs text-[var(--text-body)]/60 mt-1">
              {t('artist.dashboard.subtitle', 'Panel de control del maestro artesano')}
            </p>
          </div>

          {/* KPIs compactos y responsivos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 md:mb-10">
            {[
              { label: t('artist.dashboard.kpis.works', 'Obras'), val: kpis.total_works, icon: ImageIcon },
              { label: t('artist.dashboard.kpis.community', 'Comunidad'), val: kpis.followers, icon: Heart },
              { label: t('artist.dashboard.kpis.sales', 'Ventas'), val: kpis.sales, icon: Store },
              { label: t('artist.dashboard.kpis.revenue', 'Recaudación'), val: `$${Number(kpis.revenue).toLocaleString('es-CO')}`, icon: Activity }
            ].map((item, i) => (
              <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 transition hover:border-[rgb(var(--role-accent))]/30">
                <div className="flex items-center justify-between mb-1">
                  <item.icon size={14} className="text-[rgb(var(--role-accent))]/70" />
                  <span className="text-[7px] md:text-[8px] font-mono text-[var(--text-body)]/50">{item.label}</span>
                </div>
                <p className="text-base sm:text-lg md:text-xl font-semibold text-[var(--text-heading)]">{item.val}</p>
              </div>
            ))}
          </div>

          {/* Grid principal: acciones y actividad reciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            {/* Panel de acciones rápidas */}
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 md:p-5">
              <h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)] mb-3 md:mb-4">
                {t('artist.dashboard.operations.title', 'Acciones rápidas')}
              </h3>
              <button
                onClick={() => setSeccionActiva('crear')}
                className="w-full mb-2.5 py-2 bg-[rgb(var(--role-accent))] text-white rounded-lg text-[10px] md:text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-opacity-90 transition active:scale-98"
              >
                <PlusCircle size={12} /> {t('artist.dashboard.operations.btn_new', 'Nueva obra')}
              </button>
              <button
                onClick={() => setSeccionActiva('tienda')}
                className="w-full py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[10px] md:text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[var(--bg-container)] transition"
              >
                <Store size={12} /> {t('artist.dashboard.operations.btn_store', 'Mi tienda')}
              </button>
            </div>

            {/* Últimos movimientos */}
            <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-4 md:p-5">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h3 className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[var(--text-heading)]">
                  {t('artist.dashboard.recent.title', 'Actividad reciente')}
                </h3>
                <button
                  onClick={() => setSeccionActiva('galeria')}
                  className="text-[8px] md:text-[9px] text-[rgb(var(--role-accent))] hover:underline flex items-center gap-1"
                >
                  {t('artist.dashboard.recent.btn_catalog', 'Ver todo')} <ChevronRight size={10} />
                </button>
              </div>

              {recentWorks.length === 0 ? (
                <div className="py-8 md:py-10 text-center border border-dashed border-[var(--border-color)] rounded-lg">
                  <ImageIcon size={20} className="mx-auto text-[var(--text-body)]/30 mb-2" />
                  <p className="text-[8px] md:text-[9px] text-[var(--text-body)]/50">
                    {t('artist.dashboard.recent.empty', 'No hay movimientos recientes')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentWorks.map((work) => (
                    <div key={work.id} className="flex items-center justify-between p-2 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))]/30 transition">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-6 h-6 rounded-md bg-[var(--bg-container)] flex items-center justify-center text-[rgb(var(--role-accent))]">
                          <ImageIcon size={10} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[10px] md:text-xs font-medium text-[var(--text-heading)] truncate">
                            {getLocalizedTitle(work.title)}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[7px] md:text-[8px] text-[var(--text-body)]/50 mt-0.5">
                            <Calendar size={7} />
                            <span>{new Date(work.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[6px] md:text-[7px] font-mono uppercase px-1.5 py-0.5 rounded-full shrink-0 ${
                        work.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {work.status === 'published' ? t('common.published', 'Publicado') : t('common.draft', 'Borrador')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Otras vistas (galería, tienda, ventas) - sin cambios funcionales pero con mejor responsividad */}
      {seccionActiva === 'galeria' && (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] p-4 md:p-6 animate-in fade-in duration-500">
          <MisObrasView initialTab="published" onEditRequest={handleEditRequest} />
        </div>
      )}
      {seccionActiva === 'tienda' && (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] p-4 md:p-6 animate-in fade-in duration-500">
          <MiTiendaView onEditRequest={handleEditRequest} onAddRequest={() => setSeccionActiva('crear')} />
        </div>
      )}
      {seccionActiva === 'ventas' && (
        <div className="w-full min-h-screen bg-[var(--bg-primary)] p-4 md:p-6 animate-in fade-in duration-500">
          <GestionVentasView />
        </div>
      )}
    </div>
  );
};

export default ArtistDashboard;