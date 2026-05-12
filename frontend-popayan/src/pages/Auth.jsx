import React, { useState, useEffect } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import popayanArte from '../assets/popayan-arte.png';
import { Eye, Paintbrush, BookOpen, ChevronDown, Loader2 } from 'lucide-react'; 

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
  
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

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
      alert("⚠️ Las contraseñas no coinciden.");
      return;
    }

    setLoading(true); 
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    try {
      if (isLogin) {
        const respuesta = await axios.post(`${API_URL}/login`, { email, password });
        localStorage.setItem('token', respuesta.data.token);
        localStorage.setItem('user', JSON.stringify(respuesta.data.user));
        window.dispatchEvent(new Event('storage')); 
        navigate('/dashboard');
      } else {
        await axios.post(`${API_URL}/register`, { 
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
      const msg = error.response?.data?.message || "Verifica tus credenciales.";
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-heading)] flex flex-col transition-colors duration-500">
      <Navbar />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 md:px-16 py-12 md:py-20 flex flex-col md:grid md:grid-cols-2 gap-16 items-center">
        
        {/* COLUMNA FORMULARIO */}
        <div className="w-full space-y-10 order-2 md:order-1 animate-in slide-in-from-left duration-700">
          
          <div className="space-y-2">
            <span className="text-[var(--text-body)] font-bold tracking-[0.4em] text-[10px] uppercase block mb-2 opacity-50">
              {isLogin ? 'Portal Oficial' : 'Únete a la comunidad'}
            </span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-[var(--text-heading)] italic transition-colors">
              {isLogin ? 'Inicia sesión.' : 'Regístrate.'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
            {!isLogin && (
              <input 
                type="text" placeholder="Nombre Completo" value={nombre}
                onChange={(e) => setNombre(e.target.value)} required
                className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] p-5 rounded-[22px] text-[var(--text-heading)] placeholder-[var(--text-body)]/30 focus:border-[rgb(var(--role-accent))] outline-none transition-all shadow-inner font-medium" 
              />
            )}

            <input 
              type="email" placeholder="Correo Electrónico" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] p-5 rounded-[22px] text-[var(--text-heading)] placeholder-[var(--text-body)]/30 focus:border-[rgb(var(--role-accent))] outline-none transition-all shadow-inner font-medium" 
            />
            
            <input 
              type="password" placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] p-5 rounded-[22px] text-[var(--text-heading)] placeholder-[var(--text-body)]/30 focus:border-[rgb(var(--role-accent))] outline-none transition-all shadow-inner font-medium" 
            />

            {!isLogin && (
              <>
                <input 
                  type="password" placeholder="Confirmar Contraseña" value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)} required
                  className="w-full bg-[var(--bg-container)] border border-[var(--border-color)] p-5 rounded-[22px] text-[var(--text-heading)] placeholder-[var(--text-body)]/30 focus:border-[rgb(var(--role-accent))] outline-none transition-all shadow-inner font-medium" 
                />

                {/* DROPDOWN DINÁMICO */}
                <div className="relative">
                  <div 
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className={`w-full bg-[var(--bg-container)] border ${isRoleDropdownOpen ? 'border-[rgb(var(--role-accent))]' : 'border-[var(--border-color)]'} p-5 rounded-[22px] flex items-center justify-between cursor-pointer transition-all select-none shadow-inner`}
                  >
                    <div className="flex items-center gap-3 text-[var(--text-body)]">
                      <span className={isRoleDropdownOpen ? 'text-[rgb(var(--role-accent))]' : 'opacity-40'}>
                        {roleOptions.find(opt => opt.value === rol)?.icon}
                      </span>
                      <span className="font-bold text-[11px] uppercase tracking-widest">
                        {roleOptions.find(opt => opt.value === rol)?.label}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180 text-[rgb(var(--role-accent))]' : 'opacity-30'}`} />
                  </div>

                  {isRoleDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)}></div>
                      <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-[var(--bg-container)] border border-[var(--border-color)] rounded-[22px] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                        {roleOptions.map((option) => (
                          <div 
                            key={option.value}
                            onClick={() => { setRol(option.value); setIsRoleDropdownOpen(false); }}
                            className={`flex items-center gap-4 p-5 cursor-pointer transition-all hover:bg-[rgb(var(--role-accent))]/5 ${
                              rol === option.value ? 'bg-[rgb(var(--role-accent))]/10 text-[rgb(var(--role-accent))]' : 'text-[var(--text-body)] opacity-60'
                            }`}
                          >
                            <span>{option.icon}</span>
                            <span className="font-bold text-[10px] uppercase tracking-[0.1em]">{option.label}</span>
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
              className="w-full py-5 rounded-full font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-lg active:scale-95 bg-[var(--text-heading)] text-[var(--bg-primary)] mt-8 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={18}/> : (isLogin ? 'INGRESAR' : 'CREAR CUENTA')}
            </button>
          </form>

          <div className="text-center max-w-md pt-4">
            <p className="text-[var(--text-body)] text-[11px] font-bold tracking-widest flex items-center justify-center gap-2 opacity-60">
              {isLogin ? '¿NO TIENES CUENTA?' : '¿YA TIENES CUENTA?'}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[rgb(var(--role-accent))] font-black cursor-pointer hover:underline transition-all uppercase"
              >
                {isLogin ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </div>

        {/* COLUMNA ILUSTRACIÓN */}
        <div className="w-full h-[300px] md:h-[600px] order-1 md:order-2 relative group flex items-center justify-center p-4">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[rgb(var(--role-accent))]/10 rounded-full blur-[100px] -z-10"></div>
           <img 
             src={popayanArte} 
             alt="Ilustración Arte Popayán" 
             className="w-full h-full object-contain drop-shadow-2xl grayscale-[40%] hover:grayscale-0 transition-all duration-700"
           />
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default Auth;