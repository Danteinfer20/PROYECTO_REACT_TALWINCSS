import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import popayanArte from '../assets/popayan-arte.png';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false); 

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('visitor'); 

  useEffect(() => {
    if (location.state?.action === 'register') {
      setIsLogin(false);
    } else if (location.state?.action === 'login') {
      setIsLogin(true);
    }
  }, [location.state]); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
  // Cambia esto en el handleSubmit de Auth.jsx
const API_URL = 'http://localhost:8000/api/v1';

    try {
      if (isLogin) {
        // --- LOGIN ---
        const respuesta = await axios.post(`${API_URL}/login`, {
          email: email,
          password: password
        });
        
        localStorage.setItem('token', respuesta.data.token);
        localStorage.setItem('user', JSON.stringify(respuesta.data.user));
        window.dispatchEvent(new Event('storage'));

        navigate('/dashboard');

      } else {
        // --- REGISTRO ---
        const respuesta = await axios.post(`${API_URL}/register`, { 
          name: nombre,
          email: email,
          password: password,
          password_confirmation: password, 
          user_type: rol 
        });

        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        setNombre(''); setEmail(''); setPassword('');
        setIsLogin(true); 
      }
    } catch (error) {
      console.error("❌ Error:", error.response?.data || error);
      const mensajeError = error.response?.data?.message || "Verifica tus datos.";
      alert(`Error: ${mensajeError}`);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-16 py-12 md:py-20 flex flex-col md:grid md:grid-cols-2 gap-16 items-center">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO ELEGANTE */}
        <div className="w-full space-y-10 order-2 md:order-1 animate-in slide-in-from-left duration-700">
          
          {/* TÍTULOS GRANDES (COMO EN TU DISEÑO ORIGINAL) */}
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

            {/* SELECTOR SOBRIO Y LIMPIO */}
            {!isLogin && (
              <div className="relative">
                <select 
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-gray-300 focus:text-white focus:border-[#a855f7] outline-none transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="visitor"> Soy Espectador / Turista</option>
                  <option value="artist"> Soy Maestro Artesano / Artista</option>
                  <option value="cultural_manager"> Soy Gestor Cultural</option>
                </select>
                {/* Flecha discreta */}
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            )}

            {/* BOTÓN GRANDE MORADO (COMO EN LA CAPTURA) */}
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full py-5 rounded-full font-black uppercase tracking-[0.15em] text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] mt-8 ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#a855f7] text-white hover:scale-[1.01]'
              }`}
            >
              {loading ? 'Cargando...' : (isLogin ? 'INGRESAR' : 'CREAR CUENTA')}
            </button>
          </form>

          {/* PARTE INFERIOR ALINEADA (COMO PEDISTE) */}
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
           {/* Efecto de luz morada detrás de la imagen */}
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