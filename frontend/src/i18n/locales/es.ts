import type en from './en';

const es = {
  app: {
    title: 'Navegador de ensayos clínicos oncológicos',
    shortTitle: 'Navegador de ensayos',
    preRelease: 'Versión preliminar',
  },
  header: {
    takeTour: 'Hacer el recorrido',
    switchToLight: 'Cambiar al tema claro',
    switchToDark: 'Cambiar al tema oscuro',
    savedTrials: 'Ensayos guardados',
    language: 'Idioma',
    useEnglish: 'Usar inglés',
  },
  languageGate: {
    title: 'Elija su idioma',
    description:
      'La aplicación y los detalles de los ensayos se mostrarán en este idioma. Puede cambiarlo cuando quiera desde la cabecera.',
  },
  chat: {
    newConversation: 'Nueva conversación',
    placeholder: 'Describa su situación o pregunte por un ensayo...',
    sendHint: 'Entrar para enviar',
    starter:
      'Hola, soy {{agent}}. Ayudo a las personas a encontrar ensayos clínicos oncológicos en todo Canadá. ¿En qué puedo ayudarle hoy?',
    disclaimer:
      '{{agent}} es una IA y puede equivocarse. Confirme siempre los detalles con su equipo médico y no comparta información personal.',
    askAiHint: 'Cómo obtener la explicación de un término',
    askAiHintBody:
      '¿No entiende una palabra? <mark>Resáltela</mark> en la conversación y haga clic en el botón <ask>Preguntar a la IA</ask> que aparece; {{agent}} se la explicará.',
    askAi: 'Preguntar a la IA',
    addedTrials: 'Sus ensayos añadidos',
    removeFromContext: 'Quitar {{trialRef}} del contexto',
    stop: 'Detener',
    send: 'Enviar',
  },
  searching: {
    trials: 'Buscando ensayos clínicos oncológicos…',
    criteria: 'Comparando sus datos con los criterios de elegibilidad…',
    sites: 'Revisando centros que reclutan cerca de usted…',
    phases: 'Revisando las fases y los tratamientos de los ensayos…',
    gathering: 'Reuniendo los ensayos más relevantes…',
    reading: 'Leyendo la respuesta',
  },
  feedback: {
    prompt: 'Cuéntenos qué tal estuvo',
    helpful: 'Útil',
    notHelpful: 'No útil',
    commentPlaceholder: 'Comentario (opcional)',
    nctPlaceholder: 'NCT que el agente debería haber usado',
    nctHint: 'Pulse Entrar para añadir cada número NCT.',
    submit: 'Enviar',
    submitted: 'Gracias por su comentario',
  },
  errors: {
    rateLimited: 'Está enviando mensajes demasiado rápido. Espere un momento e inténtelo de nuevo.',
    rateLimitedRetry:
      'Está enviando mensajes demasiado rápido. Espere {{seconds}} s e inténtelo de nuevo.',
    unavailable: 'El asistente no está disponible temporalmente. Inténtelo de nuevo en breve.',
    serverError: 'Algo salió mal de nuestro lado. Inténtelo de nuevo en un momento.',
    network: 'No se pudo conectar con el servidor. Revise su conexión e inténtelo de nuevo.',
    usageLimit:
      'Esta conversación alcanzó su límite de procesamiento. Comience un mensaje nuevo, por favor.',
    modelError: 'No pude completar esa solicitud. Intente reformularla.',
    turnstileFailed:
      'No pudimos verificar que sea una persona. Actualice la página e inténtelo de nuevo.',
    generic: 'Algo salió mal. Inténtelo de nuevo.',
    messageTooLong:
      'Su mensaje es demasiado largo. Manténgalo por debajo de {{limit}} caracteres e inténtelo de nuevo.',
  },
  map: {
    closeSite: 'Cerrar',
    trialCount_one: '{{count}} ensayo',
    trialCount_other: '{{count}} ensayos',
    coverageArea: 'Área de cobertura',
    coverageNotice: 'La cobertura incluye centros de ensayos clínicos en todo Canadá.',
    seeTrials: 'Ver los ensayos en el mapa',
    emptyHint: 'Los ensayos aparecerán aquí a medida que converse.',
  },
  status: {
    recruiting: 'Reclutando',
    openingSoon: 'Próxima apertura',
  },
  summary: {
    emptyTitle: 'Ningún ensayo seleccionado',
    emptyDescription:
      'Seleccione un ensayo en el mapa o toque una cita en la conversación para ver sus detalles.',
    trialDetails: 'Detalles del ensayo',
    showFullTitle: 'Mostrar el título completo',
    showLess: 'Mostrar menos',
    showMore: 'Mostrar {{n}} más',
    status: 'Estado',
    cancerType: 'Tipo de cáncer',
    phase: 'Fase',
    treatment: 'Tratamiento',
    province: 'Provincia',
    city: 'Ciudad',
    whoCanJoin: 'Quién puede participar',
    whoCannotJoin: 'Quién no puede participar',
    translate: 'Traducir',
    seeOriginal: 'Ver el original',
    machineNotice:
      'Traducción automática sin revisar. Consulte el original en inglés para todo lo relacionado con la elegibilidad.',
    unavailableNotice:
      'La traducción no está disponible temporalmente. Se muestra el original en inglés.',
    askAbout: 'Preguntar a {{agent}} sobre este ensayo',
    addedToChat: 'Añadido a su conversación',
    addedToChatHint: 'Añadido, pregunte a {{agent}} lo que quiera',
    viewOnCtc: 'Ver en Cancer Trials Canada',
    close: 'Cerrar',
  },
  contact: {
    cta: 'Contactar al equipo de investigación',
    title: 'Contactar al equipo de investigación',
    sitePrompt: '¿A qué centro desea contactar?',
    noContactsAtSite: 'Sin contacto registrado',
    contactsAt: 'Contactos en {{site}}',
    changeSite: 'Elegir otro centro',
    adviceTitle: 'Hable primero con su propio equipo médico',
    adviceBody:
      'Su oncólogo o su enfermera conoce su historial y puede decirle si vale la pena considerar un ensayo. Los coordinadores de investigación responden preguntas sobre el estudio, pero no pueden asesorarle sobre su atención médica.',
    email: 'Enviar un correo electrónico',
    showPhone: 'Mostrar el número de teléfono',
    phoneExtension: 'ext. {{ext}}',
    unnamed: 'Contacto del estudio',
    emptyBody:
      'Este ensayo no tiene datos de contacto registrados. La página del ensayo en Cancer Trials Canada puede indicar otra forma de comunicarse.',
    loadError: 'No se pudieron cargar los datos de contacto. Inténtelo de nuevo.',
  },
  bookmarks: {
    title: 'Ensayos guardados',
    description: 'Los ensayos que guardó. Permanecen en este dispositivo hasta que los quite.',
    emptyTitle: 'Nada guardado todavía',
    emptyHint: 'Abra un ensayo y toque el icono de marcador para conservarlo aquí para después.',
    exportAll: 'Exportar todo en PDF',
    exportOne: 'Exportar este ensayo en PDF',
    remove: 'Quitar de los ensayos guardados',
    add: 'Guardar este ensayo',
    added: 'Guardado',
    unavailable: 'Detalles no disponibles en este momento',
    close: 'Cerrar los ensayos guardados',
  },
  export: {
    preparing: 'Creando su PDF',
    ready: 'Su PDF se está descargando',
    failed: 'No se pudo crear el PDF',
    failedHint: 'Inténtelo de nuevo y avísenos si sigue fallando.',
  },
  data: {
    lastUpdated: 'Datos actualizados el {{date}}',
    shortNotice: 'Los datos reflejan el estado en la última actualización.',
    detailedNotice:
      'Los datos de los ensayos se actualizaron por última vez el {{date}} y pueden estar desactualizados. Consulte a su equipo médico para más detalles.',
  },
  tour: {
    next: 'Siguiente',
    back: 'Atrás',
    done: 'Listo',
    skip: 'Omitir',
    steps: {
      welcome: {
        title: 'Bienvenido al Navegador de ensayos',
        description:
          'Este breve recorrido le muestra cómo encontrar ensayos clínicos oncológicos conversando, explorando el mapa y preguntando por los que le interesen. Solo toma un momento.',
      },
      workspace: {
        title: 'Su espacio de trabajo',
        description:
          'Tres paneles trabajan juntos: la conversación a la izquierda, el mapa arriba a la derecha y los detalles del ensayo abajo a la derecha. Mientras conversa, el mapa y los detalles se mantienen sincronizados. Veamos cada uno.',
      },
      message: {
        title: 'Empiece con un mensaje',
        description:
          'Describa su situación con palabras sencillas, por ejemplo su tipo de cáncer, la etapa y su ciudad. El asistente hace preguntas de seguimiento y encuentra los ensayos que coinciden.',
      },
      answer: {
        title: 'Leer la respuesta',
        description:
          'Las respuestas citan ensayos reales como las etiquetas de arriba: haga clic en una para enfocarla en el mapa, o pase el cursor para verla en resumen. Los términos médicos subrayados muestran una definición sencilla al pasar el cursor.',
      },
      askAi: {
        title: 'Pregunte lo que quiera',
        description:
          'Resalte cualquier texto de una respuesta y aparecerá un botón Preguntar a la IA, para que pida al asistente que lo explique o lo amplíe.',
      },
      feedback: {
        title: 'Cuéntenos qué tal estuvo',
        description:
          'Valore cada respuesta con un pulgar arriba o abajo. Puede añadir un comentario o sugerir ensayos que el asistente pasó por alto, lo que nos ayuda a mejorarlo.',
      },
      map: {
        title: 'Ver los ensayos en el mapa',
        description:
          'Los centros de los ensayos que coinciden aparecen como marcadores a medida que la conversación afina la búsqueda. La cobertura abarca centros de ensayos en todo Canadá.',
      },
      details: {
        title: 'Detalles del ensayo',
        description:
          'Haga clic en cualquier marcador para ver ese ensayo aquí: su fase, la elegibilidad, las ubicaciones y un enlace a la página oficial.',
      },
      officialPage: {
        title: 'Abrir la página oficial',
        description:
          'Esto abre el ensayo en el sitio de Cancer Trials Canada, donde puede leer la ficha completa y saber cómo ponerse en contacto.',
      },
      addToChat: {
        title: 'Preguntar por un ensayo',
        description:
          '¿Le interesa un ensayo concreto? Añádalo a su conversación con este botón y pregunte al asistente lo que quiera sobre él.',
      },
      addedTrials: {
        title: 'Sus ensayos añadidos',
        description:
          'Los ensayos que añade aparecen aquí como etiquetas antes de enviar el mensaje. Quite cualquiera de ellos con la × cuando ya no lo necesite.',
      },
      finish: {
        title: 'Todo listo',
        description:
          'Ese es todo el recorrido. Empiece describiendo su situación en la conversación, y el mapa y los detalles del ensayo le seguirán. Puede volver a abrir este recorrido cuando quiera desde el botón de ayuda de arriba.',
      },
    },
  },
  notFound: {
    eyebrow: 'Se ha desviado',
    title: 'No está en el lugar correcto',
    action: 'Llévame de vuelta',
  },
  footer: {
    terms: 'Condiciones de uso',
    oicrTerms: 'Términos y condiciones del OICR',
    oicrPrivacy: 'Declaración de privacidad del OICR',
  },
} satisfies typeof en;

export default es;
