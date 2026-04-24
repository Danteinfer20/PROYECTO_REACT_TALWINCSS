import React, { useState } from 'react';
import { 
  ShoppingBag, X, QrCode, CheckCircle2, 
  Truck, ReceiptCent, Clock, ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';

const ComprasView = () => {
  // 💡 MOCK DATA CON ESTADO DINÁMICO
  const historialCompras = [
    { id: 1, orden_numero: 'POP-2026-089A', fecha: '24 Mar 2026', total: '$120.000', total_raw: 120000, estado: 'entregado', items_count: 2, producto_principal: 'Réplica Torre del Reloj (Artesanía)' },
    { id: 2, orden_numero: 'POP-2026-092B', fecha: '26 Mar 2026', total: '$45.000', total_raw: 45000, estado: 'en_camino', items_count: 1, producto_principal: 'Camiseta Neo-Cultura Talla M' }
  ];

  const [selectedOrder, setSelectedOrder] = useState(null);

  // 🟢 SISTEMA DE ESTADOS LUMINOSOS (Refinado)
  const getEstadoBadge = (estado) => {
    const config = {
      'entregado': { text: 'Completado', color: 'text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/20', glow: 'bg-emerald-400', icon: CheckCircle2 },
      'en_camino': { text: 'En Tránsito', color: 'text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/20', glow: 'bg-amber-400', icon: Truck },
      'default': { text: 'Procesando', color: 'text-[#a855f7]', bg: 'bg-[#a855f7]/5', border: 'border-[#a855f7]/20', glow: 'bg-[#a855f7]', icon: Clock }
    };
    
    const active = config[estado] || config.default;
    const Icon = active.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${active.bg} ${active.border} border backdrop-blur-sm`}>
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${active.glow} opacity-60`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${active.glow}`}></span>
        </span>
        <span className={`${active.color} text-[8px] font-bold uppercase tracking-[0.2em] flex items-center gap-1`}>
          {active.text}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#0A0A0C] text-white p-6 md:p-12 animate-in fade-in duration-700 relative overflow-x-hidden">
      
      {/* 🔮 HEADER ATMOSFÉRICO (Elegante y Controlado) */}
      <header className="relative w-full mb-10 pt-4 pb-10 border-b border-white/5">
        <div className="absolute top-0 left-0 w-[400px] h-[200px] bg-[#a855f7]/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-[#a855f7] font-mono text-[9px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
            <ShoppingBag size={12} strokeWidth={1.5} /> Archivo de Transacciones
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight mt-1">
            Tesoros <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              Adquiridos.
            </span>
          </h1>
        </div>
      </header>

      {/* 🧾 LISTA DE COMPRAS (Estilo Ledger/Libro Mayor) */}
      <div className="space-y-3">
        {historialCompras.map((orden) => (
          <div 
            key={orden.id} 
            onClick={() => setSelectedOrder(orden)}
            className="group relative flex flex-col md:flex-row md:items-center justify-between bg-white/[0.01] border border-white/5 rounded-[16px] p-5 md:p-6 hover:bg-white/[0.03] hover:border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer overflow-hidden"
          >
            {/* Brillo Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

            {/* Lado Izquierdo: Icono e Info Principal */}
            <div className="flex items-start md:items-center gap-5 relative z-10">
              <div className="hidden md:flex w-12 h-12 rounded-[12px] bg-[#0A0A0C] border border-white/5 items-center justify-center text-gray-500 group-hover:text-[#a855f7] transition-colors shadow-inner shrink-0">
                <ReceiptCent size={18} strokeWidth={1.5} />
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                    #{orden.orden_numero}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20"></span>
                  <span className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.1em] flex items-center gap-1.5">
                    <Clock size={10} /> {orden.fecha}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white leading-tight group-hover:text-[#a855f7] transition-colors line-clamp-1">
                  {orden.producto_principal}
                </h3>
                <span className="font-mono text-[8px] text-gray-400 uppercase tracking-widest mt-1">
                  {orden.items_count} Artículo(s) en esta orden
                </span>
              </div>
            </div>

            {/* Lado Derecho: Estado y Total */}
            <div className="mt-5 md:mt-0 flex items-center justify-between md:justify-end gap-6 relative z-10 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <div className="flex md:hidden">
                {getEstadoBadge(orden.estado)}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="block text-gray-500 font-mono text-[7px] uppercase tracking-[0.2em] mb-0.5">Total Pagado</span>
                  <span className="text-lg font-mono text-white tracking-tight">
                    {orden.total}
                  </span>
                </div>
                
                <div className="hidden md:flex">
                  {getEstadoBadge(orden.estado)}
                </div>

                <div className="w-8 h-8 rounded-full bg-black/40 border border-white/5 flex items-center justify-center group-hover:bg-[#a855f7] group-hover:border-[#a855f7] transition-all duration-300 shrink-0">
                  <ArrowRight size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* 📜 CERTIFICADO DE AUTENTICIDAD (BOTTOM SHEET MODAL) */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end md:justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 p-4 md:p-6" onClick={() => setSelectedOrder(null)}>
          
          <div className="w-full max-w-[850px] max-h-[90vh] bg-[#0d0d0f] rounded-[30px] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-y-auto overflow-x-hidden animate-in slide-in-from-bottom-8 duration-500 relative" onClick={(e) => e.stopPropagation()}>
            
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#a855f7]/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10 p-6 md:p-10">
              
              {/* Header del Certificado */}
              <div className="flex items-start justify-between border-b border-white/5 pb-6 mb-8">
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 text-gray-400 text-[8px] font-bold uppercase tracking-[0.2em] w-fit">
                    <ShieldCheck size={10} className="text-[#a855f7]"/> Documento de Autenticidad
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white leading-none">
                    Recibo de Adquisición
                  </h3>
                  <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
                    ID Transacción: {selectedOrder.orden_numero}
                  </p>
                </div>
                
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="w-8 h-8 bg-[#111113] border border-white/5 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                >
                  <X size={14} strokeWidth={2}/>
                </button>
              </div>

              {/* Contenido del Recibo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Columna Izquierda: Desglose */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  
                  {/* Item List */}
                  <div>
                    <h4 className="text-gray-500 font-mono uppercase tracking-[0.2em] text-[8px] mb-4">
                      Obra / Producto Adquirido
                    </h4>
                    <div className="flex items-start gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-[16px]">
                      <div className="w-12 h-12 rounded-[8px] bg-[#0A0A0C] border border-white/5 flex items-center justify-center text-gray-600 shadow-inner shrink-0">
                        <ShoppingBag size={16} strokeWidth={1.5}/>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm leading-tight mb-1">{selectedOrder.producto_principal}</p>
                        <p className="text-gray-500 font-mono text-[8px] tracking-widest uppercase">Autorización Patrimonial</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-[8px] font-mono uppercase tracking-[0.2em] mb-1">Cant: 1</p>
                        <p className="text-sm font-mono text-white">{selectedOrder.total}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desglose Matemático */}
                  <div className="bg-[#0A0A0C] border border-white/5 rounded-[16px] p-5 space-y-3">
                    <div className="flex justify-between items-center text-gray-400 font-mono text-[9px] uppercase tracking-[0.1em]">
                      <span>Subtotal Neto</span> 
                      <span className="text-gray-300">{selectedOrder.total}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400 font-mono text-[9px] uppercase tracking-[0.1em]">
                      <span>Logística / Envío</span> 
                      <span className="text-emerald-400">Bonificado</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-[0.2em]">Total Liquidado</span> 
                      <span className="text-2xl font-mono tracking-tight text-white drop-shadow-md">{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Estado, Envío y QR */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  
                  {/* Estado Badge */}
                  <div className="bg-white/[0.01] border border-white/5 p-5 rounded-[16px] flex items-center justify-between">
                    <span className="text-gray-500 font-mono text-[8px] uppercase tracking-[0.2em]">Estado de Orden</span>
                    {getEstadoBadge(selectedOrder.estado)}
                  </div>

                  {/* Panel Logístico */}
                  <div className="bg-white/[0.01] p-5 rounded-[16px] border border-white/5 flex flex-col justify-center">
                    <p className="text-gray-500 text-[8px] font-mono uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                      <MapPin size={10} strokeWidth={1.5}/> Destino Logístico
                    </p>
                    <p className="text-gray-200 font-bold text-xs mb-1">Camilo Perez</p>
                    <p className="text-gray-500 font-mono text-[9px] leading-relaxed">Calle 5 # 4-70, Sector Histórico<br/>Popayán, Cauca.</p>
                  </div>
                  
                  {/* Código de Validación (Scanner UI Minimalista) */}
                  <div className="flex-1 bg-[#a855f7]/5 border border-[#a855f7]/10 rounded-[16px] p-6 flex flex-col items-center justify-center text-center">
                    <div className="p-3 bg-white rounded-xl shadow-lg mb-3">
                      <QrCode className="text-black" size={80} strokeWidth={1.2}/>
                    </div>
                    <p className="text-[#a855f7] font-mono text-[7px] font-bold uppercase tracking-[0.3em]">
                      Token de Verificación
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprasView;