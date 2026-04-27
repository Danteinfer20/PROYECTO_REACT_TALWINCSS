import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, X, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, RefreshCw, ReceiptCent
} from 'lucide-react';
// 🔥 IMPORTACIÓN DEL MOTOR REAL
import { QRCodeSVG } from 'qrcode.react';

const ComprasView = () => {
  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const fetchPurchases = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/my-purchases`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.data.status === 'success' || res.data.data) {
        setCompras([...res.data.data]);
      }
    } catch (e) {
      console.error("❌ Error de enlace:", e.response?.data || e.message);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [token, API_URL]);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const getEstadoBadge = (estado) => {
    const config = {
      'confirmed': { text: 'Confirmado', color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20', glow: 'bg-emerald-400' },
      'pending': { text: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20', glow: 'bg-amber-400' },
      'default': { text: 'En Proceso', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/5', border: 'border-[#a855f7]/20', glow: 'bg-[#a855f7]' }
    };
    const active = config[estado] || config.default;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${active.bg} border ${active.border} backdrop-blur-md`}>
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${active.glow} opacity-40`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${active.glow}`}></span>
        </span>
        <span className={`${active.color} text-[9px] font-black uppercase tracking-[0.2em]`}>{active.text}</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 animate-in fade-in duration-700 selection:bg-[#a855f7]/30">
      
      <header className="relative mb-16 border-b border-white/5 pb-12">
        <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-[#a855f7]/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <span className="text-[#a855f7] font-mono text-[10px] font-bold uppercase tracking-[0.5em] flex items-center gap-2">
            <div className="w-8 h-[1px] bg-[#a855f7]/50"></div> Archivo de Adquisiciones
          </span>
          <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-tight">
            Tesoros <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500 drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              Adquiridos.
            </span>
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <RefreshCw className="animate-spin text-[#a855f7]" size={48} strokeWidth={1} />
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.6em] animate-pulse">Sincronizando Ledger...</p>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          {compras.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {compras.map((orden) => (
                <div 
                  key={orden.id} 
                  onClick={() => setSelectedOrder(orden)}
                  className="group flex flex-col md:flex-row md:items-center justify-between bg-[#111113]/50 border border-white/5 rounded-[35px] p-6 md:p-8 hover:bg-[#111113] hover:border-[#a855f7]/30 transition-all duration-700 cursor-pointer shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-8 z-10">
                    <div className="w-20 h-20 rounded-[28px] bg-[#0d0d0f] border border-white/10 flex items-center justify-center group-hover:border-[#a855f7]/50 transition-all duration-500 shadow-[inset_0_0_25px_rgba(0,0,0,0.8)] relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {orden.items && orden.items.length > 0 ? (
                        <span className="font-black text-3xl italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-600 group-hover:from-white group-hover:to-[#a855f7] relative z-10 transition-all duration-500">
                          {orden.items[0].initials || orden.items[0].product_name.charAt(0)}
                        </span>
                      ) : (
                        <ReceiptCent size={32} strokeWidth={1} className="text-gray-700 relative z-10" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-[10px] text-[#a855f7] font-bold uppercase tracking-[0.3em]">#{orden.order_number}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                        <span className="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} strokeWidth={2.5}/> {orden.date ? orden.date.split(' ')[0] : 'HOY'}
                        </span>
                      </div>
                      <h3 className="font-black text-2xl italic uppercase tracking-tighter text-white group-hover:text-[#a855f7] transition-colors leading-none">
                        {orden.items && orden.items.length > 0 ? orden.items[0].product_name : 'Obra del Patrimonio'}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-8 md:mt-0 flex items-center justify-between md:justify-end gap-12 z-10">
                    <div className="text-right">
                      <span className="block text-gray-500 font-mono text-[9px] uppercase tracking-[0.4em] mb-2 font-black">Total Liquidado</span>
                      <span className="text-3xl font-mono text-white tracking-tighter font-black group-hover:scale-105 transition-transform inline-block">
                        ${parseFloat(orden.total_amount || 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      {getEstadoBadge(orden.status)}
                      <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-[#a855f7] group-hover:rotate-45 transition-all duration-700 shadow-xl">
                        <ArrowRight size={22} className="text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center border border-dashed border-white/5 rounded-[50px] bg-[#111113]/30 backdrop-blur-sm">
              <ShoppingBag size={64} className="mx-auto text-gray-800 mb-8 opacity-20" strokeWidth={1} />
              <p className="text-gray-600 font-mono text-[12px] uppercase tracking-[0.6em]">Sin registros en el Ledger de Transacciones.</p>
            </div>
          )}
        </div>
      )}

      {/* 📜 MODAL: CERTIFICADO DE AUTENTICIDAD CON QR REAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-500" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-xl bg-[#0d0d0f] border border-white/10 rounded-[50px] p-10 md:p-14 relative overflow-hidden shadow-[0_0_120px_rgba(168,85,247,0.1)]" onClick={e => e.stopPropagation()}>
             
             <div className="absolute top-0 right-0 w-80 h-80 bg-[#a855f7]/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[#a855f7] font-black text-[11px] uppercase tracking-[0.4em]">
                        <ShieldCheck size={16} strokeWidth={2.5}/> Certificación Oficial
                    </div>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Recibo de <br/>Adquisición</h2>
                    <p className="font-mono text-[11px] text-gray-500 uppercase tracking-widest mt-2 font-bold">ID: {selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-red-500/20 hover:text-red-500 transition-all border border-white/5"><X size={24}/></button>
             </div>
             
             <div className="space-y-4 mb-12 max-h-72 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {selectedOrder.items && selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/[0.02] p-6 rounded-[30px] border border-white/5 group hover:border-[#a855f7]/40 transition-all duration-500">
                        <div className="flex flex-col gap-1">
                          <p className="text-white font-black text-lg uppercase italic tracking-tight">{item.product_name}</p>
                          <p className="text-gray-500 font-mono text-[10px] uppercase font-bold tracking-widest">Cant: {item.quantity} x ${parseFloat(item.unit_price).toLocaleString('es-CO')}</p>
                        </div>
                        <span className="font-mono text-white font-black text-xl tracking-tighter">${parseFloat(item.subtotal).toLocaleString('es-CO')}</span>
                    </div>
                ))}
             </div>

             <div className="bg-[#a855f7]/5 border border-[#a855f7]/20 p-10 rounded-[45px] flex flex-col items-center gap-8 relative z-10 shadow-inner">
                <div className="flex justify-between w-full border-b border-[#a855f7]/20 pb-8 items-center">
                    <span className="text-gray-400 font-mono text-[12px] uppercase font-black tracking-[0.4em]">Liquidación</span>
                    <span className="text-5xl font-mono text-white font-black tracking-tighter drop-shadow-2xl">${parseFloat(selectedOrder.total_amount).toLocaleString('es-CO')}</span>
                </div>
                
                {/* 🔥 CONTENEDOR DE QR REAL */}
                <div className="p-6 bg-white rounded-[35px] shadow-[0_0_50px_rgba(255,255,255,0.1)] group hover:scale-105 transition-transform duration-700">
                    <QRCodeSVG 
                        value={`VERIFY-ORDER-${selectedOrder.order_number}`} // 🔗 Dato real que el QR contiene
                        size={160}
                        bgColor={"#FFFFFF"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                    />
                </div>
                
                <p className="text-[#a855f7] font-mono text-[9px] font-black uppercase tracking-[0.5em] text-center opacity-80 leading-relaxed">
                  Token Auténtico Inmutable <br/> Popayán Cultural 2026
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprasView;