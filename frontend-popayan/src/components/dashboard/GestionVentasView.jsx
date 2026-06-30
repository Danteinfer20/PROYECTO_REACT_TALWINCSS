import React, { useState, useEffect } from 'react';
import { 
  Package, Clock, CheckCircle, AlertCircle, Loader2, 
  DollarSign, User, Phone, TrendingUp, Wallet, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api'; // ✅ API centralizada

const GestionVentasView = () => {
  const { t } = useTranslation();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); 

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      // ✅ Usamos api.get (ruta relativa, interceptor añade token)
      const res = await api.get('/my-sales');
      setOrdenes(res.data.data || []);
    } catch (err) {
      console.error("Error al cargar ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPago = async (id) => {
    if (!window.confirm(t('ventas.confirm_alert', '¿Confirmas que recibiste el pago? Esto descontará el stock de tu inventario oficial.'))) return;

    try {
      setProcesando(id);
      await api.put(`/orders/${id}/confirm`);
      setOrdenes(prev => prev.map(ord => ord.id === id ? { ...ord, status: 'confirmed' } : ord));
    } catch (err) {
      alert(err.response?.data?.message || t('ventas.error_confirm', 'Error al confirmar la venta. Es posible que el stock se haya agotado.'));
    } finally {
      setProcesando(null);
    }
  };

  const formatNumber = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const formatDate = (dateStr) => {
    if (!dateStr) return t('ventas.no_date', 'Fecha no disponible');
    try {
      return new Date(dateStr).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return t('ventas.no_date', 'Fecha no disponible');
    }
  };

  const kpis = {
    pendientes: ordenes.filter(o => o.status === 'pending').reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0),
    confirmadas: ordenes.filter(o => o.status === 'confirmed').reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0),
    totalOrdenes: ordenes.length
  };

  const filteredOrdenes = ordenes.filter(ord => ord.status === activeTab);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin mb-3 text-[rgb(var(--role-accent))]" size={28} />
        <p className="text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">
          {t('ventas.loading', 'Cargando operaciones...')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 md:px-5 py-5 md:py-8 pb-16 transition-colors duration-500">
      
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1 h-1 rounded-full bg-[rgb(var(--role-accent))]"></span>
          <span className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-body)]/50">
            {t('ventas.subtitle', 'P2P OPERATIONS')}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[rgb(var(--role-accent))]">
          {t('ventas.title', 'Gestión de Ventas')}
        </h1>
      </div>

      {/* KPIs compactos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-1">
            <Clock size={12} className="text-amber-500/70" />
            <TrendingUp size={10} className="text-amber-500/30" />
          </div>
          <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60 mb-0.5">
            {t('ventas.kpis.pending_capital', 'Pendiente')}
          </p>
          <p className="text-base md:text-lg font-semibold text-[var(--text-heading)] tracking-tight">
            {formatNumber(kpis.pendientes)}
          </p>
        </div>
        
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-1">
            <CheckCircle size={12} className="text-emerald-500/70" />
            <Wallet size={10} className="text-emerald-500/30" />
          </div>
          <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60 mb-0.5">
            {t('ventas.kpis.confirmed_capital', 'Asegurado')}
          </p>
          <p className="text-base md:text-lg font-semibold text-[var(--text-heading)] tracking-tight">
            {formatNumber(kpis.confirmadas)}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-3 transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-1">
            <Package size={12} className="text-[var(--text-body)]/50" />
          </div>
          <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60 mb-0.5">
            {t('ventas.kpis.order_volume', 'Órdenes')}
          </p>
          <p className="text-base md:text-lg font-semibold text-[var(--text-heading)] tracking-tight">
            {kpis.totalOrdenes}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 md:gap-6 border-b border-[var(--border-color)] mb-5 md:mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 text-[10px] md:text-sm font-medium transition-all duration-200 relative ${
            activeTab === 'pending' 
              ? 'text-[rgb(var(--role-accent))] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[rgb(var(--role-accent))] after:rounded-full' 
              : 'text-[var(--text-body)]/60 hover:text-[var(--text-heading)]'
          }`}
        >
          {t('ventas.tabs.pending', 'Reservas')} ({ordenes.filter(o => o.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('confirmed')}
          className={`pb-2 text-[10px] md:text-sm font-medium transition-all duration-200 relative ${
            activeTab === 'confirmed' 
              ? 'text-[rgb(var(--role-accent))] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[rgb(var(--role-accent))] after:rounded-full' 
              : 'text-[var(--text-body)]/60 hover:text-[var(--text-heading)]'
          }`}
        >
          {t('ventas.tabs.confirmed', 'Completadas')} ({ordenes.filter(o => o.status === 'confirmed').length})
        </button>
      </div>

      {/* Lista de órdenes */}
      {filteredOrdenes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrdenes.map((orden, idx) => (
            <div 
              key={orden.id} 
              className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Cabecera */}
              <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-container)]/20">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-[8px] font-mono uppercase tracking-wider text-[var(--text-body)]/50">
                      {t('ventas.order.purchase_order', 'Orden')}
                    </p>
                    <p className="text-xs md:text-sm font-mono font-semibold text-[var(--text-heading)] mt-0.5">
                      {orden.order_number}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[7px] md:text-[8px] text-[var(--text-body)]/40">
                      <Calendar size={8} />
                      <span>{formatDate(orden.created_at)}</span>
                    </div>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium flex items-center gap-1 ${
                    orden.status === 'pending' 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    {orden.status === 'pending' ? <Clock size={8} /> : <CheckCircle size={8} />}
                    <span>
                      {orden.status === 'pending' 
                        ? t('ventas.order.waiting_payment', 'Pendiente')
                        : t('ventas.order.payment_received', 'Pagado')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="p-3 space-y-1.5">
                {orden.order_items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-dashed border-[var(--border-color)] last:border-0">
                    <div className="flex items-center gap-2">
                      <Package size={10} className="text-[var(--text-body)]/40" />
                      <span className="text-[10px] md:text-xs font-medium text-[var(--text-heading)]">
                        {item.product?.name || 'Producto'}
                      </span>
                      <span className="text-[8px] md:text-[9px] text-[var(--text-body)]/50">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="text-[10px] md:text-xs font-mono text-[rgb(var(--role-accent))]">
                      {formatNumber(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-container)]/10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-[var(--text-body)]/70">
                      <User size={10} className="text-[rgb(var(--role-accent))]/70" />
                      <span>{orden.user?.name || t('ventas.order.user_p2p', 'Usuario P2P')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-[var(--text-body)]/50">
                      <Phone size={8} />
                      <span>{orden.contact_phone || t('ventas.order.no_phone', 'No registrado')}</span>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto">
                    <p className="text-[7px] md:text-[8px] uppercase tracking-wider text-[var(--text-body)]/50">
                      {t('ventas.order.total_to_receive', 'Total a recibir')}
                    </p>
                    <p className="text-sm md:text-base font-semibold text-[var(--text-heading)]">
                      {formatNumber(orden.total_amount)}
                    </p>
                    {orden.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmarPago(orden.id)}
                        disabled={procesando === orden.id}
                        className="mt-1.5 w-full sm:w-auto px-3 py-1 bg-[rgb(var(--role-accent))] hover:bg-opacity-90 text-white text-[8px] md:text-[9px] font-medium rounded-full transition-all flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {procesando === orden.id ? <Loader2 size={9} className="animate-spin" /> : <DollarSign size={9} />}
                        {t('ventas.order.confirm_income', 'Confirmar pago')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-container)]/20">
          <AlertCircle size={20} className="mx-auto mb-2 text-[var(--text-body)]/30" />
          <p className="text-[9px] md:text-xs text-[var(--text-body)]/60">
            {t('ventas.empty', 'No hay órdenes {{status}}', { status: activeTab === 'pending' ? 'pendientes' : 'completadas' })}
          </p>
        </div>
      )}
    </div>
  );
};

export default GestionVentasView;