import { WuzapiClient } from './wuzapi';
import { PersonalityManager } from './personality-manager';
import { MediaManager } from './media-manager';
import { WuzapiInstance, MessageType, MaturadorConfig, MessageLog, PersonalityProfile } from '@/types';

interface InstanceTimer {
  instanceId: string;
  intervalId: NodeJS.Timeout | null;
  lastMessageTime: Date;
  nextMessageTime: Date;
}

export class WhatsAppMaturador {
  private wuzapi: WuzapiClient;
  private personalityManager: PersonalityManager;
  private mediaManager: MediaManager;
  private config: MaturadorConfig;
  private _isRunning: boolean = false;
  private instanceTimers: Map<string, InstanceTimer> = new Map();
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
    
    // Iniciar timers individuais para cada instância
    this.startIndividualTimers();
  }

  stop(): void {
    if (!this._isRunning) {
      console.log('Maturador is not running');
      return;
    }

    this._isRunning = false;
    
    // Parar todos os timers individuais
    this.stopAllTimers();
    
    console.log('WhatsApp Maturador stopped');
  }

  private startIndividualTimers(): void {
    this.connectedInstances.forEach(instance => {
      this.startInstanceTimer(instance.id);
    });
  }

  private startInstanceTimer(instanceId: string): void {
    const delay = this.getRandomInterval();
    const nextMessageTime = new Date(Date.now() + delay);
    
    const timer: InstanceTimer = {
      instanceId,
      intervalId: null,
      lastMessageTime: new Date(),
      nextMessageTime
    };

    timer.intervalId = setTimeout(async () => {
      await this.sendMessageFromInstance(instanceId);
      if (this._isRunning) {
        this.startInstanceTimer(instanceId);
      }
    }, delay);

    this.instanceTimers.set(instanceId, timer);
  }

  private stopAllTimers(): void {
    this.instanceTimers.forEach((timer, instanceId) => {
      if (timer.intervalId) {
        clearTimeout(timer.intervalId);
      }
    });
    this.instanceTimers.clear();
  }

  private async sendMessageFromInstance(instanceId: string): Promise<void> {
    if (!this._isRunning) {
      return;
    }

    // Verificar se a instância ainda está conectada
    await this.updateConnectedInstances();
    const instance = this.connectedInstances.find(inst => inst.id === instanceId);
    
    if (!instance) {
      return;
    }

    // Selecionar destinatário aleatório (diferente do remetente)
    let receiver: WuzapiInstance;
    do {
      receiver = this.connectedInstances[Math.floor(Math.random() * this.connectedInstances.length)];
    } while (receiver.id === instanceId && this.connectedInstances.length > 1);

    const personality = this.personalityManager.getPersonality(instanceId);
    if (!personality) {
      return;
    }

    // Verificar se deve enviar mensagem baseado na personalidade
    if (!this.personalityManager.shouldInitiateConversation(personality)) {
      return;
    }

    const messageType = this.personalityManager.selectMessageType(personality);
    const content = this.getMessageContent(messageType, personality);

    const success = await this.wuzapi.sendMessage(instance.token, receiver.jid, messageType, content);
    
    // Log the message
    this.logMessage({
      id: Date.now().toString(),
      timestamp: new Date(),
      from: instanceId,
      to: receiver.jid,
      type: messageType,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      success
    });

    if (success) {
      console.log(`✅ ${instance.name} → ${receiver.name} (${messageType})`);
      
      // Verificar se deve enviar múltiplas mensagens
      if (this.personalityManager.shouldSendMultipleMessages(personality)) {
        setTimeout(async () => {
          const followUpType = this.personalityManager.selectMessageType(personality);
          const followUpContent = this.getMessageContent(followUpType, personality);
          const followUpSuccess = await this.wuzapi.sendMessage(instance.token, receiver.jid, followUpType, followUpContent);
          
          this.logMessage({
            id: (Date.now() + 1).toString(),
            timestamp: new Date(),
            from: instanceId,
            to: receiver.jid,
            type: followUpType,
            content: typeof followUpContent === 'string' ? followUpContent : JSON.stringify(followUpContent),
            success: followUpSuccess
          });

          if (followUpSuccess) {
            console.log(`✅ ${instance.name} → ${receiver.name} (${followUpType}) [follow-up]`);
          }
        }, Math.random() * 5000 + 1000); // 1-6 seconds delay
      }
    } else {
      console.log(`❌ ${instance.name} → ${receiver.name} (${messageType})`);
    }
  }

  private getRandomInterval(): number {
    const minMs = this.config.minIntervalSeconds * 1000;
    const maxMs = this.config.maxIntervalSeconds * 1000;
    return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
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
      this.connectedInstances = await this.wuzapi.getConnectedInstances(true); // Modo silencioso
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

  getStatus(): { isRunning: boolean; instanceCount: number; messageCount: number; timers: InstanceTimer[] } {
    return {
      isRunning: this._isRunning,
      instanceCount: this.connectedInstances.length,
      messageCount: this.messageLogs.length,
      timers: Array.from(this.instanceTimers.values())
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