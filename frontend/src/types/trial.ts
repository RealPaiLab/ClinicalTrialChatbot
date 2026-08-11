import { StreamEventType } from '@/constants/chat';
import type { ChatErrorKey, ChatRole } from '@/constants/chat';
import type { LanguageCode, TranslationSource } from '@/constants/language';

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
  nctNumber: string | null;
  acronymOrProtocolId: string | null;
  shortTitleEn: string | null;
  officialTitleEn: string | null;
  descriptionEn: string | null;
  inclusionCriteriaEn: string | null;
  exclusionCriteriaEn: string | null;
  phases: string[];
  treatmentTypeNames: string[];
  interventionNames: string[];
  treatmentLines: string[];
  sites: TrialSite[];
}

export type TrialSummary = Pick<
  Trial,
  'nctNumber' | 'shortTitleEn' | 'officialTitleEn' | 'descriptionEn'
>;

export interface TrialTranslation {
  nctNumber: string;
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
  usedNctNumbers: string[];
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
  contextNctNumbers?: string[];
  followUpQuestions?: string[];
  observationId?: string;
  error?: ChatError;
}
