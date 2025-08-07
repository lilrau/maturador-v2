export interface WuzapiInstance {
  id: string;
  jid: string;
  name: string;
  token: string;
  connected: boolean;
  loggedIn: boolean;
  events: string;
  expiration: number;
  proxy_url: string;
  qrcode: string;
  webhook: string;
}

export interface WuzapiResponse {
  code: number;
  data: WuzapiInstance[];
  success: boolean;
}

export interface MessageStatus {
  from: string;
  to: string;
  sent: boolean;
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  STICKER = 'sticker',
  LOCATION = 'location'
}

export enum MessageSequence {
  MEDIA_ONLY = 'media_only',
  MEDIA_THEN_TEXT = 'media_then_text',
  TEXT_THEN_MEDIA = 'text_then_media'
}

export interface ConversationContext {
  participants: string[];
  lastMessageTime: Date;
  messageCount: number;
  topic?: string;
  mood?: 'casual' | 'formal' | 'friendly' | 'neutral';
  isActive: boolean;
}

export interface PersonalityProfile {
  id: string;
  name: string;
  description: string;
  mediaPreferences: {
    [key in MessageType]: number;
  };
  vocabulary: string[];
  behaviorTraits: {
    responseChance: number;
    initiateConversationChance: number;
    sendMultipleMessages: number;
    useEmojis: number;
    sendVoiceMessages: number;
  };
}

export interface MaturadorConfig {
  baseUrl: string;
  token: string;
  minIntervalSeconds: number;
  maxIntervalSeconds: number;
  isRunning: boolean;
}

export interface MessageLog {
  id: string;
  timestamp: Date;
  from: string;
  to: string;
  type: MessageType;
  content: string;
  success: boolean;
}