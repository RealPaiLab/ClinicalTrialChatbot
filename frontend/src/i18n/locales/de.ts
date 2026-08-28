import type en from './en';

const de = {
  app: {
    title: 'Navigator für klinische Krebsstudien',
    shortTitle: 'Studien-Navigator',
    preRelease: 'Vorabversion',
  },
  header: {
    takeTour: 'Rundgang starten',
    switchToLight: 'Zum hellen Design wechseln',
    switchToDark: 'Zum dunklen Design wechseln',
    savedTrials: 'Gespeicherte Studien',
    language: 'Sprache',
    useEnglish: 'Englisch verwenden',
  },
  languageGate: {
    title: 'Wählen Sie Ihre Sprache',
    description:
      'Die App und die Studiendetails werden in dieser Sprache angezeigt. Sie können sie jederzeit oben im Kopfbereich ändern.',
  },
  chat: {
    newConversation: 'Neue Unterhaltung',
    placeholder: 'Beschreiben Sie Ihre Situation oder fragen Sie nach einer Studie...',
    sendHint: 'Eingabetaste zum Senden',
    starter:
      'Hallo, ich bin {{agent}}. Ich helfe Menschen, klinische Krebsstudien in ganz Kanada zu finden. Wie kann ich Ihnen heute helfen?',
    disclaimer:
      '{{agent}} ist eine KI und kann sich irren. Bestätigen Sie Angaben immer mit Ihrem Behandlungsteam und teilen Sie keine persönlichen Daten.',
    askAiHint: 'So lassen Sie sich einen Begriff erklären',
    askAiHintBody:
      'Ein Wort unklar? <mark>Markieren</mark> Sie es in der Unterhaltung und klicken Sie auf die Schaltfläche <ask>KI fragen</ask>, die erscheint. {{agent}} erklärt es Ihnen.',
    askAi: 'KI fragen',
    addedTrials: 'Ihre hinzugefügten Studien',
    removeFromContext: '{{trialRef}} aus dem Kontext entfernen',
    stop: 'Stoppen',
    send: 'Senden',
  },
  searching: {
    trials: 'Klinische Krebsstudien werden gesucht…',
    criteria: 'Ihre Angaben werden mit den Eignungskriterien abgeglichen…',
    sites: 'Rekrutierende Zentren in Ihrer Nähe werden geprüft…',
    phases: 'Studienphasen und Behandlungen werden geprüft…',
    gathering: 'Die relevantesten Studien werden zusammengestellt…',
    reading: 'Antwort wird gelesen',
  },
  feedback: {
    prompt: 'Sagen Sie uns, wie es war',
    helpful: 'Hilfreich',
    notHelpful: 'Nicht hilfreich',
    commentPlaceholder: 'Kommentar (optional)',
    nctPlaceholder: 'NCT, die der Agent hätte nutzen sollen',
    nctHint: 'Drücken Sie die Eingabetaste, um jede NCT-Nummer hinzuzufügen.',
    submit: 'Absenden',
    submitted: 'Danke für Ihr Feedback',
  },
  errors: {
    rateLimited:
      'Sie senden Nachrichten zu schnell. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
    rateLimitedRetry:
      'Sie senden Nachrichten zu schnell. Bitte warten Sie {{seconds}} Sekunden und versuchen Sie es erneut.',
    unavailable:
      'Der Assistent ist vorübergehend nicht verfügbar. Bitte versuchen Sie es in Kürze erneut.',
    serverError:
      'Auf unserer Seite ist etwas schiefgelaufen. Bitte versuchen Sie es gleich noch einmal.',
    network:
      'Der Server war nicht erreichbar. Prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    usageLimit:
      'Diese Unterhaltung hat ihr Verarbeitungslimit erreicht. Bitte beginnen Sie eine neue Nachricht.',
    modelError: 'Ich konnte diese Anfrage nicht abschließen. Bitte formulieren Sie sie anders.',
    turnstileFailed:
      'Wir konnten nicht bestätigen, dass Sie ein Mensch sind. Bitte laden Sie die Seite neu und versuchen Sie es erneut.',
    generic: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.',
    messageTooLong:
      'Ihre Nachricht ist zu lang. Bitte halten Sie sie unter {{limit}} Zeichen und versuchen Sie es erneut.',
  },
  map: {
    coverageArea: 'Abgedecktes Gebiet',
    coverageNotice: 'Die Abdeckung umfasst Studienzentren in ganz Kanada.',
    seeTrials: 'Studien auf der Karte ansehen',
    emptyHint: 'Studien erscheinen hier im Verlauf des Gesprächs.',
  },
  status: {
    recruiting: 'Rekrutierung läuft',
    openingSoon: 'Öffnet bald',
  },
  summary: {
    emptyTitle: 'Keine Studie ausgewählt',
    emptyDescription:
      'Wählen Sie eine Studie auf der Karte oder tippen Sie im Chat auf eine Quellenangabe, um die Details zu sehen.',
    trialDetails: 'Studiendetails',
    showFullTitle: 'Vollständigen Titel anzeigen',
    showLess: 'Weniger anzeigen',
    showMore: '{{n}} weitere anzeigen',
    status: 'Status',
    cancerType: 'Krebsart',
    phase: 'Phase',
    treatment: 'Behandlung',
    province: 'Provinz',
    city: 'Stadt',
    whoCanJoin: 'Wer teilnehmen kann',
    whoCannotJoin: 'Wer nicht teilnehmen kann',
    translate: 'Übersetzen',
    seeOriginal: 'Original anzeigen',
    machineNotice:
      'Automatisch übersetzt und nicht geprüft. Ziehen Sie für alles, was die Eignung betrifft, das englische Original heran.',
    unavailableNotice:
      'Die Übersetzung ist vorübergehend nicht verfügbar. Es wird das englische Original angezeigt.',
    askAbout: '{{agent}} zu dieser Studie fragen',
    addedToChat: 'Zu Ihrem Chat hinzugefügt',
    addedToChatHint: 'Hinzugefügt, fragen Sie {{agent}} alles dazu',
    viewOnCtc: 'Auf Cancer Trials Canada ansehen',
    close: 'Schließen',
  },
  bookmarks: {
    title: 'Gespeicherte Studien',
    description:
      'Von Ihnen gespeicherte Studien. Sie bleiben auf diesem Gerät, bis Sie sie entfernen.',
    emptyTitle: 'Noch nichts gespeichert',
    emptyHint:
      'Öffnen Sie eine Studie und tippen Sie auf das Lesezeichen-Symbol, um sie hier aufzubewahren.',
    exportAll: 'Alle als PDF exportieren',
    exportOne: 'Diese Studie als PDF exportieren',
    remove: 'Aus den gespeicherten Studien entfernen',
    add: 'Diese Studie speichern',
    added: 'Gespeichert',
    unavailable: 'Details derzeit nicht verfügbar',
    close: 'Gespeicherte Studien schließen',
  },
  export: {
    preparing: 'Ihr PDF wird erstellt',
    ready: 'Ihr PDF wird heruntergeladen',
    failed: 'Das PDF konnte nicht erstellt werden',
    failedHint: 'Versuchen Sie es erneut und sagen Sie uns Bescheid, wenn es weiter fehlschlägt.',
  },
  data: {
    lastUpdated: 'Daten zuletzt aktualisiert am {{date}}',
    shortNotice: 'Die Daten geben den Stand der letzten Aktualisierung wieder.',
    detailedNotice:
      'Die Studiendaten wurden zuletzt am {{date}} aktualisiert und können veraltet sein. Wenden Sie sich für weitere Einzelheiten an Ihr Behandlungsteam.',
  },
  tour: {
    next: 'Weiter',
    back: 'Zurück',
    done: 'Fertig',
    skip: 'Überspringen',
    steps: {
      welcome: {
        title: 'Willkommen beim Studien-Navigator',
        description:
          'Dieser kurze Rundgang zeigt Ihnen, wie Sie klinische Krebsstudien im Gespräch finden, die Karte erkunden und zu den Studien nachfragen, die Sie interessieren. Es dauert nur einen Moment.',
      },
      workspace: {
        title: 'Ihr Arbeitsbereich',
        description:
          'Drei Bereiche arbeiten zusammen: der Chat links, die Karte oben rechts und die Studiendetails unten rechts. Während Sie schreiben, bleiben Karte und Details synchron. Sehen wir uns alle drei an.',
      },
      message: {
        title: 'Beginnen Sie mit einer Nachricht',
        description:
          'Beschreiben Sie Ihre Situation in einfachen Worten, zum Beispiel Ihre Krebsart, das Stadium und Ihre Stadt. Der Assistent stellt Rückfragen und findet passende Studien.',
      },
      answer: {
        title: 'Die Antwort lesen',
        description:
          'Antworten zitieren echte Studien als Chips wie oben: Klicken Sie einen an, um ihn auf der Karte hervorzuheben, oder fahren Sie mit der Maus darüber für eine Vorschau. Unterstrichene Fachbegriffe zeigen beim Überfahren eine verständliche Erklärung.',
      },
      askAi: {
        title: 'Fragen Sie alles',
        description:
          'Markieren Sie einen beliebigen Text in einer Antwort, dann erscheint eine Schaltfläche KI fragen, mit der Sie den Assistenten um eine Erklärung oder Vertiefung bitten können.',
      },
      feedback: {
        title: 'Sagen Sie uns, wie es war',
        description:
          'Bewerten Sie jede Antwort mit Daumen hoch oder runter. Sie können einen Kommentar hinzufügen oder Studien vorschlagen, die der Assistent übersehen hat. Das hilft uns, ihn zu verbessern.',
      },
      map: {
        title: 'Studien auf der Karte ansehen',
        description:
          'Passende Studienzentren erscheinen als Markierungen, sobald das Gespräch die Auswahl eingrenzt. Die Abdeckung erstreckt sich auf Studienzentren in ganz Kanada.',
      },
      details: {
        title: 'Studiendetails',
        description:
          'Klicken Sie auf eine Markierung, um die Studie hier zu sehen: Phase, Eignung, Standorte und ein Link zur offiziellen Seite.',
      },
      officialPage: {
        title: 'Offizielle Seite öffnen',
        description:
          'Damit öffnen Sie die Studie auf der Website von Cancer Trials Canada, wo Sie den vollständigen Eintrag lesen und erfahren, wie Sie Kontakt aufnehmen können.',
      },
      addToChat: {
        title: 'Zu einer Studie fragen',
        description:
          'Neugierig auf eine bestimmte Studie? Fügen Sie sie mit dieser Schaltfläche Ihrem Chat hinzu und fragen Sie den Assistenten alles dazu.',
      },
      addedTrials: {
        title: 'Ihre hinzugefügten Studien',
        description:
          'Studien, die Sie hinzufügen, erscheinen hier als Chips, bevor Sie eine Nachricht senden. Entfernen Sie sie mit dem ×, sobald Sie sie nicht mehr brauchen.',
      },
      finish: {
        title: 'Alles bereit',
        description:
          'Das war der ganze Rundgang. Beschreiben Sie zunächst Ihre Situation im Chat, Karte und Studiendetails folgen dann von selbst. Sie können diesen Rundgang jederzeit über die Hilfe-Schaltfläche oben erneut starten.',
      },
    },
  },
  notFound: {
    eyebrow: 'Sie haben sich verlaufen',
    title: 'Sie sind hier nicht richtig',
    action: 'Zurück zur Startseite',
  },
  footer: {
    terms: 'Nutzungsbedingungen',
    oicrTerms: 'OICR-Geschäftsbedingungen',
    oicrPrivacy: 'OICR-Datenschutzerklärung',
  },
} satisfies typeof en;

export default de;
