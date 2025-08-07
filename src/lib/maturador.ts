import { WuzapiClient } from './wuzapi';
import { PersonalityManager } from './personality-manager';
import { MediaManager } from './media-manager';
import { WuzapiInstance, MessageType, MaturadorConfig, MessageLog, PersonalityProfile } from '@/types';

export class WhatsAppMaturador {
  private wuzapi: WuzapiClient;
  private personalityManager: PersonalityManager;
  private mediaManager: MediaManager;
  private config: MaturadorConfig;
  private _isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private messageLogs: MessageLog[] = [];
  private connectedInstances: WuzapiInstance[] = [];

  constructor(config: MaturadorConfig) {
    this.config = config;
    this.wuzapi = new WuzapiClient(config.baseUrl, config.token);
    this.personalityManager = new PersonalityManager();
    this.mediaManager = new MediaManager();
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing WhatsApp Maturador...');
      await this.updateConnectedInstances();
      
      if (this.connectedInstances.length < 2) {
        console.error('Need at least 2 connected instances to start maturador');
        return false;
      }

      // Assign personalities to instances
      this.connectedInstances.forEach(instance => {
        this.personalityManager.assignPersonality(instance.id);
      });

      console.log(`Maturador initialized with ${this.connectedInstances.length} instances`);
      return true;
    } catch (error) {
      console.error('Failed to initialize maturador:', error);
      return false;
    }
  }

  async start(): Promise<void> {
    if (this._isRunning) {
      console.log('⚠️ Maturador já está rodando');
      return;
    }

    const initialized = await this.initialize();
    if (!initialized) {
      throw new Error('Failed to initialize maturador');
    }

    this._isRunning = true;
    console.log('✅ Maturador iniciado com sucesso');
    
    this.scheduleNextMessage();
  }

  stop(): void {
    if (!this._isRunning) {
      console.log('Maturador is not running');
      return;
    }

    this._isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    console.log('WhatsApp Maturador stopped');
  }

  private scheduleNextMessage(): void {
    if (!this._isRunning) {
      return;
    }

    const delay = this.getRandomInterval();
    console.log(`⏰ Próxima mensagem agendada em ${Math.round(delay/1000)}s`);

    this.intervalId = setTimeout(async () => {
      try {
        await this.sendRandomMessage();
        this.scheduleNextMessage();
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        this.scheduleNextMessage();
      }
    }, delay);
  }

  private getRandomInterval(): number {
    const minMs = this.config.minIntervalSeconds * 1000;
    const maxMs = this.config.maxIntervalSeconds * 1000;
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  }

  private async sendRandomMessage(): Promise<void> {
    if (this.connectedInstances.length < 2) {
      await this.updateConnectedInstances();
      if (this.connectedInstances.length < 2) {
        console.log('❌ Não há instâncias suficientes conectadas');
        return;
      }
    }

    // Select random sender and receiver
    const sender = this.connectedInstances[Math.floor(Math.random() * this.connectedInstances.length)];
    let receiver: WuzapiInstance;
    do {
      receiver = this.connectedInstances[Math.floor(Math.random() * this.connectedInstances.length)];
    } while (receiver.id === sender.id && this.connectedInstances.length > 1);

    const personality = this.personalityManager.getPersonality(sender.id);
    if (!personality) {
      console.error(`❌ Nenhuma personalidade encontrada para instância ${sender.id}`);
      return;
    }

    // Check if should send message based on personality
    if (!this.personalityManager.shouldInitiateConversation(personality)) {
      console.log(`🤔 Instância ${sender.name} decidiu não enviar mensagem`);
      return;
    }

    const messageType = this.personalityManager.selectMessageType(personality);
    const content = this.getMessageContent(messageType, personality);

    const success = await this.wuzapi.sendMessage(sender.token, receiver.jid, messageType, content);
    
    // Log the message
    this.logMessage({
      id: Date.now().toString(),
      timestamp: new Date(),
      from: sender.id,
      to: receiver.jid,
      type: messageType,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      success
    });

    if (success) {
      console.log(`✅ Mensagem enviada: ${sender.name} → ${receiver.name} (${messageType})`);
      
      // Check if should send multiple messages
      if (this.personalityManager.shouldSendMultipleMessages(personality)) {
        setTimeout(async () => {
          const followUpType = this.personalityManager.selectMessageType(personality);
          const followUpContent = this.getMessageContent(followUpType, personality);
          const followUpSuccess = await this.wuzapi.sendMessage(sender.token, receiver.jid, followUpType, followUpContent);
          
          this.logMessage({
            id: (Date.now() + 1).toString(),
            timestamp: new Date(),
            from: sender.id,
            to: receiver.jid,
            type: followUpType,
            content: typeof followUpContent === 'string' ? followUpContent : JSON.stringify(followUpContent),
            success: followUpSuccess
          });

          if (followUpSuccess) {
            console.log(`✅ Mensagem de acompanhamento enviada: ${sender.name} → ${receiver.name} (${followUpType})`);
          }
        }, Math.random() * 5000 + 1000); // 1-6 seconds delay
      }
    } else {
      console.log(`❌ Falha ao enviar mensagem: ${sender.name} → ${receiver.name} (${messageType})`);
    }
  }

  private getMessageContent(type: MessageType, personality: PersonalityProfile): string | Record<string, unknown> {
    if (type === MessageType.TEXT) {
      let message = this.personalityManager.getRandomMessage(personality);
      message = this.personalityManager.enhanceTextWithEmojis(message, personality);
      return message;
    }
    
    return this.mediaManager.getMediaContent(type);
  }

  private async updateConnectedInstances(): Promise<void> {
    try {
      this.connectedInstances = await this.wuzapi.getConnectedInstances();
      console.log(`Found ${this.connectedInstances.length} connected instances`);
    } catch (error) {
      console.error('Failed to update connected instances:', error);
    }
  }

  private logMessage(log: MessageLog): void {
    this.messageLogs.push(log);
    
    // Keep only last 1000 messages in memory
    if (this.messageLogs.length > 1000) {
      this.messageLogs = this.messageLogs.slice(-1000);
    }
  }

  // Public methods for monitoring
  isRunning(): boolean {
    return this._isRunning;
  }

  getStatus(): { isRunning: boolean; instanceCount: number; messageCount: number } {
    return {
      isRunning: this._isRunning,
      instanceCount: this.connectedInstances.length,
      messageCount: this.messageLogs.length
    };
  }

  getConnectedInstances(): WuzapiInstance[] {
    return this.connectedInstances;
  }

  getMessageLogs(): MessageLog[] {
    return this.messageLogs.slice(-100); // Return last 100 messages
  }

  getPersonalities(): Map<string, PersonalityProfile> {
    return this.personalityManager.getInstancePersonalities();
  }

  updateConfig(newConfig: Partial<MaturadorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.baseUrl || newConfig.token) {
      this.wuzapi = new WuzapiClient(this.config.baseUrl, this.config.token);
    }
  }
}