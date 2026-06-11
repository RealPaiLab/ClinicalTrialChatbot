import { ChatRole, StreamEventType } from '@/constants/chat';
import type { ChatMessage, Trial } from '@/types/trial';

export const mockTrials: Trial[] = [
  {
    nctNumber: 'NCT04267848',
    acronymOrProtocolId: 'CCTG-BR42',
    shortTitleEn: 'Immunotherapy for Advanced Triple-Negative Breast Cancer',
    officialTitleEn:
      'A Phase II Study of Pembrolizumab Plus Chemotherapy in Metastatic Triple-Negative Breast Cancer',
    descriptionEn:
      'This trial evaluates whether adding immunotherapy to standard chemotherapy improves outcomes for people with advanced triple-negative breast cancer.',
    inclusionCriteriaEn: 'Adults 18+ with confirmed metastatic triple-negative breast cancer.',
    exclusionCriteriaEn: 'Prior treatment with a PD-1 or PD-L1 inhibitor.',
    phases: ['PHASE2'],
    treatmentTypeNames: ['immunotherapy', 'chemotherapy'],
    interventionNames: ['Pembrolizumab', 'Paclitaxel'],
    treatmentLines: ['first-line'],
    sites: [
      {
        nameEn: 'Princess Margaret Cancer Centre',
        address: '610 University Ave',
        city: 'Toronto',
        province: 'Ontario',
        lat: 43.6592,
        lon: -79.3897,
        state: 'Recruiting',
        cancerTypeNames: ['breast cancer'],
      },
      {
        nameEn: 'Jewish General Hospital',
        address: '3755 Chemin de la Côte-Sainte-Catherine',
        city: 'Montreal',
        province: 'Quebec',
        lat: 45.4961,
        lon: -73.6307,
        state: 'Not yet recruiting',
        cancerTypeNames: ['breast cancer'],
      },
    ],
  },
  {
    nctNumber: 'NCT03520491',
    acronymOrProtocolId: 'LUNG-IO-7',
    shortTitleEn: 'Targeted Therapy for EGFR-Mutated Non-Small Cell Lung Cancer',
    officialTitleEn: 'A Phase III Randomized Trial of Osimertinib in EGFR-Mutated Advanced NSCLC',
    descriptionEn:
      'A study comparing a targeted oral medication against standard care for people whose lung cancer carries an EGFR mutation.',
    inclusionCriteriaEn: 'Stage IV NSCLC with a confirmed EGFR mutation.',
    exclusionCriteriaEn: 'Symptomatic brain metastases.',
    phases: ['PHASE3'],
    treatmentTypeNames: ['targeted therapy'],
    interventionNames: ['Osimertinib'],
    treatmentLines: ['first-line'],
    sites: [
      {
        nameEn: 'BC Cancer - Vancouver',
        address: '600 W 10th Ave',
        city: 'Vancouver',
        province: 'British Columbia',
        lat: 49.2606,
        lon: -123.1233,
        state: 'Recruiting',
        cancerTypeNames: ['lung cancer'],
      },
    ],
  },
  {
    nctNumber: 'NCT02499770',
    acronymOrProtocolId: 'COLO-ADJ-3',
    shortTitleEn: 'Adjuvant Chemotherapy Duration in Stage III Colon Cancer',
    officialTitleEn:
      'A Phase III Study Comparing 3 Versus 6 Months of Adjuvant Therapy in Resected Stage III Colon Cancer',
    descriptionEn:
      'This trial looks at whether a shorter course of chemotherapy after surgery works as well as the standard longer course, with fewer side effects.',
    inclusionCriteriaEn: 'Resected stage III colon cancer within 8 weeks of surgery.',
    exclusionCriteriaEn: 'Prior chemotherapy for colon cancer.',
    phases: ['PHASE3'],
    treatmentTypeNames: ['chemotherapy'],
    interventionNames: ['FOLFOX'],
    treatmentLines: ['adjuvant'],
    sites: [
      {
        nameEn: 'The Ottawa Hospital Cancer Centre',
        address: '501 Smyth Rd',
        city: 'Ottawa',
        province: 'Ontario',
        lat: 45.3998,
        lon: -75.6426,
        state: 'Not yet recruiting',
        cancerTypeNames: ['colorectal cancer'],
      },
    ],
  },
];

export const mockConversation: ChatMessage[] = [
  {
    id: 'm1',
    role: ChatRole.User,
    content: 'I have advanced triple-negative breast cancer and live in Toronto. Any trials?',
  },
  {
    id: 'm2',
    role: ChatRole.Assistant,
    content:
      'I found a trial that may fit. **[NCT04267848]** is testing immunotherapy added to chemotherapy for advanced triple-negative breast cancer, and it is currently **recruiting** at Princess Margaret Cancer Centre in Toronto.',
    trials: [mockTrials[0]],
    followUpQuestions: [
      'What are the eligibility requirements?',
      'Are there trials in Montreal too?',
      'What does immunotherapy involve?',
    ],
  },
];

export const mockWireStreamLines: string[] = [
  JSON.stringify({
    type: StreamEventType.AgentResponse,
    data: {
      message: 'Looking for trials that match advanced triple-negative breast cancer near Toronto',
      used_nct_numbers: [],
      follow_up_questions: [],
    },
  }),
  JSON.stringify({
    type: StreamEventType.AgentResponse,
    data: {
      message:
        'I found a trial that may fit. [NCT04267848] is testing immunotherapy added to chemotherapy.',
      used_nct_numbers: ['NCT04267848'],
      follow_up_questions: ['What are the eligibility requirements?'],
    },
  }),
  JSON.stringify({
    type: StreamEventType.ChatResult,
    data: {
      message:
        'I found a trial that may fit. **[NCT04267848]** is testing immunotherapy added to chemotherapy for advanced triple-negative breast cancer, and it is currently **recruiting** at Princess Margaret Cancer Centre in Toronto.',
      follow_up_questions: [
        'What are the eligibility requirements?',
        'Are there trials in Montreal too?',
      ],
      trials: [
        {
          nct_number: 'NCT04267848',
          acronym_or_protocol_id: 'CCTG-BR42',
          short_title_en: 'Immunotherapy for Advanced Triple-Negative Breast Cancer',
          official_title_en:
            'A Phase II Study of Pembrolizumab Plus Chemotherapy in Metastatic Triple-Negative Breast Cancer',
          description_en:
            'This trial evaluates whether adding immunotherapy to standard chemotherapy improves outcomes.',
          inclusion_criteria_en:
            'Adults 18+ with confirmed metastatic triple-negative breast cancer.',
          exclusion_criteria_en: 'Prior treatment with a PD-1 or PD-L1 inhibitor.',
          phases: ['PHASE2'],
          treatment_type_names: ['immunotherapy', 'chemotherapy'],
          intervention_names: ['Pembrolizumab', 'Paclitaxel'],
          treatment_lines: ['first-line'],
          sites: [
            {
              name_en: 'Princess Margaret Cancer Centre',
              address: '610 University Ave',
              city: 'Toronto',
              province: 'Ontario',
              lat: 43.6592,
              lon: -79.3897,
              state: 'Recruiting',
              cancer_type_names: ['breast cancer'],
            },
          ],
        },
      ],
    },
  }),
];

export function createNdjsonStream(lines: string[], chunkSize = 24): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(lines.join('\n'));
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        controller.enqueue(bytes.subarray(offset, offset + chunkSize));
      }
      controller.close();
    },
  });
}
