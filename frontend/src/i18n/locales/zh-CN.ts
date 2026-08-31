import type en from './en';

const zhCn = {
  app: {
    title: '癌症临床试验导航',
    shortTitle: '试验导航',
    preRelease: '预发布版本',
  },
  header: {
    takeTour: '查看导览',
    switchToLight: '切换到浅色主题',
    switchToDark: '切换到深色主题',
    savedTrials: '已保存的试验',
    language: '语言',
    useEnglish: '使用英文',
  },
  languageGate: {
    title: '选择您的语言',
    description: '应用界面和试验详情将以此语言显示。您可以随时在顶部标题栏更改。',
  },
  chat: {
    newConversation: '新对话',
    placeholder: '描述您的情况，或询问某项试验……',
    sendHint: '按 Enter 发送',
    starter: '您好，我是 {{agent}}。我帮助人们查找加拿大各地的癌症临床试验。今天有什么可以帮您？',
    disclaimer:
      '{{agent}} 是人工智能，可能出错。请务必与您的医疗团队核实细节，并且不要分享个人信息。',
    askAiHint: '如何获取术语解释',
    askAiHintBody:
      '有不明白的词？在对话中<mark>高亮</mark>它，然后点击出现的<ask>询问 AI</ask>按钮，{{agent}} 会为您解释。',
    askAi: '询问 AI',
    addedTrials: '您添加的试验',
    removeFromContext: '将 {{trialRef}} 移出上下文',
    stop: '停止',
    send: '发送',
  },
  searching: {
    trials: '正在搜索癌症临床试验……',
    criteria: '正在将您的情况与入组标准比对……',
    sites: '正在查找您附近正在招募的中心……',
    phases: '正在查看试验的阶段与治疗方式……',
    gathering: '正在汇总最相关的试验……',
    reading: '正在读取回答',
  },
  feedback: {
    prompt: '告诉我们效果如何',
    helpful: '有帮助',
    notHelpful: '没有帮助',
    commentPlaceholder: '备注（可选）',
    nctPlaceholder: '助手本应使用的 NCT 编号',
    nctHint: '按 Enter 逐个添加 NCT 编号。',
    submit: '提交',
    submitted: '感谢您的反馈',
  },
  errors: {
    rateLimited: '您发送消息过于频繁。请稍等片刻后再试。',
    rateLimitedRetry: '您发送消息过于频繁。请等待 {{seconds}} 秒后再试。',
    unavailable: '助手暂时不可用，请稍后再试。',
    serverError: '我们这边出了点问题，请稍后再试。',
    network: '无法连接服务器。请检查网络连接后重试。',
    usageLimit: '本次对话已达到处理上限，请重新发起一条消息。',
    modelError: '我无法完成该请求，请换一种说法。',
    turnstileFailed: '我们无法验证您是真人。请刷新页面后重试。',
    generic: '出了点问题，请重试。',
    messageTooLong: '您的消息过长。请控制在 {{limit}} 个字符以内后重试。',
  },
  map: {
    closeSite: '关闭',
    trialCount_one: '{{count}} 项试验',
    trialCount_other: '{{count}} 项试验',
    coverageArea: '覆盖范围',
    coverageNotice: '覆盖范围包括加拿大各地的试验中心。',
    seeTrials: '在地图上查看试验',
    emptyHint: '试验将随着对话在此显示。',
  },
  status: {
    recruiting: '正在招募',
    openingSoon: '即将开放',
  },
  summary: {
    emptyTitle: '未选择试验',
    emptyDescription: '在地图上选择一项试验，或点按对话中的引用，即可查看详情。',
    trialDetails: '试验详情',
    showFullTitle: '显示完整标题',
    showLess: '收起',
    showMore: '再显示 {{n}} 项',
    status: '状态',
    cancerType: '癌症类型',
    phase: '阶段',
    treatment: '治疗',
    province: '省份',
    city: '城市',
    whoCanJoin: '谁可以参加',
    whoCannotJoin: '谁不能参加',
    translate: '翻译',
    seeOriginal: '查看原文',
    machineNotice: '本内容为自动翻译且未经审核。任何涉及参加资格的内容请以英文原文为准。',
    unavailableNotice: '翻译暂时不可用，正在显示英文原文。',
    askAbout: '向 {{agent}} 询问这项试验',
    addedToChat: '已添加到您的对话',
    addedToChatHint: '已添加，可以向 {{agent}} 提出任何问题',
    viewOnCtc: '在 Cancer Trials Canada 上查看',
    close: '关闭',
  },
  contact: {
    cta: '联系研究团队',
    title: '联系研究团队',
    sitePrompt: '您想联系哪个研究中心？',
    noContactsAtSite: '未提供联系人',
    contactsAt: '{{site}} 的联系人',
    changeSite: '选择其他研究中心',
    adviceTitle: '请先咨询您自己的医疗团队',
    adviceBody:
      '您的肿瘤科医生或护士了解您的病史，能够判断某项试验是否值得考虑。研究协调员可以解答与研究本身相关的问题，但无法就您的治疗提供建议。',
    email: '发送邮件',
    showPhone: '显示电话号码',
    phoneExtension: '分机 {{ext}}',
    unnamed: '研究联系人',
    emptyBody: '该试验没有登记联系方式。Cancer Trials Canada 上的试验页面可能提供其他联系方式。',
    loadError: '无法加载联系方式，请重试。',
  },
  bookmarks: {
    title: '已保存的试验',
    description: '您保存的试验。在您移除之前，它们会一直保留在本设备上。',
    emptyTitle: '尚未保存任何内容',
    emptyHint: '打开一项试验并点按书签图标，即可保存到这里。',
    exportAll: '全部导出为 PDF',
    exportOne: '将此试验导出为 PDF',
    remove: '从已保存的试验中移除',
    add: '保存这项试验',
    added: '已保存',
    unavailable: '暂时无法获取详情',
    close: '关闭已保存的试验',
  },
  export: {
    preparing: '正在生成您的 PDF',
    ready: '您的 PDF 正在下载',
    failed: '无法生成 PDF',
    failedHint: '请重试；如果一直失败，请告诉我们。',
  },
  data: {
    lastUpdated: '数据最后更新于 {{date}}',
    shortNotice: '数据反映的是最后一次更新时的状态。',
    detailedNotice: '试验数据最后更新于 {{date}}，可能已过时。详情请咨询您的医疗团队。',
  },
  tour: {
    next: '下一步',
    back: '上一步',
    done: '完成',
    skip: '跳过',
    steps: {
      welcome: {
        title: '欢迎使用试验导航',
        description:
          '这个简短导览会告诉您如何通过对话查找癌症临床试验、浏览地图，并就您感兴趣的试验提问。只需片刻。',
      },
      workspace: {
        title: '您的工作区',
        description:
          '三个面板协同工作：左侧是对话，右上是地图，右下是试验详情。随着对话进行，地图和详情会同步更新。我们逐一介绍。',
      },
      message: {
        title: '从一条消息开始',
        description:
          '用平实的语言描述您的情况，例如癌症类型、分期和所在城市。助手会追问细节，并找出匹配的试验。',
      },
      answer: {
        title: '阅读回答',
        description:
          '回答会像上面那样以标签形式引用真实试验：点击可在地图上定位，悬停可预览。带下划线的医学术语在悬停时会显示通俗解释。',
      },
      askAi: {
        title: '想问什么都可以',
        description:
          '在回答中高亮任意文字，就会出现“询问 AI”按钮，您可以请助手进一步解释或展开说明。',
      },
      feedback: {
        title: '告诉我们效果如何',
        description:
          '用点赞或点踩为每个回答评分。您还可以留下备注，或补充助手漏掉的试验，这有助于我们持续改进。',
      },
      map: {
        title: '在地图上查看试验',
        description:
          '随着对话逐步缩小范围，匹配的试验中心会以图钉形式出现。覆盖范围遍及加拿大各地的试验中心。',
      },
      details: {
        title: '试验详情',
        description: '点击任意图钉即可在此查看该试验：阶段、参加条件、地点，以及官方页面链接。',
      },
      officialPage: {
        title: '打开官方页面',
        description:
          '这会在 Cancer Trials Canada 网站上打开该试验，您可以阅读完整信息并了解如何联系。',
      },
      addToChat: {
        title: '询问某项试验',
        description: '对某个试验感兴趣？用这个按钮把它加入对话，然后向助手询问任何相关问题。',
      },
      addedTrials: {
        title: '您添加的试验',
        description: '您添加的试验会在发送消息前以标签形式显示在这里。不需要时点击 × 即可移除。',
      },
      finish: {
        title: '一切就绪',
        description:
          '导览到此结束。先在对话中描述您的情况，地图和试验详情会随之更新。您随时可以通过顶部的帮助按钮重新打开本导览。',
      },
    },
  },
  notFound: {
    eyebrow: '您走错地方了',
    title: '这里不是您要找的页面',
    action: '带我返回',
  },
  footer: {
    terms: '使用条款',
    oicrTerms: 'OICR 条款与条件',
    oicrPrivacy: 'OICR 隐私声明',
  },
} satisfies typeof en;

export default zhCn;
