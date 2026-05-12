import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, X, CheckCircle2, 
  Clock, ArrowRight, ShieldCheck, RefreshCw, ReceiptCent
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ComprasView = () => {
  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  // 🔥 MOTOR DE ESTADO PARA ROL CROMÁTICO (Acento heredado para el usuario)
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
      'confirmed': { text: 'Confirmado', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'bg-emerald-500' },
      'pending': { text: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', glow: 'bg-amber-500' },
      'default': { text: 'En Proceso', color: 'text-[rgb(var(--role-accent))]', bg: 'bg-[rgb(var(--role-accent))]/10', border: 'border-[rgb(var(--role-accent))]/20', glow: 'bg-[rgb(var(--role-accent))]' }
    };
    const active = config[estado] || config.default;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${active.bg} border ${active.border} backdrop-blur-md transition-colors duration-500`}>
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${active.glow} opacity-40`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${active.glow}`}></span>
        </span>
        <span className={`${active.color} text-[9px] font-black uppercase tracking-[0.2em]`}>{active.text}</span>
      </div>
    );
  };

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="w-full min-h-screen p-6 md:p-12 animate-in fade-in duration-700 selection:bg-[rgb(var(--role-accent))]/30 transition-colors duration-500">
      
      <header className="relative mb-16 border-b border-[var(--border-color)] pb-12 transition-colors">
        <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-[rgb(var(--role-accent))]/5 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col gap-3">
          <span className="text-[rgb(var(--role-accent))] font-mono text-[10px] font-bold uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
            <div className="w-8 h-[1px] bg-[rgb(var(--role-accent))]/50"></div> Archivo de Adquisiciones
          </span>
          <h1 className="text-5xl md:text-7xl font-bold italic tracking-tighter text-[var(--text-heading)] uppercase leading-none transition-colors duration-500">
            Tesoros <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-heading)] via-[var(--text-heading)] to-[var(--text-body)] opacity-60">
              Adquiridos.
            </span>
          </h1>
        </div>
      </header>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <RefreshCw className="animate-spin text-[rgb(var(--role-accent))]" size={48} strokeWidth={1} />
          <p className="text-[var(--text-body)] font-mono text-[10px] uppercase tracking-[0.6em] animate-pulse">Sincronizando Ledger...</p>
        </div>
      ) : (
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          {compras.length > 0 ? (
            <div className="grid grid-cols-1 gap-5">
              {compras.map((orden) => (
                <div 
                  key={orden.id} 
                  onClick={() => setSelectedOrder(orden)}
                  className="group flex flex-col md:flex-row md:items-center justify-between bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[35px] p-6 md:p-8 hover:border-[rgb(var(--role-accent))]/30 transition-all duration-700 cursor-pointer shadow-sm hover:shadow-[0_15px_40px_rgba(var(--glass-shadow))] relative overflow-hidden"
                >
                  <div className="flex items-center gap-8 z-10">
                    <div className="w-20 h-20 rounded-[28px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center group-hover:border-[rgb(var(--role-accent))]/50 transition-all duration-500 shadow-inner relative overflow-hidden shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--role-accent))]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      {orden.items && orden.items.length > 0 ? (
                        <span className="font-bold text-3xl italic uppercase tracking-tighter text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] relative z-10 transition-all duration-500">
                          {orden.items[0].product_name.charAt(0)}
                        </span>
                      ) : (
                        <ReceiptCent size={32} strokeWidth={1} className="text-[var(--text-body)] opacity-40 relative z-10" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-[10px] text-[rgb(var(--role-accent))] font-bold uppercase tracking-[0.3em]">#{orden.order_number}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]"></span>
                        <span className="font-mono text-[10px] text-[var(--text-body)] font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
                          <Clock size={12} strokeWidth={2.5}/> {orden.date ? orden.date.split(' ')[0] : 'HOY'}
                        </span>
                      </div>
                      <h3 className="font-bold text-2xl italic uppercase tracking-tighter text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors leading-none">
                        {orden.items && orden.items.length > 0 ? orden.items[0].product_name : 'Obra del Patrimonio'}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-8 md:mt-0 flex items-center justify-between md:justify-end gap-12 z-10">
                    <div className="text-right">
                      <span className="block text-[var(--text-body)] opacity-50 font-mono text-[9px] uppercase tracking-[0.4em] mb-2 font-black">Total Liquidado</span>
                      <span className="text-3xl font-mono text-[var(--text-heading)] tracking-tighter font-black group-hover:scale-105 transition-transform inline-block transition-colors">
                        ${parseFloat(orden.total_amount || 0).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex items-center gap-8">
                      {getEstadoBadge(orden.status)}
                      <div className="w-12 h-12 rounded-full bg-[var(--text-heading)]/5 border border-[var(--border-color)] flex items-center justify-center group-hover:bg-[rgb(var(--role-accent))] group-hover:rotate-45 transition-all duration-700 shadow-sm">
                        <ArrowRight size={22} className="text-[var(--text-body)] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-40 text-center border border-dashed border-[var(--border-color)] rounded-[50px] bg-[var(--bg-container)]/50 backdrop-blur-sm transition-colors duration-500">
              <ShoppingBag size={64} className="mx-auto text-[var(--text-body)] mb-8 opacity-10" strokeWidth={1} />
              <p className="text-[var(--text-body)] opacity-40 font-mono text-[12px] uppercase tracking-[0.6em]">Sin registros en el Ledger de Transacciones.</p>
            </div>
          )}
        </div>
      )}

      {/* 📜 MODAL: CERTIFICADO DE AUTENTICIDAD */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-500" onClick={() => setSelectedOrder(null)}>
          <div className="w-full max-w-xl bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[50px] p-10 md:p-14 relative overflow-hidden shadow-2xl transition-colors duration-500" onClick={e => e.stopPropagation()}>
             
             <div className="absolute top-0 right-0 w-80 h-80 bg-[rgb(var(--role-accent))]/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

             <div className="flex justify-between items-start mb-12 relative z-10">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[rgb(var(--role-accent))] font-black text-[11px] uppercase tracking-[0.4em]">
                        <ShieldCheck size={16} strokeWidth={2.5}/> Certificación Oficial
                    </div>
                    <h2 className="text-4xl font-bold italic uppercase tracking-tighter leading-none text-[var(--text-heading)]">Recibo de <br/>Adquisición</h2>
                    <p className="font-mono text-[11px] text-[var(--text-body)] uppercase tracking-widest mt-2 font-bold opacity-60">ID: {selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-[var(--text-heading)]/5 rounded-full flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all border border-[var(--border-color)] text-[var(--text-body)] shadow-sm"><X size={24}/></button>
             </div>
             
             <div className="space-y-4 mb-12 max-h-72 overflow-y-auto pr-4 custom-scrollbar relative z-10">
                {selectedOrder.items && selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-[var(--bg-primary)] p-6 rounded-[30px] border border-[var(--border-color)] group hover:border-[rgb(var(--role-accent))]/40 transition-all duration-500 shadow-inner">
                        <div className="flex flex-col gap-1">
                          <p className="text-[var(--text-heading)] font-bold text-lg uppercase italic tracking-tight transition-colors">{item.product_name}</p>
                          <p className="text-[var(--text-body)] font-mono text-[10px] uppercase font-bold tracking-widest opacity-60 transition-colors">Cant: {item.quantity} x ${parseFloat(item.unit_price).toLocaleString('es-CO')}</p>
                        </div>
                        <span className="font-mono text-[var(--text-heading)] font-bold text-xl tracking-tighter transition-colors">${parseFloat(item.subtotal).toLocaleString('es-CO')}</span>
                    </div>
                ))}
             </div>

             <div className="bg-[rgb(var(--role-accent))]/5 border border-[rgb(var(--role-accent))]/20 p-10 rounded-[45px] flex flex-col items-center gap-8 relative z-10 shadow-inner transition-colors">
                <div className="flex justify-between w-full border-b border-[var(--border-color)] pb-8 items-center">
                    <span className="text-[var(--text-body)] opacity-50 font-mono text-[12px] uppercase font-black tracking-[0.4em]">Liquidación</span>
                    <span className="text-5xl font-mono text-[var(--text-heading)] font-black tracking-tighter drop-shadow-sm transition-colors">${parseFloat(selectedOrder.total_amount).toLocaleString('es-CO')}</span>
                </div>
                
                {/* QR: Mantenemos fondo blanco para lectura óptica 100% segura */}
                <div className="p-6 bg-white rounded-[35px] shadow-lg group hover:scale-105 transition-transform duration-700">
                    <QRCodeSVG 
                        value={`VERIFY-ORDER-${selectedOrder.order_number}`} 
                        size={160}
                        bgColor={"#FFFFFF"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                    />
                </div>
                
                <p className="text-[rgb(var(--role-accent))] font-mono text-[9px] font-black uppercase tracking-[0.5em] text-center opacity-80 leading-relaxed transition-colors">
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