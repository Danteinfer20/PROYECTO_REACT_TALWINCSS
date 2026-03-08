import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Heart, Eye, Edit3, Trash2, 
  Upload, X, ImageIcon, FileText, Sparkles, Activity, Palette, PlusCircle,
  ShoppingBag, Store, Tag, DollarSign, Package, CheckCircle2, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const ArtistDashboard = ({ user, seccionActiva }) => {
  const [activeTab, setActiveTab] = useState(seccionActiva || 'escritorio'); 
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // --- ESTADOS DE OBRAS ---
  const [obras, setObras] = useState([]);
  const [stats, setStats] = useState({ vistas: 0, favoritos: 0, total: 0 });
  const [formDataObra, setFormDataObra] = useState({ title: '', category_id: '1', content: '', status: 'published' });
  const [editandoId, setEditandoId] = useState(null);

  // --- ESTADOS DE TIENDA (PRODUCTOS - CORREGIDOS PARA SQL) ---
  const [productos, setProductos] = useState([]);
  const [modoCrearProducto, setModoCrearProducto] = useState(false);
  const [formDataProducto, setFormDataProducto] = useState({
    name: '', category_id: '1', description: '', price: '', stock_quantity: '1', product_type: 'handicraft'
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Sincronización de pestañas y reseteo de estados de edición
  useEffect(() => {
    if (seccionActiva) {
      setActiveTab(seccionActiva);
      setModoCrearProducto(false);
      setEditandoId(null);
      setFile(null);
      setPreview(null);
    }
  }, [seccionActiva]);

  // Carga de datos iniciales
  useEffect(() => {
    if (user?.id) {
      cargarDatos();
      cargarProductos();
    }
  }, [user]);

  const mostrarAlerta = (texto, tipo = 'success') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 4000);
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/v1/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const misObrasData = res.data.data.filter(o => Number(o.user_id) === Number(user?.id));
      setObras(misObrasData);
      setStats({
        vistas: misObrasData.reduce((acc, curr) => acc + (curr.view_count || 0), 0),
        favoritos: misObrasData.reduce((acc, curr) => acc + (curr.reactions_count || curr.saved_count || 0), 0),
        total: misObrasData.filter(o => o.status === 'published').length
      });
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8000/api/v1/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const misProds = res.data.filter(p => Number(p.user_id) === Number(user?.id));
      setProductos(misProds);
    } catch (error) { console.error("Error productos:", error); }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const eliminarObra = async (id) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta obra permanentemente?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/v1/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mostrarAlerta("Obra eliminada del catálogo", "error");
      cargarDatos();
    } catch (error) { mostrarAlerta("No se pudo eliminar la obra", "error"); }
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Deseas retirar este producto de la tienda?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      mostrarAlerta("Producto retirado con éxito", "error");
      cargarProductos();
    } catch (error) { mostrarAlerta("Error al retirar producto", "error"); }
  };

  const handleSaveObra = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formDataObra).forEach(key => data.append(key, formDataObra[key]));
    data.append('content_type_id', '1'); 
    if (file) data.append('image', file);
    if (editandoId) data.append('_method', 'PUT');

    try {
      const token = localStorage.getItem('token');
      const url = editandoId ? `http://localhost:8000/api/v1/posts/${editandoId}` : 'http://localhost:8000/api/v1/posts';
      await axios.post(url, data, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
      mostrarAlerta(formDataObra.status === 'draft' ? "📝 Borrador guardado" : "🚀 ¡Obra publicada con éxito!");
      setEditandoId(null); setPreview(null); setFile(null);
      await cargarDatos();
      setActiveTab(formDataObra.status === 'draft' ? 'borradores' : 'galeria');
    } catch (error) { mostrarAlerta("Error al procesar la obra", "error"); } finally { setLoading(false); }
  };

  const handleSaveProducto = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // CORRECCIÓN: Nombres de campos exactos según tu tabla SQL, ordenados correctamente
    const data = new FormData();
    data.append('name', formDataProducto.name);
    data.append('description', formDataProducto.description);
    data.append('price', formDataProducto.price);
    data.append('stock_quantity', formDataProducto.stock_quantity); 
    data.append('product_type', formDataProducto.product_type);
    data.append('category_id', formDataProducto.category_id || '1');
    
    if (file) {
      data.append('main_image', file); // <-- Laravel espera main_image
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/v1/products', data, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      mostrarAlerta("✅ Producto disponible en la tienda oficial");
      setModoCrearProducto(false);
      setFile(null); setPreview(null);
      setFormDataProducto({ name: '', category_id: '1', description: '', price: '', stock_quantity: '1', product_type: 'handicraft' });
      cargarProductos();
    } catch (error) { 
      console.error("ERROR COMPLETO:", error.response);
      setLoading(false);
      // Capturamos el ERROR_REAL que nos mandó el controlador de Laravel
      const errorSecreto = error.response?.data?.ERROR_REAL || error.response?.data?.message || "Error en base de datos";
      // Lanzamos la alerta para saber qué pasa
      alert("🚨 ALERTA DE SISTEMA:\n\n" + errorSecreto); 
    }
  };

  const prepararEdicion = (obra) => {
    setEditandoId(obra.id);
    setFormDataObra({
      title: obra.title, category_id: obra.category_id.toString(),
      content: obra.content, status: obra.status
    });
    if (obra.media?.[0]?.file_path) {
      const path = obra.media[0].file_path;
      setPreview(path.startsWith('http') ? path : `http://localhost:8000/storage/${path}`);
    }
    setActiveTab('crear');
  };

  if (!user) return null;

  const publicadas = obras.filter(o => o.status === 'published');
  const borradores = obras.filter(o => o.status === 'draft');
  const totalObras = obras.length;

  return (
    <div className="p-8 lg:p-12 max-w-[1400px] mx-auto w-full text-left">
      
      {/* --- NOTIFICACIONES (TOASTS) --- */}
      {mensaje.texto && (
        <div className={`fixed top-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-500 ${mensaje.tipo === 'error' ? 'bg-red-500' : 'bg-[#a855f7]'} text-white font-black uppercase text-[10px] tracking-widest`}>
          {mensaje.tipo === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {mensaje.texto}
        </div>
      )}

      {/* HEADER DINÁMICO */}
      <header className="mb-10 text-left relative text-left">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#a855f7] rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse pointer-events-none"></div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white relative z-10">
          Mi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#ec4899]">Estudio</span>
        </h1>
        <div className="flex items-center gap-3 mt-3 relative z-10 text-gray-400">
          <span className="h-[2px] w-8 bg-gradient-to-r from-[#a855f7] to-[#ec4899]"></span>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Gestión Creativa y Comercial</p>
        </div>
      </header>

      {/* --- VISTA 1: ESCRITORIO (MI TALLER - INTACTO) --- */}
      {activeTab === 'escritorio' && (
        <div className="space-y-8 animate-in fade-in duration-500 w-full text-left">
          <div className="bg-gradient-to-br from-[#111] to-[#1a1a1c] border border-white/5 p-8 md:p-12 rounded-[30px] flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl">
            <div className="space-y-4 relative z-10 text-left w-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#a855f7] text-[9px] font-black uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-ping"></span>
                Sincronizado con Popayán Cultural
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-purple-400">{user?.name}</span>
              </h2>
              <p className="text-gray-400 text-xs mt-2 max-w-sm leading-relaxed font-medium">Analiza el rendimiento de tus obras, descubre qué está gustando en la ciudad y gestiona tu catálogo.</p>
            </div>
            <Sparkles size={140} className="text-white/5 absolute -right-4 -bottom-4 z-0" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-[#111] border border-white/5 p-6 rounded-[24px]">
              <div className="flex items-center gap-2 mb-4 text-[#a855f7]"><Eye size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Vistas</span></div>
              <h4 className="text-4xl md:text-5xl font-black text-white">{stats.vistas}</h4>
            </div>
            <div className="bg-[#111] border border-white/5 p-6 rounded-[24px]">
              <div className="flex items-center gap-2 mb-4 text-pink-500"><Heart size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Favoritos</span></div>
              <h4 className="text-4xl md:text-5xl font-black text-white">{stats.favoritos}</h4>
            </div>
            <div className="bg-[#111] border border-white/5 p-6 rounded-[24px]">
              <div className="flex items-center gap-2 mb-4 text-blue-500"><Palette size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Públicas</span></div>
              <h4 className="text-4xl md:text-5xl font-black text-white">{publicadas.length}</h4>
            </div>
            <div className="bg-[#111] border border-white/5 p-6 rounded-[24px]">
              <div className="flex items-center gap-2 mb-4 text-green-500"><ShoppingBag size={20}/><span className="text-[10px] font-black uppercase tracking-widest">Tienda</span></div>
              <h4 className="text-4xl md:text-5xl font-black text-white">{productos.length}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            <div className="lg:col-span-2 bg-[#111] border border-white/5 p-8 rounded-[30px] shadow-lg text-left">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white mb-10"><Activity size={18} className="text-[#a855f7]" /> Impacto Reciente</h3>
              <div className="h-48 flex items-end gap-3 md:gap-6">
                {[40, 70, 55, 90, 65, 100].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                    <div className="w-full bg-[#1a1a1c] rounded-t-2xl relative overflow-hidden h-full flex items-end">
                      <div className="w-full bg-gradient-to-t from-[#a855f7]/40 to-[#a855f7] rounded-t-2xl group-hover:from-pink-500 transition-all duration-500" style={{ height: `${height}%` }}></div>
                    </div>
                    <span className="text-[9px] font-black text-gray-500">MES {i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 p-8 rounded-[30px] shadow-lg flex flex-col text-left">
              <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 text-left">Estado del Taller</h3>
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Finalizadas</span>
                    <span className="text-blue-400">{publicadas.length}</span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1c] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{width: `${(publicadas.length / (totalObras || 1)) * 100}%`}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Borradores</span>
                    <span className="text-orange-400">{borradores.length}</span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1c] rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{width: `${(borradores.length / (totalObras || 1)) * 100}%`}}></div>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('crear')} className="w-full mt-8 py-4 rounded-xl border-2 border-dashed border-[#a855f7]/30 text-[#a855f7] text-[10px] font-black uppercase tracking-widest hover:bg-[#a855f7] hover:text-white transition-all flex items-center justify-center gap-2 group">
                <PlusCircle size={16} className="group-hover:rotate-90 transition-all" /> Nuevo Proyecto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VISTA 2: TIENDA OFICIAL (CORREGIDA) --- */}
      {activeTab === 'tienda' && (
        <div className="space-y-8 animate-in fade-in duration-500 text-left">
          <div className="flex justify-between items-end">
            <div className="text-left">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mi <span className="text-green-500">Tienda</span></h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-left">Sincronizado con la base de datos de productos</p>
            </div>
            <button onClick={() => setModoCrearProducto(!modoCrearProducto)} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${modoCrearProducto ? 'bg-white text-black' : 'bg-[#a855f7] text-white'}`}>
              {modoCrearProducto ? 'Cancelar' : 'Añadir a la Tienda'}
            </button>
          </div>

          {modoCrearProducto ? (
            <form onSubmit={handleSaveProducto} className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-[#111] p-10 rounded-[40px] border border-white/5 text-left animate-in slide-in-from-bottom-5">
               <div className="lg:col-span-5 text-left">
                  <div className="aspect-square bg-black border-2 border-dashed border-white/10 rounded-[30px] flex items-center justify-center overflow-hidden relative group hover:border-[#a855f7]/50 transition-all text-left shadow-2xl">
                    {preview ? <><img src={preview} className="w-full h-full object-cover" /><button type="button" onClick={() => {setPreview(null); setFile(null);}} className="absolute top-4 right-4 p-2 bg-red-500 rounded-full text-white"><X size={14}/></button></> : <label className="cursor-pointer flex flex-col items-center"><Upload className="text-gray-500 mb-2"/><span className="text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Foto del Producto</span><input type="file" className="hidden" onChange={handleFileChange}/></label>}
                  </div>
               </div>
               <div className="lg:col-span-7 space-y-6 text-left">
                  <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Nombre</label><input required type="text" value={formDataProducto.name} onChange={e => setFormDataProducto({...formDataProducto, name: e.target.value})} className="w-full p-4 bg-[#1a1a1c] border border-white/5 rounded-2xl text-white outline-none focus:border-[#a855f7]" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Precio (COP)</label><input required type="number" value={formDataProducto.price} onChange={e => setFormDataProducto({...formDataProducto, price: e.target.value})} className="w-full p-4 bg-[#1a1a1c] border border-white/5 rounded-2xl text-white outline-none focus:border-[#a855f7]" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="space-y-2 text-left"><label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Stock Disponible</label><input required type="number" value={formDataProducto.stock_quantity} onChange={e => setFormDataProducto({...formDataProducto, stock_quantity: e.target.value})} className="w-full p-4 bg-[#1a1a1c] border border-white/5 rounded-2xl text-white outline-none focus:border-[#a855f7]" /></div>
                    <div className="space-y-2 text-left"><label className="text-[10px] font-black uppercase text-gray-500 ml-2 tracking-widest">Categoría</label>
                      <select value={formDataProducto.product_type} onChange={e => setFormDataProducto({...formDataProducto, product_type: e.target.value})} className="w-full p-4 bg-[#1a1a1c] border border-white/5 rounded-2xl text-white outline-none appearance-none">
                        <option value="handicraft">Artesanía</option>
                        <option value="physical">Obra Física</option>
                        <option value="digital">Digital</option>
                        <option value="service">Servicio</option>
                      </select>
                    </div>
                  </div>
                  <textarea required rows="4" value={formDataProducto.description} onChange={e => setFormDataProducto({...formDataProducto, description: e.target.value})} className="w-full p-4 bg-[#1a1a1c] border border-white/5 rounded-2xl text-white outline-none resize-none focus:border-[#a855f7]" placeholder="Detalles de materiales, dimensiones..." />
                  <button type="submit" disabled={loading} className="w-full py-5 bg-[#a855f7] text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl hover:bg-[#9333ea] transition-all text-left flex justify-center shadow-xl">
                    {loading ? "Sincronizando..." : "Publicar en Tienda Oficial"}
                  </button>
               </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
              {productos.map(p => (
                <div key={p.id} className="bg-[#111] rounded-[30px] border border-white/5 overflow-hidden group hover:border-[#a855f7]/40 transition-all text-left shadow-lg">
                  <div className="aspect-square relative overflow-hidden">
                    <img src={`http://localhost:8000/storage/${p.main_image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[#a855f7] font-black text-xs">
                      ${Number(p.price).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6 text-left">
                    <h3 className="text-white font-black uppercase text-[11px] tracking-widest truncate">{p.name}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Stock: {p.stock_quantity}</p>
                      <button onClick={() => eliminarProducto(p.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all shadow-md"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- VISTA 3: GALERÍA (Sin cambios) --- */}
      {activeTab === 'galeria' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in w-full text-left">
          {publicadas.map(obra => (
            <div key={obra.id} className="group relative bg-[#111] rounded-[30px] overflow-hidden border border-white/5 hover:border-[#a855f7]/30 transition-all text-left">
              <div className="aspect-[3/4] relative">
                <img src={obra.media?.[0]?.file_path ? (obra.media[0].file_path.startsWith('http') ? obra.media[0].file_path : `http://localhost:8000/storage/${obra.media[0].file_path}`) : '/placeholder.jpg'} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <button onClick={() => prepararEdicion(obra)} className="p-4 bg-white text-black rounded-2xl hover:bg-[#a855f7] hover:text-white transition-all shadow-xl"><Edit3 size={18}/></button>
                  <button onClick={() => eliminarObra(obra.id)} className="p-4 bg-white text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-6 text-left"><h3 className="text-white font-black uppercase text-xs tracking-widest truncate">{obra.title}</h3><p className="text-green-500 text-[8px] font-black uppercase mt-1 tracking-widest">● Obra Pública</p></div>
            </div>
          ))}
        </div>
      )}

      {/* --- VISTA 4: CREAR OBRA (Sin cambios) --- */}
      {activeTab === 'crear' && (
        <form onSubmit={handleSaveObra} className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in slide-in-from-bottom-5 w-full text-left">
          <div className="xl:col-span-5 text-left">
            <div className="relative aspect-[4/5] bg-black border-2 border-dashed border-white/10 rounded-[40px] flex items-center justify-center overflow-hidden hover:border-[#a855f7]/50 transition-all group shadow-2xl">
              {preview ? <><img src={preview} className="w-full h-full object-cover" /><button type="button" onClick={() => {setPreview(null); setFile(null);}} className="absolute top-6 right-6 p-3 bg-black/60 rounded-full text-white hover:bg-red-500 transition-all"><X size={18}/></button></> : <label className="flex flex-col items-center cursor-pointer p-8"><Upload size={40} className="text-gray-700 mb-4 group-hover:text-[#a855f7] transition-colors" /><span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Subir Archivo de Arte</span><input type="file" className="hidden" onChange={handleFileChange} /></label>}
            </div>
          </div>
          <div className="xl:col-span-7 bg-[#111] p-10 rounded-[40px] border border-white/5 space-y-6 text-left shadow-2xl">
            <h2 className="text-white text-4xl font-black uppercase italic tracking-tighter text-left">{editandoId ? 'Editar' : 'Nueva'} <span className="text-[#a855f7]">Obra</span></h2>
            <div className="space-y-2 text-left"><label className="text-[10px] font-black uppercase text-gray-500 ml-3">Título</label><input required type="text" value={formDataObra.title} onChange={(e) => setFormDataObra({...formDataObra, title: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-[20px] text-white outline-none focus:border-[#a855f7]" /></div>
            <div className="grid grid-cols-2 gap-6 text-left">
                <div className="space-y-2 text-left"><label className="text-[10px] font-black uppercase text-gray-500 ml-3">Categoría</label><select value={formDataObra.category_id} onChange={(e) => setFormDataObra({...formDataObra, category_id: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-[20px] text-white outline-none appearance-none"><option value="1">Pintura</option><option value="2">Escultura</option></select></div>
                <div className="space-y-2 text-left"><label className="text-[10px] font-black uppercase text-gray-500 ml-3">Estado</label><select value={formDataObra.status} onChange={(e) => setFormDataObra({...formDataObra, status: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-[#a855f7]/40 rounded-[20px] text-[#a855f7] font-black outline-none appearance-none text-xs uppercase"><option value="published">🚀 Publicar Ahora</option><option value="draft">📝 Guardar Borrador</option></select></div>
            </div>
            <textarea required rows="6" value={formDataObra.content} onChange={(e) => setFormDataObra({...formDataObra, content: e.target.value})} className="w-full p-5 bg-[#1a1a1c] border border-white/5 rounded-[20px] text-white outline-none resize-none focus:border-[#a855f7]" placeholder="Relato..." />
            <button type="submit" disabled={loading} className="w-full bg-[#a855f7] text-white py-5 rounded-[20px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl">{loading ? "Sincronizando..." : "Confirmar Obra"}</button>
          </div>
        </form>
      )}

      {/* --- VISTA 5: BORRADORES (Sin cambios) --- */}
      {activeTab === 'borradores' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in w-full text-left">
          {borradores.map(obra => (
            <div key={obra.id} className="group relative bg-[#111] rounded-[30px] overflow-hidden border border-white/5 transition-all text-left">
              <div className="aspect-[3/4] relative">
                <img src={obra.media?.[0]?.file_path ? (obra.media[0].file_path.startsWith('http') ? obra.media[0].file_path : `http://localhost:8000/storage/${obra.media[0].file_path}`) : '/placeholder.jpg'} className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700" />
                <div className="absolute top-5 right-5 flex flex-col gap-2">
                  <button onClick={() => prepararEdicion(obra)} className="p-4 bg-white text-black rounded-2xl shadow-xl hover:bg-[#a855f7] hover:text-white transition-all"><Edit3 size={18}/></button>
                  <button onClick={() => eliminarObra(obra.id)} className="p-4 bg-white text-red-500 rounded-2xl shadow-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-6 text-left"><h3 className="text-white font-black uppercase text-xs tracking-widest truncate">{obra.title}</h3><p className="text-orange-500 text-[8px] font-black uppercase mt-1 tracking-widest">● Borrador</p></div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ArtistDashboard;