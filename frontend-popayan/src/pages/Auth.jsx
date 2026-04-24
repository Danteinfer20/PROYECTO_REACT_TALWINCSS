import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import popayanArte from '../assets/popayan-arte.png';
import { Eye, Paintbrush, BookOpen, ChevronDown } from 'lucide-react'; // 🔥 Íconos Premium

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); 

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState(''); 
  const [rol, setRol] = useState('visitor'); 
  
  // 🔥 Estado para nuestro Dropdown Custom
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Opciones de Roles con Íconos Elegantes
  const roleOptions = [
    { value: 'visitor', label: 'Soy Espectador / Turista', icon: <Eye size={18} /> },
    { value: 'artist', label: 'Soy Maestro Artesano / Artista', icon: <Paintbrush size={18} /> },
    { value: 'educator', label: 'Soy Educador Cultural', icon: <BookOpen size={18} /> }
  ];

  useEffect(() => {
    if (location.state?.action === 'register') {
      setIsLogin(false);
    } else if (location.state?.action === 'login') {
      setIsLogin(true);
    }
  }, [location.state]); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (!isLogin && password !== passwordConfirm) {
      alert("⚠️ Las contraseñas no coinciden. Por favor, verifícalas.");
      return;
    }

    setLoading(true); 
    const API_URL = 'http://localhost:8000/api/v1';

    try {
      if (isLogin) {
        const respuesta = await axios.post(`${API_URL}/login`, {
          email: email,
          password: password
        });
        
        localStorage.setItem('token', respuesta.data.token);
        localStorage.setItem('user', JSON.stringify(respuesta.data.user));
        window.dispatchEvent(new Event('storage')); 

        navigate('/dashboard');

      } else {
        const respuesta = await axios.post(`${API_URL}/register`, { 
          name: nombre,
          email: email,
          password: password,
          password_confirmation: passwordConfirm, 
          user_type: rol 
        });

        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        setNombre(''); setEmail(''); setPassword(''); setPasswordConfirm('');
        setIsLogin(true); 
      }
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error);
      
      if (error.response?.status === 422) {
        const errores = error.response.data.errors;
        const primerError = Object.values(errores)[0][0];
        alert(`Error: ${primerError}`);
      } else {
        const mensajeError = error.response?.data?.message || "Verifica tus credenciales.";
        alert(`Error: ${mensajeError}`);
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-16 py-12 md:py-20 flex flex-col md:grid md:grid-cols-2 gap-16 items-center">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="w-full space-y-10 order-2 md:order-1 animate-in slide-in-from-left duration-700">
          
          <div className="space-y-2">
            <span className="text-white/50 font-bold tracking-[0.3em] text-[10px] uppercase block mb-2">
              {isLogin ? 'Portal Oficial' : 'Únete a la comunidad'}
            </span>
            <h2 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none text-white">
              {isLogin ? 'Inicia sesión.' : 'Regístrate.'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Nombre Completo" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-white placeholder-gray-600 focus:border-[#a855f7] outline-none transition-all font-medium" 
              />
            )}

            <input 
              type="email" 
              placeholder="Correo Electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-white placeholder-gray-600 focus:border-[#a855f7] outline-none transition-all font-medium" 
            />
            
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-white placeholder-gray-600 focus:border-[#a855f7] outline-none transition-all font-medium" 
            />

            {!isLogin && (
              <input 
                type="password" 
                placeholder="Confirmar Contraseña" 
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-white placeholder-gray-600 focus:border-[#a855f7] outline-none transition-all font-medium" 
              />
            )}

            {/* 🔥 CUSTOM DROPDOWN PREMIUM */}
            {!isLogin && (
              <div className="relative">
                <div 
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`w-full bg-[#111] border ${isRoleDropdownOpen ? 'border-[#a855f7]' : 'border-white/10'} p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all select-none`}
                >
                  <div className="flex items-center gap-3 text-gray-300">
                    <span className={isRoleDropdownOpen ? 'text-[#a855f7]' : 'text-gray-500'}>
                      {roleOptions.find(opt => opt.value === rol)?.icon}
                    </span>
                    <span className="font-medium text-sm">
                      {roleOptions.find(opt => opt.value === rol)?.label}
                    </span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180 text-[#a855f7]' : 'text-gray-600'}`} 
                  />
                </div>

                {/* Menú Desplegable Flotante */}
                {isRoleDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsRoleDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[#151517] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {roleOptions.map((option) => (
                        <div 
                          key={option.value}
                          onClick={() => {
                            setRol(option.value);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-[#a855f7]/10 hover:text-white ${
                            rol === option.value 
                              ? 'bg-[#a855f7]/20 text-[#a855f7] border-l-4 border-[#a855f7]' 
                              : 'text-gray-400 border-l-4 border-transparent'
                          }`}
                        >
                          <span className={rol === option.value ? 'text-[#a855f7]' : 'text-gray-500'}>
                            {option.icon}
                          </span>
                          <span className="font-bold text-sm tracking-wide">{option.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-5 rounded-full font-black uppercase tracking-[0.15em] text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] mt-8 ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#a855f7] text-white hover:scale-[1.01]'
              }`}
            >
              {loading ? 'Procesando...' : (isLogin ? 'INGRESAR' : 'CREAR CUENTA')}
            </button>
          </form>

          <div className="text-center max-w-md pt-2">
            <p className="text-gray-500 text-sm font-medium flex items-center justify-center gap-2">
              {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[#a855f7] font-black cursor-pointer hover:text-white transition-colors uppercase text-sm tracking-wide"
              >
                {isLogin ? 'REGÍSTRATE GRATIS' : 'INICIA SESIÓN'}
              </button>
            </p>
          </div>

        </div>

        {/* COLUMNA DERECHA: IMAGEN */}
        <div className="w-full h-[300px] md:h-[600px] order-1 md:order-2 relative group flex items-center justify-center p-4">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#a855f7]/20 rounded-full blur-[100px] -z-10"></div>
           <img 
             src={popayanArte} 
             alt="Ilustración Arte Popayán" 
             className="w-full h-full object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700"
           />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Auth;