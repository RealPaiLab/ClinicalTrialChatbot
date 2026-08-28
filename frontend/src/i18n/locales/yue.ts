import type en from './en';

const yue = {
  app: {
    title: '癌症臨床試驗導航',
    shortTitle: '試驗導航',
    preRelease: '預發佈版本',
  },
  header: {
    takeTour: '睇下導覽',
    switchToLight: '轉做淺色主題',
    switchToDark: '轉做深色主題',
    savedTrials: '儲低咗嘅試驗',
    language: '語言',
    useEnglish: '用英文',
  },
  languageGate: {
    title: '揀你嘅語言',
    description: '應用程式同試驗詳情會用呢個語言顯示。你隨時可以喺上面嘅標題列改。',
  },
  chat: {
    newConversation: '新對話',
    placeholder: '講下你嘅情況，或者問下某個試驗……',
    sendHint: '撳 Enter 就send',
    starter: '你好，我係 {{agent}}。我幫人搵加拿大各地嘅癌症臨床試驗。今日有咩可以幫到你？',
    disclaimer:
      '{{agent}} 係人工智能，可能會出錯。任何細節都請同你嘅醫療團隊確認，亦唔好分享個人資料。',
    askAiHint: '點樣攞一個詞語嘅解釋',
    askAiHintBody:
      '有字唔明？喺對話入面<mark>螢光標示</mark>佢，然後撳出現嘅<ask>問下 AI</ask>掣，{{agent}} 就會解釋畀你聽。',
    askAi: '問下 AI',
    addedTrials: '你加咗嘅試驗',
    removeFromContext: '將 {{trialRef}} 由上下文移走',
    stop: '停',
    send: 'send出',
  },
  searching: {
    trials: '搵緊癌症臨床試驗……',
    criteria: '拎緊你嘅資料同參加條件對比……',
    sites: '睇緊你附近仲招緊人嘅中心……',
    phases: '睇緊試驗嘅階段同治療方式……',
    gathering: '執緊最啱你嘅試驗……',
    reading: '讀緊個答案',
  },
  feedback: {
    prompt: '講下做得點',
    helpful: '有幫助',
    notHelpful: '冇幫助',
    commentPlaceholder: '意見（可以唔填）',
    nctPlaceholder: '助手本應用嘅 NCT 編號',
    nctHint: '撳 Enter 逐個加 NCT 編號。',
    submit: '交出',
    submitted: '多謝你嘅意見',
  },
  errors: {
    rateLimited: '你send得太密喇。等陣先再試。',
    rateLimitedRetry: '你send得太密喇。等 {{seconds}} 秒先再試。',
    unavailable: '助手暫時用唔到，遲啲再試。',
    serverError: '我哋呢邊出咗啲問題，遲啲再試。',
    network: '連唔到伺服器。檢查下你嘅網絡再試。',
    usageLimit: '呢個對話已經到咗處理上限，請開一條新訊息。',
    modelError: '我做唔到呢個要求，試下換個講法。',
    turnstileFailed: '我哋確認唔到你係真人。請重新整理個頁面再試。',
    generic: '出咗啲問題，再試多次。',
    messageTooLong: '你嘅訊息太長喇。請控制喺 {{limit}} 個字以內再試。',
  },
  map: {
    coverageArea: '覆蓋範圍',
    coverageNotice: '覆蓋範圍包括加拿大各地嘅試驗中心。',
    seeTrials: '喺地圖睇試驗',
    emptyHint: '傾落去，試驗就會喺呢度出現。',
  },
  status: {
    recruiting: '招募緊',
    openingSoon: '就快開放',
  },
  summary: {
    emptyTitle: '未揀試驗',
    emptyDescription: '喺地圖揀個試驗，或者撳對話入面嘅引用，就可以睇詳情。',
    trialDetails: '試驗詳情',
    showFullTitle: '睇晒成個標題',
    showLess: '收埋',
    showMore: '再睇多 {{n}} 項',
    status: '狀態',
    cancerType: '癌症類型',
    phase: '階段',
    treatment: '治療',
    province: '省份',
    city: '城市',
    whoCanJoin: '邊個可以參加',
    whoCannotJoin: '邊個唔可以參加',
    translate: '翻譯',
    seeOriginal: '睇返原文',
    machineNotice: '呢啲內容係自動翻譯，未經審核。凡係影響參加資格嘅內容，請以英文原文為準。',
    unavailableNotice: '翻譯暫時用唔到，而家顯示緊英文原文。',
    askAbout: '問下 {{agent}} 關於呢個試驗',
    addedToChat: '已經加咗入你嘅對話',
    addedToChatHint: '加咗喇，可以問 {{agent}} 任何嘢',
    viewOnCtc: '喺 Cancer Trials Canada 上面睇',
    close: '閂咗佢',
  },
  bookmarks: {
    title: '儲低咗嘅試驗',
    description: '你儲低嘅試驗。除非你自己刪走，唔然會一直留喺呢部機。',
    emptyTitle: '未儲低任何嘢',
    emptyHint: '打開一個試驗，撳書籤圖示就可以儲喺呢度。',
    exportAll: '全部匯出做 PDF',
    exportOne: '將呢個試驗匯出做 PDF',
    remove: '由儲低咗嘅試驗度移走',
    add: '儲低呢個試驗',
    added: '已儲低',
    unavailable: '而家攞唔到詳情',
    close: '閂咗儲低嘅試驗',
  },
  export: {
    preparing: '整緊你嘅 PDF',
    ready: '你嘅 PDF 下載緊',
    failed: '整唔到個 PDF',
    failedHint: '再試多次；如果一直唔得，話我哋知。',
  },
  data: {
    lastUpdated: '資料最後更新於 {{date}}',
    shortNotice: '資料反映最後一次更新嗰陣嘅狀態。',
    detailedNotice: '試驗資料最後更新於 {{date}}，可能已經過時。詳情請問下你嘅醫療團隊。',
  },
  tour: {
    next: '下一步',
    back: '上一步',
    done: '搞掂',
    skip: '跳過',
    steps: {
      welcome: {
        title: '歡迎使用試驗導航',
        description:
          '呢個簡短導覽會話畀你知點樣傾偈搵癌症臨床試驗、睇地圖，同埋問你有興趣嘅試驗。好快就睇完。',
      },
      workspace: {
        title: '你嘅工作區',
        description:
          '三個版面一齊運作：左邊係對話，右上係地圖，右下係試驗詳情。你傾落去，地圖同詳情會跟住更新。我哋逐個講。',
      },
      message: {
        title: '由一條訊息開始',
        description:
          '用平時講嘢嘅方式講你嘅情況，例如癌症類型、期數同你住嘅城市。助手會追問，再搵啱你嘅試驗。',
      },
      answer: {
        title: '睇個答案',
        description:
          '答案會好似上面咁用標籤引用真實試驗：撳一下就會喺地圖定位，游標放上去就有預覽。有底線嘅醫學名詞，游標放上去會顯示簡單解釋。',
      },
      askAi: {
        title: '想問乜都得',
        description:
          '喺答案入面螢光標示任何文字，就會出現「問下 AI」掣，你可以叫助手再解釋或者講深入啲。',
      },
      feedback: {
        title: '講下做得點',
        description:
          '用讚好或者踩落嚟評價每個答案。你仲可以寫意見，或者補充助手漏咗嘅試驗，幫我哋做得更好。',
      },
      map: {
        title: '喺地圖睇試驗',
        description:
          '傾落去範圍收窄，啱你嘅試驗中心就會以圖釘形式出現。覆蓋範圍遍及加拿大各地嘅試驗中心。',
      },
      details: {
        title: '試驗詳情',
        description: '撳任何一個圖釘，就可以喺呢度睇嗰個試驗：階段、參加條件、地點同官方頁面連結。',
      },
      officialPage: {
        title: '打開官方頁面',
        description:
          '呢度會喺 Cancer Trials Canada 網站打開個試驗，你可以睇晒成份資料，亦知道點樣聯絡。',
      },
      addToChat: {
        title: '問下某個試驗',
        description: '對某個試驗有興趣？撳呢個掣加入對話，然後問助手任何關於佢嘅嘢。',
      },
      addedTrials: {
        title: '你加咗嘅試驗',
        description: '你加咗嘅試驗會喺你send訊息前喺呢度以標籤顯示。唔使嘅時候撳 × 就移走。',
      },
      finish: {
        title: '一切準備好',
        description:
          '導覽到呢度完。先喺對話講下你嘅情況，地圖同試驗詳情就會跟住嚟。你隨時可以撳上面嘅幫助掣再睇一次。',
      },
    },
  },
  notFound: {
    eyebrow: '你行錯咗路',
    title: '你唔係喺啱嘅地方',
    action: '帶我返去',
  },
  footer: {
    terms: '使用條款',
    oicrTerms: 'OICR 條款及細則',
    oicrPrivacy: 'OICR 私隱聲明',
  },
} satisfies typeof en;

export default yue;
