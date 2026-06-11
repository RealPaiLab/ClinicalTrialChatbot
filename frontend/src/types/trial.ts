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
  | { type: 'AgentResponse'; data: AgentResponse }
  | { type: 'ChatResult'; data: ChatResult }
  | { type: 'error'; data: string };

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  trials?: Trial[];
  followUpQuestions?: string[];
}
