import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Filter, Star, ShoppingCart, X, Plus, Minus, Trash2, ChevronRight, ChevronDown, CheckCircle, Loader2, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 🔥 IMPORTACIONES PARA EL MOTOR PDF (Cura para Vite ESM aplicada)
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Tienda = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // 🔥 Categorías Dinámicas desde el Backend
  const [categorias, setCategorias] = useState(['Todas']);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [currentBg, setCurrentBg] = useState(0);
  
  // 🔥 Estados P2P
  const [procesandoOrden, setProcesandoOrden] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  const heroImages = [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=100&w=2560",
    "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?q=100&w=2560",
    "https://images.unsplash.com/photo-1459926274020-80252119c629?q=100&w=2560"
  ];

  const placeholderImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCIgdmlld0JveD0iMCAwIDgwMCAxMDAwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjEwMDAiIGZpbGw9IiMxMTExMTMiLz48cGF0aCBkPSJNMzYwIDQ2MGg4MHY4MGgtODB6IiBmaWxsPSIjYTg1NWY3Ii8+PHRleHQgeD0iNDAwIiB5PSI1ODAiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFydGVmYWN0byBDdWx0dXJhbDwvdGV4dD48L3N2Zz4=";

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const getProductImage = (prod) => {
    if (prod.images && prod.images.length > 0) return prod.images[0];
    if (prod.main_image) return prod.main_image;
    return placeholderImg;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    cargarProductos();
    const interval = setInterval(() => setCurrentBg((prev) => (prev + 1) % heroImages.length), 6000); 
    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    let resultado = productos;

    if (categoriaActiva !== 'Todas') {
      resultado = resultado.filter(p => p.category?.name === categoriaActiva);
    }

    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.name.toLowerCase().includes(termino) || 
        (p.author?.name && p.author.name.toLowerCase().includes(termino))
      );
    }

    setProductosFiltrados(resultado);
  }, [busqueda, categoriaActiva, productos]);

  const cargarProductos = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      const data = response.data.data || [];
      setProductos(data);
      
      const categoriasUnicas = [...new Set(data.map(p => p.category?.name).filter(Boolean))];
      setCategorias(['Todas', ...categoriasUnicas]);
    } catch (error) {
      console.error("Error cargando la Pop Store:", error);
    } finally {
      setLoading(false);
    }
  };

  const irADetalle = (id) => navigate(`/tienda/${id}`);

  const abrirDetalleRapido = (e, producto) => {
    e.stopPropagation();
    setProductoSeleccionado(producto);
    setImagenActiva(0);
    document.body.style.overflow = 'hidden';
  };

  const cerrarDetalleRapido = () => {
    setProductoSeleccionado(null);
    document.body.style.overflow = 'auto';
  };

  const agregarAlCarrito = (e, producto) => {
    e.stopPropagation();
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
            showToast("⚠️ Stock máximo alcanzado");
            return prev;
        }
        showToast("🛒 Cantidad actualizada");
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      showToast("🛒 Producto añadido al Carrito");
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const modificarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(item => {
      if (item.id === id) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.stock) return { ...item, cantidad: nuevaCantidad };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id) => setCarrito(prev => prev.filter(item => item.id !== id));

  // 🔥 MOTOR GENERADOR DE PDF CORPORATIVO (Corrección Vite Aplicada)
  const generarContratoPDF = (ordenInfo) => {
    const doc = new jsPDF();
    
    const primaryColor = [168, 85, 247]; // #A855F7
    const darkColor = [10, 10, 12]; // #0A0A0C
    const grayColor = [100, 100, 100];

    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("POPAYÁN CULTURAL", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("COMPROBANTE DE COMPRA P2P", 105, 30, { align: "center" });

    doc.setTextColor(...darkColor);
    doc.setFontSize(12);
    doc.text("Detalles de la Transacción", 14, 55);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text(`ID de Orden: ${ordenInfo.order_number}`, 14, 65);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 72);
    doc.text(`Estado: VALIDACIÓN P2P PENDIENTE`, 14, 79);

    const tableColumn = ["Ref / Producto", "Cant.", "V. Unitario", "Subtotal"];
    const tableRows = carrito.map(item => [
      item.name,
      item.cantidad,
      formatoCOP(item.price),
      formatoCOP(item.price * item.cantidad)
    ]);

    // 🔥 FIX VITE: Usamos autoTable como función externa en lugar de doc.autoTable
    autoTable(doc, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 6 },
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text(`TOTAL ESTIMADO: ${formatoCOP(totalCarrito)}`, 196, finalY, { align: "right" });

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("NOTA LEGAL: Popayán Cultural actúa como vitrina digital. Este comprobante acredita la", 105, finalY + 25, { align: "center" });
    doc.text("separación del inventario. El pago y envío se coordinan directamente con el Artesano.", 105, finalY + 30, { align: "center" });

    doc.save(`PopayanCultural_Orden_${ordenInfo.order_number}.pdf`);
  };

  // 🔥 LÓGICA P2P REAL CON BACKEND Y ENRUTAMIENTO DINÁMICO (CORRECCIÓN APLICADA AQUÍ)
  const procesarCompraP2P = async () => {
    if (!token) {
        showToast("⚠️ Requiere autenticación de usuario");
        setTimeout(() => navigate('/login'), 2000);
        return;
    }

    if (carrito.length === 0) return;

    setProcesandoOrden(true);
    try {
      const itemsPayload = carrito.map(item => ({
          id: item.id,
          cantidad: item.cantidad
      }));

      const response = await axios.post(`${API_URL}/orders`, { items: itemsPayload }, {
          headers: { Authorization: `Bearer ${token}` }
      });
      
      const ordenOficial = response.data.data;

      generarContratoPDF(ordenOficial);

      // 🛡️ CORRECCIÓN P2P: Extraemos el contacto del artesano real (Lógica Defensiva)
      const artesano = carrito[0]?.author;
      const numeroArtesano = artesano?.phone; 
      const nombreArtesano = artesano?.name?.split(' ')[0] || 'Maestro';

      setCarrito([]);
      setIsCartOpen(false);

      if (numeroArtesano) {
          let mensaje = `Hola ${nombreArtesano} 👋\nAcabo de realizar una reserva oficial en la Pop Store (Orden *${ordenOficial.order_number}*).\n\n*Detalle de mi pedido:*`;
          
          carrito.forEach(item => {
              mensaje += `\n- ${item.cantidad}x ${item.name} (${formatoCOP(item.price)})`;
          });
          
          mensaje += `\n\n*Total a Transferir:* ${formatoCOP(ordenOficial.total_amount)}\n\nTengo mi comprobante PDF oficial listo. ¿Me confirmas tus datos de Nequi/Daviplata para realizar el pago y que puedas confirmar la orden en tu sistema?`;

          showToast("✅ Reserva Exitosa. Abriendo canal seguro con el Artesano...");
          
          setTimeout(() => {
              window.open(`https://wa.me/${numeroArtesano.replace(/\+/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
          }, 1500);
      } else {
          // Alerta transparente si el creador no registró número
          alert(`✅ Reserva generada (Orden ${ordenOficial.order_number}).\n\n⚠️ NOTA: El Maestro Artesano no tiene un número de contacto directo registrado. Por favor, descarga tu PDF y contáctalo a través del perfil oficial de su galería.`);
      }

    } catch (error) {
      console.error("Detalle Error:", error.response?.data?.error);
      showToast(error.response?.data?.message || "❌ Stock agotado o error de servidor");
    } finally {
      setProcesandoOrden(false);
    }
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
  const totalArticulos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const formatoCOP = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-[#a855f7]/30">
      <Navbar />

      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#111113]/90 backdrop-blur-xl border border-[#A855F7]/30 text-white px-8 py-4 rounded-full shadow-[0_10px_40px_rgba(168,85,247,0.3)] flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
          <CheckCircle size={16} className="text-[#A855F7]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full mx-auto">
        
        {/* HERO ESTILIZADO */}
        <section className="relative w-full h-[40vh] min-h-[350px] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 bg-[#0a0a0c]">
            {heroImages.map((img, index) => (
              <img 
                key={index}
                src={img} 
                className={`absolute inset-0 w-full h-full object-cover transform transition-all duration-[6000ms] ease-in-out ${
                  index === currentBg ? 'opacity-30 scale-105 grayscale-[30%]' : 'opacity-0 scale-100'
                }`} 
                alt={`Hero ${index + 1}`} 
              />
            ))}
          </div>
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0A0A0C] via-transparent to-[#0A0A0C]/80"></div>

          <div className="relative z-20 text-center flex flex-col items-center px-4 mt-8">
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] mb-4">
              POP STORE
            </h1>
            <p className="text-gray-300 font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] max-w-xl leading-relaxed">
              El mercado digital del Cauca. Directo del creador a tus manos.
            </p>
          </div>
        </section>

        {/* DOCK DE CONTROL SLIM (Asimétrico y Centrado) */}
        <div className="relative z-30 w-full max-w-[1200px] mx-auto px-6 -mt-8 mb-16">
          <div className="bg-[#111113]/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4">
            
            <div className="flex-1 flex items-center bg-black/40 rounded-full border border-white/5 px-4 focus-within:border-[#A855F7]/50 transition-colors">
                <Search className="text-[#A855F7] shrink-0" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar por artículo o artesano..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-transparent py-3.5 px-3 text-xs font-medium text-white outline-none placeholder-gray-600"
                />
            </div>
            
            <div className="relative shrink-0 hidden md:block" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  categoriaActiva !== 'Todas' || isFilterOpen 
                  ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/50' 
                  : 'bg-transparent text-gray-400 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <Filter size={14} /> {categoriaActiva} <ChevronDown size={14} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-[#111113]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden py-3 z-50 animate-in fade-in slide-in-from-top-2">
                  {categorias.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategoriaActiva(cat); setIsFilterOpen(false); }}
                      className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                        categoriaActiva === cat ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative shrink-0 bg-white hover:bg-[#A855F7] hover:text-white text-black px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <ShoppingCart size={16} /> <span className="hidden sm:block">Tu Carrito</span>
              {totalArticulos > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#A855F7] text-white border-2 border-[#111113] text-[9px] w-6 h-6 flex items-center justify-center rounded-full animate-in zoom-in">
                  {totalArticulos}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* GALERÍA EXPANSIVA */}
        <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 pb-32">
          
          {(busqueda || categoriaActiva !== 'Todas') && (
            <div className="flex flex-wrap items-center gap-3 mb-10 border-b border-white/5 pb-6">
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Filtros Activos:</span>
              {categoriaActiva !== 'Todas' && (
                <span className="bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  {categoriaActiva} <X size={12} className="cursor-pointer hover:text-white" onClick={() => setCategoriaActiva('Todas')} />
                </span>
              )}
              {busqueda && (
                <span className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  "{busqueda}" <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => setBusqueda('')} />
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-[#a855f7] text-[10px] font-mono uppercase tracking-widest gap-4">
              <Loader2 size={32} className="animate-spin" /> Cargando Vitrina...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-[#111113]/30 rounded-[40px] border border-white/5 shadow-inner">
              <ShoppingBag size={48} className="text-gray-700 mb-6" />
              <p className="text-gray-400 font-mono text-sm uppercase tracking-widest text-center px-4 mb-4">
                Inventario No Disponible.
              </p>
              <button onClick={() => {setBusqueda(''); setCategoriaActiva('Todas');}} className="text-[#a855f7] text-[10px] uppercase font-black tracking-[0.2em] hover:text-white transition-colors border border-[#a855f7]/30 px-6 py-3 rounded-full">
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {productosFiltrados.map((prod) => {
                 const imgUrl = getProductImage(prod);
                 
                 return (
                <div key={prod.id} className="group flex flex-col bg-[#111113]/40 border border-white/5 rounded-[30px] overflow-hidden hover:border-[#a855f7]/30 transition-all shadow-lg hover:shadow-2xl">
                  
                  <div className="relative w-full aspect-[4/5] bg-black overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => irADetalle(prod.id)}>
                    <img 
                      src={imgUrl} 
                      alt={prod.name} 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-[2000ms] grayscale-[15%] group-hover:grayscale-0 scale-100 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-transparent to-transparent opacity-80"></div>
                    
                    {prod.is_featured && (
                      <div className="absolute top-5 left-5 bg-[#a855f7] text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10">
                        <Star size={10} fill="currentColor"/> Elite
                      </div>
                    )}
                    
                    {prod.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full transform -rotate-6 shadow-xl border border-red-400">
                          Sold Out
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
                      <button 
                        onClick={(e) => abrirDetalleRapido(e, prod)}
                        className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#a855f7] hover:border-transparent transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 shadow-2xl"
                      >
                        Vista Rápida
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 bg-[#111113]/80">
                    <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#A855F7] mb-2 block">
                      {prod.category?.name || 'Obra Física'}
                    </span>
                    <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight mb-2 group-hover:text-[#a855f7] transition-colors line-clamp-2" onClick={() => irADetalle(prod.id)}>
                      {prod.name}
                    </h3>
                    
                    <span className="text-xl font-mono font-bold text-gray-300 block mb-6">
                      {formatoCOP(prod.price)}
                    </span>
                    
                    <div className="flex items-center justify-between mt-auto border-t border-white/5 pt-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          {prod.author?.profile_picture ? <img src={prod.author.profile_picture} className="w-full h-full object-cover"/> : <span className="text-[10px] text-[#A855F7] font-black">{prod.author?.name?.charAt(0) || 'A'}</span>}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate max-w-[120px]">
                          {prod.author?.name}
                        </span>
                      </div>
                      
                      <button 
                        onClick={(e) => agregarAlCarrito(e, prod)}
                        disabled={prod.stock <= 0}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                          prod.stock > 0 
                          ? 'bg-white text-black hover:bg-[#a855f7] hover:text-white' 
                          : 'bg-black text-gray-700 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* 🔥 MODAL DE VISTA RÁPIDA */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={cerrarDetalleRapido}></div>
          
          <div className="relative w-full max-w-6xl h-[85vh] min-h-[600px] max-h-[900px] bg-[#0A0A0C] border border-white/10 rounded-[40px] shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col lg:flex-row">
            
            <button onClick={cerrarDetalleRapido} className="absolute top-6 right-6 z-50 bg-black/60 p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-all backdrop-blur-md">
              <X size={20} strokeWidth={3} />
            </button>
            
            <div className="w-full lg:w-3/5 bg-[#0e0e10] p-6 lg:p-10 flex flex-col-reverse lg:flex-row gap-4 relative h-[50vh] lg:h-full overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
              
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto w-full lg:w-20 shrink-0 pb-2 lg:pb-0 hide-scrollbar">
                {(productoSeleccionado.images?.length > 0 ? productoSeleccionado.images : [productoSeleccionado.main_image || placeholderImg]).map((imgUrl, idx) => (
                  <button 
                    key={idx} 
                    onMouseEnter={() => setImagenActiva(idx)} 
                    onClick={() => setImagenActiva(idx)} 
                    className={`w-16 h-16 lg:w-full lg:h-20 rounded-[15px] overflow-hidden shrink-0 border-2 transition-all bg-[#111113] ${imagenActiva === idx ? 'border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img 
                      src={imgUrl} 
                      onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }} 
                      className="w-full h-full object-cover" 
                      alt={`Vista ${idx}`} 
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex-1 bg-[#111113]/50 rounded-[30px] overflow-hidden relative border border-white/5 flex items-center justify-center">
                <img 
                  src={(productoSeleccionado.images?.length > 0 ? productoSeleccionado.images[imagenActiva] : productoSeleccionado.main_image) || placeholderImg} 
                  alt={productoSeleccionado.name} 
                  onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                  className="absolute inset-0 w-full h-full object-contain p-4 animate-in fade-in duration-300"
                />
              </div>
            </div>

            <div className="w-full lg:w-2/5 p-10 overflow-y-auto flex flex-col bg-[#0A0A0C] h-[35vh] lg:h-full hide-scrollbar">
              <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#a855f7] mb-3">{productoSeleccionado.category?.name || 'Obra'}</div>
              <h2 className="text-3xl lg:text-4xl font-black italic uppercase tracking-tighter text-white mb-6 leading-none">{productoSeleccionado.name}</h2>
              <span className="text-4xl lg:text-5xl font-mono font-black text-white mb-8 block drop-shadow-[0_0_15px_rgba(168,85,247,0.2)]">{formatoCOP(productoSeleccionado.price)}</span>
              
              <div className="bg-[#111113]/80 border border-white/5 p-5 rounded-[20px] mb-8 shrink-0 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-black border border-white/10 overflow-hidden shrink-0">
                    {productoSeleccionado.author?.profile_picture ? <img src={productoSeleccionado.author.profile_picture} className="w-full h-full object-cover"/> : <User className="p-2 text-[#A855F7]"/>}
                </div>
                <div className="flex flex-col">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Autoría / Ventas Directas</p>
                    <p className="text-sm font-bold text-white">{productoSeleccionado.author?.name}</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed font-medium mb-8 flex-1">{productoSeleccionado.description}</p>
              
              <div className="mt-auto pt-6 border-t border-white/5 shrink-0">
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-4">Unidades Disponibles: <span className="text-white font-bold">{productoSeleccionado.stock}</span></p>
                <button 
                  onClick={(e) => {agregarAlCarrito(e, productoSeleccionado); cerrarDetalleRapido();}} 
                  disabled={productoSeleccionado.stock <= 0} 
                  className="w-full bg-[#a855f7] hover:bg-[#9333ea] text-white py-5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(168,85,247,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={18} /> Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛒 OFFCANVAS CART CON FACTURACIÓN P2P */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsCartOpen(false)}></div>
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
                  src={getProductImage(item)} 
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
                      <button onClick={() => modificarCantidad(item.id, -1)} className="w-6 h-6 flex justify-center items-center bg-white/10 hover:bg-[#A855F7] rounded-full text-white transition-colors"><Minus size={12} /></button>
                      <span className="font-mono text-[11px] font-bold w-4 text-center text-white">{item.cantidad}</span>
                      <button disabled={item.cantidad >= item.stock} onClick={() => modificarCantidad(item.id, 1)} className="w-6 h-6 flex justify-center items-center bg-white/10 hover:bg-[#A855F7] rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus size={12} /></button>
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

export default Tienda;