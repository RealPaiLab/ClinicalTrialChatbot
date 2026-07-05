import { ChatRole } from '@/constants/chat';
import type { ChatMessage, Trial } from '@/types/trial';

export const DEMO_TRIALS: Trial[] = [
  {
    nctNumber: 'NCT00000001',
    acronymOrProtocolId: 'DEMO-1',
    shortTitleEn: 'Immunotherapy for Advanced Breast Cancer',
    officialTitleEn:
      'A Phase II Study of Immunotherapy Plus Chemotherapy in Advanced Breast Cancer',
    descriptionEn:
      'A sample trial used to show you around. It evaluates whether adding immunotherapy to standard chemotherapy improves outcomes for advanced breast cancer.',
    inclusionCriteriaEn: 'Adults 18+ with confirmed advanced breast cancer.',
    exclusionCriteriaEn: 'Prior treatment with an immunotherapy agent.',
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
    ],
  },
  {
    nctNumber: 'NCT00000002',
    acronymOrProtocolId: 'DEMO-2',
    shortTitleEn: 'Targeted Therapy for Lung Cancer',
    officialTitleEn: 'A Phase III Randomized Trial of Targeted Therapy in Advanced Lung Cancer',
    descriptionEn:
      'A sample trial used to show you around. It compares a targeted oral medication against standard care for advanced lung cancer.',
    inclusionCriteriaEn: 'Stage IV lung cancer with a confirmed driver mutation.',
    exclusionCriteriaEn: 'Symptomatic brain metastases.',
    phases: ['PHASE3'],
    treatmentTypeNames: ['targeted therapy'],
    interventionNames: ['Osimertinib'],
    treatmentLines: ['first-line'],
    sites: [
      {
        nameEn: 'The Ottawa Hospital Cancer Centre',
        address: '501 Smyth Rd',
        city: 'Ottawa',
        province: 'Ontario',
        lat: 45.4029,
        lon: -75.6503,
        state: 'Recruiting',
        cancerTypeNames: ['lung cancer'],
      },
    ],
  },
];

export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'demo-user',
    role: ChatRole.User,
    content: 'I have advanced breast cancer and live in Toronto. Are there any trials for me?',
  },
  {
    id: 'demo-assistant',
    role: ChatRole.Assistant,
    content:
      'Good news, I found a match. **[NCT00000001]** is a Phase II trial adding [[immunotherapy||A treatment that helps your own immune system find and fight cancer cells.]] to standard chemotherapy, and it is currently **recruiting** in Toronto. It may be a fit if your cancer is [[metastatic||Cancer that has spread from where it started to other parts of the body.]].',
    trials: [DEMO_TRIALS[0]],
    followUpQuestions: [
      'What are the eligibility requirements?',
      'Are there trials near Ottawa?',
      'What does the treatment involve?',
    ],
    observationId: 'demo-observation',
  },
];
