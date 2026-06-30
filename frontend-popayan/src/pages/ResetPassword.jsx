import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Extraer token y email de la URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setError('Enlace inválido. Solicita un nuevo restablecimiento.');
        }
    }, [token, email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            setMessage('Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    if (error && (!token || !email)) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-red-500/20 border border-red-500 p-6 rounded-2xl text-center">
                        <p className="text-red-400">{error}</p>
                        <button onClick={() => navigate('/login')} className="mt-4 text-[#a855f7] hover:underline">
                            Volver al inicio de sesión
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-[#0A0A0C] border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-3xl font-light italic mb-6 text-center">Restablecer contraseña</h2>
                    {message && <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-xl mb-4 text-center">{message}</div>}
                    {error && <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl mb-4 text-center">{error}</div>}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] outline-none"
                        />
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            className="w-full bg-black/30 border border-white/10 p-4 rounded-xl focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] outline-none"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-full font-bold uppercase tracking-wider bg-[#a855f7] hover:bg-[#a855f7]/90 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Procesando...' : 'Restablecer contraseña'}
                        </button>
                        <div className="text-center">
                            <button type="button" onClick={() => navigate('/login')} className="text-white/50 text-sm hover:text-[#a855f7]">
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPassword;