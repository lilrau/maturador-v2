import axios, { AxiosInstance } from 'axios';
import { WuzapiInstance, WuzapiResponse, MessageType } from '@/types';
import fs from 'fs';
import path from 'path';

export class WuzapiClient {
  private api: AxiosInstance;
  private baseUrl: string;
  private adminToken: string;
  private lastLogTime: number = 0;
  private readonly LOG_INTERVAL = 30000; // 30 segundos entre logs
  private readonly REQUEST_LOG_FILE = './logs/api-requests.json';

  constructor(baseUrl: string, adminToken: string) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': adminToken,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    // Criar diretório de logs se não existir
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.REQUEST_LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private logRequest(endpoint: string, token: string, body: any, headers: any, response?: any, error?: any): void {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        endpoint: `${this.baseUrl}${endpoint}`,
        token: token.substring(0, 10) + '...',
        body: body,
        headers: headers,
        response: response,
        error: error ? {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        } : null
      };

      // Carregar logs existentes ou criar array vazio
      let logs = [];
      if (fs.existsSync(this.REQUEST_LOG_FILE)) {
        try {
          const existingLogs = fs.readFileSync(this.REQUEST_LOG_FILE, 'utf8');
          logs = JSON.parse(existingLogs);
        } catch (e) {
          logs = [];
        }
      }

      // Adicionar novo log
      logs.push(logEntry);

      // Manter apenas os últimos 100 logs
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }

      // Salvar logs
      fs.writeFileSync(this.REQUEST_LOG_FILE, JSON.stringify(logs, null, 2));
      
      console.log(`📝 Requisição logada: ${endpoint} - ${error ? '❌' : '✅'}`);
    } catch (logError) {
      console.error('Erro ao salvar log:', logError);
    }
  }

  async getInstances(): Promise<WuzapiInstance[]> {
    try {
      const headers = {
        'Authorization': this.adminToken,
        'Content-Type': 'application/json'
      };
      
      const response = await this.api.get<WuzapiResponse>('/admin/users');
      
      // Não fazer logging para requisições de fetch de status
      // this.logRequest('/admin/users', this.adminToken, {}, headers, response.data);
      
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch instances');
    } catch (error) {
      // Não fazer logging para requisições de fetch de status
      // const headers = { 'Authorization': this.adminToken, 'Content-Type': 'application/json' };
      // this.logRequest('/admin/users', this.adminToken, {}, headers, null, error);
      
      console.error('Error fetching instances:', error);
      throw error;
    }
  }

  async getConnectedInstances(silent: boolean = false): Promise<WuzapiInstance[]> {
    try {
      const instances = await this.getInstances();
      
      // Log apenas a cada 30 segundos para evitar spam
      const now = Date.now();
      if (!silent && (now - this.lastLogTime > this.LOG_INTERVAL)) {
        console.log(`📊 Total de instâncias encontradas: ${instances.length}`);
        this.lastLogTime = now;
      }
      
      // Filtrar apenas instâncias que começam com "matura" e estão conectadas
      const filteredInstances = instances.filter(instance => {
        const isConnected = instance.connected;
        const isLoggedIn = instance.loggedIn;
        const startsWithMatura = instance.name.toLowerCase().startsWith('matura');
        
        return isConnected && isLoggedIn && startsWithMatura;
      });
      
      // Log apenas quando há mudanças significativas ou a cada 30 segundos
      if (!silent && (now - this.lastLogTime > this.LOG_INTERVAL)) {
        console.log(`✅ Instâncias "matura" conectadas: ${filteredInstances.length}`);
        if (filteredInstances.length > 0) {
          filteredInstances.forEach(instance => {
            console.log(`  ✅ ${instance.name} (${instance.id})`);
          });
        }
      }
      
      return filteredInstances;
    } catch (error) {
      console.error('❌ Erro ao obter instâncias conectadas:', error);
      return [];
    }
  }

  async sendTextMessage(instanceToken: string, to: string, message: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Body: message
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/text`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/text', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Body: message };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/text', instanceToken, payload, headers, null, error);
      }
      
      console.error('❌ Erro ao enviar mensagem de texto:', error);
      return false;
    }
  }

  async sendAudioMessage(instanceToken: string, to: string, audioBase64: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Audio: audioBase64
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/audio`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/audio', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Audio: audioBase64 };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/audio', instanceToken, payload, headers, null, error);
      }
      
      console.error('Error sending audio message:', error);
      return false;
    }
  }

  async sendImageMessage(instanceToken: string, to: string, imageBase64: string, caption?: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Image: imageBase64,
        Caption: caption || ''
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/image`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/image', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Image: imageBase64, Caption: caption || '' };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/image', instanceToken, payload, headers, null, error);
      }
      
      console.error('Error sending image message:', error);
      return false;
    }
  }

  async sendVideoMessage(instanceToken: string, to: string, videoBase64: string, caption?: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Video: videoBase64,
        Caption: caption || ''
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/video`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/video', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Video: videoBase64, Caption: caption || '' };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/video', instanceToken, payload, headers, null, error);
      }
      
      console.error('Error sending video message:', error);
      return false;
    }
  }

  async sendDocumentMessage(instanceToken: string, to: string, documentBase64: string, filename: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Document: documentBase64,
        FileName: filename
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/document`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/document', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Document: documentBase64, FileName: filename };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/document', instanceToken, payload, headers, null, error);
      }
      
      console.error('Error sending document message:', error);
      return false;
    }
  }

  async sendStickerMessage(instanceToken: string, to: string, stickerBase64: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Sticker: stickerBase64
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/sticker`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/sticker', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Sticker: stickerBase64 };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/sticker', instanceToken, payload, headers, null, error);
      }
      
      console.error('Error sending sticker message:', error);
      return false;
    }
  }

  async sendLocationMessage(instanceToken: string, to: string, latitude: number, longitude: number, name?: string, enableLogging: boolean = true): Promise<boolean> {
    try {
      // Extract phone number from JID if needed (remove device part)
      const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
      
      const payload = {
        Phone: phoneNumber,
        Name: name || 'Location',
        Latitude: latitude,
        Longitude: longitude
      };
      
      const headers = {
        'token': instanceToken,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${this.baseUrl}/chat/send/location`, payload, {
        headers,
        timeout: 30000
      });
      
      // Log da requisição bem-sucedida
      if (enableLogging) {
        this.logRequest('/chat/send/location', instanceToken, payload, headers, response.data);
      }
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      // Log da requisição com erro
      if (enableLogging) {
        const phoneNumber = to.includes('@') ? to.split('@')[0].split(':')[0] : to;
        const payload = { Phone: phoneNumber, Name: name || 'Location', Latitude: latitude, Longitude: longitude };
        const headers = { 'token': instanceToken, 'Content-Type': 'application/json' };
        this.logRequest('/chat/send/location', instanceToken, payload, headers, null, error);
      }
      
      console.error('Error sending location message:', error);
      return false;
    }
  }

  async sendMessage(instanceToken: string, to: string, type: MessageType, content: string | Record<string, unknown>): Promise<boolean> {
    try {
      switch (type) {
        case MessageType.TEXT:
          return await this.sendTextMessage(instanceToken, to, content as string);
        
        case MessageType.AUDIO:
          return await this.sendAudioMessage(instanceToken, to, content as string);
        
        case MessageType.IMAGE:
          // Agora o content é uma string com MIME type, mas precisamos de caption
          const imageBase64 = content as string;
          const imageCaption = this.getRandomCaption('image');
          return await this.sendImageMessage(instanceToken, to, imageBase64, imageCaption);
        
        case MessageType.VIDEO:
          // Agora o content é uma string com MIME type, mas precisamos de caption
          const videoBase64 = content as string;
          const videoCaption = this.getRandomCaption('video');
          return await this.sendVideoMessage(instanceToken, to, videoBase64, videoCaption);
        
        case MessageType.DOCUMENT:
          // Agora o content é uma string com MIME type, mas precisamos de filename
          const documentBase64 = content as string;
          const filename = this.getRandomFilename();
          return await this.sendDocumentMessage(instanceToken, to, documentBase64, filename);
        
        case MessageType.STICKER:
          return await this.sendStickerMessage(instanceToken, to, content as string);
        
        case MessageType.LOCATION:
          // Location ainda precisa ser um objeto com lat/lng
          const locationContent = content as Record<string, unknown>;
          const latitude = locationContent.latitude as number;
          const longitude = locationContent.longitude as number;
          const name = locationContent.name as string;
          return await this.sendLocationMessage(instanceToken, to, latitude, longitude, name);
        
        default:
          console.error('Tipo de mensagem não suportado:', type);
          return false;
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return false;
    }
  }

  private getRandomCaption(type: 'image' | 'video'): string {
    const imageCaptions = [
      'Olha essa foto!',
      'Que legal, né?',
      'Tirei agora pouco',
      'Gostaram?',
      'Linda imagem',
      'Compartilhando com vocês',
      'Momento especial',
      'Registro do dia'
    ];

    const videoCaptions = [
      'Vídeo incrível!',
      'Assistam esse vídeo',
      'Muito legal esse vídeo',
      'Compartilhando com vocês',
      'Vale a pena assistir',
      'Vídeo do momento',
      'Gravei para vocês',
      'Que vídeo legal!'
    ];

    const captions = type === 'image' ? imageCaptions : videoCaptions;
    return captions[Math.floor(Math.random() * captions.length)];
  }

  private getRandomFilename(): string {
    const names = [
      'documento.pdf',
      'arquivo.txt',
      'planilha.xlsx',
      'apresentacao.pptx',
      'relatorio.docx',
      'dados.csv',
      'informacoes.pdf',
      'manual.pdf'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }
}