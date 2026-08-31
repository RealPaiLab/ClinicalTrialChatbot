const en = {
  app: {
    title: 'Cancer Clinical Trial Navigator',
    shortTitle: 'Cancer Trial Navigator',
    preRelease: 'Pre-Release Version',
  },
  header: {
    takeTour: 'Take a tour',
    switchToLight: 'Switch to Light theme',
    switchToDark: 'Switch to Dark theme',
    savedTrials: 'Saved trials',
    language: 'Language',
    useEnglish: 'Use English',
  },
  languageGate: {
    title: 'Choose your language',
    description:
      'The app and the trial details will be shown in this language. You can change it anytime from the header.',
  },
  chat: {
    newConversation: 'New conversation',
    placeholder: 'Describe your situation or ask about a trial...',
    sendHint: 'Enter to send',
    starter:
      "Hello, I'm {{agent}}. I help people find cancer clinical trials across Canada. How can I help you today?",
    disclaimer:
      "{{agent}} is AI and can make mistakes, always confirm details with your care team, and don't share personal information.",
    askAiHint: 'How to get a term explained',
    askAiHintBody:
      "Don't understand a word? <mark>Highlight</mark> it in the conversation and click the <ask>Ask AI</ask> button that appears, and {{agent}} will explain it.",
    askAi: 'Ask AI',
    addedTrials: 'Your added trials',
    removeFromContext: 'Remove {{trialRef}} from context',
    stop: 'Stop',
    send: 'Send',
  },
  searching: {
    trials: 'Searching cancer clinical trials…',
    criteria: 'Matching your details to eligibility criteria…',
    sites: 'Scanning recruiting sites near you…',
    phases: 'Reviewing trial phases and treatments…',
    gathering: 'Gathering the most relevant trials…',
    reading: 'Reading the answer',
  },
  feedback: {
    prompt: 'Tell us how it did',
    helpful: 'Helpful',
    notHelpful: 'Not helpful',
    commentPlaceholder: 'Comment (optional)',
    nctPlaceholder: 'NCT the agent should have used',
    nctHint: 'Press Enter to add each NCT number.',
    submit: 'Submit',
    submitted: 'Thanks for the feedback',
  },
  errors: {
    rateLimited: "You're sending messages too quickly. Please wait a moment and try again.",
    rateLimitedRetry:
      "You're sending messages too quickly. Please wait {{seconds}}s and try again.",
    unavailable: 'The assistant is temporarily unavailable. Please try again shortly.',
    serverError: 'Something went wrong on our end. Please try again in a moment.',
    network: "Couldn't reach the server. Check your connection and try again.",
    usageLimit: 'This conversation reached its processing limit. Please start a new message.',
    modelError: "I couldn't complete that request. Please try rephrasing.",
    turnstileFailed: "We couldn't verify that you're human. Please refresh the page and try again.",
    generic: 'Something went wrong. Please try again.',
    messageTooLong:
      'Your message is too long. Please keep it under {{limit}} characters and try again.',
  },
  map: {
    closeSite: 'Close',
    trialCount_one: '{{count}} trial',
    trialCount_other: '{{count}} trials',
    coverageArea: 'Coverage area',
    coverageNotice: 'Coverage includes cancer trial sites across Canada.',
    seeTrials: 'See trials on the map',
    emptyHint: 'Trials will appear here as you chat.',
  },
  status: {
    recruiting: 'Recruiting',
    openingSoon: 'Opening soon',
  },
  summary: {
    emptyTitle: 'No trial selected',
    emptyDescription: 'Select a trial on the map or tap a citation in the chat to see its details.',
    trialDetails: 'Trial details',
    showFullTitle: 'Show full title',
    showLess: 'Show less',
    showMore: 'Show {{n}} more',
    status: 'Status',
    cancerType: 'Cancer type',
    phase: 'Phase',
    treatment: 'Treatment',
    province: 'Province',
    city: 'City',
    whoCanJoin: 'Who can join',
    whoCannotJoin: 'Who cannot join',
    translate: 'Translate',
    seeOriginal: 'See original',
    machineNotice:
      'Automatically translated and not reviewed. Check the English original for anything affecting eligibility.',
    unavailableNotice: 'Translation is temporarily unavailable. Showing the English original.',
    askAbout: 'Ask {{agent}} about this trial',
    addedToChat: 'Added to your chat',
    addedToChatHint: 'Added, ask {{agent}} anything about it',
    viewOnCtc: 'View on Cancer Trials Canada',
    close: 'Close',
  },
  contact: {
    cta: 'Contact research team',
    title: 'Contact the research team',
    sitePrompt: 'Which location would you like to contact?',
    noContactsAtSite: 'No contact listed',
    contactsAt: 'Contacts at {{site}}',
    changeSite: 'Choose a different location',
    adviceTitle: 'Talk to your own care team first',
    adviceBody:
      'Your oncologist or nurse knows your history and can tell you whether a trial is worth pursuing. Research coordinators can answer questions about the study itself, but they cannot advise you on your care.',
    email: 'Send an email',
    showPhone: 'Show phone number',
    phoneExtension: 'ext. {{ext}}',
    unnamed: 'Study contact',
    emptyBody:
      'This trial has no coordinator details on record. The Cancer Trials Canada page for the trial may list another way to get in touch.',
    loadError: 'Contact details could not be loaded. Please try again.',
  },
  bookmarks: {
    title: 'Saved trials',
    description: 'Trials you saved. They stay on this device until you remove them.',
    emptyTitle: 'Nothing saved yet',
    emptyHint: 'Open a trial and tap the bookmark icon to keep it here for later.',
    exportAll: 'Export all as PDF',
    exportOne: 'Export this trial as PDF',
    remove: 'Remove from saved trials',
    add: 'Save this trial',
    added: 'Saved',
    unavailable: 'Details unavailable right now',
    close: 'Close saved trials',
  },
  export: {
    preparing: 'Building your PDF',
    ready: 'Your PDF is downloading',
    failed: 'The PDF could not be built',
    failedHint: 'Try again, and let us know if it keeps failing.',
  },
  data: {
    lastUpdated: 'Data last updated {{date}}',
    shortNotice: 'Trial data reflects the status as of the last update.',
    detailedNotice:
      'Trial data was last updated on {{date}} and may be out of date. Please reach out to your care team for more details.',
  },
  tour: {
    next: 'Next',
    back: 'Back',
    done: 'Done',
    skip: 'Skip',
    steps: {
      welcome: {
        title: 'Welcome to Cancer Trial Navigator',
        description:
          'This quick tour shows you how to find cancer clinical trials by chatting, exploring the map, and asking about the ones that interest you. It only takes a moment.',
      },
      workspace: {
        title: 'Your workspace',
        description:
          'Three panels work together: the chat on the left, the map top-right, and trial details bottom-right. As you chat, the map and details stay in sync. Let us walk through each.',
      },
      message: {
        title: 'Start with a message',
        description:
          'Describe your situation in plain language, for example your cancer type, stage, and city. The assistant asks follow-up questions and finds matching trials.',
      },
      answer: {
        title: 'Reading the answer',
        description:
          'Answers cite real trials as pills like the one above: click one to focus it on the map, or hover to preview it. Underlined medical terms show a plain-language definition on hover.',
      },
      askAi: {
        title: 'Ask about anything',
        description:
          'Highlight any text in an answer and an Ask AI button appears, so you can ask the assistant to explain or expand on it in a follow-up.',
      },
      feedback: {
        title: 'Tell us how it did',
        description:
          'Rate each answer with a thumbs up or down. You can add a comment or suggest trials the assistant missed, which helps us keep improving it.',
      },
      map: {
        title: 'See trials on the map',
        description:
          'Matching trial sites appear as pins as the conversation narrows things down. Coverage spans trial sites across Canada.',
      },
      details: {
        title: 'Trial details',
        description:
          'Click any pin to see that trial here: its phase, eligibility, locations, and a link to the official page.',
      },
      officialPage: {
        title: 'Open the official page',
        description:
          'This opens the trial on the Cancer Trials Canada website, where you can read the full listing and find out how to get in touch.',
      },
      addToChat: {
        title: 'Ask about a trial',
        description:
          'Curious about a specific trial? Add it to your chat with this button, then ask the assistant anything about it.',
      },
      addedTrials: {
        title: 'Your added trials',
        description:
          'Trials you add show up here as chips before you send a message. Remove any of them with the × when you no longer need it.',
      },
      finish: {
        title: "You're all set",
        description:
          'That is the whole tour. Start by describing your situation in the chat, and the map and trial details will follow along. You can reopen this tour anytime from the help button up top.',
      },
    },
  },
  notFound: {
    eyebrow: "You've wandered off",
    title: "You're not in the right place",
    action: 'Take me back',
  },
  footer: {
    terms: 'Terms of Use',
    oicrTerms: 'OICR Terms and Conditions',
    oicrPrivacy: 'OICR Privacy Statement',
  },
};

export default en;
