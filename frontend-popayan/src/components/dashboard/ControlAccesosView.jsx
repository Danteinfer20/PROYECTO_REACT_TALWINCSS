import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { 
  Scan, ShieldCheck, ShieldAlert, 
  User, Calendar, Clock, RefreshCw,
  Camera, Zap, Activity, Globe, Info
} from 'lucide-react';

const ControlAccesosView = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendeeData, setAttendeeData] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

  // 🔥 MOTOR DE ACENTO DINÁMICO (Heredado del Dashboard)
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
      default: return '168 85 247';
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 25,
      qrbox: { width: 280, height: 280 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0]
    });

    scanner.render(onScanSuccess, onScanError);

    function onScanSuccess(decodedText) {
      if (!isProcessing) {
        validarAcceso(decodedText);
        scanner.clear();
      }
    }

    function onScanError(err) { /* Manejo silencioso */ }

    return () => {
      scanner.clear().catch(error => console.error("Hardware Release Error", error));
    };
  }, []);

  const validarAcceso = async (hash) => {
    try {
      setIsProcessing(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/events/check-in`, 
        { qr_hash: hash },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setScanResult('success');
        setAttendeeData(response.data.data);
      }
    } catch (err) {
      setScanResult('error');
      setError(err.response?.data?.message || "Protocolo de seguridad: Código no reconocido.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    // 🔥 INYECCIÓN CROMÁTICA GLOBAL
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="p-8 lg:p-14 w-full max-w-[1600px] animate-in fade-in zoom-in-95 duration-700 transition-colors duration-500">
      
      {/* 🟢 HEADER TÁCTICO */}
      <header className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border-color)] pb-10 transition-colors">
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse shadow-[0_0_10px_rgba(var(--role-accent),0.6)]"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[rgb(var(--role-accent))]/60">Sistema de Puerta Activo</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold italic uppercase tracking-tighter text-[var(--text-heading)] transition-colors">
            Control de <span className="text-[rgb(var(--role-accent))]">Accesos</span>
          </h2>
          <p className="text-[var(--text-body)] text-[11px] font-mono uppercase tracking-[0.2em] mt-3 opacity-70">Terminal de validación Popayán Cultural v2.4</p>
        </div>

        <div className="flex items-center gap-8 bg-[var(--bg-container)] border border-[var(--border-color)] p-6 rounded-[30px] backdrop-blur-md shadow-sm transition-colors">
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-[var(--text-body)] opacity-50 uppercase tracking-widest">Estado Servidor</span>
                <span className="text-xs font-bold text-emerald-500 uppercase">Sincronizado</span>
            </div>
            <div className="w-[1px] h-10 bg-[var(--border-color)]"></div>
            <Globe size={24} className="text-[var(--text-body)] opacity-40" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* 📷 LADO IZQUIERDO: VISOR */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="relative group">
            <div className={`absolute -inset-4 rounded-[60px] blur-3xl transition-opacity duration-1000 ${
              scanResult === 'success' ? 'bg-emerald-500/10' : 
              scanResult === 'error' ? 'bg-red-500/10' : 'bg-[rgb(var(--role-accent))]/5'
            }`}></div>
            
            <div className="relative bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[50px] p-6 shadow-sm overflow-hidden transition-colors">
              <div className="absolute top-10 left-10 z-20 flex flex-col gap-1">
                <span className="text-[7px] font-black text-[var(--text-body)] opacity-30 uppercase tracking-[0.3em]">Hardware ID</span>
                <span className="text-[9px] font-mono text-[rgb(var(--role-accent))]/50 uppercase">POP-CAM-01</span>
              </div>

              <div id="reader" className="relative z-0 overflow-hidden rounded-[40px] border border-[var(--border-color)] bg-black aspect-square shadow-inner">
                <style>{`
                  #html5-qrcode-button-camera-permission, #html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop {
                    background: rgb(${getRoleAccentRGB()}) !important;
                    color: white !important;
                    border: none !important;
                    border-radius: 20px !important;
                    padding: 12px 24px !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 2px !important;
                    cursor: pointer !important;
                    transition: all 0.3s !important;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
                  }
                  #html5-qrcode-button-camera-permission:hover {
                    opacity: 0.9 !important;
                    transform: scale(1.05) !important;
                  }
                `}</style>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full py-6 bg-[var(--bg-container)] border border-[var(--border-color)] hover:border-[rgb(var(--role-accent))] text-[var(--text-heading)] rounded-[30px] font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-4 shadow-sm active:scale-95"
          >
            <RefreshCw size={16} /> Reiniciar Sistema Óptico
          </button>
        </div>

        {/* 🧠 LADO DERECHO: DATOS */}
        <div className="lg:col-span-7">
          <div className="h-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[55px] overflow-hidden relative shadow-inner transition-colors duration-500">
            
            {!scanResult && !isProcessing && (
              <div className="h-full p-12 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full border border-[var(--border-color)] flex items-center justify-center mb-10 relative shadow-inner bg-[var(--bg-primary)]">
                        <div className="absolute inset-0 border-2 border-[rgb(var(--role-accent))]/20 rounded-full animate-ping"></div>
                        <Scan size={50} className="text-[var(--text-body)] opacity-20" />
                    </div>
                    <h3 className="text-3xl font-bold italic text-[var(--text-body)] opacity-40 uppercase tracking-tighter mb-4 transition-colors">Esperando Señal...</h3>
                    <p className="text-[10px] font-mono text-[var(--text-body)] opacity-50 uppercase tracking-[0.5em] leading-relaxed max-w-xs transition-colors">Alinee el código QR del asistente con el visor</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-10 border-t border-[var(--border-color)] transition-colors">
                    <div className="p-5 rounded-[30px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col gap-3 shadow-inner transition-colors">
                        <Zap size={18} className="text-[rgb(var(--role-accent))]/40" />
                        <div>
                            <p className="text-[7px] font-black text-[var(--text-body)] opacity-50 uppercase tracking-widest">Latencia</p>
                            <p className="text-xs font-bold text-[var(--text-heading)] uppercase transition-colors">14ms</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-[30px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col gap-3 shadow-inner transition-colors">
                        <Activity size={18} className="text-[rgb(var(--role-accent))]/40" />
                        <div>
                            <p className="text-[7px] font-black text-[var(--text-body)] opacity-50 uppercase tracking-widest">Cifrado</p>
                            <p className="text-xs font-bold text-[var(--text-heading)] uppercase transition-colors">AES-256</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-[30px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex flex-col gap-3 shadow-inner transition-colors">
                        <ShieldCheck size={18} className="text-[rgb(var(--role-accent))]/40" />
                        <div>
                            <p className="text-[7px] font-black text-[var(--text-body)] opacity-50 uppercase tracking-widest">Protocolo</p>
                            <p className="text-xs font-bold text-[var(--text-heading)] uppercase transition-colors">V-Sec</p>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="h-full flex flex-col items-center justify-center p-20 bg-gradient-to-b from-[rgb(var(--role-accent))]/5 to-transparent transition-colors">
                <div className="relative w-32 h-32 mb-12">
                    <div className="absolute inset-0 border-b-4 border-[rgb(var(--role-accent))] rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-t-2 border-[rgb(var(--role-accent))]/30 rounded-full animate-[spin_2s_linear_infinite]"></div>
                </div>
                <p className="text-sm font-mono text-[rgb(var(--role-accent))] uppercase tracking-[0.8em] animate-pulse">Autenticando Pase...</p>
              </div>
            )}

            {scanResult === 'success' && attendeeData && (
              <div className="h-full p-12 flex flex-col bg-gradient-to-br from-emerald-500/[0.08] to-transparent animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex justify-between items-start mb-14">
                    <div className="flex flex-col gap-2">
                        <span className="px-5 py-2 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.3em] w-fit shadow-md">Acceso Autorizado</span>
                        <span className="text-[10px] font-mono text-emerald-500/50 uppercase ml-2 tracking-widest transition-colors">Check-in ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                    <ShieldCheck size={60} className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" strokeWidth={1.5} />
                </div>

                <div className="flex-1 space-y-12">
                    <div>
                        <label className="text-[10px] font-black text-[var(--text-body)] opacity-40 uppercase tracking-[0.4em] block mb-4 transition-colors">Identidad del Asistente</label>
                        <h4 className="text-6xl md:text-7xl font-bold text-[var(--text-heading)] tracking-tighter italic uppercase leading-tight transition-colors">{attendeeData.attendee_name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-12 border-t border-[var(--border-color)] pt-12 transition-colors">
                        <div className="flex gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[rgb(var(--role-accent))] shadow-inner transition-colors">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-[var(--text-body)] opacity-50 uppercase tracking-widest block mb-1 transition-colors">Evento</label>
                                <p className="text-lg font-bold text-[var(--text-heading)] uppercase leading-none transition-colors">{attendeeData.event_title}</p>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[rgb(var(--role-accent))] shadow-inner transition-colors">
                                <Clock size={22} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-[var(--text-body)] opacity-50 uppercase tracking-widest block mb-1 transition-colors">Hora Ingreso</label>
                                <p className="text-lg font-mono text-[var(--text-heading)] leading-none transition-colors">{new Date(attendeeData.check_in_time).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-10 flex items-center gap-4 py-6 border-t border-[var(--border-color)] opacity-40 transition-colors">
                    <Info size={16} className="text-[var(--text-body)]" />
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--text-body)]">Registro inmutable almacenado en Popayán Cultural Core.</p>
                </footer>
              </div>
            )}

            {scanResult === 'error' && (
              <div className="h-full p-16 flex flex-col items-center justify-center animate-in shake duration-500 bg-red-500/[0.03]">
                <div className="w-32 h-32 bg-red-500/10 border border-red-500/30 rounded-[45px] flex items-center justify-center text-red-500 mb-10 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                  <ShieldAlert size={64} strokeWidth={1} />
                </div>
                <h3 className="text-4xl md:text-5xl font-bold italic text-[var(--text-heading)] uppercase tracking-tighter mb-6 text-center transition-colors">ALERTA DE SEGURIDAD</h3>
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[35px] w-full max-w-md backdrop-blur-xl shadow-sm">
                    <p className="text-red-500 font-mono text-xs text-center uppercase leading-loose tracking-[0.2em] font-bold transition-colors">
                      {error}
                    </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlAccesosView;