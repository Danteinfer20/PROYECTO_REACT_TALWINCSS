import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Edit, Trash2, Search, AlertCircle, Loader2, Image as ImageIcon, 
  Package, TrendingUp, Pause, Play, Store, PlusCircle
} from 'lucide-react';

const MiTiendaView = ({ onEditRequest, onAddRequest }) => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); 
  const [searchTerm, setSearchTerm] = useState('');
  
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
        
        const data = res.data.data || [];
        setProductos(data.map(p => ({
            ...p,
            status: (p.stock_quantity <= 0 && p.status === 'available') ? 'sold_out' : p.status
        })));

        if (res.data.meta?.kpis) {
            setKpisOficiales({
                totalVentas: res.data.meta.kpis.total_revenue || 0,
                articulosVendidos: res.data.meta.kpis.total_sales || 0,
                stockTotal: res.data.meta.kpis.total_stock || 0
            });
        }
      } catch (err) {
        console.error("Error en sincronización de inventario:", err);
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
    if (window.confirm("¿Retirar este producto permanentemente del inventario?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductos(productos.filter(p => p.id !== id));
      } catch (err) {
        alert("Error crítico en la eliminación del recurso.");
      }
    }
  };

  const handleToggleStatus = async (producto) => {
    const nuevoEstado = producto.status === 'paused' ? (producto.stock_quantity > 0 ? 'available' : 'sold_out') : 'paused';
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/products/${producto.id}`, 
          { _method: 'PUT', status: nuevoEstado }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProductos(productos.map(p => p.id === producto.id ? { ...p, status: nuevoEstado } : p));
    } catch (err) {
        alert("Error al modificar el estado del escaparate.");
    }
  };

  const formatNumber = (val) => new Intl.NumberFormat('es-CO').format(val);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[rgb(var(--role-accent))]">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] font-black animate-pulse">Sincronizando Inventario...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 md:p-12 animate-in fade-in duration-700 font-sans pb-20 transition-colors duration-500">
      
      {/* HEADER DE GESTIÓN */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 transition-colors duration-500">
        <div>
          <h2 className="text-4xl md:text-5xl font-black italic text-[var(--text-heading)] tracking-tighter uppercase leading-none transition-colors">
            Pop Store <span className="text-[rgb(var(--role-accent))]">Manager</span>
          </h2>
          <p className="text-[var(--text-body)] text-[9px] font-mono uppercase tracking-[0.4em] mt-4 font-black flex items-center gap-2 transition-colors">
             <span className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--role-accent))] animate-ping"></span>
             Control de Activos y Stock Comercial
          </p>
        </div>
        
        <button 
          onClick={onAddRequest}
          className="group bg-[rgb(var(--role-accent))] text-white px-10 py-5 rounded-[25px] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:opacity-90 transition-all shadow-[0_10px_30px_rgba(var(--role-accent),0.3)] active:scale-95"
        >
          Registrar Producto <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </header>

      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Revenue Total', val: kpisOficiales.totalVentas, icon: TrendingUp, col: 'text-[rgb(var(--role-accent))]', prefix: '$', glow: 'bg-[rgb(var(--role-accent))]' },
            { label: 'Artículos Vendidos', val: kpisOficiales.articulosVendidos, icon: Package, col: 'text-blue-500', suffix: 'uds', glow: 'bg-blue-500' },
            { label: 'Stock en Bodega', val: kpisOficiales.stockTotal, icon: Store, col: 'text-emerald-500', suffix: 'uds', glow: 'bg-emerald-500' }
          ].map((kpi, i) => (
            <div key={i} className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[35px] p-8 shadow-sm relative overflow-hidden group transition-colors duration-500 hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))]">
                <div className={`absolute -right-8 -top-8 w-24 h-24 ${kpi.glow} rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
                <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-16 h-16 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center ${kpi.col} shadow-inner group-hover:scale-105 transition-transform duration-500`}>
                        <kpi.icon size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-[0.2em] mb-1">{kpi.label}</span>
                        <div className="flex items-baseline gap-1">
                            {kpi.prefix && <span className={`${kpi.col} text-sm font-black italic`}>{kpi.prefix}</span>}
                            <span className="text-3xl font-black text-[var(--text-heading)] tracking-tighter italic transition-colors">{formatNumber(kpi.val)}</span>
                        </div>
                    </div>
                </div>
            </div>
          ))}
      </div>

      {/* TOOLS: FILTROS + SEARCH */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-[var(--bg-container)]/50 backdrop-blur-xl p-4 rounded-[40px] border border-[var(--border-color)] shadow-sm transition-colors duration-500">
        <div className="flex p-1.5 gap-2 w-full lg:w-auto overflow-x-auto hide-scrollbar">
          {['available', 'paused', 'sold_out'].map((id) => (
            <button 
              key={id} 
              onClick={() => setActiveTab(id)} 
              className={`whitespace-nowrap px-8 py-3.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === id ? 'bg-[rgb(var(--role-accent))] text-white shadow-[0_0_15px_rgba(var(--role-accent),0.4)]' : 'text-[var(--text-body)] hover:text-[var(--text-heading)] hover:bg-[var(--text-heading)]/5'}`}
            >
              {id === 'available' ? 'En Vitrina' : id === 'paused' ? 'Pausados' : 'Agotados'}
              <span className="ml-2 opacity-60">[{productos.filter(o => o.status === id).length}]</span>
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="FILTRAR POR NOMBRE..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full py-5 pl-16 pr-8 text-[var(--text-heading)] text-[10px] font-black tracking-[0.2em] focus:border-[rgb(var(--role-accent))]/50 outline-none transition-all placeholder:text-[var(--text-body)]/60 shadow-inner" 
          />
        </div>
      </div>

      {/* INVENTORY GRID */}
      {filteredProductos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProductos.map(prod => (
            <div key={prod.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[40px] overflow-hidden hover:border-[rgb(var(--role-accent))]/40 shadow-sm hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))] transition-all duration-700 flex flex-col relative">
              
              <div className="h-72 w-full relative bg-[var(--bg-primary)] overflow-hidden border-b border-[var(--border-color)] transition-colors duration-500">
                {prod.main_image ? (
                  <img 
                    src={prod.main_image.startsWith('http') ? prod.main_image : `${API_URL.replace('/api/v1', '')}/storage/${prod.main_image}`} 
                    alt={prod.name} 
                    className={`w-full h-full object-cover transition-all duration-1000 ${prod.status !== 'available' ? 'grayscale opacity-50' : 'grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105'}`} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-heading)]/10"><ImageIcon size={48}/></div>
                )}
                
                <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-[var(--bg-container)]/90 backdrop-blur-xl border border-[var(--border-color)] text-[8px] font-black uppercase tracking-widest text-[var(--text-heading)] shadow-sm z-10 transition-colors duration-500">
                  <span className="text-[rgb(var(--role-accent))] mr-2">●</span> {prod.stock_quantity} UDS
                </div>
                
                {/* GLASS OVERLAY ACTIONS */}
                <div className="absolute inset-0 bg-[var(--bg-container)]/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-5 z-20">
                  <button 
                    onClick={() => onEditRequest({ 
                      ...prod, 
                      _modelType: 'PRODUCT', 
                      forceView: 'edit-product' 
                    })} 
                    className="w-14 h-14 rounded-2xl bg-[var(--text-heading)] text-[var(--bg-primary)] hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all flex items-center justify-center shadow-lg active:scale-90"
                  >
                    <Edit size={20} />
                  </button>

                  <button 
                    onClick={() => handleToggleStatus(prod)} 
                    className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-heading)] hover:bg-blue-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center shadow-lg active:scale-90"
                  >
                    {prod.status === 'paused' ? <Play size={20} /> : <Pause size={20} />}
                  </button>

                  <button 
                    onClick={() => handleDelete(prod.id)} 
                    className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-heading)] hover:bg-red-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center shadow-lg active:scale-90"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col bg-[var(--bg-card)] transition-colors duration-500">
                <div className="mb-6">
                    <h3 className="text-xl font-black italic text-[var(--text-heading)] leading-tight group-hover:text-[rgb(var(--role-accent))] transition-colors uppercase tracking-tighter line-clamp-1">{prod.name}</h3>
                    <p className="text-[8px] font-black text-[var(--text-body)] uppercase tracking-[0.3em] mt-3 transition-colors">{prod.category?.name || 'Inventario General'}</p>
                </div>
                
                <div className="mt-auto pt-6 border-t border-[var(--border-color)] flex items-center justify-between transition-colors duration-500">
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-[var(--text-body)] uppercase tracking-widest mb-1">Precio Venta</span>
                      <div className="flex items-center gap-1.5 text-[rgb(var(--role-accent))]">
                        <span className="text-xs font-black italic">$</span>
                        <span className="font-black text-2xl tracking-tighter italic">{formatNumber(prod.price)}</span>
                      </div>
                   </div>
                   <div className="bg-[var(--bg-primary)] px-4 py-2 rounded-2xl border border-[var(--border-color)] text-right shadow-inner transition-colors duration-500">
                      <span className="block text-[7px] font-black text-[var(--text-body)] uppercase tracking-widest mb-0.5">Ventas</span>
                      <span className="text-[var(--text-heading)] font-black text-sm italic tracking-tighter transition-colors">
                        {prod.stats?.sales_count || 0}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 border-2 border-dashed border-[var(--border-color)] rounded-[50px] flex flex-col items-center justify-center bg-[var(--bg-container)]/50 text-[var(--text-body)] transition-colors duration-500">
          <AlertCircle size={40} className="mb-5 opacity-50 text-[rgb(var(--role-accent))]" />
          <p className="font-black text-[10px] uppercase tracking-[0.5em] text-center max-w-xs leading-relaxed">
            No se han encontrado activos en esta categoría
          </p>
        </div>
      )}
    </div>
  );
};

export default MiTiendaView;