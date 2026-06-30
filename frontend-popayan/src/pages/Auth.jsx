import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api'; // 🔥 CAMBIO ARQUITECTÓNICO 1: Instancia blindada
import popayanArte from '../assets/popayan-arte.png';
import { Eye, Paintbrush, BookOpen, ChevronDown, Loader2, ArrowLeft } from 'lucide-react'; 

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation(); 

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); 
  const [rol, setRol] = useState('visitor'); 
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleOptions = [
    { value: 'visitor', label: t('auth.roleVisitor', 'Soy Espectador / Turista'), icon: <Eye size={18} /> },
    { value: 'artist', label: t('auth.roleArtist', 'Soy Maestro Artesano / Artista'), icon: <Paintbrush size={18} /> },
    { value: 'educator', label: t('auth.roleEducator', 'Soy Educador Cultural'), icon: <BookOpen size={18} /> }
  ];

  useEffect(() => {
    if (location.state?.action === 'register') {
      setIsLogin(false);
      setIsForgotPassword(false);
    } else if (location.state?.action === 'login') {
      setIsLogin(true);
      setIsForgotPassword(false);
    }
  }, [location.state]); 

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🔥 CAMBIO ARQUITECTÓNICO 2: Uso de ruta relativa
      const respuesta = await api.post('/forgot-password', { email });
      alert(respuesta.data.message || t('auth.forgotSuccess', 'Revisa tu correo para restablecer la contraseña.'));
      setIsForgotPassword(false);
      setPassword('');
    } catch (error) {
      const msg = error.response?.data?.message || t('auth.forgotError', 'Error al enviar el correo. Verifica tu dirección.');
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!isLogin && password !== passwordConfirm) {
      alert(t('auth.errMatch', '⚠️ Las contraseñas no coinciden.'));
      return;
    }
    setLoading(true); 
    try {
      if (isLogin) {
        // 🔥 CAMBIO ARQUITECTÓNICO 2: Uso de ruta relativa
        const respuesta = await api.post('/login', { email, password });
        localStorage.setItem('token', respuesta.data.token);
        localStorage.setItem('user', JSON.stringify(respuesta.data.user));
        window.dispatchEvent(new Event('storage')); 
        navigate('/dashboard');
      } else {
        // 🔥 CAMBIO ARQUITECTÓNICO 2: Uso de ruta relativa
        await api.post('/register', { 
          name: nombre,
          email: email,
          password: password,
          password_confirmation: passwordConfirm, 
          user_type: rol 
        });
        alert(t('auth.successReg', '¡Cuenta creada con éxito! Ahora inicia sesión.'));
        setNombre(''); setEmail(''); setPassword(''); setPasswordConfirm('');
        setIsLogin(true); 
      }
    } catch (error) {
      const msg = error.response?.data?.message || t('auth.errorGeneric', 'Verifica tus credenciales.');
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false); 
    }
  };

  const getSubTitle = () => {
    if (isForgotPassword) return t('auth.portalForgot', 'Seguridad');
    return isLogin ? t('auth.portalLogin', 'Portal Oficial') : t('auth.portalRegister', 'Únete a la comunidad');
  };

  const getMainTitle = () => {
    if (isForgotPassword) return t('auth.titleForgot', 'Recuperar clave.');
    return isLogin ? t('auth.titleLogin', 'Inicia sesión.') : t('auth.titleRegister', 'Regístrate.');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-16 py-12 md:py-20 flex flex-col md:grid md:grid-cols-2 gap-16 items-center">
        
        {/* COLUMNA FORMULARIO */}
        <div className="w-full space-y-10 order-2 md:order-1 animate-in slide-in-from-left duration-700">
          
          <div className="space-y-2">
            <span className="text-[#a855f7] font-light tracking-[0.4em] text-[11px] uppercase block mb-2 opacity-80">
              {getSubTitle()}
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light italic tracking-tighter leading-[1.1] text-white">
              {getMainTitle()}
            </h2>
          </div>

          {isForgotPassword ? (
            // RECUPERACIÓN
            <form onSubmit={handleForgotPassword} className="space-y-5 max-w-md animate-in fade-in duration-500">
              <p className="text-white/50 text-xs font-light pb-2 leading-relaxed">
                {t('auth.forgotDesc', 'Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace seguro para restablecer tu contraseña.')}
              </p>
              <input 
                type="email" placeholder={t('auth.phEmail', 'Correo Electrónico')} value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-[#0A0A0C] border border-white/10 p-5 rounded-[22px] text-white placeholder-white/40 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 outline-none transition-all shadow-inner" 
              />
              <button 
                type="submit" disabled={loading} 
                className="w-full py-5 rounded-full font-bold uppercase tracking-[0.3em] text-[11px] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] active:scale-95 bg-[#a855f7] hover:bg-[#a855f7]/90 text-white mt-8 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18}/> : t('auth.btnSubmitForgot', 'ENVIAR ENLACE')}
              </button>
              <div className="text-center pt-4">
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(false)} 
                  className="text-white/50 text-[10px] font-medium tracking-widest flex items-center justify-center gap-2 uppercase hover:text-[#a855f7] transition-colors w-full group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('auth.actionBackLogin', 'Volver al inicio de sesión')}
                </button>
              </div>
            </form>
          ) : (
            // LOGIN / REGISTRO
            <form onSubmit={handleSubmit} className="space-y-5 max-w-md animate-in fade-in duration-500">
              {!isLogin && (
                <input 
                  type="text" placeholder={t('auth.phName', 'Nombre Completo')} value={nombre}
                  onChange={(e) => setNombre(e.target.value)} required
                  className="w-full bg-[#0A0A0C] border border-white/10 p-5 rounded-[22px] text-white placeholder-white/40 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 outline-none transition-all shadow-inner" 
                />
              )}
              <input 
                type="email" placeholder={t('auth.phEmail', 'Correo Electrónico')} value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-[#0A0A0C] border border-white/10 p-5 rounded-[22px] text-white placeholder-white/40 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 outline-none transition-all shadow-inner" 
              />
              
              <div className="space-y-2">
                <input 
                  type="password" placeholder={t('auth.phPassword', 'Contraseña')} value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-[#0A0A0C] border border-white/10 p-5 rounded-[22px] text-white placeholder-white/40 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 outline-none transition-all shadow-inner" 
                />
                {isLogin && (
                  <div className="flex justify-end px-2 mt-1">
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[#a855f7] hover:text-white text-[10px] font-medium uppercase tracking-wider transition-colors duration-300"
                    >
                      {t('auth.forgotLink', '¿Olvidaste tu contraseña?')}
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <>
                  <input 
                    type="password" placeholder={t('auth.phPasswordConfirm', 'Confirmar Contraseña')} value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)} required
                    className="w-full bg-[#0A0A0C] border border-white/10 p-5 rounded-[22px] text-white placeholder-white/40 focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 outline-none transition-all shadow-inner" 
                  />

                  {/* DROPDOWN DINÁMICO */}
                  <div className="relative z-50">
                    <div 
                      onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                      className={`w-full bg-[#0A0A0C] border ${isRoleDropdownOpen ? 'border-[#a855f7]' : 'border-white/10'} p-5 rounded-[22px] flex items-center justify-between cursor-pointer transition-all select-none shadow-inner`}
                    >
                      <div className="flex items-center gap-3 text-white">
                        <span className={isRoleDropdownOpen ? 'text-[#a855f7]' : 'opacity-60'}>
                          {roleOptions.find(opt => opt.value === rol)?.icon}
                        </span>
                        <span className="font-medium text-[11px] uppercase tracking-wider text-white/90">
                          {roleOptions.find(opt => opt.value === rol)?.label}
                        </span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180 text-[#a855f7]' : 'text-white/30'}`} />
                    </div>

                    {isRoleDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)}></div>
                        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#0A0A0C] border border-white/10 rounded-[22px] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-xl">
                          {roleOptions.map((option) => (
                            <div 
                              key={option.value}
                              onClick={() => { setRol(option.value); setIsRoleDropdownOpen(false); }}
                              className={`flex items-center gap-4 p-5 cursor-pointer transition-all hover:bg-[#a855f7]/10 ${
                                rol === option.value ? 'bg-[#a855f7]/20 text-[#a855f7]' : 'text-white/60'
                              }`}
                            >
                              <span className={rol === option.value ? 'text-[#a855f7]' : 'text-white/40'}>{option.icon}</span>
                              <span className="font-medium text-[10px] uppercase tracking-wider text-white/90">{option.label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              <button 
                type="submit" disabled={loading} 
                className="w-full py-5 rounded-full font-bold uppercase tracking-[0.3em] text-[11px] transition-all shadow-[0_10px_30px_rgba(168,85,247,0.3)] active:scale-95 bg-[#a855f7] hover:bg-[#a855f7]/90 text-white mt-8 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18}/> : (isLogin ? t('auth.btnSubmitLogin', 'INGRESAR') : t('auth.btnSubmitRegister', 'CREAR CUENTA'))}
              </button>

              <div className="text-center max-w-md pt-4">
                <p className="text-white/40 text-[11px] font-light tracking-wider flex items-center justify-center gap-2">
                  {isLogin ? t('auth.promptLogin', '¿NO TIENES CUENTA?') : t('auth.promptRegister', '¿YA TIENES CUENTA?')}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)} 
                    className="text-[#a855f7] font-medium hover:underline transition-all uppercase"
                  >
                    {isLogin ? t('auth.actionLogin', 'Regístrate') : t('auth.actionRegister', 'Inicia sesión')}
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* COLUMNA ILUSTRACIÓN */}
        <div className="w-full h-[300px] md:h-[600px] order-1 md:order-2 relative flex items-center justify-center p-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#a855f7]/10 rounded-full blur-[100px] -z-10"></div>
          <img 
            src={popayanArte} 
            alt="Ilustración Arte Popayán" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Auth;