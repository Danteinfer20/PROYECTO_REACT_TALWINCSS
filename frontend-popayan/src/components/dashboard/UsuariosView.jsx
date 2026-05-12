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
  
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  
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
  }, [API_URL, token]);

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10 w-full h-full p-6 md:p-12 transition-colors duration-500">
      
      {/* 🚀 TOAST SYSTEM */}
      <div className={`fixed top-10 right-10 z-[100] transition-all duration-500 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}>
        <div className={`backdrop-blur-xl border px-6 py-4 rounded-xl shadow-lg flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-[rgb(var(--role-accent))]/10 border-[rgb(var(--role-accent))]/30 text-[rgb(var(--role-accent))]'}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} strokeWidth={2}/> : <CheckCircle2 size={16} strokeWidth={2}/>} 
          {toast.message}
        </div>
      </div>

      {/* 🔮 HEADER TÁCTICO */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-heading)] tracking-tight transition-colors">
          Control de <span className="text-[rgb(var(--role-accent))] italic">Usuarios</span>
        </h1>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-body)] group-focus-within:text-[rgb(var(--role-accent))] transition-colors" size={16}/>
          <input 
            type="text" 
            placeholder="BUSCAR USUARIO..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-full py-3 pl-12 pr-6 text-[10px] font-mono tracking-widest text-[var(--text-heading)] focus:outline-none focus:border-[rgb(var(--role-accent))]/50 transition-all w-full shadow-inner placeholder:text-[var(--text-body)]/60"
          />
        </div>
      </header>

      {/* 📊 TABLA DE CONTROL */}
      <div className="bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[30px] overflow-hidden shadow-sm relative min-h-[400px] flex flex-col transition-colors duration-500">
        
        {loading && (
           <div className="absolute inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center transition-colors">
              <div className="w-8 h-8 border-2 border-[rgb(var(--role-accent))] border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--text-heading)]/5 transition-colors">
                <th className="p-5 text-[9px] font-mono text-[var(--text-body)] uppercase tracking-[0.2em] w-[40%]">Usuario</th>
                <th className="p-5 text-[9px] font-mono text-[var(--text-body)] uppercase tracking-[0.2em] text-center">Rol</th>
                <th className="p-5 text-[9px] font-mono text-[var(--text-body)] uppercase tracking-[0.2em]">Estado</th>
                <th className="p-5 text-[9px] font-mono text-[var(--text-body)] uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {currentUsers.length > 0 ? currentUsers.map(user => (
                <tr key={user.id} className="hover:bg-[var(--text-heading)]/[0.03] transition-all duration-300 group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[rgb(var(--role-accent))]/40 group-hover:shadow-[0_0_15px_rgba(var(--role-accent),0.2)] transition-all duration-500 relative">
                         <img src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.name}&background=050505&color=ffffff`} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-transform duration-700 ease-out" alt="avatar" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--text-heading)] truncate transition-colors">{user.name}</p>
                        <p className="text-[9px] font-mono text-[var(--text-body)] uppercase tracking-widest truncate transition-colors">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* 🔥 CROMÁTICA MATEMÁTICA DE ROLES EN LA TABLA */}
                  <td className="p-5 text-center">
                    <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full border ${
                      user.user_type === 'admin' ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' :
                      user.user_type === 'artist' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
                      user.user_type === 'cultural_manager' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                      user.user_type === 'educator' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                      'bg-purple-500/10 border-purple-500/30 text-purple-500'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  
                  <td className="p-5">
                     <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></span>
                        <span className={`text-[9px] font-mono uppercase tracking-widest ${user.status === 'active' ? 'text-[var(--text-body)]' : 'text-red-500'}`}>
                          {user.status}
                        </span>
                     </div>
                  </td>
                  
                  <td className="p-5 text-right relative">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === user.id ? null : user.id); }}
                       disabled={actionLoading === user.id}
                       className={`p-2 rounded-lg transition-colors ${openMenuId === user.id ? 'bg-[var(--text-heading)]/10 text-[var(--text-heading)]' : 'text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)]'} disabled:opacity-50`}
                     >
                        {actionLoading === user.id ? <div className="w-4 h-4 border-2 border-[rgb(var(--role-accent))] border-t-transparent rounded-full animate-spin"></div> : <MoreVertical size={16}/>}
                     </button>

                     {openMenuId === user.id && (
                        <div className="absolute right-8 top-10 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 transition-colors duration-500">
                           {user.status === 'active' ? (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'active', user.name)}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-colors"
                             >
                               <ShieldAlert size={14}/> Suspender Cuenta
                             </button>
                           ) : (
                             <button 
                               onClick={() => handleStatusChange(user.id, 'suspended', user.name)}
                               className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[10px] font-mono uppercase tracking-widest text-emerald-500 hover:bg-emerald-500/10 transition-colors"
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
                    <Search className="mx-auto text-[var(--text-body)] opacity-50 mb-3" size={24}/>
                    <p className="font-mono text-[10px] text-[var(--text-body)] uppercase tracking-[0.2em]">Ningún usuario coincide con la búsqueda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🧭 PAGINACIÓN */}
        {!loading && filteredUsers.length > 0 && (
          <div className="bg-[var(--bg-primary)]/50 border-t border-[var(--border-color)] p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto transition-colors duration-500">
            <p className="text-[var(--text-body)] font-mono text-[9px] uppercase tracking-[0.2em]">
              Mostrando <span className="text-[var(--text-heading)] font-bold">{indexOfFirstUser + 1}</span> a <span className="text-[var(--text-heading)] font-bold">{Math.min(indexOfLastUser, filteredUsers.length)}</span> de <span className="text-[rgb(var(--role-accent))] font-bold">{filteredUsers.length}</span> usuarios
            </p>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)] disabled:opacity-30 disabled:hover:bg-[var(--bg-card)] transition-all"
              >
                <ChevronLeft size={14}/>
              </button>
              
              <span className="px-4 text-[10px] font-mono font-bold text-[var(--text-body)]">
                PÁGINA {currentPage} <span className="opacity-50">/ {totalPages}</span>
              </span>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-body)] hover:bg-[var(--text-heading)]/5 hover:text-[var(--text-heading)] disabled:opacity-30 disabled:hover:bg-[var(--bg-card)] transition-all"
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