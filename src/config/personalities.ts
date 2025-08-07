import { PersonalityProfile, MessageType } from '@/types';

export const personalityProfiles: PersonalityProfile[] = [
  {
    id: 'casual_frequent',
    name: 'Casual Frequente',
    description: 'Usuário casual que envia mensagens frequentemente',
    mediaPreferences: {
      [MessageType.TEXT]: 0.4,
      [MessageType.AUDIO]: 0.2,
      [MessageType.IMAGE]: 0.15,
      [MessageType.VIDEO]: 0.1,
      [MessageType.DOCUMENT]: 0.05,
      [MessageType.STICKER]: 0.08,
      [MessageType.LOCATION]: 0.02
    },
    vocabulary: [
      'Oi!', 'Tudo bem?', 'Como vai?', 'E aí?', 'Beleza?',
      'Que legal!', 'Nossa!', 'Sério?', 'Haha', 'rsrs',
      'Valeu!', 'Obrigado!', 'De nada', 'Falou!', 'Tchau!'
    ],
    behaviorTraits: {
      responseChance: 0.8,
      initiateConversationChance: 0.6,
      sendMultipleMessages: 0.4,
      useEmojis: 0.7,
      sendVoiceMessages: 0.3
    }
  },
  {
    id: 'professional',
    name: 'Profissional',
    description: 'Usuário com comunicação mais formal e profissional',
    mediaPreferences: {
      [MessageType.TEXT]: 0.6,
      [MessageType.AUDIO]: 0.1,
      [MessageType.IMAGE]: 0.1,
      [MessageType.VIDEO]: 0.05,
      [MessageType.DOCUMENT]: 0.1,
      [MessageType.STICKER]: 0.03,
      [MessageType.LOCATION]: 0.02
    },
    vocabulary: [
      'Bom dia', 'Boa tarde', 'Boa noite', 'Como está?',
      'Espero que esteja bem', 'Obrigado pela informação',
      'Entendi', 'Perfeito', 'Certo', 'Combinado',
      'Até mais', 'Tenha um bom dia', 'Abraços'
    ],
    behaviorTraits: {
      responseChance: 0.9,
      initiateConversationChance: 0.3,
      sendMultipleMessages: 0.2,
      useEmojis: 0.2,
      sendVoiceMessages: 0.1
    }
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    description: 'Usuário mais ativo durante a noite',
    mediaPreferences: {
      [MessageType.TEXT]: 0.35,
      [MessageType.AUDIO]: 0.25,
      [MessageType.IMAGE]: 0.2,
      [MessageType.VIDEO]: 0.1,
      [MessageType.DOCUMENT]: 0.02,
      [MessageType.STICKER]: 0.06,
      [MessageType.LOCATION]: 0.02
    },
    vocabulary: [
      'Boa noite!', 'Ainda acordado?', 'Insônia?', 'Que horas são?',
      'Vou dormir', 'Soninho chegando', 'Cansado', 'Amanhã conversamos',
      'Durma bem', 'Boa madrugada', 'Até amanhã'
    ],
    behaviorTraits: {
      responseChance: 0.7,
      initiateConversationChance: 0.5,
      sendMultipleMessages: 0.3,
      useEmojis: 0.5,
      sendVoiceMessages: 0.4
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalista',
    description: 'Usuário que prefere mensagens curtas e diretas',
    mediaPreferences: {
      [MessageType.TEXT]: 0.7,
      [MessageType.AUDIO]: 0.05,
      [MessageType.IMAGE]: 0.1,
      [MessageType.VIDEO]: 0.05,
      [MessageType.DOCUMENT]: 0.05,
      [MessageType.STICKER]: 0.03,
      [MessageType.LOCATION]: 0.02
    },
    vocabulary: [
      'Ok', 'Sim', 'Não', 'Certo', 'Entendi',
      'Blz', 'Vlw', 'Flw', 'Tmj', 'Show',
      'Top', 'Legal', 'Massa', 'Perfeito'
    ],
    behaviorTraits: {
      responseChance: 0.6,
      initiateConversationChance: 0.2,
      sendMultipleMessages: 0.1,
      useEmojis: 0.3,
      sendVoiceMessages: 0.1
    }
  },
  {
    id: 'social_butterfly',
    name: 'Borboleta Social',
    description: 'Usuário muito sociável que adora conversar',
    mediaPreferences: {
      [MessageType.TEXT]: 0.3,
      [MessageType.AUDIO]: 0.3,
      [MessageType.IMAGE]: 0.15,
      [MessageType.VIDEO]: 0.1,
      [MessageType.DOCUMENT]: 0.03,
      [MessageType.STICKER]: 0.1,
      [MessageType.LOCATION]: 0.02
    },
    vocabulary: [
      'Oi querido!', 'Como você está?', 'Conta novidade!',
      'Que bom te ver!', 'Adorei conversar!', 'Você é demais!',
      'Que história é essa?', 'Me conta tudo!', 'Sério mesmo?',
      'Que incrível!', 'Estou morrendo de rir!', 'Você é hilário!'
    ],
    behaviorTraits: {
      responseChance: 0.95,
      initiateConversationChance: 0.8,
      sendMultipleMessages: 0.7,
      useEmojis: 0.9,
      sendVoiceMessages: 0.6
    }
  }
];

export const defaultPersonalityWeights = {
  casual_frequent: 0.3,
  professional: 0.2,
  night_owl: 0.2,
  minimalist: 0.15,
  social_butterfly: 0.15
};