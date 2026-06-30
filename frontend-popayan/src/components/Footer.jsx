import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ASSETS } from '../utils/constants';
import LegalModal from '../components/modals/LegalModal';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  // Estados para los modales
  const [modalPrivacidad, setModalPrivacidad] = useState(false);
  const [modalTerminos, setModalTerminos] = useState(false);
  const [modalGarantia, setModalGarantia] = useState(false);

  // Estado del usuario para el color de acento
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (!savedUser || savedUser === "undefined") {
          setUser(null);
        } else {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getRoleAccentRGB = () => {
    if (!user) return '168 85 247';
    switch (user.user_type) {
      case 'admin': return '59 130 246';
      case 'cultural_manager': return '16 185 129';
      case 'educator': return '245 158 11';
      case 'artist': return '244 63 94';
      case 'visitor': return '168 85 247';
      default: return '168 85 247';
    }
  };

  // Función para construir el contenido del modal de privacidad usando traducciones
  const renderPrivacyContent = () => (
    <>
      <p>{t('legal.privacy_content.p1')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Recopilación de Datos</h4>
      <p>{t('legal.privacy_content.p2')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Uso de la Información</h4>
      <p>{t('legal.privacy_content.p3')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Protección y Cifrado</h4>
      <p>{t('legal.privacy_content.p4')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Identidad Pública</h4>
      <p>{t('legal.privacy_content.p5')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Tus Derechos</h4>
      <p>{t('legal.privacy_content.p6')}</p>
    </>
  );

  const renderTermsContent = () => (
    <>
      <p>{t('legal.terms_content.p1')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Naturaleza de la Plataforma</h4>
      <p>{t('legal.terms_content.p2')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">El Modelo P2P (Persona a Persona)</h4>
      <p>{t('legal.terms_content.p3')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Exoneración de Responsabilidad Financiera</h4>
      <p>{t('legal.terms_content.p4')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Propiedad Intelectual</h4>
      <p>{t('legal.terms_content.p5')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Conducta del Usuario</h4>
      <p>{t('legal.terms_content.p6')}</p>
    </>
  );

  const renderGuaranteeContent = () => (
    <>
      <p>{t('legal.guarantee_content.p1')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Certificación de Origen</h4>
      <p>{t('legal.guarantee_content.p2')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">La Naturaleza de lo Hecho a Mano</h4>
      <p>{t('legal.guarantee_content.p3')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Gestión de Reclamos (Proceso P2P)</h4>
      <p>{t('legal.guarantee_content.p4')}</p>
      <h4 className="font-bold text-[rgb(var(--role-accent))] mt-4 mb-2">Exclusiones</h4>
      <p>{t('legal.guarantee_content.p5')}</p>
    </>
  );

  // Navegación traducida
  const footerLinks = [
    { path: '/', label: t('footer.navigation.home', 'Inicio') },
    { path: '/artesanos', label: t('footer.navigation.artisans', 'Maestros Artesanos') },
    { path: '/obras', label: t('footer.navigation.artworks', 'Galería de Obras') },
    { path: '/tienda', label: t('footer.navigation.store', 'Tienda') },
    { path: '/aprende', label: t('footer.navigation.learn', 'Aprende') }
  ];

  return (
    <footer style={{ '--role-accent': getRoleAccentRGB() }} className="w-full bg-[var(--bg-container)] border-t border-[var(--border-color)] pt-20 pb-10 px-6 md:px-16 mt-auto relative overflow-hidden transition-colors duration-500">
      
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pointer-events-none opacity-80 z-0"></div>

      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-16">
          
          {/* COLUMNA 1: MARCA Y MENSAJE */}
          <div className="space-y-8">
            <Link to="/" className="inline-block">
              <img 
                src={ASSETS.LOGO_PRINCIPAL} 
                alt="Popayán Cultural" 
                className="h-16 w-auto opacity-90 hover:opacity-100 transition-all duration-500 drop-shadow-[0_0_15px_rgba(var(--role-accent)),0.2] hover:scale-105" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = `https://ui-avatars.com/api/?name=Popayan+Cultural&background=0A0A0C&color=fff`;
                }}
              />
            </Link>
            <div className="relative pl-5 border-l-2 border-[rgb(var(--role-accent))]/30 group">
              <p className="text-[var(--text-body)] opacity-90 text-sm leading-relaxed font-serif italic tracking-wide group-hover:text-[var(--text-heading)] transition-colors">
                {t('footer.slogan', '"El alma de la Ciudad Blanca, inmortalizada en el tiempo. Tejiendo memoria y futuro desde el corazón del Cauca."')}
              </p>
            </div>
          </div>

          {/* COLUMNA 2: NAVEGACIÓN */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[rgb(var(--role-accent))]">
              {t('footer.navigation.title', 'Navegación')}
            </h4>
            <ul className="space-y-4 text-[var(--text-body)] text-[11px] uppercase tracking-widest font-bold">
              {footerLinks.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: LEGAL (con botones que abren modales) */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[rgb(var(--role-accent))]">
              {t('footer.legal.title', 'Legal')}
            </h4>
            <ul className="space-y-4 text-[var(--text-body)] text-[11px] uppercase tracking-widest font-bold">
              <li>
                <button onClick={() => setModalPrivacidad(true)} className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit text-left">
                  {t('footer.legal.privacy', 'Privacidad')}
                </button>
              </li>
              <li>
                <button onClick={() => setModalTerminos(true)} className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit text-left">
                  {t('footer.legal.terms', 'Términos de Uso')}
                </button>
              </li>
              <li>
                <button onClick={() => setModalGarantia(true)} className="hover:text-[var(--text-heading)] transition-all hover:pl-2 duration-300 block w-fit text-left">
                  {t('footer.legal.guarantee', 'Garantía de Artesanías')}
                </button>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: CONTACTO */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-[rgb(var(--role-accent))]">
              {t('footer.contact.title', 'Conéctate')}
            </h4>
            <div className="space-y-5 text-[var(--text-body)] text-[11px] uppercase tracking-widest font-bold">
              <p className="flex items-center gap-4 hover:text-[var(--text-heading)] transition-colors cursor-default group">
                <MapPin size={14} className="text-[rgb(var(--role-accent))] group-hover:scale-110 transition-transform" />
                {t('footer.contact.location', 'Centro Histórico, Popayán')}
              </p>
              <div className="flex items-center gap-4 group">
                <Mail size={14} className="text-[rgb(var(--role-accent))] group-hover:scale-110 transition-transform" />
                <a 
                  href="mailto:vivelarteadministrador@gmail.com" 
                  className="hover:text-[var(--text-heading)] transition-colors italic lowercase font-medium tracking-normal text-xs underline decoration-dotted underline-offset-2 hover:decoration-solid"
                  title="Abrir cliente de correo"
                >
                  vivelarteadministrador@gmail.com
                </a>
              </div>
              <div className="flex gap-4 mt-8 pt-8 border-t border-[var(--border-color)]">
                {[
                  { icon: Facebook, href: '#' },
                  { icon: Instagram, href: '#' },
                  { icon: Twitter, href: '#' }
                ].map((social, idx) => (
                  <a 
                    key={idx}
                    href={social.href} 
                    className="p-3 bg-[var(--text-heading)]/5 border border-[var(--border-color)] rounded-full text-[var(--text-body)] hover:bg-[rgb(var(--role-accent))] hover:border-[rgb(var(--role-accent))] hover:text-white transition-all hover:scale-110 active:scale-90"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* BARRA FINAL */}
        <div className="border-t border-[var(--border-color)] pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-[var(--text-body)] uppercase tracking-[0.2em] font-bold">
          <p className="opacity-80">© {currentYear} POPAYÁN CULTURAL. {t('footer.rights', 'TODOS LOS DERECHOS RESERVADOS.')}</p>
          <div className="flex items-center gap-3 group cursor-default hover:text-[var(--text-heading)] transition-colors">
            <span className="opacity-60">{t('footer.slogan_left', 'EXALTANDO EL PATRIMONIO VIVO')}</span>
            <Sparkles size={12} className="text-[rgb(var(--role-accent))] fill-[rgb(var(--role-accent))]/20 group-hover:rotate-180 transition-transform duration-1000" />
            <span className="opacity-60">{t('footer.slogan_right', 'DESDE EL CAUCA')}</span>
          </div>
        </div>
      </div>

      {/* MODALES LEGALES con traducciones */}
      <LegalModal 
        isOpen={modalPrivacidad} 
        onClose={() => setModalPrivacidad(false)} 
        title={t('legal.privacy_title')}
      >
        {renderPrivacyContent()}
      </LegalModal>

      <LegalModal 
        isOpen={modalTerminos} 
        onClose={() => setModalTerminos(false)} 
        title={t('legal.terms_title')}
      >
        {renderTermsContent()}
      </LegalModal>

      <LegalModal 
        isOpen={modalGarantia} 
        onClose={() => setModalGarantia(false)} 
        title={t('legal.guarantee_title')}
      >
        {renderGuaranteeContent()}
      </LegalModal>
    </footer>
  );
};

export default Footer;