import { AGENT_NAME } from '@/constants/chat';
import { LanguageCode } from '@/constants/language';

export interface PanelStrings {
  status: string;
  cancerType: string;
  phase: string;
  treatment: string;
  province: string;
  city: string;
  whoCanJoin: string;
  whoCannotJoin: string;
  recruiting: string;
  openingSoon: string;
  translate: string;
  seeOriginal: string;
  machineNotice: string;
  unavailableNotice: string;
  askAbout: string;
  addedToChat: string;
  addedToChatHint: string;
  viewOnCtc: string;
  close: string;
}

/**
 * Summary-panel copy per language. Deliberately a typed object literal rather
 * than an i18n library: these strings are static, with no pluralization,
 * interpolation, or locale formatting to justify one.
 */
export const PANEL_STRINGS = {
  [LanguageCode.En]: {
    status: 'Status',
    cancerType: 'Cancer type',
    phase: 'Phase',
    treatment: 'Treatment',
    province: 'Province',
    city: 'City',
    whoCanJoin: 'Who can join',
    whoCannotJoin: 'Who cannot join',
    recruiting: 'Recruiting',
    openingSoon: 'Opening soon',
    translate: 'Translate',
    seeOriginal: 'See original',
    machineNotice:
      'Automatically translated and not reviewed. Check the English original for anything affecting eligibility.',
    unavailableNotice: 'Translation is temporarily unavailable. Showing the English original.',
    askAbout: `Ask ${AGENT_NAME} about this trial`,
    addedToChat: 'Added to your chat',
    addedToChatHint: `Added, ask ${AGENT_NAME} anything about it`,
    viewOnCtc: 'View on Cancer Trials Canada',
    close: 'Close',
  },
  [LanguageCode.FrCa]: {
    status: 'Statut',
    cancerType: 'Type de cancer',
    phase: 'Phase',
    treatment: 'Traitement',
    province: 'Province',
    city: 'Ville',
    whoCanJoin: 'Qui peut participer',
    whoCannotJoin: 'Qui ne peut pas participer',
    recruiting: 'Recrutement en cours',
    openingSoon: 'Ouverture prochaine',
    translate: 'Traduire',
    seeOriginal: "Voir l'original",
    machineNotice:
      "Traduction automatique non révisée. Consultez l'original anglais pour tout ce qui touche l'admissibilité.",
    unavailableNotice:
      "La traduction est temporairement indisponible. Affichage de l'original anglais.",
    askAbout: `Poser une question à ${AGENT_NAME} sur cet essai`,
    addedToChat: 'Ajouté à votre conversation',
    addedToChatHint: `Ajouté, posez n'importe quelle question à ${AGENT_NAME}`,
    viewOnCtc: 'Voir sur Cancer Trials Canada',
    close: 'Fermer',
  },
  [LanguageCode.Es]: {
    status: 'Estado',
    cancerType: 'Tipo de cáncer',
    phase: 'Fase',
    treatment: 'Tratamiento',
    province: 'Provincia',
    city: 'Ciudad',
    whoCanJoin: 'Quién puede participar',
    whoCannotJoin: 'Quién no puede participar',
    recruiting: 'Reclutando',
    openingSoon: 'Próxima apertura',
    translate: 'Traducir',
    seeOriginal: 'Ver el original',
    machineNotice:
      'Traducción automática sin revisar. Consulte el original en inglés para todo lo relacionado con la elegibilidad.',
    unavailableNotice:
      'La traducción no está disponible temporalmente. Se muestra el original en inglés.',
    askAbout: `Preguntar a ${AGENT_NAME} sobre este ensayo`,
    addedToChat: 'Añadido a tu conversación',
    addedToChatHint: `Añadido, pregunta a ${AGENT_NAME} lo que quieras`,
    viewOnCtc: 'Ver en Cancer Trials Canada',
    close: 'Cerrar',
  },
  [LanguageCode.PtBr]: {
    status: 'Situação',
    cancerType: 'Tipo de câncer',
    phase: 'Fase',
    treatment: 'Tratamento',
    province: 'Província',
    city: 'Cidade',
    whoCanJoin: 'Quem pode participar',
    whoCannotJoin: 'Quem não pode participar',
    recruiting: 'Recrutando',
    openingSoon: 'Abertura em breve',
    translate: 'Traduzir',
    seeOriginal: 'Ver o original',
    machineNotice:
      'Tradução automática não revisada. Consulte o original em inglês para tudo que afete a elegibilidade.',
    unavailableNotice:
      'A tradução está temporariamente indisponível. Exibindo o original em inglês.',
    askAbout: `Perguntar a ${AGENT_NAME} sobre este estudo`,
    addedToChat: 'Adicionado à sua conversa',
    addedToChatHint: `Adicionado, pergunte qualquer coisa a ${AGENT_NAME}`,
    viewOnCtc: 'Ver no Cancer Trials Canada',
    close: 'Fechar',
  },
  [LanguageCode.De]: {
    status: 'Status',
    cancerType: 'Krebsart',
    phase: 'Phase',
    treatment: 'Behandlung',
    province: 'Provinz',
    city: 'Stadt',
    whoCanJoin: 'Wer teilnehmen kann',
    whoCannotJoin: 'Wer nicht teilnehmen kann',
    recruiting: 'Rekrutierung läuft',
    openingSoon: 'Öffnet bald',
    translate: 'Übersetzen',
    seeOriginal: 'Original anzeigen',
    machineNotice:
      'Automatisch übersetzt und nicht geprüft. Ziehen Sie für alles, was die Eignung betrifft, das englische Original heran.',
    unavailableNotice:
      'Die Übersetzung ist vorübergehend nicht verfügbar. Es wird das englische Original angezeigt.',
    askAbout: `${AGENT_NAME} zu dieser Studie fragen`,
    addedToChat: 'Zu Ihrem Chat hinzugefügt',
    addedToChatHint: `Hinzugefügt, fragen Sie ${AGENT_NAME} alles dazu`,
    viewOnCtc: 'Auf Cancer Trials Canada ansehen',
    close: 'Schließen',
  },
  [LanguageCode.It]: {
    status: 'Stato',
    cancerType: 'Tipo di tumore',
    phase: 'Fase',
    treatment: 'Trattamento',
    province: 'Provincia',
    city: 'Città',
    whoCanJoin: 'Chi può partecipare',
    whoCannotJoin: 'Chi non può partecipare',
    recruiting: 'Reclutamento in corso',
    openingSoon: 'Apertura prossima',
    translate: 'Traduci',
    seeOriginal: "Vedi l'originale",
    machineNotice:
      "Traduzione automatica non revisionata. Consulta l'originale inglese per tutto ciò che riguarda l'idoneità.",
    unavailableNotice:
      "La traduzione non è temporaneamente disponibile. Viene mostrato l'originale inglese.",
    askAbout: `Chiedi a ${AGENT_NAME} di questo studio`,
    addedToChat: 'Aggiunto alla tua conversazione',
    addedToChatHint: `Aggiunto, chiedi qualsiasi cosa a ${AGENT_NAME}`,
    viewOnCtc: 'Vedi su Cancer Trials Canada',
    close: 'Chiudi',
  },
  [LanguageCode.Hi]: {
    status: 'स्थिति',
    cancerType: 'कैंसर का प्रकार',
    phase: 'चरण',
    treatment: 'उपचार',
    province: 'प्रांत',
    city: 'शहर',
    whoCanJoin: 'कौन भाग ले सकता है',
    whoCannotJoin: 'कौन भाग नहीं ले सकता',
    recruiting: 'भर्ती जारी है',
    openingSoon: 'जल्द शुरू होगा',
    translate: 'अनुवाद करें',
    seeOriginal: 'मूल देखें',
    machineNotice:
      'यह स्वचालित अनुवाद है और इसकी समीक्षा नहीं की गई है। पात्रता से जुड़ी किसी भी बात के लिए अंग्रेज़ी मूल देखें।',
    unavailableNotice: 'अनुवाद अस्थायी रूप से उपलब्ध नहीं है। अंग्रेज़ी मूल दिखाया जा रहा है।',
    askAbout: `इस परीक्षण के बारे में ${AGENT_NAME} से पूछें`,
    addedToChat: 'आपकी बातचीत में जोड़ा गया',
    addedToChatHint: `जोड़ा गया, ${AGENT_NAME} से कुछ भी पूछें`,
    viewOnCtc: 'Cancer Trials Canada पर देखें',
    close: 'बंद करें',
  },
  [LanguageCode.ZhCn]: {
    status: '状态',
    cancerType: '癌症类型',
    phase: '阶段',
    treatment: '治疗',
    province: '省份',
    city: '城市',
    whoCanJoin: '谁可以参加',
    whoCannotJoin: '谁不能参加',
    recruiting: '正在招募',
    openingSoon: '即将开放',
    translate: '翻译',
    seeOriginal: '查看原文',
    machineNotice: '本内容为自动翻译且未经审核。任何涉及参加资格的内容请以英文原文为准。',
    unavailableNotice: '翻译暂时不可用，正在显示英文原文。',
    askAbout: `向 ${AGENT_NAME} 询问这项试验`,
    addedToChat: '已添加到您的对话',
    addedToChatHint: `已添加，可以向 ${AGENT_NAME} 提出任何问题`,
    viewOnCtc: '在 Cancer Trials Canada 上查看',
    close: '关闭',
  },
  [LanguageCode.ZhTw]: {
    status: '狀態',
    cancerType: '癌症類型',
    phase: '階段',
    treatment: '治療',
    province: '省份',
    city: '城市',
    whoCanJoin: '誰可以參加',
    whoCannotJoin: '誰不能參加',
    recruiting: '正在招募',
    openingSoon: '即將開放',
    translate: '翻譯',
    seeOriginal: '查看原文',
    machineNotice: '本內容為自動翻譯且未經審核。任何涉及參加資格的內容請以英文原文為準。',
    unavailableNotice: '翻譯暫時無法使用，正在顯示英文原文。',
    askAbout: `向 ${AGENT_NAME} 詢問這項試驗`,
    addedToChat: '已加入您的對話',
    addedToChatHint: `已加入，可以向 ${AGENT_NAME} 提出任何問題`,
    viewOnCtc: '在 Cancer Trials Canada 上查看',
    close: '關閉',
  },
  [LanguageCode.Yue]: {
    status: '狀態',
    cancerType: '癌症類型',
    phase: '階段',
    treatment: '治療',
    province: '省份',
    city: '城市',
    whoCanJoin: '邊個可以參加',
    whoCannotJoin: '邊個唔可以參加',
    recruiting: '招募緊',
    openingSoon: '就快開放',
    translate: '翻譯',
    seeOriginal: '睇返原文',
    machineNotice: '呢啲內容係自動翻譯，未經審核。凡係影響參加資格嘅內容，請以英文原文為準。',
    unavailableNotice: '翻譯暫時用唔到，而家顯示緊英文原文。',
    askAbout: `問下 ${AGENT_NAME} 關於呢個試驗`,
    addedToChat: '已經加咗入你嘅對話',
    addedToChatHint: `加咗喇，可以問 ${AGENT_NAME} 任何嘢`,
    viewOnCtc: '喺 Cancer Trials Canada 上面睇',
    close: '閂咗佢',
  },
} as const satisfies Record<LanguageCode, PanelStrings>;
