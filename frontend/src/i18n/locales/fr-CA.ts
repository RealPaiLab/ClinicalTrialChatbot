import type en from './en';

const frCa = {
  app: {
    title: 'Navigateur d’essais cliniques en oncologie',
    shortTitle: 'Navigateur d’essais',
    preRelease: 'Version préliminaire',
  },
  header: {
    takeTour: 'Faire la visite guidée',
    switchToLight: 'Passer au thème clair',
    switchToDark: 'Passer au thème sombre',
    savedTrials: 'Essais enregistrés',
    language: 'Langue',
    useEnglish: 'Utiliser l’anglais',
  },
  languageGate: {
    title: 'Choisissez votre langue',
    description:
      'L’application et les détails des essais s’afficheront dans cette langue. Vous pouvez la changer à tout moment depuis l’en-tête.',
  },
  chat: {
    newConversation: 'Nouvelle conversation',
    placeholder: 'Décrivez votre situation ou posez une question sur un essai...',
    sendHint: 'Entrée pour envoyer',
    starter:
      'Bonjour, je suis {{agent}}. J’aide les gens à trouver des essais cliniques en oncologie en Ontario. Comment puis-je vous aider aujourd’hui?',
    disclaimer:
      '{{agent}} est une IA et peut se tromper. Confirmez toujours les détails avec votre équipe de soins et ne partagez pas de renseignements personnels.',
    askAiHint: 'Comment obtenir l’explication d’un terme',
    askAiHintBody:
      'Vous ne comprenez pas un mot? <mark>Surlignez</mark>-le dans la conversation et cliquez sur le bouton <ask>Demander à l’IA</ask> qui apparaît, et {{agent}} vous l’expliquera.',
    askAi: 'Demander à l’IA',
    addedTrials: 'Vos essais ajoutés',
    removeFromContext: 'Retirer {{nctNumber}} du contexte',
    stop: 'Arrêter',
    send: 'Envoyer',
  },
  searching: {
    trials: 'Recherche d’essais cliniques en oncologie…',
    criteria: 'Comparaison de vos renseignements aux critères d’admissibilité…',
    sites: 'Analyse des sites de recrutement près de chez vous…',
    phases: 'Examen des phases et des traitements des essais…',
    gathering: 'Regroupement des essais les plus pertinents…',
    reading: 'Lecture de la réponse',
  },
  feedback: {
    prompt: 'Dites-nous ce que vous en pensez',
    helpful: 'Utile',
    notHelpful: 'Pas utile',
    commentPlaceholder: 'Commentaire (facultatif)',
    nctPlaceholder: 'NCT que l’agent aurait dû utiliser',
    nctHint: 'Appuyez sur Entrée pour ajouter chaque numéro NCT.',
    submit: 'Envoyer',
    submitted: 'Merci pour votre commentaire',
  },
  errors: {
    rateLimited:
      'Vous envoyez des messages trop rapidement. Veuillez patienter un instant et réessayer.',
    rateLimitedRetry:
      'Vous envoyez des messages trop rapidement. Veuillez patienter {{seconds}} s et réessayer.',
    unavailable: 'L’assistant est temporairement indisponible. Veuillez réessayer sous peu.',
    serverError: 'Une erreur est survenue de notre côté. Veuillez réessayer dans un moment.',
    network: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
    usageLimit:
      'Cette conversation a atteint sa limite de traitement. Veuillez commencer un nouveau message.',
    modelError: 'Je n’ai pas pu traiter cette demande. Essayez de la reformuler.',
    turnstileFailed:
      'Nous n’avons pas pu vérifier que vous êtes une personne. Veuillez actualiser la page et réessayer.',
    generic: 'Une erreur est survenue. Veuillez réessayer.',
    messageTooLong: 'Votre message est trop long. Limitez-le à {{limit}} caractères et réessayez.',
  },
  map: {
    coverageArea: 'Zone couverte',
    coverageNotice: 'La couverture est actuellement limitée à l’Ontario.',
    seeTrials: 'Voir les essais sur la carte',
    emptyHint: 'Les essais apparaîtront ici au fil de la conversation.',
  },
  status: {
    recruiting: 'Recrutement en cours',
    openingSoon: 'Ouverture prochaine',
  },
  summary: {
    emptyTitle: 'Aucun essai sélectionné',
    emptyDescription:
      'Sélectionnez un essai sur la carte ou touchez une citation dans la conversation pour voir ses détails.',
    trialDetails: 'Détails de l’essai',
    showFullTitle: 'Afficher le titre complet',
    showLess: 'Afficher moins',
    status: 'Statut',
    cancerType: 'Type de cancer',
    phase: 'Phase',
    treatment: 'Traitement',
    province: 'Province',
    city: 'Ville',
    whoCanJoin: 'Qui peut participer',
    whoCannotJoin: 'Qui ne peut pas participer',
    translate: 'Traduire',
    seeOriginal: 'Voir l’original',
    machineNotice:
      'Traduction automatique non révisée. Consultez l’original anglais pour tout ce qui touche l’admissibilité.',
    unavailableNotice:
      'La traduction est temporairement indisponible. Affichage de l’original anglais.',
    askAbout: 'Poser une question à {{agent}} sur cet essai',
    addedToChat: 'Ajouté à votre conversation',
    addedToChatHint: 'Ajouté, posez n’importe quelle question à {{agent}}',
    viewOnCtc: 'Voir sur Cancer Trials Canada',
    close: 'Fermer',
  },
  bookmarks: {
    title: 'Essais enregistrés',
    description:
      'Les essais que vous avez enregistrés. Ils restent sur cet appareil jusqu’à ce que vous les retiriez.',
    emptyTitle: 'Rien d’enregistré pour l’instant',
    emptyHint: 'Ouvrez un essai et touchez l’icône de signet pour le conserver ici pour plus tard.',
    exportAll: 'Tout exporter en PDF',
    exportOne: 'Exporter cet essai en PDF',
    remove: 'Retirer des essais enregistrés',
    add: 'Enregistrer cet essai',
    added: 'Enregistré',
    unavailable: 'Détails indisponibles pour le moment',
    close: 'Fermer les essais enregistrés',
  },
  export: {
    preparing: 'Création de votre PDF',
    ready: 'Votre PDF est en cours de téléchargement',
    failed: 'Le PDF n’a pas pu être créé',
    failedHint: 'Réessayez, et dites-le-nous si le problème persiste.',
  },
  data: {
    lastUpdated: 'Données mises à jour le {{date}}',
    shortNotice: 'Les données reflètent le statut au moment de la dernière mise à jour.',
    detailedNotice:
      'Les données des essais ont été mises à jour le {{date}} et peuvent être périmées. Communiquez avec votre équipe de soins pour plus de détails.',
  },
  tour: {
    next: 'Suivant',
    back: 'Précédent',
    done: 'Terminé',
    skip: 'Passer',
    steps: {
      welcome: {
        title: 'Bienvenue dans le Navigateur d’essais',
        description:
          'Cette courte visite vous montre comment trouver des essais cliniques en oncologie en discutant, en explorant la carte et en posant des questions sur ceux qui vous intéressent. Ce sera bref.',
      },
      workspace: {
        title: 'Votre espace de travail',
        description:
          'Trois panneaux travaillent ensemble : la conversation à gauche, la carte en haut à droite et les détails de l’essai en bas à droite. Au fil de la conversation, la carte et les détails restent synchronisés. Voyons chacun d’eux.',
      },
      message: {
        title: 'Commencez par un message',
        description:
          'Décrivez votre situation en mots simples, par exemple votre type de cancer, le stade et votre ville. L’assistant pose des questions complémentaires et trouve les essais correspondants.',
      },
      answer: {
        title: 'Lire la réponse',
        description:
          'Les réponses citent de vrais essais sous forme de pastilles comme celle ci-dessus : cliquez sur l’une d’elles pour la mettre en évidence sur la carte, ou survolez-la pour un aperçu. Les termes médicaux soulignés affichent une définition en langage clair au survol.',
      },
      askAi: {
        title: 'Posez n’importe quelle question',
        description:
          'Surlignez n’importe quel texte d’une réponse et un bouton Demander à l’IA apparaît : vous pouvez ainsi demander à l’assistant de l’expliquer ou de le développer.',
      },
      feedback: {
        title: 'Dites-nous ce que vous en pensez',
        description:
          'Évaluez chaque réponse avec un pouce en haut ou en bas. Vous pouvez ajouter un commentaire ou suggérer des essais que l’assistant a manqués, ce qui nous aide à l’améliorer.',
      },
      map: {
        title: 'Voir les essais sur la carte',
        description:
          'Les sites des essais correspondants apparaissent sous forme de repères à mesure que la conversation précise vos besoins. La couverture est actuellement limitée à l’Ontario.',
      },
      details: {
        title: 'Détails de l’essai',
        description:
          'Cliquez sur un repère pour voir l’essai ici : sa phase, l’admissibilité, les lieux et un lien vers la page officielle.',
      },
      officialPage: {
        title: 'Ouvrir la page officielle',
        description:
          'Ceci ouvre l’essai sur le site de Cancer Trials Canada, où vous pouvez lire la fiche complète et savoir comment entrer en contact.',
      },
      addToChat: {
        title: 'Poser une question sur un essai',
        description:
          'Un essai vous intrigue? Ajoutez-le à votre conversation avec ce bouton, puis posez n’importe quelle question à l’assistant.',
      },
      addedTrials: {
        title: 'Vos essais ajoutés',
        description:
          'Les essais que vous ajoutez apparaissent ici sous forme de pastilles avant l’envoi de votre message. Retirez-les avec le × quand vous n’en avez plus besoin.',
      },
      finish: {
        title: 'Tout est prêt',
        description:
          'Voilà pour la visite. Commencez par décrire votre situation dans la conversation, et la carte ainsi que les détails suivront. Vous pouvez relancer cette visite à tout moment avec le bouton d’aide en haut.',
      },
    },
  },
  notFound: {
    eyebrow: 'Vous vous êtes égaré',
    title: 'Vous n’êtes pas au bon endroit',
    action: 'Ramenez-moi',
  },
  footer: {
    terms: 'Conditions d’utilisation',
    oicrTerms: 'Conditions générales de l’OICR',
    oicrPrivacy: 'Déclaration de confidentialité de l’OICR',
  },
} satisfies typeof en;

export default frCa;
