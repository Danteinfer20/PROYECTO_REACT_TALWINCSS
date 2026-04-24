import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, ShieldCheck, Truck, Star, 
  Plus, Minus, X, Trash2, Sparkles, User, PackageX, ChevronRight, CheckCircle, MessageCircle, Loader2
} from 'lucide-react';
// 🔥 LIBRERÍAS DE RENDERIZADO PDF CORREGIDAS
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Importación explícita para Vite/ESM

import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const DetalleProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cantidadAComprar, setCantidadAComprar] = useState(1);
  
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [procesandoOrden, setProcesandoOrden] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');
  const placeholderImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCIgdmlld0JveD0iMCAwIDgwMCAxMDAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIGZpbGw9IiMxMTExMTMiLz48cGF0aCBkPSJNMzYwIDQ2MGg4MHY4MGgtODB6IiBmaWxsPSIjYTg1NWY3Ii8+PHRleHQgeD0iNDAwIiB5PSI1ODAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFydGVmYWN0byBDdWx0dXJhbDwvdGV4dD48L3N2Zz4=";

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    cargarDetalleProducto();
  }, [id]);

  const cargarDetalleProducto = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProducto(response.data.data || response.data);
      setImagenActiva(0);
    } catch (err) {
      console.error("Error cargando el detalle de la obra:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlCarrito = () => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        const nuevaCantidad = existe.cantidad + cantidadAComprar;
        if (nuevaCantidad > producto.stock) {
           showToast("⚠️ Stock máximo alcanzado");
           return prev;
        }
        showToast("🛒 Cantidad actualizada");
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: nuevaCantidad } : item);
      }
      showToast("🛒 Producto añadido al Carrito");
      return [...prev, { ...producto, cantidad: cantidadAComprar }];
    });
    setCantidadAComprar(1);
    setIsCartOpen(true);
  };

  const modificarCantidadCarrito = (prodId, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === prodId) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.stock) return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (prodId) => setCarrito(prev => prev.filter(item => item.id !== prodId));

  // 🔥 MOTOR GENERADOR DE PDF CORPORATIVO
  const generarContratoPDF = (ordenInfo) => {
    const doc = new jsPDF();
    
    // Paleta de colores corporativa
    const primaryColor = [168, 85, 247]; // #A855F7
    const darkColor = [10, 10, 12]; // #0A0A0C
    const grayColor = [100, 100, 100];

    // Encabezado Visual
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("POPAYÁN CULTURAL", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("COMPROBANTE DE COMPRA P2P", 105, 30, { align: "center" });

    // Información de la Orden
    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.text("Detalles de la Transacción", 14, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(`ID de Orden: ${ordenInfo.order_number}`, 14, 65);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 72);
    doc.text(`Estado: VALIDACIÓN P2P PENDIENTE`, 14, 79);

    // Tabla de Productos
    const tableColumn = ["Ref / Producto", "Cant.", "V. Unitario", "Subtotal"];
    const tableRows = carrito.map(item => [
      item.name,
      item.cantidad,
      formatoCOP(item.price),
      formatoCOP(item.price * item.cantidad)
    ]);

    // 🔥 CORRECCIÓN DE LA FUNCIÓN AUTOTABLE
    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 6 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    // Total y Cierre
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text(`TOTAL ESTIMADO: ${formatoCOP(totalCarrito)}`, 196, finalY, { align: "right" });

    // Términos Legales
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("NOTA LEGAL: Popayán Cultural actúa como vitrina digital. Este comprobante acredita la", 105, finalY + 25, { align: "center" });
    doc.text("separación del inventario. El pago y envío se coordinan directamente con el Artesano.", 105, finalY + 30, { align: "center" });

    // Descarga nativa
    doc.save(`PopayanCultural_Orden_${ordenInfo.order_number}.pdf`);
  };

  // 🔥 LÓGICA P2P REAL CON BACKEND Y PDF
  const procesarCompraP2P = async () => {
    if (!token) {
        showToast("⚠️ Requiere autenticación de usuario");
        setTimeout(() => navigate('/login'), 2000);
        return;
    }

    if (carrito.length === 0) return;

    setProcesandoOrden(true);
    try {
      // 1. Armar Payload exacto para el StoreOrderRequest
      const itemsPayload = carrito.map(item => ({
          id: item.id, // El backend espera 'id'
          cantidad: item.cantidad // El backend espera 'cantidad'
      }));

      // 2. Transacción Real con Laravel
      const response = await axios.post(`${API_URL}/orders`, { items: itemsPayload }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      const ordenOficial = response.data.data; // Data desde el OrderResource

      // 3. Generar y Descargar PDF Automáticamente
      generarContratoPDF(ordenOficial);

      // 4. Preparar Mensaje de WhatsApp
      const telefonoSoporte = '573000000000'; // Ajustar al teléfono real
      let mensaje = `Hola Maestro 👋\nQuiero confirmar el pago de mi orden *${ordenOficial.order_number}* generada en Popayán Cultural.\n\n*Detalle del pedido:*`;
      
      carrito.forEach(item => {
          mensaje += `\n- ${item.cantidad}x ${item.name} (${formatoCOP(item.price)})`;
      });
      
      mensaje += `\n\n*Total a Transferir:* ${formatoCOP(ordenOficial.total_amount)}\n\nTengo mi comprobante PDF listo. ¿Me confirmas los datos de transferencia?`;

      // 5. Limpieza y Redirección
      setCarrito([]);
      setIsCartOpen(false);
      showToast("✅ Orden Confirmada. Redirigiendo a WhatsApp...");
      
      setTimeout(() => {
          window.open(`https://wa.me/${telefonoSoporte}?text=${encodeURIComponent(mensaje)}`, '_blank');
      }, 1500);

    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.message || "❌ Stock agotado o error de servidor");
    } finally {
      setProcesandoOrden(false);
    }
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
  const totalArticulos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const formatoCOP = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col justify-center items-center">
        <div className="w-16 h-16 border-4 border-[#a855f7]/30 border-t-[#a855f7] rounded-full animate-spin mb-4"></div>
        <p className="text-[#a855f7] font-mono text-xs uppercase tracking-widest animate-pulse">Preparando exhibición...</p>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center p-6 mt-20">
          <PackageX size={64} className="text-gray-600 mb-6" />
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 text-white">Obra No Encontrada</h2>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mb-8 max-w-md">La obra que buscas ya no está disponible o el enlace es incorrecto.</p>
          <button onClick={() => navigate('/tienda')} className="bg-[#111113] border border-white/10 text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#a855f7] hover:border-[#a855f7] transition-all">
            Volver a la Tienda
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const galeriaSegura = producto.images?.length > 0 ? producto.images : [producto.main_image || placeholderImg];
  const currentImage = galeriaSegura[imagenActiva] || placeholderImg;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-[#a855f7]/30">
      <Navbar />

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#111113]/90 backdrop-blur-xl border border-[#A855F7]/30 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
          <CheckCircle size={16} className="text-[#A855F7]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-32">
        
        {/* ARQUITECTURA DE GRID ASIMÉTRICO */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start mt-6">
          
          {/* 📸 BLOQUE IZQUIERDO: GALERÍA TIPO E-COMMERCE (55%) */}
          <div className="w-full lg:w-[55%] flex flex-col-reverse lg:flex-row gap-5 lg:sticky lg:top-24">
            
            {/* MINIATURAS VERTICALES (BORDES REDONDEADOS) */}
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto w-full lg:w-24 shrink-0 pb-2 lg:pb-0 hide-scrollbar">
              {galeriaSegura.map((img, idx) => (
                <button 
                  key={idx}
                  onMouseEnter={() => setImagenActiva(idx)}
                  onClick={() => setImagenActiva(idx)}
                  className={`relative w-20 h-20 lg:w-full lg:h-24 shrink-0 rounded-[24px] overflow-hidden border-2 transition-all duration-300 bg-black ${
                    imagenActiva === idx 
                    ? 'border-[#a855f7] shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105 z-10' 
                    : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img src={img} onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }} className="w-full h-full object-cover" alt={`Detalle ${idx + 1}`} />
                </button>
              ))}
            </div>

            {/* VISOR PRINCIPAL */}
            <div className="flex-1 w-full aspect-square lg:aspect-auto lg:h-[75vh] bg-[#111113]/80 backdrop-blur-3xl rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl flex items-center justify-center p-6 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#A855F7]/5 to-transparent opacity-50"></div>
              <img 
                src={currentImage} 
                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                alt={producto.name} 
                className="w-full h-full object-contain animate-in fade-in duration-500 drop-shadow-2xl transition-transform duration-700 group-hover:scale-105 relative z-10"
              />
              {producto.is_featured && (
                <div className="absolute top-6 left-6 bg-[#a855f7] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)] z-20">
                  <Star size={12} fill="currentColor" className="inline mr-1"/> Obra de Autor
                </div>
              )}
            </div>
          </div>

          {/* 📝 BLOQUE DERECHO: INTERFAZ TRANSACCIONAL */}
          <div className="w-full lg:w-[45%] flex flex-col gap-8 lg:py-2">
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a855f7] bg-[#a855f7]/10 px-4 py-2 rounded-full border border-[#a855f7]/20 shadow-inner">
                  {producto.category?.name || 'Artesanía'}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
                  ID: {producto.id}00-PC
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter text-white leading-[1.05] drop-shadow-lg">
                {producto.name}
              </h1>
              
              <div className="text-4xl font-mono font-black text-white mt-1">
                {formatoCOP(producto.price)}
              </div>
            </div>

            <Link to={`/artesanos/${producto.author?.username}`} className="flex items-center justify-between p-5 bg-[#111113]/50 backdrop-blur-md rounded-[30px] border border-white/5 hover:border-[#a855f7]/40 transition-all shadow-lg group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-[#0A0A0C] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-1">
                  {producto.author?.profile_picture ? (
                    <img src={producto.author.profile_picture} alt="Maestro" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-lg text-[#a855f7] font-black uppercase">{producto.author?.name?.charAt(0) || 'A'}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <p className="text-[8px] text-[#a855f7] font-black uppercase tracking-[0.2em] mb-1">Maestro Creador</p>
                  <p className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-[#a855f7] transition-colors truncate">
                    {producto.author?.name || 'Creador Local'}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-[#a855f7] group-hover:text-white transition-all">
                <ChevronRight size={18} />
              </div>
            </Link>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-5 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#A855F7]"></div> Relato de la Obra
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                {producto.description}
              </p>
            </div>

            {(producto.specs?.materials || producto.specs?.dimensions || producto.specs?.weight) && (
              <div className="grid grid-cols-2 gap-4 p-6 bg-black/40 border border-white/5 rounded-[30px] shadow-inner mt-2">
                {producto.specs.materials && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} className="text-[#a855f7]"/> Técnica</p>
                    <p className="text-xs font-black text-white uppercase truncate">{producto.specs.materials}</p>
                  </div>
                )}
                {producto.specs.dimensions && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} className="text-[#a855f7]"/> Escala</p>
                    <p className="text-xs font-black text-white uppercase truncate">{producto.specs.dimensions}</p>
                  </div>
                )}
              </div>
            )}

            {/* COMPRA Y STOCK */}
            <div className="bg-[#111113]/80 backdrop-blur-xl p-8 rounded-[40px] border border-[#a855f7]/20 relative overflow-hidden mt-4 shadow-2xl">
              <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#a855f7]/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Estado de Reserva</span>
                <span className={`text-xs font-black uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full border ${producto.stock > 0 ? "text-emerald-400 border-emerald-900/50" : "text-red-500 border-red-900/50"}`}>
                  {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}
                </span>
              </div>

              {producto.stock > 0 ? (
                <div className="flex flex-col xl:flex-row items-center gap-4 relative z-10">
                  <div className="flex items-center justify-between bg-[#0A0A0C] border border-white/10 rounded-full px-5 py-4 w-full xl:w-40 shrink-0 shadow-inner">
                    <button onClick={() => setCantidadAComprar(prev => Math.max(1, prev - 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#a855f7] text-white transition-all">
                      <Minus size={14} />
                    </button>
                    <span className="font-mono font-black text-sm w-8 text-center text-white">{cantidadAComprar}</span>
                    <button onClick={() => setCantidadAComprar(prev => Math.min(producto.stock, prev + 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#a855f7] text-white transition-all">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={agregarAlCarrito} className="w-full flex-1 bg-white text-black py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.4)] hover:bg-[#a855f7] hover:text-white active:scale-95 transition-all duration-300 flex items-center justify-center gap-3">
                    <ShoppingCart size={18} /> Añadir al Carrito
                  </button>
                </div>
              ) : (
                <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] text-center relative z-10 shadow-inner">
                  Esta pieza ha sido adquirida
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-8 mt-4">
              <div className="flex items-center gap-3 text-gray-500">
                <ShieldCheck size={20} className="text-[#a855f7]" />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">Venta<br/>Autenticada</span>
              </div>
              <div className="w-px h-8 bg-white/5 hidden sm:block"></div>
              <div className="flex items-center gap-3 text-gray-500">
                <Truck size={20} className="text-[#a855f7]" />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">Logística<br/>P2P</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* 🛒 OFFCANVAS CART CON FACTURACIÓN PDF */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0A0A0C]/95 backdrop-blur-3xl border-l border-white/10 z-[110] transform transition-transform duration-700 ease-out flex flex-col shadow-2xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-black/20">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3"><ShoppingCart size={24} className="text-[#A855F7]"/> Tu Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white hover:bg-red-500/20 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-5 hide-scrollbar">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingCart size={80} className="mb-6 text-gray-600" />
              <p className="font-bold text-[10px] uppercase tracking-[0.3em] text-gray-400">El carrito está vacío.</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="flex gap-5 bg-[#111113]/60 backdrop-blur-md p-4 rounded-[28px] border border-white/5 shadow-lg group hover:border-white/10 transition-colors">
                <img 
                  src={item.images?.[0] || item.main_image || placeholderImg} 
                  onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }} 
                  className="w-20 h-24 object-cover rounded-[20px] bg-black" 
                  alt={item.name}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white leading-tight line-clamp-2 pr-4">{item.name}</h4>
                    <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-600 hover:text-red-500 transition-colors shrink-0"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-end justify-between mt-2">
                    <p className="text-[#a855f7] font-mono font-bold text-sm">{formatoCOP(item.price)}</p>
                    <div className="flex items-center gap-3 bg-black/50 rounded-full border border-white/10 p-1.5 shadow-inner">
                      <button onClick={() => modificarCantidadCarrito(item.id, -1)} className="w-6 h-6 flex justify-center items-center bg-white/10 hover:bg-[#A855F7] rounded-full text-white transition-colors"><Minus size={12} /></button>
                      <span className="font-mono text-[11px] font-bold w-4 text-center text-white">{item.cantidad}</span>
                      <button disabled={item.cantidad >= item.stock} onClick={() => modificarCantidadCarrito(item.id, 1)} className="w-6 h-6 flex justify-center items-center bg-white/10 hover:bg-[#A855F7] rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus size={12} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="p-8 bg-[#0A0A0C] border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-gray-500 font-black text-[10px] uppercase tracking-[0.3em]">Total Estimado</span>
              <span className="text-3xl font-black font-mono text-white">{formatoCOP(totalCarrito)}</span>
            </div>
            
            {/* 🔥 Botón P2P con Generación de PDF */}
            <button 
              onClick={procesarCompraP2P}
              disabled={procesandoOrden}
              className="w-full bg-[#a855f7] text-white py-5 rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(168,85,247,0.3)] hover:shadow-[0_15px_30px_rgba(168,85,247,0.6)] active:scale-95 transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-wait"
            >
               {procesandoOrden ? <Loader2 size={18} className="animate-spin" /> : <MessageCircle size={18} />} 
               Generar Contrato P2P
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetalleProducto; 