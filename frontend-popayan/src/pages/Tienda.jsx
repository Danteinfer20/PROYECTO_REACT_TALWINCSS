import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  ShoppingBag, Search, Plus, X, ArrowUpRight, Grid, Instagram, Phone, User, CheckCircle2
} from 'lucide-react';

const Tienda = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('carrito_popayan');
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    localStorage.setItem('carrito_popayan', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setCargando(true);
        const res = await axios.get('http://localhost:8000/api/v1/products');
        const datos = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setProductos(datos);
      } catch (e) { console.error(e); } finally { setCargando(false); }
    };
    obtenerProductos();
  }, []);

  const agregarAlCarrito = (prod, e) => {
    if(e) e.stopPropagation(); 
    
    if (prod.stock_quantity <= 0) return;
    const existe = carrito.find(i => i.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(i => i.id === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
    setIsCartOpen(true);
    setProductoSeleccionado(null);
  };

  // --- MENSAJE DEL CARRITO MEJORADO ---
  const procesarPagoCentralizado = () => {
    if(carrito.length === 0) return;
    
    const numeroCentral = "573107473434"; 
    let texto = "🏛️✨ *¡Hola equipo de Popayán Cultural!*%0A";
    texto += "Me encantaron estas piezas en la Pop Store y quiero hacer mi pedido para apoyar el talento local:%0A%0A";
    
    carrito.forEach(item => {
      texto += `🎨 *Obra:* ${item.name} (x${item.cantidad})%0A`;
      texto += `👤 *Maestro:* ${item.user?.name || 'Artista Caucano'}%0A`;
      texto += `💎 *Valor:* $${Number(item.price).toLocaleString()}%0A`;
      texto += `-----------------------------------%0A`;
    });
    
    const total = carrito.reduce((acc, i) => acc + (i.price * i.cantidad), 0);
    texto += `%0A🌟 *INVERSIÓN TOTAL: $${total.toLocaleString()} COP* 🌟%0A%0A`;
    texto += `Por favor confírmenme la disponibilidad para realizar la transferencia (Nequi/Bancolombia) y coordinar el envío. 🚚📦%0A%0A`;
    texto += `¡Muchas gracias!`;
    
    window.open(`https://wa.me/${numeroCentral}?text=${texto}`, '_blank');
  };

  // --- MENSAJE DE CONSULTA RÁPIDA MEJORADO ---
  const contactarPorObra = (obra) => {
    const numeroCentral = "573107473434"; 
    let texto = `🏛️✨ *¡Hola equipo de Popayán Cultural!*%0A%0A`;
    texto += `Estoy explorando la Pop Store y me enamoré de esta pieza. Quisiera saber si aún está disponible:%0A%0A`;
    texto += `🎨 *Obra:* ${obra.name}%0A`;
    texto += `👤 *Maestro:* ${obra.user?.name || 'Artista Caucano'}%0A`;
    texto += `💎 *Inversión:* $${Number(obra.price).toLocaleString()} COP%0A%0A`;
    texto += `¡Quedo muy atento/a! 📦`;
    
    window.open(`https://wa.me/${numeroCentral}?text=${texto}`, '_blank');
  };

  const filtrados = productos.filter(p => {
    const matchBusqueda = p.name?.toLowerCase().includes(busqueda.toLowerCase());
    const matchCat = filtroCategoria === 'todos' || p.product_type === filtroCategoria;
    return matchBusqueda && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col font-sans relative">
      <Navbar />

      <div className="pt-32 pb-10 px-6 md:px-12 border-b border-white/5 bg-[#0D0D0F]">
        <div className="max-w-full mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="text-left space-y-2">
            <h1 className="text-5xl font-serif italic font-black uppercase tracking-tighter">
              POP <span className="text-[#A855F7]">STORE</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Curaduría de Maestros Caucanos</p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#A855F7]" size={18} />
            <input 
              type="text" 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="BUSCAR OBRA O ARTESANÍA..." 
              className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-[#A855F7] outline-none transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-[#0A0A0C]/80 backdrop-blur-2xl border-b border-white/5 px-6 md:px-12 py-4">
        <div className="max-w-full mx-auto flex justify-between items-center">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {['todos', 'handicraft', 'physical', 'digital'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                  filtroCategoria === cat ? 'bg-[#A855F7] text-white border-[#A855F7]' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'
                }`}
              >
                {cat === 'todos' ? 'Ver Todo' : cat === 'handicraft' ? 'Artesanías' : cat === 'physical' ? 'Físico' : 'Digital'}
              </button>
            ))}
          </div>
          
          <button onClick={() => setIsCartOpen(true)} className="relative bg-[#111] p-3 rounded-xl border border-white/10 hover:border-[#A855F7] transition-all">
            <ShoppingBag size={20} />
            {carrito.length > 0 && <span className="absolute -top-1 -right-1 bg-[#A855F7] text-white text-[8px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg">{carrito.length}</span>}
          </button>
        </div>
      </div>

      <main className="flex-1 px-6 md:px-12 py-12">
        {cargando ? (
          <div className="py-40 flex justify-center"><div className="w-10 h-10 border-t-2 border-[#A855F7] animate-spin rounded-full"></div></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filtrados.map((prod) => (
              <div 
                key={prod.id} 
                onClick={() => setProductoSeleccionado(prod)} 
                className="group flex flex-col bg-[#111]/40 border border-white/5 rounded-[32px] overflow-hidden transition-all hover:border-[#A855F7]/40 hover:-translate-y-2 shadow-2xl cursor-pointer"
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-black">
                  <img 
                    src={`http://localhost:8000/storage/${prod.main_image}`} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                    alt={prod.name} 
                  />
                  <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[#A855F7] font-black text-xs">
                    ${Number(prod.price).toLocaleString()}
                  </div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black to-transparent">
                    <button 
                      onClick={(e) => agregarAlCarrito(prod, e)}
                      className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#A855F7] hover:text-white transition-all shadow-xl"
                    >
                      Añadir al Carrito
                    </button>
                  </div>
                </div>

                <div className="p-6 text-left space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-serif italic font-black uppercase leading-tight truncate pr-4">{prod.name}</h3>
                    <ArrowUpRight size={18} className="text-gray-800 flex-shrink-0" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">{prod.product_type}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm ${prod.stock_quantity > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      Stock: {prod.stock_quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && filtrados.length === 0 && (
          <div className="py-40 text-center opacity-30 flex flex-col items-center">
            <Grid size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No se encontraron piezas en esta categoría</p>
          </div>
        )}
      </main>

      {/* --- MODAL DE DETALLES DEL PRODUCTO --- */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#111] border border-white/10 rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col md:flex-row shadow-2xl relative">
            
            <button 
              onClick={() => setProductoSeleccionado(null)} 
              className="absolute top-6 right-6 z-10 p-3 bg-black/60 backdrop-blur-md text-white rounded-full border border-white/10 hover:bg-red-500 transition-all"
            >
              <X size={20}/>
            </button>

            <div className="md:w-1/2 bg-black flex items-center justify-center min-h-[300px] md:min-h-full p-10">
              <img 
                src={`http://localhost:8000/storage/${productoSeleccionado.main_image}`} 
                className="w-full h-auto max-h-[70vh] object-contain rounded-2xl shadow-2xl" 
                alt={productoSeleccionado.name} 
              />
            </div>

            <div className="md:w-1/2 p-8 md:p-14 flex flex-col text-left">
              <div className="flex-1 space-y-6">
                <div>
                  <span className="inline-block px-3 py-1 mb-4 rounded-full border border-[#A855F7]/30 text-[#A855F7] text-[9px] font-black uppercase tracking-widest bg-[#A855F7]/10">
                    {productoSeleccionado.product_type}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-serif italic font-black uppercase tracking-tighter leading-none mb-2">
                    {productoSeleccionado.name}
                  </h2>
                  <p className="text-3xl font-black text-[#A855F7] italic">
                    ${Number(productoSeleccionado.price).toLocaleString()} <span className="text-sm text-gray-500 font-sans not-italic">COP</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sobre la Obra</h4>
                  <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-white/10 pl-4">
                    {productoSeleccionado.description || 'Esta pieza no cuenta con descripción adicional.'}
                  </p>
                </div>

                <div className="mt-8 bg-[#1a1a1c] border border-white/5 rounded-[24px] p-6 shadow-inner">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest mb-4">
                    <User size={14} className="text-[#A855F7]" /> Maestro Artesano
                  </h4>
                  <div className="space-y-4">
                    <p className="text-lg font-black italic">{productoSeleccionado.user?.name || 'Artista Caucano'}</p>
                    
                    <div className="flex gap-4">
                      <button 
                        onClick={() => contactarPorObra(productoSeleccionado)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                      >
                        <Phone size={14} /> Consultar Disponibilidad
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <button 
                  onClick={(e) => agregarAlCarrito(productoSeleccionado, e)}
                  disabled={productoSeleccionado.stock_quantity <= 0}
                  className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all shadow-xl ${
                    productoSeleccionado.stock_quantity > 0 
                    ? 'bg-[#A855F7] text-white hover:bg-[#9333ea]' 
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {productoSeleccionado.stock_quantity > 0 ? 'Añadir a Mi Bolsa' : 'Agotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BOLSA DE COMPRAS (CARRITO) --- */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-[#0A0A0C] z-[100] border-l border-white/10 shadow-2xl transition-transform duration-700 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-10 text-left">
          <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
            <h2 className="text-3xl font-serif italic font-black uppercase tracking-tighter">Mi <span className="text-[#A855F7]">Bolsa</span></h2>
            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
            {carrito.map(item => (
              <div key={item.id} className="flex gap-5 bg-white/5 p-4 rounded-3xl border border-white/5">
                <img src={`http://localhost:8000/storage/${item.main_image}`} className="w-20 h-20 object-cover rounded-2xl" />
                <div className="flex-1 space-y-1">
                  <h4 className="font-black uppercase text-[10px] tracking-widest">{item.name}</h4>
                  <p className="text-[9px] text-gray-500 uppercase font-black truncate">De: {item.user?.name || 'Artista'}</p>
                  <p className="text-xl font-black text-[#A855F7] italic">${Number(item.price).toLocaleString()}</p>
                  <button onClick={() => setCarrito(carrito.filter(i => i.id !== item.id))} className="text-red-500/40 hover:text-red-500 text-[8px] font-black uppercase">Quitar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/5 space-y-6">
            <div className="flex justify-between text-2xl font-black italic uppercase tracking-tighter">
              <span>Total</span>
              <span className="text-[#A855F7]">${carrito.reduce((acc, i) => acc + (i.price * i.cantidad), 0).toLocaleString()}</span>
            </div>
            
            {/* BOTÓN CENTRALIZADO DE PAGO */}
            <div className="space-y-3">
              <button 
                onClick={procesarPagoCentralizado}
                className="w-full bg-[#A855F7] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-[#9333ea] transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Comprar Vía WhatsApp
              </button>
              <div className="flex items-center justify-center gap-2 text-green-500/80">
                <CheckCircle2 size={12} />
                <p className="text-[8px] font-black uppercase tracking-widest">
                  Pago seguro garantizado por Popayán Cultural
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Tienda;