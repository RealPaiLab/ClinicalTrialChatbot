import { StreamEventType } from '@/constants/chat';
import type { ChatErrorKey, ChatRole } from '@/constants/chat';
import type { LanguageCode, TranslationSource } from '@/constants/language';
import type { TrialSourceCode } from '@/constants/trialSources';

export type { ChatRole };

export interface TrialSite {
  nameEn: string;
  address: string | null;
  city: string | null;
  province: string | null;
  lat: number | null;
  lon: number | null;
  state: string | null;
  cancerTypeNames: string[];
}

export interface Trial {
  trialRef: string;
  nctNumber: string | null;
  acronymOrProtocolId: string | null;
  shortTitleEn: string | null;
  officialTitleEn: string | null;
  descriptionEn: string | null;
  inclusionCriteriaEn: string | null;
  exclusionCriteriaEn: string | null;
  phases: string[];
  treatmentTypeNames: string[];
  diseaseStages: string[];
  interventionNames: string[];
  treatmentLines: string[];
  // Age eligibility verbatim from the registry, when it states one.
  ageRangeText: string | null;
  // Source code to the token its public trial page is built from.
  sourceKeys: Partial<Record<TrialSourceCode, string>>;
  // Which registries list the trial; both when it is merged from two.
  dataSources: TrialSourceCode[];
  sites: TrialSite[];
}

export type TrialSummary = Pick<
  Trial,
  | 'trialRef'
  | 'nctNumber'
  | 'acronymOrProtocolId'
  | 'shortTitleEn'
  | 'officialTitleEn'
  | 'descriptionEn'
>;

export interface TrialTranslation {
  trialRef: string;
  language: LanguageCode;
  source: TranslationSource;
  shortTitle: string | null;
  officialTitle: string | null;
  description: string | null;
  inclusionCriteria: string | null;
  exclusionCriteria: string | null;
  cancerTypeNames: Record<string, string>;
  treatmentTypeNames: Record<string, string>;
}

export type TrialStatus = 'recruiting' | 'opening_soon';

export interface ChatResult {
  message: string;
  trials: Trial[];
  followUpQuestions: string[];
  observationId: string;
}

export interface AgentResponse {
  message: string;
  usedTrialRefs: string[];
  followUpQuestions: string[];
}

export type StreamEvent =
  | { type: typeof StreamEventType.AgentResponse; data: AgentResponse }
  | { type: typeof StreamEventType.ChatResult; data: ChatResult }
  | { type: typeof StreamEventType.Error; data: string };

export interface ChatError {
  key: ChatErrorKey;
  params?: { seconds?: number; limit?: number };
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  trials?: Trial[];
  contextTrialRefs?: string[];
  followUpQuestions?: string[];
  observationId?: string;
  error?: ChatError;
}

export interface SourceFreshness {
  source: TrialSourceCode;
  name: string;
  publishedAt: string | null;
}

export interface DataFreshness {
  // The oldest published source, so the badge never overstates freshness.
  publishedAt: string | null;
  sources: SourceFreshness[];
}
