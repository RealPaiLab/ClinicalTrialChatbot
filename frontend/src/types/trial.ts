import { StreamEventType } from '@/constants/chat';
import type { ChatRole } from '@/constants/chat';

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

export type TrialStatus = 'recruiting' | 'opening_soon';

export interface ChatResult {
  message: string;
  trials: Trial[];
  followUpQuestions: string[];
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

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  trials?: Trial[];
  followUpQuestions?: string[];
}
