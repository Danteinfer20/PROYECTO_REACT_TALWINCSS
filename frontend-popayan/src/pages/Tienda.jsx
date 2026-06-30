import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, Filter, Star, ShoppingCart, X, Plus, Minus, Trash2, ChevronDown, CheckCircle, Loader2, User, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next'; 

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Tienda = () => {
  const { t, i18n } = useTranslation(); 
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [categorias, setCategorias] = useState(['Todas']);
  const [categoriaActiva, setCategoriaActiva] = useState('Todas');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);
  
  const [carrito, setCarrito] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(0);
  
  const [procesandoOrden, setProcesandoOrden] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
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
      const response = await api.get(`/products`);
      const data = response.data.data || response.data || [];
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
            showToast(t('store.toasts.max_stock', '⚠️ Stock máximo alcanzado'));
            return prev;
        }
        showToast(t('store.toasts.qty_updated', '🛒 Cantidad actualizada'));
        return prev.map(item => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      showToast(t('store.toasts.added', '🛒 Producto añadido al Carrito'));
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

  const generarContratoPDF = (ordenInfo, comprador) => {
    const doc = new jsPDF();
    const primaryColor = [168, 85, 247]; 
    const darkColor = [10, 10, 12]; 
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
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 72);
    doc.text("Estado: VALIDACIÓN P2P PENDIENTE", 14, 79);

    const artesano = ordenInfo.order_items?.[0]?.product?.author || carrito[0]?.author;
    if (artesano) {
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text("DATOS DEL VENDEDOR (ARTESANO)", 14, 92);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayColor);
      doc.text(`Nombre: ${artesano.name || 'No especificado'}`, 14, 100);
      doc.text(`Teléfono: ${artesano.phone || 'No registrado'}`, 14, 107);
      doc.text(`Correo: ${artesano.email || 'No registrado'}`, 14, 114);
    }

    if (comprador) {
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text("DATOS DEL COMPRADOR", 14, 128);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...grayColor);
      doc.text(`Nombre: ${comprador.name || 'No especificado'}`, 14, 136);
      doc.text(`Teléfono: ${comprador.phone || 'No registrado'}`, 14, 143);
      doc.text(`Correo: ${comprador.email || 'No registrado'}`, 14, 150);
    }

    const tableColumn = ["Producto", "Cant.", "V. Unitario", "Subtotal"];
    const tableRows = carrito.map(item => [
      item.name,
      item.cantidad,
      formatoCOP(item.price),
      formatoCOP(item.price * item.cantidad)
    ]);

    autoTable(doc, {
      startY: 165,
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

    doc.save(`PopayanCultural_Order_${ordenInfo.order_number}.pdf`);
  };

  const procesarCompraP2P = async () => {
    if (!localStorage.getItem('token')) {
        showToast('⚠️ Requiere autenticación de usuario');
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

      const response = await api.post(`/orders`, { items: itemsPayload });
      
      const ordenOficial = response.data.data || response.data;
      const comprador = user || JSON.parse(localStorage.getItem('user') || '{}');
      
      generarContratoPDF(ordenOficial, comprador);

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
          
          mensaje += `\n\n*Total a Transferir:* ${formatoCOP(ordenOficial.total_amount)}\n\nTengo mi comprobante PDF oficial listo. ¿Me confirmas tus datos de Nequi/Daviplata para realizar el pago?`;

          showToast('✅ Reserva Exitosa. Abriendo canal seguro con el Artesano...');
          
          setTimeout(() => {
              window.open(`https://wa.me/${numeroArtesano.replace(/\+/g, '')}?text=${encodeURIComponent(mensaje)}`, '_blank');
          }, 1500);
      } else {
          alert(`✅ Reserva generada (Orden ${ordenOficial.order_number}).\n\n⚠️ NOTA: El Maestro Artesano no tiene un número de contacto directo registrado. Por favor, descarga tu PDF y contáctalo a través del perfil oficial de su galería.`);
      }

    } catch (error) {
      console.error("Error:", error.response?.data?.error);
      showToast(error.response?.data?.message || '❌ Stock agotado o error de servidor');
    } finally {
      setProcesandoOrden(false);
    }
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
  const totalArticulos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const formatoCOP = (valor) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor);

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col font-sans relative overflow-x-hidden transition-colors duration-500">
      <Navbar />

      {/* Toast Notifications */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-500 ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-[var(--bg-container)]/90 backdrop-blur-xl border border-[rgb(var(--role-accent))]/30 text-[var(--text-heading)] px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-[8px] font-bold tracking-widest uppercase">
          <CheckCircle size={12} className="text-[rgb(var(--role-accent))]" /> {toast.message}
        </div>
      </div>

      <main className="flex-1 w-full mx-auto">
        
        {/* Hero Section - Tamaño proporcional */}
        <section className="relative w-full py-12 md:py-16 flex items-center justify-center border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="text-center flex flex-col items-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-[var(--text-heading)] drop-shadow-lg mb-3">
              POP STORE
            </h1>
            <p className="text-[var(--text-body)] font-mono text-[9px] md:text-xs uppercase tracking-[0.3em] max-w-xl leading-relaxed">
              El mercado digital del Cauca. Directo del creador a tus manos.
            </p>
          </div>
        </section>

        {/* Barra de búsqueda y filtros (responsiva) */}
        <div className="relative z-30 w-full max-w-[1200px] mx-auto px-4 -mt-6 mb-10">
          <div className="bg-[var(--bg-container)]/80 backdrop-blur-3xl border border-[var(--border-color)] rounded-full p-1 shadow-sm flex items-center justify-between gap-2">
            
            <div className="flex-1 flex items-center bg-[var(--bg-primary)] rounded-full border border-[var(--border-color)] px-3 focus-within:border-[rgb(var(--role-accent))]/50 transition-all shadow-inner">
                <Search className="text-[rgb(var(--role-accent))] shrink-0" size={14} />
                <input 
                  type="text" 
                  placeholder="Buscar por artículo o artesano..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-transparent py-2 px-2 text-xs font-medium text-[var(--text-heading)] outline-none placeholder:[var(--text-body)]/60"
                />
            </div>
            
            <div className="relative shrink-0 hidden md:block" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all border ${
                  categoriaActiva !== 'Todas' || isFilterOpen 
                  ? 'bg-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))] border-[rgb(var(--role-accent))]/50' 
                  : 'bg-transparent text-[var(--text-body)] hover:text-[var(--text-heading)] border-transparent hover:bg-[var(--text-heading)]/5'
                }`}
              >
                <Filter size={12} /> {categoriaActiva === 'Todas' ? 'Todas' : categoriaActiva} <ChevronDown size={12} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`}/>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-[var(--bg-container)]/95 backdrop-blur-xl border border-[var(--border-color)] rounded-2xl shadow-xl overflow-hidden py-2 z-50">
                  {categorias.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategoriaActiva(cat); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[8px] font-black uppercase tracking-widest transition-colors ${
                        categoriaActiva === cat ? 'bg-[rgb(var(--role-accent))]/20 text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)]'
                      }`}
                    >
                      {cat === 'Todas' ? 'Todas' : cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative shrink-0 bg-[var(--text-heading)] hover:bg-[rgb(var(--role-accent))] text-[var(--bg-primary)] hover:text-white px-4 py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={14} /> <span className="hidden sm:inline">Carrito</span>
              {totalArticulos > 0 && (
                <span className="absolute -top-1 -right-1 bg-[rgb(var(--role-accent))] text-white border-2 border-[var(--bg-container)] text-[7px] w-5 h-5 flex items-center justify-center rounded-full">
                  {totalArticulos}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Galería de productos - grid compacto y responsivo */}
        <div className="w-full max-w-[1600px] mx-auto px-4 pb-20">
          
          {(busqueda || categoriaActiva !== 'Todas') && (
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[var(--border-color)] pb-3">
              <span className="text-[8px] text-[var(--text-body)] font-black uppercase tracking-[0.2em]">Filtros activos:</span>
              {categoriaActiva !== 'Todas' && (
                <span className="bg-[rgb(var(--role-accent))]/10 border border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))] px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                  {categoriaActiva} <X size={8} className="cursor-pointer hover:text-[var(--text-heading)]" onClick={() => setCategoriaActiva('Todas')} />
                </span>
              )}
              {busqueda && (
                <span className="bg-[var(--text-heading)]/5 border border-[var(--border-color)] text-[var(--text-heading)] px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-[0.2em] flex items-center gap-1">
                  "{busqueda}" <X size={8} className="cursor-pointer hover:text-red-500" onClick={() => setBusqueda('')} />
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[rgb(var(--role-accent))] text-[8px] font-mono uppercase tracking-widest gap-2">
              <Loader2 size={20} className="animate-spin" /> Cargando...
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-container)]/30 rounded-2xl border border-[var(--border-color)]">
              <ShoppingBag size={32} className="text-[var(--text-body)] opacity-50 mb-3" />
              <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-widest">No hay productos disponibles.</p>
              <button onClick={() => {setBusqueda(''); setCategoriaActiva('Todas');}} className="mt-3 text-[rgb(var(--role-accent))] text-[8px] uppercase font-black tracking-[0.2em] border border-[rgb(var(--role-accent))]/30 px-4 py-1.5 rounded-full">
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {productosFiltrados.map((prod) => {
                const imgUrl = getProductImage(prod);
                return (
                  <div key={prod.id} className="group flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[rgb(var(--role-accent))]/40 transition-all shadow-sm hover:shadow-md">
                    
                    <div className="relative w-full aspect-square bg-[var(--bg-primary)] overflow-hidden cursor-pointer" onClick={() => irADetalle(prod.id)}>
                      <img 
                        src={imgUrl} 
                        alt={prod.name} 
                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 grayscale-[15%] group-hover:grayscale-0 scale-100 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-60"></div>
                      
                      {prod.is_featured && (
                        <div className="absolute top-2 left-2 bg-[rgb(var(--role-accent))] text-white text-[6px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-md z-10">
                          <Star size={6} fill="currentColor"/> Elite
                        </div>
                      )}
                      
                      {prod.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                          <span className="bg-red-500 text-white text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full transform -rotate-3 shadow-md">
                            Agotado
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                        <button 
                          onClick={(e) => abrirDetalleRapido(e, prod)}
                          className="pointer-events-auto bg-[var(--bg-container)]/80 backdrop-blur-xl border border-[var(--border-color)] text-[var(--text-heading)] px-3 py-1 rounded-full text-[6px] font-black uppercase tracking-[0.2em] hover:bg-[rgb(var(--role-accent))] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-sm"
                        >
                          Vista Rápida
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 flex flex-col flex-1">
                      <span className="text-[5px] font-bold uppercase tracking-[0.3em] text-[rgb(var(--role-accent))] mb-0.5">
                        {prod.category?.name || 'Obra'}
                      </span>
                      <h3 className="text-[10px] font-black uppercase tracking-tight text-[var(--text-heading)] leading-tight mb-1 line-clamp-2 group-hover:text-[rgb(var(--role-accent))] transition-colors">
                        {prod.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-[var(--text-body)] block mb-1.5">
                        {formatoCOP(prod.price)}
                      </span>
                      
                      <div className="flex items-center justify-between mt-auto border-t border-[var(--border-color)] pt-1.5">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                            {prod.author?.profile_picture ? <img src={prod.author.profile_picture} className="w-full h-full object-cover"/> : <span className="text-[5px] text-[rgb(var(--role-accent))] font-black">{prod.author?.name?.charAt(0) || 'A'}</span>}
                          </div>
                          <span className="text-[6px] font-bold text-[var(--text-body)] uppercase tracking-widest truncate max-w-[70px]">
                            {prod.author?.name}
                          </span>
                        </div>
                        
                        <button 
                          onClick={(e) => agregarAlCarrito(e, prod)}
                          disabled={prod.stock <= 0}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            prod.stock > 0 
                            ? 'bg-[var(--text-heading)] text-[var(--bg-primary)] hover:bg-[rgb(var(--role-accent))] hover:text-white' 
                            : 'bg-[var(--bg-primary)] text-[var(--text-body)] border border-[var(--border-color)] cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Modal Vista Rápida - responsivo */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={cerrarDetalleRapido}></div>
          
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[var(--bg-container)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
            
            <button onClick={cerrarDetalleRapido} className="absolute top-2 right-2 z-50 bg-[var(--bg-primary)]/80 p-1.5 rounded-full text-[var(--text-body)] hover:text-white hover:bg-red-500 transition-all backdrop-blur-md shadow-sm border border-[var(--border-color)]">
              <X size={16} strokeWidth={2.5} />
            </button>
            
            <div className="w-full lg:w-3/5 bg-[var(--bg-primary)] p-3 lg:p-5 flex flex-col-reverse lg:flex-row gap-2 relative h-56 lg:h-auto border-b lg:border-b-0 lg:border-r border-[var(--border-color)]">
              
              <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto w-full lg:w-14 shrink-0 pb-1 lg:pb-0 hide-scrollbar">
                {(productoSeleccionado.images?.length > 0 ? productoSeleccionado.images : [productoSeleccionado.main_image || placeholderImg]).map((imgUrl, idx) => (
                  <button 
                    key={idx} 
                    onMouseEnter={() => setImagenActiva(idx)} 
                    onClick={() => setImagenActiva(idx)} 
                    className={`w-10 h-10 lg:w-full lg:h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all bg-[var(--bg-container)] ${imagenActiva === idx ? 'border-[rgb(var(--role-accent))] shadow-sm scale-105' : 'border-[var(--border-color)] opacity-60 hover:opacity-100'}`}
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
              
              <div className="flex-1 bg-[var(--bg-container)]/50 rounded-lg overflow-hidden relative border border-[var(--border-color)] flex items-center justify-center">
                <img 
                  src={(productoSeleccionado.images?.length > 0 ? productoSeleccionado.images[imagenActiva] : productoSeleccionado.main_image) || placeholderImg} 
                  alt={productoSeleccionado.name} 
                  onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                  className="absolute inset-0 w-full h-full object-contain p-2 animate-in fade-in duration-300"
                />
              </div>
            </div>

            <div className="w-full lg:w-2/5 p-4 overflow-y-auto flex flex-col">
              <div className="text-[7px] font-black uppercase tracking-[0.3em] text-[rgb(var(--role-accent))] mb-1">{productoSeleccionado.category?.name || 'Obra'}</div>
              <h2 className="text-lg lg:text-xl font-black italic uppercase tracking-tighter text-[var(--text-heading)] mb-2 leading-tight">{productoSeleccionado.name}</h2>
              <span className="text-xl lg:text-2xl font-mono font-black text-[var(--text-heading)] mb-3 block">{formatoCOP(productoSeleccionado.price)}</span>
              
              <div className="bg-[var(--bg-container)]/80 border border-[var(--border-color)] p-2 rounded-lg mb-4 flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden shrink-0 shadow-inner">
                    {productoSeleccionado.author?.profile_picture ? <img src={productoSeleccionado.author.profile_picture} className="w-full h-full object-cover"/> : <User className="p-1 text-[rgb(var(--role-accent))] w-full h-full"/>}
                </div>
                <div className="flex flex-col">
                    <p className="text-[7px] font-bold text-[var(--text-body)] uppercase tracking-widest mb-0.5">Autoría / Ventas Directas</p>
                    <p className="text-[10px] font-bold text-[var(--text-heading)]">{productoSeleccionado.author?.name}</p>
                </div>
              </div>
              
              <p className="text-[var(--text-body)] text-[10px] leading-relaxed font-medium mb-3 flex-1 line-clamp-3">{productoSeleccionado.description}</p>
              
              <div className="mt-auto pt-3 border-t border-[var(--border-color)]">
                <p className="text-[8px] text-[var(--text-body)] font-mono uppercase tracking-widest mb-2">Disponibles: <span className="text-[var(--text-heading)] font-bold">{productoSeleccionado.stock}</span></p>
                <button 
                  onClick={(e) => {agregarAlCarrito(e, productoSeleccionado); cerrarDetalleRapido();}} 
                  disabled={productoSeleccionado.stock <= 0} 
                  className="w-full bg-[rgb(var(--role-accent))] hover:opacity-90 text-white py-2 rounded-full font-black text-[8px] uppercase tracking-[0.2em] shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart size={12} /> Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Carrito lateral responsivo */}
      <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-[var(--bg-container)]/95 backdrop-blur-3xl border-l border-[var(--border-color)] z-[110] transform transition-transform duration-500 ease-out flex flex-col shadow-2xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)] bg-[var(--text-heading)]/5">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-[var(--text-heading)] flex items-center gap-2"><ShoppingCart size={18} className="text-[rgb(var(--role-accent))]"/> Tu Carrito</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-[var(--text-body)] hover:text-white hover:bg-red-500/80 p-1.5 rounded-full transition-colors"><X size={16} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingCart size={50} className="mb-3 text-[var(--text-body)]" />
              <p className="font-bold text-[8px] uppercase tracking-[0.3em] text-[var(--text-body)]">El carrito está vacío.</p>
            </div>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="flex gap-2 bg-[var(--bg-card)]/60 backdrop-blur-md p-2 rounded-xl border border-[var(--border-color)] shadow-sm group hover:border-[rgb(var(--role-accent))]/30 transition-colors">
                <img 
                  src={getProductImage(item)} 
                  onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }} 
                  className="w-12 h-14 object-cover rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]" 
                  alt={item.name}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[8px] font-black uppercase tracking-widest text-[var(--text-heading)] leading-tight line-clamp-2 pr-1">{item.name}</h4>
                    <button onClick={() => eliminarDelCarrito(item.id)} className="text-[var(--text-body)] hover:text-red-500 transition-colors shrink-0"><Trash2 size={10} /></button>
                  </div>
                  <div className="flex items-end justify-between mt-1">
                    <p className="text-[rgb(var(--role-accent))] font-mono font-bold text-[10px]">{formatoCOP(item.price)}</p>
                    <div className="flex items-center gap-1 bg-[var(--bg-primary)] rounded-full border border-[var(--border-color)] p-0.5">
                      <button onClick={() => modificarCantidad(item.id, -1)} className="w-4 h-4 flex justify-center items-center bg-[var(--text-heading)]/5 hover:bg-[rgb(var(--role-accent))] hover:text-white rounded-full text-[var(--text-heading)] transition-colors"><Minus size={8} /></button>
                      <span className="font-mono text-[8px] font-bold w-4 text-center text-[var(--text-heading)]">{item.cantidad}</span>
                      <button disabled={item.cantidad >= item.stock} onClick={() => modificarCantidad(item.id, 1)} className="w-4 h-4 flex justify-center items-center bg-[var(--text-heading)]/5 hover:bg-[rgb(var(--role-accent))] hover:text-white rounded-full text-[var(--text-heading)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"><Plus size={8} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="p-4 bg-[var(--bg-container)] border-t border-[var(--border-color)] shadow-[0_-10px_30px_rgba(var(--glass-shadow))]">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[var(--text-body)] font-black text-[8px] uppercase tracking-[0.3em]">Total Estimado</span>
              <span className="text-xl font-black font-mono text-[var(--text-heading)]">{formatoCOP(totalCarrito)}</span>
            </div>
            <button 
              onClick={procesarCompraP2P}
              disabled={procesandoOrden}
              className="w-full bg-[rgb(var(--role-accent))] text-white py-2.5 rounded-full font-black text-[8px] uppercase tracking-[0.3em] shadow-md hover:shadow-lg active:scale-95 transition-all flex justify-center items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
            >
               {procesandoOrden ? <Loader2 size={12} className="animate-spin" /> : <MessageCircle size={12} />} 
               Generar Contrato P2P
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tienda;