import React, { useState, useEffect } from 'react';
import { 
  Edit, Trash2, Search, AlertCircle, Loader2, Image as ImageIcon, 
  Package, TrendingUp, Pause, Play, Store, PlusCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const MiTiendaView = ({ onEditRequest, onAddRequest }) => {
  const { t } = useTranslation();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [kpisOficiales, setKpisOficiales] = useState({
      totalVentas: 0,
      articulosVendidos: 0,
      stockTotal: 0
  });

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products', { params: { my_products: true } });
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
  }, []);

  const filteredProductos = productos.filter(prod => 
    prod.status === activeTab && 
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm(t('mytienda.deleteConfirm', '¿Retirar este producto permanentemente del inventario?'))) {
      try {
        await api.delete(`/products/${id}`);
        setProductos(productos.filter(p => p.id !== id));
      } catch (err) {
        alert(t('mytienda.deleteError', 'Error crítico en la eliminación del recurso.'));
      }
    }
  };

  const handleToggleStatus = async (producto) => {
    const nuevoEstado = producto.status === 'paused' ? (producto.stock_quantity > 0 ? 'available' : 'sold_out') : 'paused';
    try {
        await api.put(`/products/${producto.id}`, { status: nuevoEstado });
        setProductos(productos.map(p => p.id === producto.id ? { ...p, status: nuevoEstado } : p));
    } catch (err) {
        alert(t('mytienda.statusError', 'Error al modificar el estado del escaparate.'));
    }
  };

  const formatNumber = (val) => new Intl.NumberFormat('es-CO').format(val);

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-[rgb(var(--role-accent))]">
        <Loader2 className="animate-spin mb-3" size={28} />
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] font-black">
          {t('mytienda.loading', 'Cargando inventario...')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-4 md:py-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 md:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold italic text-[var(--text-heading)] tracking-tighter">
            Pop Store <span className="text-[rgb(var(--role-accent))]">Manager</span>
          </h2>
          <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-wider text-[var(--text-body)]/60 mt-0.5 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[rgb(var(--role-accent))]"></span>
            {t('mytienda.subtitle', 'Gestión de inventario')}
          </p>
        </div>
        <button 
          onClick={onAddRequest}
          className="bg-[rgb(var(--role-accent))] text-white px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 hover:opacity-90 transition shadow-sm active:scale-95"
        >
          <PlusCircle size={14} /> {t('mytienda.addButton', 'Nuevo producto')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {[
          { label: t('mytienda.kpis.revenue', 'Ingresos'), val: kpisOficiales.totalVentas, icon: TrendingUp, color: 'text-[rgb(var(--role-accent))]', prefix: '$' },
          { label: t('mytienda.kpis.sold', 'Vendidos'), val: kpisOficiales.articulosVendidos, icon: Package, color: 'text-blue-500', suffix: t('mytienda.unitAbbr', 'uds') },
          { label: t('mytienda.kpis.stock', 'Stock'), val: kpisOficiales.stockTotal, icon: Store, color: 'text-emerald-500', suffix: t('mytienda.unitAbbr', 'uds') }
        ].map((kpi, i) => (
          <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] ${kpi.color}`}>
                <kpi.icon size={16} />
              </div>
              <div>
                <p className="text-[7px] md:text-[8px] font-mono uppercase tracking-wider text-[var(--text-body)]/60">{kpi.label}</p>
                <p className="text-base md:text-lg font-bold text-[var(--text-heading)]">
                  {kpi.prefix && <span className="text-xs mr-0.5">{kpi.prefix}</span>}
                  {formatNumber(kpi.val)}
                  {kpi.suffix && <span className="text-[9px] ml-0.5">{kpi.suffix}</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-5 md:mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 w-full lg:w-auto">
          {['available', 'paused', 'sold_out'].map((id) => (
            <button 
              key={id} 
              onClick={() => setActiveTab(id)} 
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-wider transition-all ${
                activeTab === id 
                  ? 'bg-[rgb(var(--role-accent))] text-white shadow-sm' 
                  : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-body)] hover:border-[rgb(var(--role-accent))]/40'
              }`}
            >
              {t(`mytienda.tabs.${id}`, id === 'available' ? 'Disponibles' : id === 'paused' ? 'Pausados' : 'Agotados')}
              <span className="ml-1 opacity-70 text-[7px]">({productos.filter(o => o.status === id).length})</span>
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-body)]/50" size={12} />
          <input 
            type="text" 
            placeholder={t('mytienda.searchPlaceholder', 'Buscar...')}
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full py-1.5 pl-8 pr-3 text-[9px] focus:border-[rgb(var(--role-accent))]/50 outline-none transition"
          />
        </div>
      </div>

      {filteredProductos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {filteredProductos.map(prod => (
            <div key={prod.id} className="group bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
              
              <div className="relative h-40 sm:h-44 md:h-48 bg-[var(--bg-primary)] overflow-hidden">
                {prod.main_image ? (
                  <img 
                    src={prod.main_image.startsWith('http') ? prod.main_image : `https://vivelarte.com/storage/${prod.main_image.replace(/^\/+/, '')}`} 
                    alt={prod.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      prod.status !== 'available' ? 'grayscale opacity-60' : ''
                    }`} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-heading)]/20">
                    <ImageIcon size={24} />
                  </div>
                )}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-[7px] font-mono font-bold">
                  {prod.stock_quantity} {t('mytienda.stockLabel', 'uds')}
                </div>
                
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => onEditRequest({ ...prod, _modelType: 'PRODUCT' })} 
                    className="w-8 h-8 rounded-lg bg-white text-gray-800 hover:bg-[rgb(var(--role-accent))] hover:text-white transition flex items-center justify-center shadow-md"
                  >
                    <Edit size={12} />
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(prod)} 
                    className="w-8 h-8 rounded-lg bg-white text-gray-800 hover:bg-blue-500 hover:text-white transition flex items-center justify-center shadow-md"
                  >
                    {prod.status === 'paused' ? <Play size={12} /> : <Pause size={12} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(prod.id)} 
                    className="w-8 h-8 rounded-lg bg-white text-gray-800 hover:bg-red-500 hover:text-white transition flex items-center justify-center shadow-md"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <h3 className="text-xs font-bold text-[var(--text-heading)] leading-tight line-clamp-1">{prod.name}</h3>
                <p className="text-[7px] font-mono text-[var(--text-body)]/60 uppercase mt-0.5">{prod.category?.name || 'General'}</p>
                
                <div className="mt-auto pt-2 flex items-center justify-between border-t border-[var(--border-color)]">
                  <div>
                    <span className="text-[6px] font-mono uppercase text-[var(--text-body)]/50">{t('mytienda.priceLabel', 'Precio')}</span>
                    <div className="text-[rgb(var(--role-accent))] font-bold text-sm">
                      ${formatNumber(prod.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[6px] font-mono uppercase text-[var(--text-body)]/50">{t('mytienda.salesLabel', 'Ventas')}</span>
                    <div className="text-xs font-bold text-[var(--text-heading)]">
                      {prod.stats?.sales_count || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-container)]/30">
          <AlertCircle size={24} className="mx-auto mb-2 text-[var(--text-body)]/30" />
          <p className="text-[9px] text-[var(--text-body)]/60">{t('mytienda.empty', 'No hay productos en esta categoría')}</p>
        </div>
      )}
    </div>
  );
};

export default MiTiendaView;