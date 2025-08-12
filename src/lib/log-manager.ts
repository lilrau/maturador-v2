import fs from 'fs';
import { MessageLog } from '@/types';

export class LogManager {
  private readonly LOG_DIR = './logs';
  private readonly MESSAGE_LOG_FILE = './logs/messages.json';
  private readonly MAX_LOGS_IN_MEMORY = 1000;
  private readonly MAX_LOGS_ON_DISK = 10000;
  private messageLogs: MessageLog[] = [];

  constructor() {
    this.ensureLogDirectory();
    this.loadLogsFromDisk();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.LOG_DIR)) {
      fs.mkdirSync(this.LOG_DIR, { recursive: true });
    }
  }

  private loadLogsFromDisk(): void {
    try {
      if (fs.existsSync(this.MESSAGE_LOG_FILE)) {
        const logContent = fs.readFileSync(this.MESSAGE_LOG_FILE, 'utf8');
        const logs = JSON.parse(logContent);
        
        // Converter timestamps de string para Date
        this.messageLogs = logs.map((log: Record<string, unknown>) => ({
          ...log,
          timestamp: new Date(log.timestamp as string)
        }));
        
        console.log(`📋 Carregados ${this.messageLogs.length} logs do disco`);
      }
    } catch (error) {
      console.error('Erro ao carregar logs do disco:', error);
      this.messageLogs = [];
    }
  }

  private saveLogsToDisk(): void {
    try {
      // Converter timestamps para string para serialização
      const logsToSave = this.messageLogs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      }));
      
      fs.writeFileSync(this.MESSAGE_LOG_FILE, JSON.stringify(logsToSave, null, 2));
    } catch (error) {
      console.error('Erro ao salvar logs no disco:', error);
    }
  }

  public addMessageLog(log: MessageLog): void {
    // Adicionar novo log no início (logs mais novos primeiro)
    this.messageLogs.unshift(log);
    
    // Manter limite em memória
    if (this.messageLogs.length > this.MAX_LOGS_IN_MEMORY) {
      this.messageLogs = this.messageLogs.slice(0, this.MAX_LOGS_IN_MEMORY);
    }
    
    // Salvar no disco periodicamente (a cada 10 logs)
    if (this.messageLogs.length % 10 === 0) {
      this.saveLogsToDisk();
    }
  }

  public getMessageLogs(limit: number = 100): MessageLog[] {
    // Retornar logs mais recentes primeiro, limitados pela quantidade solicitada
    return this.messageLogs.slice(0, limit);
  }

  public getMessageLogsByDate(startDate: Date, endDate: Date): MessageLog[] {
    return this.messageLogs.filter(log => 
      log.timestamp >= startDate && log.timestamp <= endDate
    );
  }

  public getMessageLogsByType(type: string): MessageLog[] {
    return this.messageLogs.filter(log => log.type === type);
  }

  public getMessageLogsByPhone(phone: string): MessageLog[] {
    return this.messageLogs.filter(log => 
      log.from === phone || log.to === phone
    );
  }

  public getStats(): {
    total: number;
    success: number;
    failed: number;
    byType: Record<string, number>;
  } {
    const stats = {
      total: this.messageLogs.length,
      success: this.messageLogs.filter(log => log.success).length,
      failed: this.messageLogs.filter(log => !log.success).length,
      byType: {} as Record<string, number>
    };

    // Contar por tipo
    this.messageLogs.forEach(log => {
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
    });

    return stats;
  }

  public clearLogs(): void {
    this.messageLogs = [];
    this.saveLogsToDisk();
    console.log('🗑️ Logs limpos com sucesso');
  }

  public cleanup(): void {
    // Manter apenas os logs mais recentes no disco
    if (this.messageLogs.length > this.MAX_LOGS_ON_DISK) {
      this.messageLogs = this.messageLogs.slice(0, this.MAX_LOGS_ON_DISK);
      this.saveLogsToDisk();
      console.log(`🧹 Limpeza de logs: mantidos ${this.MAX_LOGS_ON_DISK} logs mais recentes`);
    }
  }

  // Método para forçar salvamento no disco
  public forceSave(): void {
    this.saveLogsToDisk();
  }
}

// Instância singleton
export const logManager = new LogManager(); 