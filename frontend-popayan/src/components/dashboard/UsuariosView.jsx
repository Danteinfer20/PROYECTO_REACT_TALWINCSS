import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, MoreVertical, ShieldAlert, CheckCircle2,
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';

const UsuariosView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 🧭 Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
  // ⚙️ Estados de Acción
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [openMenuId, setOpenMenuId] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data.data || []);
      } catch (e) { 
        showToast("Fallo al sincronizar los usuarios.", "error");
      } finally { 
        setLoading(false); 
      }
    };
    fetchUsers();
  }, []);

  // ⚡ LÓGICA DE FILTRADO Y PAGINACIÓN
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // 🛑 ACCIÓN TÁCTICA: CAMBIAR ESTADO DEL USUARIO
  const handleStatusChange = async (userId, currentStatus, userName) => {
    try {
      setOpenMenuId(null);
      setActionLoading(userId);
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const res = await axios.patch(`${API_URL}/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        showToast(`Estado de ${userName} actualizado a ${newStatus}.`, 'success');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error al cambiar estado.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      
      {/* 🚀 TOAST SYSTEM */}
      <div className={`fixed top-10 right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-xl border px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} strokeWidth={2}/> : <CheckCircle2 size={16} strokeWidth={2}/>} 
          {toast.message}
        </div>
      </div>

      {/* 🔮 HEADER TÁCTICO */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight">
          Control de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-[#a855f7] to-emerald-400 font-medium">Usuarios</span>
        </h1>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#a855f7] transition-colors" size={16}/>
          <input 
            type="text" 
            placeholder="BUSCAR USUARIO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#111113] border border-white/5 rounded-full py-3 pl-12 pr-6 text-[10px] font-mono tracking-widest text-white focus:outline-none focus:border-[#a855f7]/50 transition-all w-full shadow-inner"
          />
        </div>
      </header>

      {/* 📊 TABLA DE CONTROL */}
      <div className="bg-[#111113] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col">
        
        {loading && (
           <div className="absolute inset-0 bg-[#111113]/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#0A0A0C]/50">
                <th className="p-5 text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] w-[40%]">Usuario</th>
                {/* 🔥 Columna Rol Centrada */}
                <th className="p-5 text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] text-center">Rol</th>
                <th className="p-5 text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em]">Estado</th>
                <th className="p-5 text-[9px] font-mono text-gray-500 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {currentUsers.length > 0 ? currentUsers.map(user => (
                <tr key={user.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {/* 🔥 Contenedor del Avatar con resplandor en hover */}
                      <div className="w-10 h-10 rounded-[10px] bg-[#0A0A0C] border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[#a855f7]/40 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-500 relative">
                         {/* 🔥 Imagen con zoom suave */}
                         <img src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=111113&color=ffffff`} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-transform duration-700 ease-out" alt="avatar" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-serif text-white truncate">{user.name}</p>
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* 🔥 Celda Rol Centrada y con colores más vibrantes */}
                  <td className="p-5 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full border ${
                      user.user_type === 'admin' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                      user.user_type === 'artist' ? 'bg-[#a855f7]/10 border-[#a855f7]/30 text-[#a855f7]' :
                      user.user_type === 'cultural_manager' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                      'bg-gray-500/10 border-gray-500/30 text-gray-400'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="p-5">
                     <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                        <span className={`text-[9px] font-mono uppercase tracking-widest ${user.status === 'active' ? 'text-gray-400' : 'text-red-400'}`}>
                          {user.status}
                        </span>
                     </div>
                  </td>
                  <td className="p-5 text-right relative">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === user.id ? null : user.id); }}
                       disabled={actionLoading === user.id}
                       className={`p-2 rounded-lg transition-colors ${openMenuId === user.id ? 'bg-white/10 text-white' : 'text-gray-600 hover:bg-white/5 hover:text-gray-300'} disabled:opacity-50`}
                     >
                        {actionLoading === user.id ? <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div> : <MoreVertical size={16}/>}
                     </button>

                     {openMenuId === user.id && (
                        <div className="absolute right-8 top-10 w-48 bg-[#0A0A0C] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                           {user.status === 'active' ? (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'active', user.name)}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-red-400 hover:bg-red-500/10 transition-colors"
                             >
                               <ShieldAlert size={14}/> Suspender Cuenta
                             </button>
                           ) : (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'suspended', user.name)}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                             >
                               <CheckCircle2 size={14}/> Activar Cuenta
                             </button>
                           )}
                        </div>
                     )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <Search className="mx-auto text-gray-700 mb-3" size={24}/>
                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-[0.2em]">Ningún usuario coincide con la búsqueda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🧭 PAGINACIÓN */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-[#0A0A0C]/50 border-t border-white/5 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
            <p className="text-gray-500 font-mono text-[9px] uppercase tracking-[0.2em]">
              Mostrando <span className="text-white font-bold">{indexOfFirstUser + 1}</span> a <span className="text-white font-bold">{Math.min(indexOfLastUser, filteredUsers.length)}</span> de <span className="text-[#a855f7] font-bold">{filteredUsers.length}</span> usuarios
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#111113] border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-[#111113] transition-all"
              >
                <ChevronLeft size={14}/>
              </button>
              
              <span className="px-4 text-[10px] font-mono font-bold text-gray-400">
                PÁGINA {currentPage} <span className="opacity-50">/ {totalPages}</span>
              </span>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#111113] border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-[#111113] transition-all"
              >
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default UsuariosView;