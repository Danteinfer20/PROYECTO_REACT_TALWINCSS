import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Ticket, Users, DollarSign, Search, 
  Filter, Calendar, CheckCircle2, Clock, 
  Loader2, AlertCircle, ArrowUpRight
} from 'lucide-react';

const GestionTaquillaView = ({ user }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_revenue: 0 });
  const [busqueda, setBusqueda] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/manager/ticket-sales`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.status === 'success') {
          setSales(response.data.data);
          setStats({ total_revenue: response.data.meta.total_revenue });
        }
      } catch (err) {
        console.error("Error en taquilla:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, [API_URL]);

  const filtrados = sales.filter(s => 
    s.event_title.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.buyer_name.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[rgb(var(--role-accent))]/50 transition-colors duration-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold">Sincronizando Taquilla...</p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 w-full animate-in fade-in duration-700 transition-colors duration-500">
      
      {/* HEADER DINÁMICO */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-colors duration-500">
        <div>
          <h2 className="text-4xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-sm transition-colors">
            Control de <span className="text-[rgb(var(--role-accent))]">Taquilla</span>
          </h2>
          <p className="text-[var(--text-body)] text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-[rgb(var(--role-accent))]/50 pl-4 transition-colors">
            Gestión de ingresos y flujo de asistentes
          </p>
        </div>

        {/* MÉTRICA RÁPIDA BENTO */}
        <div className="bg-[var(--bg-container)] border border-[rgb(var(--role-accent))]/20 rounded-[24px] p-5 flex items-center gap-5 shadow-sm hover:shadow-[0_10px_30px_rgba(var(--glass-shadow))] transition-all duration-500">
            <div className="w-12 h-12 rounded-xl bg-[rgb(var(--role-accent))]/10 flex items-center justify-center text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/20 shadow-inner">
                <DollarSign size={24} />
            </div>
            <div>
                <span className="text-[8px] font-black text-[var(--text-body)] opacity-60 uppercase tracking-widest block mb-1">Recaudación Total</span>
                <span className="text-2xl font-black text-[var(--text-heading)] font-mono leading-none transition-colors">
                    ${stats.total_revenue.toLocaleString('es-CO')}
                </span>
            </div>
        </div>
      </header>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por evento o comprador..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] text-[var(--text-heading)] text-xs font-mono rounded-[20px] pl-14 pr-6 py-4 outline-none focus:border-[rgb(var(--role-accent))]/40 transition-all shadow-inner placeholder-[var(--text-body)]/50"
          />
        </div>
      </div>

      {/* TABLA DE OPERACIONES */}
      <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[32px] overflow-hidden shadow-sm transition-colors duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--text-heading)]/[0.02] border-b border-[var(--border-color)] transition-colors">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] opacity-60">Evento / Actividad</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] opacity-60">Comprador</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] opacity-60 text-center">Tickets</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] opacity-60 text-right">Monto</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-[var(--text-body)] opacity-60 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] transition-colors">
              {filtrados.length > 0 ? filtrados.map((sale) => (
                <tr key={sale.id} className="hover:bg-[var(--text-heading)]/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgb(var(--role-accent))]/5 flex items-center justify-center text-[rgb(var(--role-accent))] border border-[rgb(var(--role-accent))]/10 shadow-inner">
                          <Calendar size={14} />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-heading)] group-hover:text-[rgb(var(--role-accent))] transition-colors">{sale.event_title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-[var(--text-heading)] font-bold transition-colors">{sale.buyer_name}</span>
                      <span className="text-[10px] text-[var(--text-body)] font-mono opacity-60">{sale.buyer_email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="bg-[var(--text-heading)]/[0.03] border border-[var(--border-color)] px-3 py-1 rounded-full text-[10px] font-mono text-[var(--text-heading)] transition-colors">
                      {sale.guest_count}x
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-[var(--text-heading)] font-mono transition-colors">${sale.total_amount.toLocaleString('es-CO')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      {sale.checked_in ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest shadow-sm">
                          <CheckCircle2 size={10} /> Ingresó
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest shadow-sm">
                          <Clock size={10} /> Por entrar
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center transition-colors">
                     <AlertCircle className="mx-auto text-[var(--text-body)] opacity-20 mb-4" size={32} />
                     <p className="text-[var(--text-body)] opacity-50 text-[10px] font-mono uppercase tracking-widest">No se detectan movimientos en taquilla.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestionTaquillaView;