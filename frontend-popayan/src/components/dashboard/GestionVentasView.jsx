import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Clock, CheckCircle, AlertCircle, Loader2, 
  DollarSign, User, Phone
} from 'lucide-react';

const GestionVentasView = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); 

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/my-sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrdenes(res.data.data || []);
    } catch (err) {
      console.error("Error al cargar ventas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPago = async (id) => {
    if (!window.confirm("¿Confirmas que recibiste el pago? Esto descontará el stock de tu inventario oficial.")) return;

    try {
      setProcesando(id);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_URL}/orders/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrdenes(prev => prev.map(ord => ord.id === id ? { ...ord, status: 'confirmed' } : ord));
      
    } catch (err) {
      alert(err.response?.data?.message || "Error al confirmar la venta. Es posible que el stock se haya agotado.");
    } finally {
      setProcesando(null);
    }
  };

  const formatNumber = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  const kpis = {
    pendientes: ordenes.filter(o => o.status === 'pending').reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0),
    confirmadas: ordenes.filter(o => o.status === 'confirmed').reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0),
    totalOrdenes: ordenes.length
  };

  const filteredOrdenes = ordenes.filter(ord => ord.status === activeTab);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[rgb(var(--role-accent))] animate-pulse transition-colors duration-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Sincronizando Logística...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20 px-6 md:px-12 transition-colors duration-500">
      
      <header className="mb-10 relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-heading)] tracking-tighter italic transition-colors">Gestión de <span className="text-[rgb(var(--role-accent))]">Ventas</span></h2>
        <p className="text-[rgb(var(--role-accent))]/60 text-[9px] font-mono uppercase tracking-[0.4em] mt-3 font-bold flex items-center gap-2 transition-colors">
           <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.8)]"></span>
           Centro de Operaciones P2P
        </p>
      </header>

      {/* KPI GRID DINÁMICO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-[var(--bg-container)] border border-amber-500/30 rounded-[24px] p-6 shadow-sm relative overflow-hidden transition-colors duration-500">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500 rounded-full blur-[40px] opacity-10"></div>
          <Clock size={18} className="text-amber-500 mb-4" />
          <p className="text-[var(--text-body)] opacity-70 font-mono text-[9px] uppercase tracking-widest mb-1">Capital Pendiente</p>
          <h3 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter transition-colors">{formatNumber(kpis.pendientes)}</h3>
        </div>
        
        <div className="bg-[var(--bg-container)] border border-emerald-500/30 rounded-[24px] p-6 shadow-sm relative overflow-hidden transition-colors duration-500">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500 rounded-full blur-[40px] opacity-10"></div>
          <CheckCircle size={18} className="text-emerald-500 mb-4" />
          <p className="text-[var(--text-body)] opacity-70 font-mono text-[9px] uppercase tracking-widest mb-1">Capital Asegurado</p>
          <h3 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter transition-colors">{formatNumber(kpis.confirmadas)}</h3>
        </div>

        <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm transition-colors duration-500">
          <Package size={18} className="text-[var(--text-body)] opacity-50 mb-4" />
          <p className="text-[var(--text-body)] opacity-70 font-mono text-[9px] uppercase tracking-widest mb-1">Volumen de Órdenes</p>
          <h3 className="text-3xl font-black text-[var(--text-heading)] tracking-tighter transition-colors">{kpis.totalOrdenes}</h3>
        </div>
      </div>

      {/* SELECTOR DE TABS TÁCTICO */}
      <div className="flex bg-[var(--bg-primary)] p-1.5 rounded-full border border-[var(--border-color)] shadow-inner w-fit mb-10 transition-colors duration-500">
        <button 
          onClick={() => setActiveTab('pending')} 
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
        >
          <Clock size={14} /> Reservas ({ordenes.filter(o => o.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')} 
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'confirmed' ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_20px_rgba(var(--role-accent),0.3)]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)]'}`}
        >
          <CheckCircle size={14} /> Completadas ({ordenes.filter(o => o.status === 'confirmed').length})
        </button>
      </div>

      {/* LISTADO DE ÓRDENES */}
      {filteredOrdenes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrdenes.map(orden => (
            <div key={orden.id} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[30px] p-6 md:p-8 flex flex-col justify-between hover:border-[rgb(var(--role-accent))]/30 transition-all shadow-sm hover:shadow-[0_15px_40px_rgba(var(--glass-shadow))] duration-500">
              
              <div className="flex justify-between items-start mb-6 border-b border-[var(--border-color)] pb-6 transition-colors duration-500">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-body)] opacity-60 uppercase tracking-widest block mb-1">Orden de Compra</span>
                  <h4 className="text-xl font-black text-[var(--text-heading)] tracking-tighter transition-colors">{orden.order_number}</h4>
                  <p className="text-[9px] text-[var(--text-body)] opacity-50 font-mono mt-1">{new Date(orden.created_at).toLocaleString('es-CO')}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-2 transition-colors ${orden.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  {orden.status === 'pending' ? <Clock size={10} /> : <CheckCircle size={10} />}
                  {orden.status === 'pending' ? 'Esperando Pago' : 'Pago Recibido'}
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                {orden.order_items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[var(--bg-primary)] p-4 rounded-[16px] border border-[var(--border-color)] transition-colors duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--bg-container)] rounded-[10px] flex items-center justify-center border border-[var(--border-color)] shadow-inner transition-colors duration-500">
                        <Package size={16} className="text-[var(--text-body)] opacity-50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-heading)] leading-tight transition-colors">{item.product?.name || 'Obra'}</p>
                        <p className="text-[9px] font-mono text-[var(--text-body)] opacity-60 uppercase">Cant: {item.quantity} x {formatNumber(item.unit_price)}</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-[rgb(var(--role-accent))]">{formatNumber(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row justify-between items-center gap-6 transition-colors duration-500">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-[var(--text-body)] text-xs">
                    <User size={14} className="text-[rgb(var(--role-accent))]" /> <span className="font-bold text-[var(--text-heading)] transition-colors">{orden.user?.name || 'Usuario P2P'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-body)] opacity-70 text-[10px] font-mono">
                    <Phone size={12} className="text-amber-500" /> {orden.contact_phone || 'No registrado'}
                  </div>
                </div>

                <div className="w-full sm:w-auto text-right">
                  <p className="text-[9px] font-mono text-[var(--text-body)] opacity-60 uppercase tracking-widest mb-1">Total a Recibir</p>
                  <h4 className="text-2xl font-black text-[var(--text-heading)] tracking-tighter mb-4 transition-colors">{formatNumber(orden.total_amount)}</h4>
                  
                  {orden.status === 'pending' && (
                    <button 
                      onClick={() => handleConfirmarPago(orden.id)}
                      disabled={procesando === orden.id}
                      className="w-full sm:w-auto bg-[rgb(var(--role-accent))] hover:opacity-90 text-white px-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(var(--role-accent),0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {procesando === orden.id ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
                      Confirmar Ingreso
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 border-2 border-dashed border-[var(--border-color)] rounded-[40px] flex flex-col items-center justify-center bg-[var(--bg-container)]/50 text-[var(--text-body)] relative overflow-hidden transition-colors duration-500">
          <div className="absolute inset-0 bg-[rgb(var(--role-accent))]/5 blur-[120px] rounded-full w-64 h-64 mx-auto top-1/2 -translate-y-1/2"></div>
          <AlertCircle size={32} className="mb-4 opacity-30 relative z-10" />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] relative z-10 text-center">
            No hay órdenes en estado {activeTab}
          </p>
        </div>
      )}
    </div>
  );
};

export default GestionVentasView;