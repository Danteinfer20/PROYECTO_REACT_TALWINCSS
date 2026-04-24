import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, Trash2, Search, AlertCircle, Loader2, Image as ImageIcon, 
  DollarSign, Package, TrendingUp, Pause, Play, Store, PlusCircle
} from 'lucide-react';

const MiTiendaView = ({ onEditRequest, onAddRequest }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🛡️ NUEVO ESTADO: KPIs Oficiales (Directo desde PostgreSQL)
  const [kpisOficiales, setKpisOficiales] = useState({
      totalVentas: 0,
      articulosVendidos: 0,
      stockTotal: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { my_products: true } 
        });
        
        // 1. Cargamos los productos para la grilla
        const data = res.data.data || [];
        setProductos(data.map(p => ({
            ...p,
            status: (p.stock_quantity <= 0 && p.status === 'available') ? 'sold_out' : p.status
        })));

        // 2. 🔥 EXTRACCIÓN DE LA TELEMETRÍA (El nodo 'meta' que envía Laravel)
        if (res.data.meta && res.data.meta.kpis) {
            setKpisOficiales({
                totalVentas: res.data.meta.kpis.total_revenue,
                articulosVendidos: res.data.meta.kpis.total_sales,
                stockTotal: res.data.meta.kpis.total_stock
            });
        }
      } catch (err) {
        console.error("Error al recuperar inventario:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventario();
  }, [API_URL]);

  const filteredProductos = productos.filter(prod => 
    prod.status === activeTab && 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("¿Retirar este producto permanentemente de la Pop Store?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(productos.filter(p => p.id !== id));
      } catch (err) {
        alert("Error en la eliminación transaccional.");
      }
    }
  };

  const handleToggleStatus = async (producto) => {
    const nuevoEstado = producto.status === 'paused' ? (producto.stock_quantity > 0 ? 'available' : 'sold_out') : 'paused';
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/products/${producto.id}`, { _method: 'PUT', status: nuevoEstado }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(productos.map(p => p.id === producto.id ? { ...p, status: nuevoEstado } : p));
    } catch (err) {
        alert("Error al actualizar estado en escaparate.");
    }
  };

  const getCoverImage = (prod) => {
    if (prod.main_image) return prod.main_image.startsWith('http') ? prod.main_image : `${API_URL.replace('/api/v1', '')}/storage/${prod.main_image}`;
    return null;
  };

  const formatNumber = (val) => new Intl.NumberFormat('es-CO').format(val);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-emerald-500 animate-pulse">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold">Sincronizando Inventario y Métricas...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-700 font-sans pb-20">
      
      {/* 🚀 CABECERA CON BOTÓN DE ACCIÓN RÁPIDA */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tighter italic">Pop Store <span className="text-emerald-500">Manager</span></h2>
          <p className="text-emerald-500/60 text-[9px] font-mono uppercase tracking-[0.4em] mt-3 font-bold flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
             Logística de Activos y Ventas
          </p>
        </div>
        
        <button 
          onClick={onAddRequest}
          className="group bg-white text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95"
        >
          Forjar Nuevo Producto <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </header>

      {/* 📊 KPIs PREMIUM (Conectados a la Verdad de PostgreSQL) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 relative z-10">
          {[
            { label: 'Ingresos', val: kpisOficiales.totalVentas, icon: TrendingUp, col: 'emerald', prefix: '$', glow: 'bg-emerald-500' },
            { label: 'Ventas', val: kpisOficiales.articulosVendidos, icon: Package, col: 'blue', suffix: 'uds', glow: 'bg-blue-500' },
            { label: 'Stock', val: kpisOficiales.stockTotal, icon: Store, col: 'amber', suffix: 'físicas', glow: 'bg-amber-500' }
          ].map((kpi, i) => (
            <div key={i} className="relative bg-gradient-to-br from-[#111113] to-[#050505] border border-white/5 rounded-[24px] p-6 shadow-xl group overflow-hidden hover:border-white/10 transition-all duration-500">
                {/* Esfera de Luz Ambiental */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 ${kpi.glow} rounded-full mix-blend-screen filter blur-[50px] opacity-[0.07] group-hover:opacity-[0.15] transition-opacity pointer-events-none`}></div>
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-12 h-12 rounded-[16px] bg-[#050505] border border-white/5 flex items-center justify-center text-${kpi.col}-500 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <kpi.icon size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.2em] mb-1.5">{kpi.label} Históricos</span>
                        <div className="flex items-baseline gap-1.5">
                            {kpi.prefix && <span className={`text-${kpi.col}-500/70 text-sm font-bold`}>{kpi.prefix}</span>}
                            <span className="text-3xl font-black text-white tracking-tighter leading-none">{formatNumber(kpi.val)}</span>
                            {kpi.suffix && <span className="text-[8px] font-mono text-gray-600 uppercase ml-1 tracking-widest">{kpi.suffix}</span>}
                        </div>
                    </div>
                </div>
            </div>
          ))}
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-10 border-b border-white/5 pb-8">
        <div className="flex bg-[#050505] p-1.5 rounded-full border border-white/5 shadow-inner">
          {[
            { id: 'available', label: 'Escaparate' },
            { id: 'paused', label: 'Pausados' },
            { id: 'sold_out', label: 'Agotados' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-gray-600 hover:text-white'}`}
            >
              {tab.label} ({productos.filter(o => o.status === tab.id).length})
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="BUSCAR EN INVENTARIO..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[#050505] border border-white/5 rounded-full py-4 pl-14 pr-6 text-white text-[10px] font-mono focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-gray-700 shadow-inner" 
          />
        </div>
      </div>

      {/* GRID DE PRODUCTOS */}
      {filteredProductos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProductos.map(prod => (
            <div key={prod.id} className="group bg-[#111113] border border-white/5 rounded-[30px] overflow-hidden hover:border-emerald-500/30 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] transition-all duration-700 flex flex-col relative">
              <div className="aspect-square w-full overflow-hidden relative bg-[#050505]">
                {getCoverImage(prod) ? (
                  <img src={getCoverImage(prod)} alt={prod.name} className={`w-full h-full object-cover transition-all duration-1000 ${prod.status !== 'available' ? 'grayscale opacity-50' : 'grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110'}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/5"><ImageIcon size={48}/></div>
                )}
                
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-[#0A0A0C]/80 backdrop-blur-md border border-white/10 text-[7px] font-black uppercase tracking-widest text-emerald-400 shadow-lg">
                  {prod.stock_quantity} EN STOCK
                </div>
                
                {/* ActionBar Phantom V2 */}
                <div className="absolute inset-0 bg-[#0A0A0C]/60 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                  <button onClick={() => onEditRequest({...prod, isProduct: true})} className="w-12 h-12 rounded-full bg-white text-black hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center shadow-2xl active:scale-90"><Edit size={16} /></button>
                  <button onClick={() => handleToggleStatus(prod)} className="w-12 h-12 rounded-full bg-white text-black hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center shadow-2xl active:scale-90">{prod.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}</button>
                  <button onClick={() => handleDelete(prod.id)} className="w-12 h-12 rounded-full bg-white text-black hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-2xl active:scale-90"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="p-6 flex-1 bg-gradient-to-b from-[#111113] to-[#0A0A0C]">
                <h3 className="text-lg font-serif text-white italic leading-tight group-hover:text-emerald-400 transition-colors line-clamp-1">{prod.name}</h3>
                <p className="text-[8px] font-mono text-gray-600 uppercase tracking-widest mt-2">{prod.product_type || 'Pieza Artesanal'}</p>
                
                <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-emerald-400">
                      <span className="text-xs font-bold">$</span>
                      <span className="font-black text-xl tracking-tighter">{formatNumber(prod.price)}</span>
                   </div>
                   <div className="text-right">
                      <span className="block text-[7px] font-mono text-gray-600 uppercase tracking-widest">Ventas</span>
                      <span className="text-white font-black font-mono text-sm tracking-tighter">{prod.sales_count || 0}</span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-32 border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center bg-[#050505] text-gray-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full w-64 h-64 mx-auto top-1/2 -translate-y-1/2"></div>
          <AlertCircle size={32} className="mb-4 opacity-30 relative z-10" strokeWidth={1} />
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] relative z-10 text-center">Escaparate vacío en sección {activeTab}</p>
        </div>
      )}
    </div>
  );
};

export default MiTiendaView;