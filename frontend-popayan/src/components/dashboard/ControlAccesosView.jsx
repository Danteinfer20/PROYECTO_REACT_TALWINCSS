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

    function onScanError(err) { /* Manejo interno silencioso */ }

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
    <div className="p-8 lg:p-14 w-full max-w-[1600px] animate-in fade-in zoom-in-95 duration-700">
      
      {/* 🟢 HEADER DE GRADO MILITAR */}
      <header className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-emerald-500/60">Sistema de Puerta Activo</span>
          </div>
          <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white">
            Control de <span className="text-emerald-500">Accesos</span>
          </h2>
          <p className="text-gray-500 text-[11px] font-mono uppercase tracking-[0.2em] mt-3">Terminal de validación Popayán Cultural v2.4</p>
        </div>

        <div className="flex items-center gap-8 bg-white/[0.02] border border-white/5 p-6 rounded-[30px] backdrop-blur-md">
            <div className="flex flex-col items-end">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Estado Servidor</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">Sincronizado</span>
            </div>
            <div className="w-[1px] h-10 bg-white/10"></div>
            <Globe size={24} className="text-gray-600" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        {/* 📷 LADO IZQUIERDO: EL VISOR (ESTILO CORE) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="relative group">
            {/* Aura de Escaneo */}
            <div className={`absolute -inset-4 rounded-[60px] blur-3xl transition-opacity duration-1000 ${
              scanResult === 'success' ? 'bg-emerald-500/10' : 
              scanResult === 'error' ? 'bg-red-500/10' : 'bg-violet-500/5'
            }`}></div>
            
            <div className="relative bg-[#0D0D0F] border border-white/10 rounded-[50px] p-6 shadow-2xl overflow-hidden shadow-emerald-500/5">
              
              {/* GUI HUD Overlays */}
              <div className="absolute top-10 left-10 z-20 flex flex-col gap-1">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-[0.3em]">Hardware ID</span>
                <span className="text-[9px] font-mono text-emerald-500/50 uppercase">POP-CAM-01</span>
              </div>

              <div id="reader" className="relative z-0 overflow-hidden rounded-[40px] border border-white/5 bg-black aspect-square">
                {/* Estilos inyectados para el botón de la librería */}
                <style>{`
                  #html5-qrcode-button-camera-permission, #html5-qrcode-button-camera-start, #html5-qrcode-button-camera-stop {
                    background: #10b981 !important;
                    color: black !important;
                    border: none !important;
                    border-radius: 20px !important;
                    padding: 12px 24px !important;
                    font-size: 10px !important;
                    font-weight: 900 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 2px !important;
                    cursor: pointer !important;
                    transition: all 0.3s !important;
                  }
                  #html5-qrcode-button-camera-permission:hover {
                    background: white !important;
                    box-shadow: 0 0 20px rgba(16,185,129,0.4) !important;
                  }
                `}</style>
              </div>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full py-6 bg-white/[0.03] border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-white rounded-[30px] font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-500 flex items-center justify-center gap-4"
          >
            <RefreshCw size={16} /> Reiniciar Sistema Óptico
          </button>
        </div>

        {/* 🧠 LADO DERECHO: EL NÚCLEO DE DATOS */}
        <div className="lg:col-span-7">
          <div className="h-full bg-[#0D0D0F] border border-white/5 rounded-[55px] overflow-hidden relative shadow-inner">
            
            {/* CASE 1: MODO ESPERA */}
            {!scanResult && !isProcessing && (
              <div className="h-full p-12 flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-10 relative">
                        <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-ping"></div>
                        <Scan size={50} className="text-white/10" />
                    </div>
                    <h3 className="text-3xl font-black italic text-gray-500 uppercase tracking-tighter mb-4">Esperando Señal...</h3>
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em] leading-relaxed max-w-xs">Alinee el código QR del asistente con el área central del visor</p>
                </div>

                {/* BENTO GRID DE METADATOS */}
                <div className="grid grid-cols-3 gap-4 pt-10 border-t border-white/5">
                    <div className="p-5 rounded-[30px] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                        <Zap size={18} className="text-emerald-500/40" />
                        <div>
                            <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Latencia</p>
                            <p className="text-xs font-bold text-white uppercase">14ms</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-[30px] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                        <Activity size={18} className="text-emerald-500/40" />
                        <div>
                            <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Cifrado</p>
                            <p className="text-xs font-bold text-white uppercase">AES-256</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-[30px] bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                        <ShieldCheck size={18} className="text-emerald-500/40" />
                        <div>
                            <p className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Protocolo</p>
                            <p className="text-xs font-bold text-white uppercase">V-Sec</p>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* CASE 2: PROCESANDO */}
            {isProcessing && (
              <div className="h-full flex flex-col items-center justify-center p-20 bg-gradient-to-b from-emerald-500/5 to-transparent">
                <div className="relative w-32 h-32 mb-12">
                    <div className="absolute inset-0 border-b-4 border-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-t-2 border-emerald-500/30 rounded-full animate-[spin_2s_linear_infinite]"></div>
                </div>
                <p className="text-sm font-mono text-emerald-500 uppercase tracking-[0.8em] animate-pulse">Autenticando Pase...</p>
              </div>
            )}

            {/* CASE 3: ÉXITO (LA TARJETA MAGISTRAL) */}
            {scanResult === 'success' && attendeeData && (
              <div className="h-full p-12 flex flex-col bg-gradient-to-br from-emerald-500/[0.08] to-transparent animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex justify-between items-start mb-14">
                    <div className="flex flex-col gap-2">
                        <span className="px-5 py-2 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-[0.3em] w-fit">Acceso Autorizado</span>
                        <span className="text-[10px] font-mono text-emerald-500/50 uppercase ml-2 tracking-widest">Check-in ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                    <ShieldCheck size={60} className="text-emerald-500" strokeWidth={1.5} />
                </div>

                <div className="flex-1 space-y-12">
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] block mb-4">Identidad del Asistente</label>
                        <h4 className="text-7xl font-black text-white tracking-tighter italic uppercase leading-tight drop-shadow-2xl">{attendeeData.attendee_name}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-12 border-t border-white/5 pt-12">
                        <div className="flex gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500">
                                <Calendar size={22} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">Evento</label>
                                <p className="text-lg font-bold text-white uppercase leading-none">{attendeeData.event_title}</p>
                            </div>
                        </div>
                        <div className="flex gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500">
                                <Clock size={22} />
                            </div>
                            <div>
                                <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest block mb-1">Hora Ingreso</label>
                                <p className="text-lg font-mono text-white leading-none">{new Date(attendeeData.check_in_time).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-10 flex items-center gap-4 py-6 border-t border-white/5 opacity-40">
                    <Info size={16} />
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em]">Registro inmutable almacenado en Popayán Cultural Core.</p>
                </footer>
              </div>
            )}

            {/* CASE 4: ERROR (RECHAZO AGRESIVO) */}
            {scanResult === 'error' && (
              <div className="h-full p-16 flex flex-col items-center justify-center animate-in shake duration-500 bg-red-500/[0.03]">
                <div className="w-32 h-32 bg-red-500/20 border border-red-500/50 rounded-[45px] flex items-center justify-center text-red-500 mb-10 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                  <ShieldAlert size={64} strokeWidth={1} />
                </div>
                <h3 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-6 text-center">ALERTA DE SEGURIDAD</h3>
                <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[35px] w-full max-w-md backdrop-blur-xl">
                    <p className="text-red-400 font-mono text-xs text-center uppercase leading-loose tracking-[0.2em] font-bold">
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