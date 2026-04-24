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
      <div className="w-full h-96 flex flex-col items-center justify-center text-[#a855f7] animate-pulse">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Sincronizando Logística...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-700 pb-20">
      
      <header className="mb-10 relative z-10">
        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter italic">Gestión de <span className="text-[#a855f7]">Ventas</span></h2>
        <p className="text-[#a855f7]/60 text-[9px] font-mono uppercase tracking-[0.4em] mt-3 font-bold flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse"></span>
           Centro de Operaciones P2P
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-[#111113] border border-[#f59e0b]/30 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#f59e0b] rounded-full mix-blend-screen filter blur-[40px] opacity-10"></div>
          <Clock size={18} className="text-[#f59e0b] mb-4" />
          <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest mb-1">Capital Pendiente</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{formatNumber(kpis.pendientes)}</h3>
        </div>
        
        <div className="bg-[#111113] border border-emerald-500/30 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500 rounded-full mix-blend-screen filter blur-[40px] opacity-10"></div>
          <CheckCircle size={18} className="text-emerald-500 mb-4" />
          <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest mb-1">Capital Asegurado</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{formatNumber(kpis.confirmadas)}</h3>
        </div>

        <div className="bg-[#111113] border border-white/10 rounded-[24px] p-6 shadow-lg">
          <Package size={18} className="text-gray-400 mb-4" />
          <p className="text-gray-500 font-mono text-[9px] uppercase tracking-widest mb-1">Volumen de Órdenes</p>
          <h3 className="text-3xl font-black text-white tracking-tighter">{kpis.totalOrdenes}</h3>
        </div>
      </div>

      <div className="flex bg-[#050505] p-1.5 rounded-full border border-white/5 shadow-inner w-fit mb-10">
        <button 
          onClick={() => setActiveTab('pending')} 
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'pending' ? 'bg-[#f59e0b] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-gray-500 hover:text-white'}`}
        >
          <Clock size={14} /> Reservas ({ordenes.filter(o => o.status === 'pending').length})
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')} 
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === 'confirmed' ? 'bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-white'}`}
        >
          <CheckCircle size={14} /> Completadas ({ordenes.filter(o => o.status === 'confirmed').length})
        </button>
      </div>

      {filteredOrdenes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrdenes.map(orden => (
            <div key={orden.id} className="bg-[#111113] border border-white/5 rounded-[30px] p-6 md:p-8 flex flex-col justify-between hover:border-white/10 transition-all shadow-xl">
              
              <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Orden de Compra</span>
                  <h4 className="text-xl font-black text-white tracking-tighter">{orden.order_number}</h4>
                  <p className="text-[9px] text-gray-600 font-mono mt-1">{new Date(orden.created_at).toLocaleString('es-CO')}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border flex items-center gap-2 ${orden.status === 'pending' ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                  {orden.status === 'pending' ? <Clock size={10} /> : <CheckCircle size={10} />}
                  {orden.status === 'pending' ? 'Esperando Pago' : 'Pago Recibido'}
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                {orden.order_items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#050505] p-4 rounded-[16px] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#111113] rounded-[10px] flex items-center justify-center border border-white/5">
                        <Package size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-tight">{item.product?.name || 'Obra'}</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase">Cant: {item.quantity} x {formatNumber(item.unit_price)}</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#a855f7]">{formatNumber(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <User size={14} className="text-[#a855f7]" /> <span className="font-bold text-white">{orden.user?.name || 'Usuario P2P'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-mono">
                    <Phone size={12} className="text-[#f59e0b]" /> {orden.contact_phone || 'No registrado'}
                  </div>
                </div>

                <div className="w-full sm:w-auto text-right">
                  <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Total a Recibir</p>
                  <h4 className="text-2xl font-black text-white tracking-tighter mb-4">{formatNumber(orden.total_amount)}</h4>
                  
                  {orden.status === 'pending' && (
                    <button 
                      onClick={() => handleConfirmarPago(orden.id)}
                      disabled={procesando === orden.id}
                      className="w-full sm:w-auto bg-[#a855f7] hover:bg-[#9333ea] text-white px-6 py-3.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
        <div className="py-32 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-[#050505] text-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#a855f7]/5 blur-[120px] rounded-full w-64 h-64 mx-auto top-1/2 -translate-y-1/2"></div>
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