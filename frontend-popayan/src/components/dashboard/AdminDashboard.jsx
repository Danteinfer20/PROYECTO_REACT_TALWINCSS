import React from 'react';
import { 
  Shield, Users, DollarSign, Palette, 
  AlertTriangle, CheckCircle, Ban, Settings, 
  Activity, ArrowUpRight 
} from 'lucide-react';

const AdminDashboard = ({ user }) => {
  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER TÉCNICO */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Centro de <span className="text-blue-500">Comando</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 border-l-2 border-blue-500 pl-4">
            Administración de Plataforma | Popayán Cultural
          </p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Estado del Sistema</span>
          <span className="text-green-500 font-bold flex items-center gap-2 justify-end">
            <Activity size={14} /> Operacional
          </span>
        </div>
      </header>

      {/* 1. KPIs GLOBALES (Basados en user_statistics) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[#111] p-6 rounded-[24px] border border-white/5 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Users size={50} /></div>
          <h4 className="text-3xl font-black text-white">1,240</h4>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Usuarios Totales</p>
          <div className="flex items-center gap-1 text-[9px] text-green-500 mt-4 font-bold">
            <ArrowUpRight size={10} /> +12% este mes
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-[24px] border border-white/5 relative overflow-hidden group hover:border-green-500/50 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign size={50} /></div>
          <h4 className="text-3xl font-black text-white">$45.2M</h4>
          <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest mt-1">Ventas Globales</p>
          <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[70%]"></div>
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-[24px] border border-white/5 relative overflow-hidden group hover:border-[#a855f7]/50 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Palette size={50} /></div>
          <h4 className="text-3xl font-black text-white">850</h4>
          <p className="text-[10px] text-[#a855f7] font-bold uppercase tracking-widest mt-1">Obras Activas</p>
          <div className="flex items-center gap-1 text-[9px] text-gray-500 mt-4 font-bold italic">
            Promedio 4.8/5.0
          </div>
        </div>

        <div className="bg-[#111] p-6 rounded-[24px] border border-white/5 relative overflow-hidden group hover:border-red-500/50 transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><AlertTriangle size={50} /></div>
          <h4 className="text-3xl font-black text-white">3</h4>
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Alertas / Reportes</p>
          <div className="animate-pulse flex items-center gap-1 text-[9px] text-red-400 mt-4 font-bold">
             Acción requerida
          </div>
        </div>
      </div>

      {/* 2. TABLA DE GESTIÓN (Tabla users de tu DB) */}
      <div className="bg-[#111] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-transparent">
          <h3 className="text-xl font-black text-white uppercase flex items-center gap-3 italic">
            <Shield className="text-blue-500" size={20}/> Auditoría de Cuentas
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Exportar CSV</button>
            <button className="px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">Ver Logs</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 text-[9px] uppercase border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 font-black tracking-[0.2em]">Identidad</th>
                <th className="p-6 font-black tracking-[0.2em]">Rol Asignado</th>
                <th className="p-6 font-black tracking-[0.2em]">Estado</th>
                <th className="p-6 font-black tracking-[0.2em] text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-black text-xs">MO</div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-blue-400 transition-colors">Maestro Ordoñez</span>
                      <span className="text-[10px] text-gray-500 font-medium">m.ordonez@popayan.co</span>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-[#a855f7]/10 text-[#a855f7] px-3 py-1 rounded-full text-[9px] font-black uppercase border border-[#a855f7]/20">Artesano</span>
                </td>
                <td className="p-6">
                  <span className="text-green-500 font-black text-[10px] flex items-center gap-1 uppercase tracking-tighter italic">
                    <CheckCircle size={12}/> Verificado
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors" title="Editar"><Settings size={16}/></button>
                    <button className="p-2 text-gray-500 hover:text-red-500 transition-colors" title="Bloquear"><Ban size={16}/></button>
                  </div>
                </td>
              </tr>
              {/* Más filas se cargarían dinámicamente aquí */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;