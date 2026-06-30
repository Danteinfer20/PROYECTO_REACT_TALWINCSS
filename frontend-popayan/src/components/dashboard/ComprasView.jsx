import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  ShoppingBag, X, Clock, ArrowRight, ShieldCheck, RefreshCw, ReceiptCent, FileDown
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ComprasView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [compras, setCompras] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // ✅ PARSER DEFINITIVO: sin limpiar escapes antes de parsear
  const getLocalizedName = useCallback((data) => {
    if (!data) return 'Producto';

    let current = data;

    for (let i = 0; i < 5; i++) {
      if (typeof current === 'string') {
        // Primero intentar parsear directamente
        try {
          current = JSON.parse(current);
          continue;
        } catch (e) {}

        // Si falla, limpiar solo comillas externas y reintentar
        try {
          const cleaned = current.trim().replace(/^"+|"+$/g, '');
          current = JSON.parse(cleaned);
          continue;
        } catch (e) {
          // Es texto plano, retornar tal cual
          return String(current);
        }

      } else if (typeof current === 'object' && current !== null) {
        const value = current.es || current.ES || current.Es || Object.values(current)[0];
        if (value === undefined || value === null) return 'Producto';
        current = value;
      } else {
        break;
      }
    }

    return String(current);
  }, []);

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/my-purchases');
      if (res.data.status === 'success' || res.data.data) {
        setCompras(res.data.data || []);
      }
    } catch (e) {
      console.error("❌ Error de enlace:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleDownloadPDF = async (orderInfo) => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF();

      doc.setFont("helvetica", "bold");
      doc.text("POPAYÁN CULTURAL", 10, 10);
      doc.setFont("helvetica", "normal");
      doc.text(`Orden: ${orderInfo.order_number}`, 10, 20);

      const tableColumn = ["Producto", "Cant.", "Subtotal"];
      const tableRows = (orderInfo.items || []).map(item => [
        getLocalizedName(item.product_name),
        item.quantity,
        `$${parseFloat(item.subtotal || 0).toLocaleString('es-CO')}`
      ]);

      autoTable(doc, { startY: 30, head: [tableColumn], body: tableRows });
      doc.save(`Recibo_${orderInfo.order_number}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Error al generar el comprobante.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      'confirmed': { text: 'CONFIRMADO', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      'pending': { text: 'PENDIENTE', color: 'text-amber-500', bg: 'bg-amber-500/10' },
      'default': { text: 'EN PROCESO', color: 'text-purple-500', bg: 'bg-purple-500/10' }
    };
    const active = config[estado] || config.default;
    return (
      <div className={`px-3 py-1 rounded-full ${active.bg} ${active.color} text-[8px] font-black uppercase`}>
        {active.text}
      </div>
    );
  };

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="w-full min-h-screen p-8 bg-[var(--bg-primary)]">
      <header className="mb-8 border-b border-[var(--border-color)] pb-6">
        <h1 className="text-3xl font-bold italic text-[var(--text-heading)] uppercase">TESOROS ADQUIRIDOS.</h1>
      </header>

      {loading ? (
        <div className="py-20 flex justify-center">
          <RefreshCw className="animate-spin text-[rgb(var(--role-accent))]" size={32} />
        </div>
      ) : (
        <div className="space-y-4">
          {compras.map((orden) => (
            <div
              key={orden.id}
              onClick={() => setSelectedOrder(orden)}
              className="flex justify-between bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl p-6 cursor-pointer hover:border-[rgb(var(--role-accent))]"
            >
              <div>
                <p className="text-[rgb(var(--role-accent))] text-[10px] font-bold">{orden.order_number}</p>
                <h3 className="font-bold text-lg text-[var(--text-heading)]">
                  {getLocalizedName(orden.items?.[0]?.product_name)}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-lg font-bold text-[var(--text-heading)]">
                  ${parseFloat(orden.total_amount || 0).toLocaleString('es-CO')}
                </span>
                {getEstadoBadge(orden.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-container)] rounded-3xl p-8"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">RECIBO DE ADQUISICIÓN</h2>
            {selectedOrder.items.map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/10">
                <span>{getLocalizedName(item.product_name)}</span>
                <span>${parseFloat(item.subtotal || 0).toLocaleString('es-CO')}</span>
              </div>
            ))}

            <div className="mt-8 flex flex-col items-center gap-6">
              {selectedOrder?.order_type === 'event' && (
                <QRCodeSVG value={selectedOrder.order_number} size={120} />
              )}
              <button
                onClick={() => handleDownloadPDF(selectedOrder)}
                disabled={isDownloading}
                className="bg-[rgb(var(--role-accent))] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2"
              >
                <FileDown size={18} /> {isDownloading ? 'GENERANDO...' : 'DESCARGAR PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprasView;