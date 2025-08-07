import { PersonalityProfile, MessageType } from '@/types';
import { personalityProfiles, defaultPersonalityWeights } from '@/config/personalities';

export class PersonalityManager {
  private instancePersonalities: Map<string, PersonalityProfile> = new Map();
  private profiles: PersonalityProfile[] = personalityProfiles;

  constructor() {
    this.initializeProfiles();
  }

  private initializeProfiles(): void {
    console.log(`Loaded ${this.profiles.length} personality profiles`);
  }

  assignPersonality(instanceId: string): PersonalityProfile {
    if (this.instancePersonalities.has(instanceId)) {
      const existing = this.instancePersonalities.get(instanceId)!;
      return existing;
    }

    const personality = this.selectRandomPersonality();
    this.instancePersonalities.set(instanceId, personality);
    console.log(`🎭 Personalidade "${personality.name}" atribuída para instância ${instanceId}`);
    return personality;
  }

  getPersonality(instanceId: string): PersonalityProfile | undefined {
    const personality = this.instancePersonalities.get(instanceId);
    if (!personality) {
      return this.assignPersonality(instanceId);
    }
    return personality;
  }

  private selectRandomPersonality(): PersonalityProfile {
    const weights = Object.values(defaultPersonalityWeights);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < this.profiles.length; i++) {
      const profileId = this.profiles[i].id;
      const weight = defaultPersonalityWeights[profileId as keyof typeof defaultPersonalityWeights] || 0;
      random -= weight;
      if (random <= 0) {
        return this.profiles[i];
      }
    }

    return this.profiles[0]; // fallback
  }

  selectMessageType(personality: PersonalityProfile): MessageType {
    const preferences = personality.mediaPreferences;
    const totalWeight = Object.values(preferences).reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [type, weight] of Object.entries(preferences)) {
      random -= weight;
      if (random <= 0) {
        return type as MessageType;
      }
    }

    return MessageType.TEXT; // fallback
  }

  getRandomMessage(personality: PersonalityProfile): string {
    const vocabulary = personality.vocabulary;
    const message = vocabulary[Math.floor(Math.random() * vocabulary.length)];
    return message;
  }

  shouldRespond(personality: PersonalityProfile): boolean {
    return Math.random() < personality.behaviorTraits.responseChance;
  }

  shouldInitiateConversation(personality: PersonalityProfile): boolean {
    return Math.random() < personality.behaviorTraits.initiateConversationChance;
  }

  shouldSendMultipleMessages(personality: PersonalityProfile): boolean {
    return Math.random() < personality.behaviorTraits.sendMultipleMessages;
  }

  shouldUseEmojis(personality: PersonalityProfile): boolean {
    return Math.random() < personality.behaviorTraits.useEmojis;
  }

  shouldSendVoiceMessage(personality: PersonalityProfile): boolean {
    return Math.random() < personality.behaviorTraits.sendVoiceMessages;
  }

  enhanceTextWithEmojis(text: string, personality: PersonalityProfile): string {
    if (!this.shouldUseEmojis(personality)) {
      return text;
    }

    const emojis = ['😊', '😄', '👍', '❤️', '😂', '🤔', '👌', '🙌', '😎', '🔥'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    // 50% chance to add emoji at the end, 50% at the beginning
    const enhanced = Math.random() < 0.5 ? `${text} ${randomEmoji}` : `${randomEmoji} ${text}`;
    return enhanced;
  }

  getAllPersonalities(): PersonalityProfile[] {
    return this.profiles;
  }

  getInstancePersonalities(): Map<string, PersonalityProfile> {
    return this.instancePersonalities;
  }
}