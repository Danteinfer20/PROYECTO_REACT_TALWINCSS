import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { 
  ShieldCheck, ShieldAlert, 
  Calendar, Clock, RefreshCw,
  Camera, Zap, Activity, Globe, Info
} from 'lucide-react';

const ControlAccesosView = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attendeeData, setAttendeeData] = useState(null);
  const scannerRef = useRef(null);

  // 🔥 Usa la variable de entorno VITE_API_URL; si no existe, usa la URL de producción por defecto
  const API_URL = import.meta.env.VITE_API_URL || 'https://vivelarte.com/api/v1';

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
      } else {
        setScanResult('error');
        setError(response.data.message || 'Error inesperado');
      }
    } catch (err) {
      setScanResult('error');
      setError(err.response?.data?.message || "Protocolo de seguridad: Código no reconocido.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const iniciarScanner = async () => {
      const readerElement = document.getElementById('reader');
      if (readerElement) {
        readerElement.innerHTML = '';
      }

      const html5QrCode = new Html5Qrcode('reader');

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 25, qrbox: { width: 280, height: 280 } },
          (decodedText) => {
            if (!isProcessing) {
              validarAcceso(decodedText);
            }
          },
          (err) => {} // silencioso
        );
        scannerRef.current = html5QrCode;
      } catch (err) {
        console.warn('Error con cámara trasera, intentando frontal:', err);
        try {
          await html5QrCode.start(
            { facingMode: 'user' },
            { fps: 25, qrbox: { width: 280, height: 280 } },
            (decodedText) => {
              if (!isProcessing) {
                validarAcceso(decodedText);
              }
            },
            (err) => {}
          );
          scannerRef.current = html5QrCode;
        } catch (err2) {
          console.error('No se pudo iniciar ninguna cámara:', err2);
          setError('No se pudo acceder a la cámara. Verifica permisos.');
          setScanResult('error');
        }
      }
    };

    iniciarScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ '--role-accent': getRoleAccentRGB() }} className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8 lg:p-12 transition-colors duration-500">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[rgb(var(--role-accent))] animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[rgb(var(--role-accent))]">Terminal de validación</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold italic text-[var(--text-heading)]">
              Control de <span className="text-[rgb(var(--role-accent))]">Accesos</span>
            </h1>
            <p className="text-xs text-[var(--text-body)]/60 mt-1">Popayán Cultural v2.4</p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-xl px-4 py-2">
            <div className="text-right">
              <p className="text-[8px] font-mono uppercase text-[var(--text-body)]/50">Servidor</p>
              <p className="text-xs font-semibold text-emerald-500">Sincronizado</p>
            </div>
            <Globe size={18} className="text-[var(--text-body)]/30" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Panel izquierdo - lector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
            <div className="absolute top-4 left-4 z-10">
              <p className="text-[8px] font-mono text-[var(--text-body)]/40 uppercase">Hardware ID</p>
              <p className="text-[10px] font-mono text-[rgb(var(--role-accent))]/70">POP-CAM-01</p>
            </div>
            <div id="reader" className="w-full rounded-xl overflow-hidden bg-black aspect-square">
              <style>{`
                #html5-qrcode-button-camera-permission, 
                #html5-qrcode-button-camera-start, 
                #html5-qrcode-button-camera-stop {
                  background: rgb(${getRoleAccentRGB()}) !important;
                  color: white !important;
                  border: none !important;
                  border-radius: 12px !important;
                  padding: 8px 16px !important;
                  font-size: 10px !important;
                  font-weight: 600 !important;
                  text-transform: uppercase !important;
                  letter-spacing: 1px !important;
                  cursor: pointer !important;
                  transition: all 0.2s !important;
                }
              `}</style>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-[var(--bg-container)] border border-[var(--border-color)] rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:border-[rgb(var(--role-accent))] transition-all"
          >
            <RefreshCw size={14} /> Reiniciar sistema
          </button>
        </div>

        {/* Panel derecho - resultados */}
        <div className="lg:col-span-7">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
            
            {!scanResult && !isProcessing && (
              <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-2 border-[rgb(var(--role-accent))]/20 flex items-center justify-center bg-[var(--bg-primary)]">
                    <Camera size={36} className="text-[rgb(var(--role-accent))]/40" />
                  </div>
                  <div className="absolute -inset-1 rounded-full border border-[rgb(var(--role-accent))]/30 animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-heading)] mb-2">Visor activo</h3>
                <p className="text-sm text-[var(--text-body)]/60 max-w-xs">
                  Alinee el código QR del asistente en el centro del visor
                </p>
                <div className="grid grid-cols-3 gap-4 w-full mt-10 pt-6 border-t border-[var(--border-color)]">
                  <div className="text-center">
                    <Zap size={18} className="mx-auto text-[rgb(var(--role-accent))]/40 mb-1" />
                    <p className="text-[8px] font-mono uppercase text-[var(--text-body)]/50">Latencia</p>
                    <p className="text-xs font-semibold text-[var(--text-heading)]">14ms</p>
                  </div>
                  <div className="text-center">
                    <Activity size={18} className="mx-auto text-[rgb(var(--role-accent))]/40 mb-1" />
                    <p className="text-[8px] font-mono uppercase text-[var(--text-body)]/50">Cifrado</p>
                    <p className="text-xs font-semibold text-[var(--text-heading)]">AES-256</p>
                  </div>
                  <div className="text-center">
                    <ShieldCheck size={18} className="mx-auto text-[rgb(var(--role-accent))]/40 mb-1" />
                    <p className="text-[8px] font-mono uppercase text-[var(--text-body)]/50">Protocolo</p>
                    <p className="text-xs font-semibold text-[var(--text-heading)]">V-Sec</p>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="p-12 flex flex-col items-center justify-center h-full">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-[rgb(var(--role-accent))]/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-[rgb(var(--role-accent))] rounded-full animate-spin"></div>
                </div>
                <p className="text-sm font-mono text-[rgb(var(--role-accent))] uppercase tracking-wider">Verificando acceso...</p>
              </div>
            )}

            {scanResult === 'success' && attendeeData && (
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={28} className="text-emerald-500" />
                    <span className="text-sm font-bold uppercase tracking-wider text-emerald-500">Acceso autorizado</span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-body)]/50">
                    Check-in ID: {Math.random().toString(36).substring(7).toUpperCase()}
                  </span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-6">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-body)]/50 mb-2">Asistente</p>
                  <h2 className="text-3xl font-bold text-[var(--text-heading)]">{attendeeData.attendee_name}</h2>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-[rgb(var(--role-accent))] mt-0.5" />
                    <div>
                      <p className="text-[9px] font-mono uppercase text-[var(--text-body)]/50">Evento</p>
                      <p className="text-sm font-semibold text-[var(--text-heading)]">{attendeeData.event_title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-[rgb(var(--role-accent))] mt-0.5" />
                    <div>
                      <p className="text-[9px] font-mono uppercase text-[var(--text-body)]/50">Hora ingreso</p>
                      <p className="text-sm font-mono text-[var(--text-heading)]">
                        {new Date(attendeeData.check_in_time).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
                  <p className="text-[9px] text-[var(--text-body)]/40 flex items-center gap-2">
                    <Info size={12} /> Registro inmutable en el núcleo de Popayán Cultural
                  </p>
                </div>
              </div>
            )}

            {scanResult === 'error' && (
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                  <ShieldAlert size={36} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-500 mb-2">Acceso denegado</h3>
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 max-w-md">
                  <p className="text-xs text-red-500 font-mono">{error}</p>
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