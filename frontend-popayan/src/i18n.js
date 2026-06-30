import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      navbar: {
        home: "Inicio",
        artisans: "Artesanos",
        artworks: "Obras",
        events: "Eventos",
        store: "Tienda",
        learn: "Aprende",
        login: "Entrar",
        join: "Unirse",
        alerts: "Alertas",
        clear: "Limpiar",
        no_interactions: "Sin interacciones recientes",
        panel: "Panel",
        logout: "Salir"
      },
      dashboard: {
        title: "Mi Panel",
        roles: {
          admin: "Centro Comando",
          artist: "Maestro Artesano",
          artist_pending: "Artesano (Pendiente)",
          manager: "Gestor Cultural",
          manager_pending: "Gestor (Pendiente)",
          educator: "Educador",
          educator_pending: "Educador (Pendiente)",
          visitor: "Visitante"
        },
        menu: {
          admin: { escritorio: "Centro Comando", usuarios: "Usuarios", auditoria: "Auditoría" },
          artist: { escritorio: "Mi Taller", galeria: "Mis Obras", tienda: "Mi Tienda", crear: "Crear Obra", ventas: "Gestión Ventas" },
          manager: { escritorio: "Panel Gestor", crear: "Nueva Creación", eventos: "Agenda Cultural", locaciones: "Espacios/Sitios", ventas: "Mis Ventas", escaner: "Control Accesos" },
          educator: { escritorio: "Mi Aula", rutas: "Rutas Educativas", material: "Material Didáctico", favoritos: "Favoritos" },
          visitor: { escritorio: "Mi Espacio", favoritos: "Favoritos", compras: "Compras" },
          ajustes: "Ajustes de Cuenta",
          logout: "Cerrar Sesión"
        },
        ventas: { obras: "Venta de Obras", tickets: "Venta de Tickets" }
      },
      artist: {
        dashboard: {
          error_sync: "Fallo de sincronización con el núcleo creativo.",
          loading: "Sincronizando Taller Creativo...",
          verified: "Artista Verificado",
          greeting: "Hola,",
          subtitle: "Cuartel General del Maestro Artesano",
          kpis: { works: "Obras Creadas", community: "Comunidad", sales: "Ventas en Tienda", revenue: "Recaudación" },
          operations: { title: "Operaciones", btn_new: "Subir Nueva Obra", btn_store: "Mi Tienda Pop" },
          recent: { title: "Últimos Movimientos", btn_catalog: "CATÁLOGO COMPLETO", empty: "Sin registros recientes." }
        }
      },
      roles: {
        artist: "Artista",
        manager: "Gestor",
        admin: "Admin",
        explorer: "Explorador",
        educator: "Educador",
        visitor: "Visitante"
      },
      settings: {
        tabs: { identity: "Identidad", contact: "Contacto", privacy: "Privacidad", preferences: "Preferencias" },
        crop: { title: "Ajustar Imagen", apply: "Aplicar" },
        hero: { cover: "Cambiar Portada", loading: "Cargando..." },
        profile: {
          name: "Nombre Real",
          phone: "Teléfono",
          city: "Ciudad",
          neighborhood: "Barrio / Localidad",
          bio: "Biografía Cultural",
          bio_placeholder: "Cuéntale a Popayán sobre ti..."
        },
        contact: {
          website: "Sitio Web / Portafolio",
          web_placeholder: "https://miportafolio.com",
          link_profile: "Enlace a tu perfil"
        },
        privacy: {
          public_profile: "Perfil Público",
          public_profile_desc: "Permite que otros te encuentren.",
          email_notifications: "Notificaciones de Red",
          email_notifications_desc: "Avisos sobre interacciones."
        },
        preferences: {
          visual_mode: "Entorno Visual",
          light: "Claro",
          dark: "Oscuro",
          language: "Idioma Sistema",
          es: "Español",
          en: "Inglés"
        },
        actions: {
          save: "Guardar Cambios",
          saving: "Sincronizando...",
          success: "✅ Perfil y Ajustes sincronizados exitosamente.",
          error: "❌ Error al guardar."
        },
        // los campos de formulario ya están dentro de profile, no es necesario duplicar
        cover_button: "Cambiar Portada",
        loading: "Cargando...",
        success_save: "✅ Perfil y Ajustes sincronizados exitosamente.",
        error_save: "❌ Error al guardar."
      },
      // ------------------------------------------------
      // NUEVA SECCIÓN: PURCHASES (para ComprasView)
      // ------------------------------------------------
      purchases: {
        title: "Archivo de Adquisiciones",
        subtitle: "Tesoros Adquiridos.",
        loading: "Sincronizando Ledger...",
        empty: "Sin registros en el Ledger de Transacciones.",
        badge: {
          confirmed: "Confirmado",
          pending: "Pendiente",
          in_process: "En Proceso"
        },
        total_label: "Total Liquidado",
        order_prefix: "#",
        date_label: "HOY",
        modal: {
          certification: "Certificación Oficial",
          receipt_title: "Recibo de Adquisición",
          id_label: "ID:",
          liquidation: "Liquidación",
          token: "Token Auténtico Inmutable",
          footer: "Popayán Cultural 2026",
          close: "Cerrar"
        },
        product_name_fallback: "Obra del Patrimonio",
        qr_verify_prefix: "VERIFY-ORDER-"
      },
      // ------------------------------------------------
      // resto de secciones (mytienda, misobras, ventas, creator, auth, etc.)
      // ------------------------------------------------
      mytienda: {
        title: "Pop Store Manager",
        subtitle: "Control de Activos y Stock Comercial",
        addButton: "Registrar Producto",
        kpis: {
          revenue: "Revenue Total",
          sold: "Artículos Vendidos",
          stock: "Stock en Bodega"
        },
        tabs: {
          available: "En Vitrina",
          paused: "Pausados",
          sold_out: "Agotados"
        },
        searchPlaceholder: "FILTRAR POR NOMBRE...",
        unitAbbr: "uds",
        stockLabel: "UDS",
        priceLabel: "Precio Venta",
        salesLabel: "Ventas",
        deleteConfirm: "¿Retirar este producto permanentemente del inventario?",
        deleteError: "Error crítico en la eliminación del recurso.",
        statusError: "Error al modificar el estado del escaparate.",
        loading: "Sincronizando Inventario...",
        empty: "No se han encontrado activos en esta categoría"
      },
      misobras: {
        title: "Gestor de Catálogo",
        subtitle: "Conexión directa con tu base de datos",
        tabs: {
          published: "Públicas",
          draft: "Borradores"
        },
        searchPlaceholder: "BUSCAR EN EL ARCHIVO...",
        deleteConfirm: "¿Estás seguro de que deseas destruir esta obra?",
        deleteError: "Fallo en la eliminación.",
        loading: "Sincronizando Archivo Cultural...",
        noImage: "Sin Imagen",
        idLabel: "ID: #",
        views: "Vistas",
        likes: "Likes",
        emptyTitle: "Archivo Silencioso",
        emptyMessage: "No hay registros en {{status}}",
        statusNames: {
          published: "Públicas",
          draft: "Borradores"
        }
      },
      ventas: {
        title: "Gestión de Ventas",
        subtitle: "Centro de Operaciones P2P",
        kpis: {
          pending_capital: "Capital Pendiente",
          confirmed_capital: "Capital Asegurado",
          order_volume: "Volumen de Órdenes"
        },
        tabs: {
          pending: "Reservas",
          confirmed: "Completadas"
        },
        order: {
          purchase_order: "Orden de Compra",
          waiting_payment: "Esperando Pago",
          payment_received: "Pago Recibido",
          quantity: "Cant:",
          total_to_receive: "Total a Recibir",
          confirm_income: "Confirmar Ingreso",
          no_phone: "No registrado",
          user_p2p: "Usuario P2P"
        },
        loading: "Sincronizando Logística...",
        empty: "No hay órdenes en estado {{status}}",
        confirm_alert: "¿Confirmas que recibiste el pago? Esto descontará el stock de tu inventario oficial.",
        error_confirm: "Error al confirmar la venta. Es posible que el stock se haya agotado."
      },
      creator: {
        error: {
          title_required: "IDENTIFICADOR REQUERIDO.",
          category_required: "TAXONOMÍA REQUERIDA.",
          start_date_required: "FECHA DE INICIO REQUERIDA.",
          end_date_required: "FECHA FINAL REQUERIDA.",
          location_catalog_required: "SELECCIONA UN RECINTO DEL CATÁLOGO.",
          custom_location_required: "EL NOMBRE DE LA LOCACIÓN ES OBLIGATORIO.",
          submit_prefix: "RECHAZO EN"
        },
        success: {
          edit: "MODIFICACIÓN EXITOSA",
          create: "CREACIÓN COMPLETADA",
          message: "Sincronización total con Popayán Cultural."
        },
        header: {
          event: "Orquestar Evento",
          product: "Taller de Tienda",
          art: "Taller de Obra"
        },
        tabs: {
          art: "OBRA",
          product: "PRODUCTO",
          event: "EVENTO"
        },
        content_label: "Contenido / Relato",
        content_placeholder: "Escribe el relato cultural...",
        save_button: "Guardar Cambios",
        publish_button: "Publicar",
        asset_label: "Identificador del Activo",
        asset_placeholder: "Ej: Crónicas de Popayán",
        taxonomy_label: "Taxonomía",
        discipline_label: "Disciplina Técnica / Formato",
        technique_label: "Disciplina Técnica / Formato",
        select_category: "Selecciona una Categoría...",
        select_technique: "Selecciona la Técnica...",
        visual: {
          main_label: "Archivo Matriz",
          extra_label: "Vista {{number}}"
        },
        product: {
          price_label: "Valor de Intercambio (COP)",
          price_placeholder: "Ej: 50000",
          stock_label: "Inventario Físico",
          stock_placeholder: "Ej: 10",
          type_label: "Naturaleza del Activo",
          type_physical: "Objeto Físico (Envío Tradicional)",
          type_handicraft: "Artesanía / Pieza Única",
          type_digital: "Activo Digital (Descargable)",
          type_service: "Servicio Artístico / Taller"
        },
        event: {
          location_ref: "Referencia Espacial",
          catalog_location: "Registrado",
          custom_location: "Referencia Libre",
          venue_label: "Recinto del Catálogo",
          select_venue: "Selecciona un recinto...",
          loading_venues: "Cargando espacios...",
          place_name: "Nombre del sitio",
          no_gps: "Sin GPS",
          address_placeholder: "Dirección detallada o puntos de referencia...",
          start_date: "Fecha Inicio",
          start_time: "Hora Apertura",
          end_date: "Fecha Final",
          qr_control: "Control QR",
          qr_active: "QR ACTIVADO",
          qr_inactive: "SIN RESERVA",
          monetization: "Monetización y Aforo",
          free: "Libre",
          paid: "Pago",
          price_placeholder: "Valor COP",
          capacity_placeholder: "Tickets / Aforo Total"
        }
      },
      auth: {
        portalLogin: "Portal Oficial",
        portalRegister: "Únete a la comunidad",
        portalForgot: "Seguridad",
        titleLogin: "Inicia sesión.",
        titleRegister: "Regístrate.",
        titleForgot: "Recuperar clave.",
        phName: "Nombre Completo",
        phEmail: "Correo Electrónico",
        phPassword: "Contraseña",
        phPasswordConfirm: "Confirmar Contraseña",
        btnSubmitLogin: "INGRESAR",
        btnSubmitRegister: "CREAR CUENTA",
        btnSubmitForgot: "ENVIAR ENLACE",
        promptLogin: "¿NO TIENES CUENTA?",
        promptRegister: "¿YA TIENES CUENTA?",
        actionLogin: "Regístrate",
        actionRegister: "Inicia sesión",
        actionBackLogin: "Volver al inicio de sesión",
        forgotLink: "¿Olvidaste tu contraseña?",
        forgotDesc: "Ingresa el correo electrónico asociado a tu cuenta. Te enviaremos un enlace seguro para restablecer tu contraseña.",
        forgotSuccess: "Revisa tu correo para restablecer la contraseña.",
        forgotError: "Error al enviar el correo. Verifica tu dirección.",
        errMatch: "⚠️ Las contraseñas no coinciden.",
        successReg: "¡Cuenta creada con éxito! Ahora inicia sesión.",
        errorGeneric: "Verifica tus credenciales.",
        loading: "Cargando...",
        roleVisitor: "Soy Espectador / Turista",
        roleArtist: "Soy Maestro Artesano / Artista",
        roleEducator: "Soy Educador Cultural"
      },
      categories: {
        pintura: "Pintura",
        escultura: "Escultura",
        fotografía: "Fotografía",
        arte_digital: "Arte digital",
        grabado: "Grabado",
        artesanía_tradicional: "Artesanía tradicional",
        música: "Música",
        danza: "Danza",
        teatro: "Teatro",
        literatura: "Literatura",
        cine_videoarte: "Cine / Videoarte",
        historia_del_arte_caucano: "Historia del arte caucano",
        técnicas_pictóricas_tradicionales: "Técnicas pictóricas tradicionales",
        patrimonio_cultural_inmaterial: "Patrimonio cultural inmaterial",
        restauración_y_conservación: "Restauración y conservación",
        gestión_cultural: "Gestión cultural",
        música_tradicional_del_cauca: "Música tradicional del Cauca",
        semana_santa_popayaneja: "Semana Santa popayaneja",
        rutas_culturales_de_popayán: "Rutas culturales de Popayán",
        festival_de_música_religiosa: "Festival de Música Religiosa",
        exposición_temporal: "Exposición temporal",
        concierto: "Concierto",
        taller_masterclass: "Taller / Masterclass",
        conversatorio_panel: "Conversatorio / Panel",
        lanzamiento_de_obra: "Lanzamiento de obra",
        procesión: "Procesión",
        feria_artesanal: "Feria artesanal",
        teatro_al_parque: "Teatro al parque",
        cuadros_originales: "Cuadros originales",
        reproducciones_artísticas: "Reproducciones artísticas",
        artesanía_decorativa: "Artesanía decorativa",
        instrumentos_musicales: "Instrumentos musicales",
        joyería_de_filigrana: "Joyería de filigrana",
        cerámica_utilitaria: "Cerámica utilitaria",
        textiles_ruanas_mochilas: "Textiles (ruanas, mochilas)",
        libros_de_arte_local: "Libros de arte local"
      },
      contentTypes: {
        óleo: "Óleo",
        acuarela: "Acuarela",
        acrílico: "Acrílico",
        madera: "Madera",
        piedra: "Piedra",
        metal: "Metal",
        barro: "Barro",
        documental: "Documental",
        artística: "Artística",
        patrimonial: "Patrimonial",
        ilustración: "Ilustración",
        nft: "NFT",
        modelado_3d: "Modelado 3D",
        calcografía: "Calcografía",
        xilografía: "Xilografía",
        serigrafía: "Serigrafía",
        cestería: "Cestería",
        cerámica: "Cerámica",
        tejido: "Tejido",
        platería: "Platería",
        andina: "Andina",
        carranga: "Carranga",
        bambuco: "Bambuco",
        chirimía: "Chirimía",
        clásica: "Clásica",
        folclórica: "Folclórica",
        contemporánea: "Contemporánea",
        ballet: "Ballet",
        calle: "Calle",
        sala: "Sala",
        títeres: "Títeres",
        clown: "Clown",
        poesía: "Poesía",
        cuento: "Cuento",
        novela: "Novela",
        crónica: "Crónica",
        cortometraje: "Cortometraje",
        experimental: "Experimental",
        físico: "Físico",
        digital: "Digital",
        servicio: "Servicio"
      },
      legal: {
        privacy_title: "POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS",
        terms_title: "TÉRMINOS DE USO Y ACUERDOS DE LA PLATAFORMA",
        guarantee_title: "GARANTÍA Y AUTENTICIDAD DE OBRAS",
        privacy_content: {
          p1: "En Popayán Cultural, salvaguardar la información de nuestra comunidad y de los maestros artesanos es una prioridad absoluta. Este documento detalla cómo gestionamos tu huella digital dentro de nuestra plataforma.",
          p2: "Recolectamos información básica de identidad (nombre, correo electrónico, teléfono) y métricas de navegación estrictamente necesarias para el funcionamiento del directorio, la agenda cultural y la Pop Store.",
          p3: "Tus datos de contacto se utilizan con el fin exclusivo de facilitar la conexión P2P (Persona a Persona) entre tú y los Maestros Artesanos, emitir comprobantes digitales de reserva y personalizar tu experiencia en la cartelera de eventos.",
          p4: "No almacenamos información financiera ni datos de tarjetas de crédito. Toda transacción económica ocurre por fuera de la plataforma, directamente entre las partes involucradas, garantizando que tu información bancaria permanezca privada.",
          p5: "Para los perfiles con rol de \"Artista\" o \"Gestor Cultural\", la información visible en el directorio (biografía, redes sociales, taller) es de dominio público para promover su exposición cultural, según las preferencias ajustadas en el panel de control.",
          p6: "Tienes el derecho inalienable de acceder, actualizar, rectificar o solicitar la eliminación permanente de tu perfil y tus datos de nuestra base en cualquier momento desde tus Ajustes de Cuenta."
        },
        terms_content: {
          p1: "El acceso y uso de Popayán Cultural implica la aceptación de los siguientes términos, diseñados para proteger el legado cultural del Cauca y garantizar un ecosistema digital justo.",
          p2: "Popayán Cultural funciona como un catálogo patrimonial y una vitrina digital interactiva. No somos una tienda minorista, ni una empresa de logística o envíos.",
          p3: "Las reservas realizadas en la Pop Store generan un contrato directo y vinculante entre el Usuario (comprador) y el Maestro Artesano (creador). La plataforma facilita el comprobante de separación de inventario, pero el pago, la coordinación del envío y la entrega final son responsabilidad exclusiva de las dos partes conectadas.",
          p4: "Al no procesar pagos directamente, Popayán Cultural se exime de responsabilidad ante fraudes, demoras en el envío, o disputas económicas. No obstante, monitoreamos la calidad de la red y nos reservamos el derecho de suspender perfiles que incumplan la ética comunitaria.",
          p5: "Las fotografías, obras, textos y contenido educativo publicados pertenecen a sus respectivos autores. Queda estrictamente prohibida su reproducción, comercialización o distribución sin el consentimiento explícito del creador original.",
          p6: "Los usuarios se comprometen a interactuar con respeto hacia los gestores, artistas y otros miembros de la comunidad, honrando las reservas de obras y eventos generadas a través del sistema."
        },
        guarantee_content: {
          p1: "Cada pieza exhibida en la Pop Store es el resultado de un oficio heredado y perfeccionado a través de las generaciones en Popayán y el Cauca.",
          p2: "Garantizamos que los creadores listados en nuestro directorio oficial son maestros artesanos verificados, asegurando que adquieres una obra de auténtico valor patrimonial y no un producto de manufactura industrial.",
          p3: "El trabajo artesanal es orgánico. Al adquirir una obra, el comprador acepta que pueden existir ligeras variaciones en color, textura, peso o dimensiones respecto a las fotografías del catálogo. Estas \"imperfecciones\" no son defectos, sino la firma única de la intervención humana y el material natural.",
          p4: "Dado nuestro modelo de conexión directa, cualquier solicitud de cambio, reparación o garantía por daños durante el transporte debe gestionarse directamente con el Maestro Artesano, utilizando los canales de contacto (WhatsApp/Redes) proporcionados en el comprobante de reserva.",
          p5: "La garantía de los creadores generalmente no cubre daños por desgaste natural, mal uso, exposición a condiciones extremas o caídas posteriores a la entrega. Consulta con el artesano las instrucciones específicas de cuidado para cada material (cerámica, madera, textiles)."
        }
      },
      footer: {
        slogan: "\"El alma de la Ciudad Blanca, inmortalizada en el tiempo. Tejiendo memoria y futuro desde el corazón del Cauca.\"",
        navigation: {
          title: "Navegación",
          home: "Inicio",
          artisans: "Maestros Artesanos",
          artworks: "Galería de Obras",
          store: "Tienda",
          learn: "Aprende"
        },
        legal: {
          title: "Legal",
          privacy: "Privacidad",
          terms: "Términos de Uso",
          guarantee: "Garantía de Artesanías"
        },
        contact: {
          title: "Conéctate",
          location: "Centro Histórico, Popayán"
        },
        rights: "TODOS LOS DERECHOS RESERVADOS.",
        slogan_left: "EXALTANDO EL PATRIMONIO VIVO",
        slogan_right: "DESDE EL CAUCA"
      },
      home: {
        error: { title: "Portal Fuera de Línea", retry: "Reconectar Núcleo" },
        hero: { syncing: "Sincronizando Agenda Cultural...", starting: "Iniciando transmisiones de ciudad...", next_event: "Próximo Evento", details: "Ver Detalles" },
        agenda: { title: "Agenda Cultural", subtitle: "Próximos eventos y convocatorias de la ciudad", link: "Ver agenda completa", empty: "Sin eventos programados actualmente" },
        artworks: { title: "Obras Maestras", subtitle: "Selección exclusiva de nuestro archivo patrimonial", link: "Ver galería completa", empty: "Próximamente nuevas obras" },
        store: { title: "Pop Store", subtitle: "Tesoros artesanales con certificación de origen", link: "Ver toda la tienda", empty: "Tienda en preparación" },
        learn: { title: "Aprende", subtitle: "Cátedra cultural por nuestros maestros", link: "Ver todos los cursos", badge: "Especialidad", duration: "Duración", empty: "Próximamente nuevos talleres" },
        directory: { title: "Directorio", subtitle: "Los creadores detrás del legado", link: "Ver todos los artistas", empty: "Próximamente catálogo de artistas" }
      },
      store: {
        hero: { title: "POP STORE", subtitle: "El mercado digital del Cauca. Directo del creador a tus manos." },
        filters: { search: "Buscar por artículo o artesano...", all: "Todas", active: "Filtros Activos:", reset: "Restablecer Filtros" },
        loading: "Cargando Vitrina...",
        empty: "Inventario No Disponible.",
        product: {
          elite: "Elite",
          sold_out: "Sold Out",
          quick_view: "Vista Rápida",
          fallback_category: "Obra Física",
          authorship: "Autoría / Ventas Directas",
          available: "Unidades Disponibles:",
          add_cart: "Añadir al Carrito"
        },
        cart: {
          button: "Tu Carrito",
          title: "Tu Carrito",
          empty: "El carrito está vacío.",
          estimated_total: "Total Estimado",
          checkout: "Generar Contrato P2P"
        },
        toasts: {
          max_stock: "⚠️ Stock máximo alcanzado",
          qty_updated: "🛒 Cantidad actualizada",
          added: "🛒 Producto añadido al Carrito",
          auth_required: "⚠️ Requiere autenticación de usuario",
          reserve_success: "✅ Reserva Exitosa. Abriendo canal seguro con el Artesano...",
          error: "❌ Stock agotado o error de servidor",
          no_number_alert: "✅ Reserva generada (Orden {{order}}).\n\n⚠️ NOTA: El Maestro Artesano no tiene un número de contacto directo registrado. Por favor, descarga tu PDF y contáctalo a través del perfil oficial de su galería."
        },
        whatsapp: {
          greeting: "Hola {{name}} 👋\nAcabo de realizar una reserva oficial en la Pop Store (Orden *{{order}}*).\n\n*Detalle de mi pedido:*",
          total: "\n\n*Total a Transferir:* {{total}}\n\nTengo mi comprobante PDF oficial listo. ¿Me confirmas tus datos de Nequi/Daviplata para realizar el pago y que puedas confirmar la orden en tu sistema?"
        },
        pdf: {
          title: "COMPROBANTE DE COMPRA P2P",
          details: "Detalles de la Transacción",
          order_id: "ID de Orden:",
          date: "Fecha:",
          status: "Estado: VALIDACIÓN P2P PENDIENTE",
          col_ref: "Ref / Producto",
          col_qty: "Cant.",
          col_unit: "V. Unitario",
          col_sub: "Subtotal",
          total: "TOTAL ESTIMADO:",
          legal1: "NOTA LEGAL: Popayán Cultural actúa como vitrina digital. Este comprobante acredita la",
          legal2: "separación del inventario. El pago y envío se coordinan directamente con el Artesano."
        }
      },
      cards: {
        art: { anonymous: "Maestro Anónimo", heritage: "Patrimonio", master_prefix: "Maestro" },
        artist: { default_name: "Artista", master: "Maestro Artesano" },
        product: { store: "Tienda", featured: "Destacado", default_author: "Popayán Cultural" }
      },
      profile: {
        loading: "Sincronizando Archivo...",
        roles: { manager: "Gestor Cultural", artisan: "Maestro Artesano" },
        stats: { artworks: "Obras", community: "Comunidad" },
        default_bio: "Este custodio del legado forja su historia en el corazón del Cauca.",
        actions: { shadow_follow: "Seguir", following: "Siguiendo" },
        tabs: { artworks: "Obras Maestras", store: "Pop Store" },
        empty: { artworks: "Sin registro de obras", store: "Sin piezas comerciales" }
      },
      artisans: {
        hero: { badge: "Directorio Oficial", title_prefix: "Maestros", title_highlight: "Artesanos", search: "Buscar creador..." },
        loading: "Forjando Red Cultural...",
        empty: { title: "Ningún maestro coincide", subtitle: "Intenta ajustar los parámetros de búsqueda." },
        card: { default_location: "Popayán" },
        modal: {
          badge: "Maestro",
          verified: "Verificado",
          default_neighborhood: "Centro Histórico",
          default_bio: "Maestro artesano de Popayán Cultural. Su legado está documentado visualmente en el catálogo de la plataforma.",
          explore: "Explorar Perfil"
        }
      },
      obras: {
        hero: { badge: "Obra Destacada", by: "Maestro", explore: "Explorar", empty: "No hay contenido destacado" },
        filters: { search: "Buscar por título o maestro...", all: "Todas", oil: "Pintura Óleo", sculpture: "Escultura", arts: "Artes Vivas", heritage: "Patrimonio" },
        toasts: { fav_add: "❤️ Coleccionada", fav_remove: "🗑️ Eliminada", error: "Error al guardar" },
        empty: "La bóveda no encontró resultados."
      },
      artwork: {
        loading: "Descifrando Lienzo...",
        author: { role: "Maestro", anonymous: "Anónimo" },
        actions: { saved: "Guardada", save: "Coleccionar", share: "Compartir Obra" },
        stats: { inspiration: "Inspiración", repost: "Repost", views: "Vistas" },
        category_fallback: "Arte Local",
        tabs: { story: "Relato Visual", community: "Perspectives" },
        content_empty: "Este registro visual no cuenta con un relato extendido adjunto.",
        comments: { placeholder: "Escribe tu interpretación...", login_prompt: "Inicia sesión para comentar.", login_button: "Ingresar" },
        toasts: {
          saved: "⭐ Añadida a tu colección",
          unsaved: "🗑️ Eliminada de la colección",
          sync_error: "❌ Error al sincronizar.",
          link_copied: "🔗 Enlace copiado. ¡Listo para compartir!",
          copy_error: "❌ No se pudo copiar el enlace.",
          share_success: "🔄 ¡Repost registrado con éxito!",
          comment_added: "💬 Aporte registrado.",
          comment_error: "❌ Error al comentar."
        },
        share_text: "Explora el lienzo: {{title}}"
      },
      common: { soon: "Próximamente" }
    }
  },
  en: {
    translation: {
      navbar: {
        home: "Home",
        artisans: "Artisans",
        artworks: "Artworks",
        events: "Events",
        store: "Store",
        learn: "Learn",
        login: "Log In",
        join: "Join",
        alerts: "Alerts",
        clear: "Clear",
        no_interactions: "No recent interactions",
        panel: "Dashboard",
        logout: "Log Out"
      },
      dashboard: {
        title: "My Dashboard",
        roles: {
          admin: "Control Center",
          artist: "Master Artisan",
          artist_pending: "Artisan (Pending)",
          manager: "Cultural Manager",
          manager_pending: "Manager (Pending)",
          educator: "Educator",
          educator_pending: "Educator (Pending)",
          visitor: "Visitor"
        },
        menu: {
          admin: { escritorio: "Control Center", usuarios: "Users", auditoria: "Audit" },
          artist: { escritorio: "My Workshop", galeria: "My Artworks", tienda: "My Store", crear: "Create Work", ventas: "Sales Management" },
          manager: { escritorio: "Manager Panel", crear: "New Creation", eventos: "Cultural Agenda", locaciones: "Spaces/Sites", ventas: "My Sales", escaner: "Access Control" },
          educator: { escritorio: "My Classroom", rutas: "Educational Paths", material: "Didactic Material", favoritos: "Favorites" },
          visitor: { escritorio: "My Space", favoritos: "Favorites", compras: "Purchases" },
          ajustes: "Account Settings",
          logout: "Log Out"
        },
        ventas: { obras: "Artworks Sales", tickets: "Ticket Sales" }
      },
      artist: {
        dashboard: {
          error_sync: "Failed to synchronize with the creative core.",
          loading: "Synchronizing Creative Workshop...",
          verified: "Verified Artist",
          greeting: "Hello,",
          subtitle: "Master Artisan Headquarters",
          kpis: { works: "Created Works", community: "Community", sales: "Store Sales", revenue: "Revenue" },
          operations: { title: "Operations", btn_new: "Upload New Work", btn_store: "My Pop Store" },
          recent: { title: "Recent Movements", btn_catalog: "FULL CATALOG", empty: "No recent records." }
        }
      },
      roles: {
        artist: "Artist",
        manager: "Manager",
        admin: "Admin",
        explorer: "Explorer",
        educator: "Educator",
        visitor: "Visitor"
      },
      settings: {
        tabs: { identity: "Identity", contact: "Contact", privacy: "Privacy", preferences: "Preferences" },
        crop: { title: "Adjust Image", apply: "Apply" },
        hero: { cover: "Change Cover", loading: "Loading..." },
        profile: {
          name: "Real Name",
          phone: "Phone",
          city: "City",
          neighborhood: "Neighborhood / Area",
          bio: "Cultural Biography",
          bio_placeholder: "Tell Popayán about yourself..."
        },
        contact: {
          website: "Website / Portfolio",
          web_placeholder: "https://myportfolio.com",
          link_profile: "Link to your profile"
        },
        privacy: {
          public_profile: "Public Profile",
          public_profile_desc: "Allow others to find you.",
          email_notifications: "Network Notifications",
          email_notifications_desc: "Alerts about interactions."
        },
        preferences: {
          visual_mode: "Visual Environment",
          light: "Light",
          dark: "Dark",
          language: "System Language",
          es: "Spanish",
          en: "English"
        },
        actions: {
          save: "Save Changes",
          saving: "Syncing...",
          success: "✅ Profile and Settings synced successfully.",
          error: "❌ Error saving."
        },
        cover_button: "Change Cover",
        loading: "Loading...",
        success_save: "✅ Profile and Settings synced successfully.",
        error_save: "❌ Error saving."
      },
      // ------------------------------------------------
      // PURCHASES (English)
      // ------------------------------------------------
      purchases: {
        title: "Acquisition Archive",
        subtitle: "Acquired Treasures.",
        loading: "Syncing Ledger...",
        empty: "No records in the Transaction Ledger.",
        badge: {
          confirmed: "Confirmed",
          pending: "Pending",
          in_process: "In Process"
        },
        total_label: "Total Settled",
        order_prefix: "#",
        date_label: "TODAY",
        modal: {
          certification: "Official Certification",
          receipt_title: "Acquisition Receipt",
          id_label: "ID:",
          liquidation: "Settlement",
          token: "Immutable Authentic Token",
          footer: "Popayán Cultural 2026",
          close: "Close"
        },
        product_name_fallback: "Heritage Artwork",
        qr_verify_prefix: "VERIFY-ORDER-"
      },
      // ------------------------------------------------
      // resto de secciones en inglés (omitidas por brevedad, pero deben estar todas)
      // ------------------------------------------------
      mytienda: {
        title: "Pop Store Manager",
        subtitle: "Asset and Stock Control",
        addButton: "Register Product",
        kpis: {
          revenue: "Total Revenue",
          sold: "Items Sold",
          stock: "Warehouse Stock"
        },
        tabs: {
          available: "Showcase",
          paused: "Paused",
          sold_out: "Sold Out"
        },
        searchPlaceholder: "FILTER BY NAME...",
        unitAbbr: "units",
        stockLabel: "UNITS",
        priceLabel: "Sale Price",
        salesLabel: "Sales",
        deleteConfirm: "Permanently remove this product from inventory?",
        deleteError: "Critical error deleting the resource.",
        statusError: "Error modifying showcase status.",
        loading: "Syncing Inventory...",
        empty: "No assets found in this category"
      },
      misobras: {
        title: "Catalog Manager",
        subtitle: "Direct connection to your database",
        tabs: {
          published: "Published",
          draft: "Drafts"
        },
        searchPlaceholder: "SEARCH ARCHIVE...",
        deleteConfirm: "Are you sure you want to destroy this artwork?",
        deleteError: "Deletion failed.",
        loading: "Syncing Cultural Archive...",
        noImage: "No Image",
        idLabel: "ID: #",
        views: "Views",
        likes: "Likes",
        emptyTitle: "Silent Archive",
        emptyMessage: "No records in {{status}}",
        statusNames: {
          published: "Published",
          draft: "Drafts"
        }
      },
      ventas: {
        title: "Sales Management",
        subtitle: "P2P Operations Center",
        kpis: {
          pending_capital: "Pending Capital",
          confirmed_capital: "Confirmed Capital",
          order_volume: "Order Volume"
        },
        tabs: {
          pending: "Reservations",
          confirmed: "Completed"
        },
        order: {
          purchase_order: "Purchase Order",
          waiting_payment: "Waiting Payment",
          payment_received: "Payment Received",
          quantity: "Qty:",
          total_to_receive: "Total to Receive",
          confirm_income: "Confirm Income",
          no_phone: "Not registered",
          user_p2p: "P2P User"
        },
        loading: "Syncing Logistics...",
        empty: "No orders in {{status}} status",
        confirm_alert: "Do you confirm receipt of payment? This will deduct stock from your official inventory.",
        error_confirm: "Error confirming sale. Stock may have run out."
      },
      creator: {
        error: {
          title_required: "TITLE REQUIRED.",
          category_required: "CATEGORY REQUIRED.",
          start_date_required: "START DATE REQUIRED.",
          end_date_required: "END DATE REQUIRED.",
          location_catalog_required: "SELECT A VENUE FROM CATALOG.",
          custom_location_required: "LOCATION NAME IS REQUIRED.",
          submit_prefix: "REJECTED IN"
        },
        success: {
          edit: "EDIT SUCCESSFUL",
          create: "CREATION COMPLETED",
          message: "Full synchronization with Popayán Cultural."
        },
        header: {
          event: "Orchestrate Event",
          product: "Workshop Store",
          art: "Artwork Workshop"
        },
        tabs: {
          art: "ARTWORK",
          product: "PRODUCT",
          event: "EVENT"
        },
        content_label: "Content / Story",
        content_placeholder: "Write the cultural story...",
        save_button: "Save Changes",
        publish_button: "Publish",
        asset_label: "Asset Identifier",
        asset_placeholder: "E.g.: Chronicles of Popayán",
        taxonomy_label: "Taxonomy",
        discipline_label: "Technical Discipline / Format",
        technique_label: "Technical Discipline / Format",
        select_category: "Select a Category...",
        select_technique: "Select Technique...",
        visual: {
          main_label: "Matrix File",
          extra_label: "View {{number}}"
        },
        product: {
          price_label: "Exchange Value (COP)",
          price_placeholder: "E.g.: 50000",
          stock_label: "Physical Inventory",
          stock_placeholder: "E.g.: 10",
          type_label: "Asset Nature",
          type_physical: "Physical Object (Traditional Shipping)",
          type_handicraft: "Handicraft / Unique Piece",
          type_digital: "Digital Asset (Downloadable)",
          type_service: "Artistic Service / Workshop"
        },
        event: {
          location_ref: "Spatial Reference",
          catalog_location: "Registered",
          custom_location: "Free Reference",
          venue_label: "Catalog Venue",
          select_venue: "Select a venue...",
          loading_venues: "Loading spaces...",
          place_name: "Place name",
          no_gps: "No GPS",
          address_placeholder: "Detailed address or landmarks...",
          start_date: "Start Date",
          start_time: "Opening Time",
          end_date: "End Date",
          qr_control: "QR Control",
          qr_active: "QR ACTIVATED",
          qr_inactive: "NO RESERVATION",
          monetization: "Monetization and Capacity",
          free: "Free",
          paid: "Paid",
          price_placeholder: "COP Value",
          capacity_placeholder: "Tickets / Total Capacity"
        }
      },
      auth: {
        portalLogin: "Official Portal",
        portalRegister: "Join the community",
        portalForgot: "Security",
        titleLogin: "Log in.",
        titleRegister: "Sign up.",
        titleForgot: "Recover password.",
        phName: "Full Name",
        phEmail: "Email Address",
        phPassword: "Password",
        phPasswordConfirm: "Confirm Password",
        btnSubmitLogin: "SIGN IN",
        btnSubmitRegister: "CREATE ACCOUNT",
        btnSubmitForgot: "SEND LINK",
        promptLogin: "DON'T HAVE AN ACCOUNT?",
        promptRegister: "ALREADY HAVE AN ACCOUNT?",
        actionLogin: "Sign up",
        actionRegister: "Log in",
        actionBackLogin: "Back to login",
        forgotLink: "Forgot your password?",
        forgotDesc: "Enter the email associated with your account. We'll send you a secure link to reset your password.",
        forgotSuccess: "Check your email to reset your password.",
        forgotError: "Error sending email. Please verify your address.",
        errMatch: "⚠️ Passwords do not match.",
        successReg: "Account created successfully! Please log in.",
        errorGeneric: "Check your credentials.",
        loading: "Loading...",
        roleVisitor: "I am a Spectator / Tourist",
        roleArtist: "I am an Artisan / Artist",
        roleEducator: "I am a Cultural Educator"
      },
      categories: {
        pintura: "Painting",
        escultura: "Sculpture",
        fotografía: "Photography",
        arte_digital: "Digital Art",
        grabado: "Engraving",
        artesanía_tradicional: "Traditional Craft",
        música: "Music",
        danza: "Dance",
        teatro: "Theater",
        literatura: "Literature",
        cine_videoarte: "Film / Video Art",
        historia_del_arte_caucano: "Caucan Art History",
        técnicas_pictóricas_tradicionales: "Traditional Painting Techniques",
        patrimonio_cultural_inmaterial: "Intangible Cultural Heritage",
        restauración_y_conservación: "Restoration and Conservation",
        gestión_cultural: "Cultural Management",
        música_tradicional_del_cauca: "Traditional Cauca Music",
        semana_santa_popayaneja: "Popayán Holy Week",
        rutas_culturales_de_popayán: "Popayán Cultural Routes",
        festival_de_música_religiosa: "Religious Music Festival",
        exposición_temporal: "Temporary Exhibition",
        concierto: "Concert",
        taller_masterclass: "Workshop / Masterclass",
        conversatorio_panel: "Talk / Panel",
        lanzamiento_de_obra: "Artwork Launch",
        procesión: "Procession",
        feria_artesanal: "Craft Fair",
        teatro_al_parque: "Park Theater",
        cuadros_originales: "Original Paintings",
        reproducciones_artísticas: "Artistic Reproductions",
        artesanía_decorativa: "Decorative Crafts",
        instrumentos_musicales: "Musical Instruments",
        joyería_de_filigrana: "Filigree Jewelry",
        cerámica_utilitaria: "Utilitarian Ceramics",
        textiles_ruanas_mochilas: "Textiles (ruanas, backpacks)",
        libros_de_arte_local: "Local Art Books"
      },
      contentTypes: {
        óleo: "Oil",
        acuarela: "Watercolor",
        acrílico: "Acrylic",
        madera: "Wood",
        piedra: "Stone",
        metal: "Metal",
        barro: "Clay",
        documental: "Documentary",
        artística: "Artistic",
        patrimonial: "Heritage",
        ilustración: "Illustration",
        nft: "NFT",
        modelado_3d: "3D Modeling",
        calcografía: "Chalcography",
        xilografía: "Woodcut",
        serigrafía: "Screen Printing",
        cestería: "Basketry",
        cerámica: "Ceramics",
        tejido: "Weaving",
        platería: "Silverware",
        andina: "Andean",
        carranga: "Carranga",
        bambuco: "Bambuco",
        chirimía: "Chirimía",
        clásica: "Classical",
        folclórica: "Folk",
        contemporánea: "Contemporary",
        ballet: "Ballet",
        calle: "Street",
        sala: "Stage",
        títeres: "Puppets",
        clown: "Clown",
        poesía: "Poetry",
        cuento: "Short Story",
        novela: "Novel",
        crónica: "Chronicle",
        cortometraje: "Short Film",
        experimental: "Experimental",
        físico: "Physical",
        digital: "Digital",
        servicio: "Service"
      },
      legal: {
        privacy_title: "PRIVACY POLICY AND DATA PROCESSING",
        terms_title: "TERMS OF USE AND PLATFORM AGREEMENTS",
        guarantee_title: "WARRANTY AND AUTHENTICITY OF ARTWORKS",
        privacy_content: {
          p1: "At Popayán Cultural, safeguarding the information of our community and master artisans is a top priority. This document details how we manage your digital footprint within our platform.",
          p2: "We collect basic identity information (name, email, phone) and strictly necessary navigation metrics for the operation of the directory, cultural agenda, and Pop Store.",
          p3: "Your contact information is used exclusively to facilitate P2P connection between you and the Master Artisans, issue digital reservation receipts, and personalize your event calendar experience.",
          p4: "We do not store financial information or credit card data. All economic transactions occur outside the platform, directly between the involved parties, ensuring your banking information remains private.",
          p5: "For profiles with the role of \"Artist\" or \"Cultural Manager\", the visible information in the directory (biography, social networks, workshop) is in the public domain to promote their cultural exposure, according to preferences adjusted in the control panel.",
          p6: "You have the inalienable right to access, update, rectify, or request permanent deletion of your profile and data from our database at any time from your Account Settings."
        },
        terms_content: {
          p1: "Access and use of Popayán Cultural implies acceptance of the following terms, designed to protect the cultural legacy of Cauca and ensure a fair digital ecosystem.",
          p2: "Popayán Cultural functions as a heritage catalog and an interactive digital showcase. We are not a retail store, nor a logistics or shipping company.",
          p3: "Reservations made in the Pop Store generate a direct and binding contract between the User (buyer) and the Master Artisan (creator). The platform facilitates the inventory separation receipt, but payment, shipping coordination, and final delivery are the exclusive responsibility of the two connected parties.",
          p4: "By not directly processing payments, Popayán Cultural disclaims liability for fraud, shipping delays, or economic disputes. However, we monitor network quality and reserve the right to suspend profiles that violate community ethics.",
          p5: "The photographs, works, texts, and educational content published belong to their respective authors. Reproduction, commercialization, or distribution is strictly prohibited without the explicit consent of the original creator.",
          p6: "Users agree to interact respectfully with managers, artists, and other community members, honoring the reservations of works and events generated through the system."
        },
        guarantee_content: {
          p1: "Each piece displayed in the Pop Store is the result of a trade inherited and perfected over generations in Popayán and Cauca.",
          p2: "We guarantee that the creators listed in our official directory are verified master artisans, ensuring that you acquire a work of authentic heritage value and not an industrially manufactured product.",
          p3: "Handmade work is organic. When purchasing a work, the buyer accepts that slight variations in color, texture, weight, or dimensions may exist compared to catalog photographs. These \"imperfections\" are not defects, but the unique signature of human intervention and natural material.",
          p4: "Given our direct connection model, any request for exchange, repair, or warranty for damage during transport must be managed directly with the Master Artisan, using the contact channels (WhatsApp/Social Media) provided on the reservation receipt.",
          p5: "The creators' guarantee generally does not cover damage from natural wear and tear, misuse, exposure to extreme conditions, or drops after delivery. Consult the artisan for specific care instructions for each material (ceramics, wood, textiles)."
        }
      },
      footer: {
        slogan: "\"The soul of the White City, immortalized in time. Weaving memory and future from the heart of Cauca.\"",
        navigation: {
          title: "Navigation",
          home: "Home",
          artisans: "Master Artisans",
          artworks: "Art Gallery",
          store: "Store",
          learn: "Learn"
        },
        legal: {
          title: "Legal",
          privacy: "Privacy Policy",
          terms: "Terms of Use",
          guarantee: "Craftsmanship Guarantee"
        },
        contact: {
          title: "Connect",
          location: "Historic Center, Popayán"
        },
        rights: "ALL RIGHTS RESERVED.",
        slogan_left: "EXALTING LIVING HERITAGE",
        slogan_right: "FROM CAUCA"
      },
      home: {
        error: { title: "Portal Offline", retry: "Reconnect Core" },
        hero: { syncing: "Syncing Cultural Agenda...", starting: "Initiating city transmissions...", next_event: "Next Event", details: "View Details" },
        agenda: { title: "Cultural Agenda", subtitle: "Upcoming city events and calls", link: "View full agenda", empty: "No events scheduled currently" },
        artworks: { title: "Masterpieces", subtitle: "Exclusive selection from our heritage archive", link: "View full gallery", empty: "New artworks coming soon" },
        store: { title: "Pop Store", subtitle: "Artisanal treasures with certificate of origin", link: "View entire store", empty: "Store in preparation" },
        learn: { title: "Learn", subtitle: "Cultural masterclasses by our experts", link: "View all courses", badge: "Specialty", duration: "Duration", empty: "New workshops coming soon" },
        directory: { title: "Directory", subtitle: "The creators behind the legacy", link: "View all artists", empty: "Artist catalog coming soon" }
      },
      store: {
        hero: { title: "POP STORE", subtitle: "Cauca's digital market. Direct from the creator to your hands." },
        filters: { search: "Search for item or artisan...", all: "All", active: "Active Filters:", reset: "Reset Filters" },
        loading: "Loading Showcase...",
        empty: "Inventory Not Available.",
        product: {
          elite: "Elite",
          sold_out: "Sold Out",
          quick_view: "Quick View",
          fallback_category: "Physical Artwork",
          authorship: "Authorship / Direct Sales",
          available: "Units Available:",
          add_cart: "Add to Cart"
        },
        cart: {
          button: "Your Cart",
          title: "Your Cart",
          empty: "The cart is empty.",
          estimated_total: "Estimated Total",
          checkout: "Generate P2P Contract"
        },
        toasts: {
          max_stock: "⚠️ Maximum stock reached",
          qty_updated: "🛒 Quantity updated",
          added: "🛒 Product added to Cart",
          auth_required: "⚠️ User authentication required",
          reserve_success: "✅ Reservation Successful. Opening secure channel with the Artisan...",
          error: "❌ Out of stock or server error",
          no_number_alert: "✅ Reservation generated (Order {{order}}).\n\n⚠️ NOTE: The Master Artisan does not have a direct contact number registered. Please download your PDF and contact them through their official gallery profile."
        },
        whatsapp: {
          greeting: "Hi {{name}} 👋\nI just made an official reservation at the Pop Store (Order *{{order}}*).\n\n*My order details:*",
          total: "\n\n*Total to Transfer:* {{total}}\n\nI have my official PDF receipt ready. Could you confirm your Nequi/Daviplata details so I can make the payment and you can confirm the order in your system?"
        },
        pdf: {
          title: "P2P PURCHASE RECEIPT",
          details: "Transaction Details",
          order_id: "Order ID:",
          date: "Date:",
          status: "Status: PENDING P2P VALIDATION",
          col_ref: "Ref / Product",
          col_qty: "Qty.",
          col_unit: "Unit Price",
          col_sub: "Subtotal",
          total: "ESTIMATED TOTAL:",
          legal1: "LEGAL NOTE: Popayán Cultural acts as a digital showcase. This receipt proves the",
          legal2: "reservation of the inventory. Payment and shipping are coordinated directly with the Artisan."
        }
      },
      cards: {
        art: { anonymous: "Anonymous Master", heritage: "Heritage", master_prefix: "Master" },
        artist: { default_name: "Artist", master: "Master Artisan" },
        product: { store: "Store", featured: "Featured", default_author: "Popayán Cultural" }
      },
      profile: {
        loading: "Syncing Archive...",
        roles: { manager: "Cultural Manager", artisan: "Master Artisan" },
        stats: { artworks: "Artworks", community: "Community" },
        default_bio: "This custodian of the legacy forged their history in the heart of Cauca.",
        actions: { shadow_follow: "Follow", following: "Following" },
        tabs: { artworks: "Masterpieces", store: "Pop Store" },
        empty: { artworks: "No artwork records", store: "No commercial pieces" }
      },
      artisans: {
        hero: { badge: "Official Directory", title_prefix: "Master", title_highlight: "Artisans", search: "Search creator..." },
        loading: "Forging Cultural Network...",
        empty: { title: "No master artisan matches", subtitle: "Try adjusting your search parameters." },
        card: { default_location: "Popayán" },
        modal: {
          badge: "Master",
          verified: "Verified",
          default_neighborhood: "Historic Center",
          default_bio: "Master artisan of Popayán Cultural. Their legacy is visually documented in the platform's catalog.",
          explore: "Explore Profile"
        }
      },
      obras: {
        hero: { badge: "Featured Artwork", by: "Master", explore: "Explore", empty: "No featured content" },
        filters: { search: "Search by title or master...", all: "All", oil: "Oil Painting", sculpture: "Sculpture", arts: "Performing Arts", heritage: "Heritage" },
        toasts: { fav_add: "❤️ Collected", fav_remove: "🗑️ Removed", error: "Save error" },
        empty: "The vault found no results."
      },
      artwork: {
        loading: "Decoding Canvas...",
        author: { role: "Master", anonymous: "Anonymous" },
        actions: { saved: "Saved", save: "Collect", share: "Share Artwork" },
        stats: { inspiration: "Inspiration", repost: "Repost", views: "Views" },
        category_fallback: "Local Art",
        tabs: { story: "Visual Story", community: "Perspectives" },
        content_empty: "This visual record does not have an extended story attached.",
        comments: { placeholder: "Write your interpretation...", login_prompt: "Log in to comment.", login_button: "Log In" },
        toasts: {
          saved: "⭐ Added to your collection",
          unsaved: "🗑️ Removed from collection",
          sync_error: "❌ Sync error.",
          link_copied: "🔗 Link copied. Ready to share!",
          copy_error: "❌ Could not copy the link.",
          share_success: "🔄 Repost successfully registered!",
          comment_added: "💬 Contribution registered.",
          comment_error: "❌ Error commenting."
        },
        share_text: "Explore the canvas: {{title}}"
      },
      common: { soon: "Soon" }
    }
  }
};

const savedLang = localStorage.getItem('app_lang') || 'es';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: "es",
  interpolation: { escapeValue: false }
});

export default i18n;