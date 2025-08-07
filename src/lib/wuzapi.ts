import axios, { AxiosInstance } from 'axios';
import { WuzapiInstance, WuzapiResponse, MessageType } from '@/types';

export class WuzapiClient {
  private api: AxiosInstance;
  private baseUrl: string;
  private adminToken: string;

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
  }

  async getInstances(): Promise<WuzapiInstance[]> {
    try {
      const response = await this.api.get<WuzapiResponse>('/admin/users');
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to fetch instances');
    } catch (error) {
      console.error('Error fetching instances:', error);
      throw error;
    }
  }

  async getConnectedInstances(): Promise<WuzapiInstance[]> {
    try {
    const instances = await this.getInstances();
      
    // Filtrar apenas instâncias que começam com "matura" e estão conectadas
      const filteredInstances = instances.filter(instance => {
        const isConnected = instance.connected;
        const isLoggedIn = instance.loggedIn;
        const startsWithMatura = instance.name.toLowerCase().startsWith('matura');
        
        return isConnected && isLoggedIn && startsWithMatura;
      });
      
      return filteredInstances;
    } catch (error) {
      console.error('Erro ao obter instâncias conectadas:', error);
      return [];
    }
  }

  async sendTextMessage(instanceToken: string, to: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/text`, {
        Phone: to,
        Body: message
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem de texto:', error);
      return false;
    }
  }

  async sendAudioMessage(instanceToken: string, to: string, audioBase64: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/audio`, {
        Phone: to,
        Audio: audioBase64
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending audio message:', error);
      return false;
    }
  }

  async sendImageMessage(instanceToken: string, to: string, imageBase64: string, caption?: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/image`, {
        Phone: to,
        Image: imageBase64,
        Caption: caption || ''
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending image message:', error);
      return false;
    }
  }

  async sendVideoMessage(instanceToken: string, to: string, videoBase64: string, caption?: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/video`, {
        Phone: to,
        Video: videoBase64,
        Caption: caption || ''
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending video message:', error);
      return false;
    }
  }

  async sendDocumentMessage(instanceToken: string, to: string, documentBase64: string, filename: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/document`, {
        Phone: to,
        Document: documentBase64,
        FileName: filename
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending document message:', error);
      return false;
    }
  }

  async sendStickerMessage(instanceToken: string, to: string, stickerBase64: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/sticker`, {
        Phone: to,
        Sticker: stickerBase64
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending sticker message:', error);
      return false;
    }
  }

  async sendLocationMessage(instanceToken: string, to: string, latitude: number, longitude: number, name?: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/send/location`, {
        Phone: to,
        Name: name || 'Location',
        Latitude: latitude,
        Longitude: longitude
      }, {
        headers: {
          'token': instanceToken,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending location message:', error);
      return false;
    }
  }

  async sendMessage(instanceToken: string, to: string, type: MessageType, content: string | Record<string, unknown>): Promise<boolean> {
    switch (type) {
      case MessageType.TEXT:
        return this.sendTextMessage(instanceToken, to, content as string);
      case MessageType.AUDIO:
        return this.sendAudioMessage(instanceToken, to, content as string);
      case MessageType.IMAGE:
        const imageContent = content as { image: string; caption?: string };
        return this.sendImageMessage(instanceToken, to, imageContent.image, imageContent.caption);
      case MessageType.VIDEO:
        const videoContent = content as { video: string; caption?: string };
        return this.sendVideoMessage(instanceToken, to, videoContent.video, videoContent.caption);
      case MessageType.DOCUMENT:
        const documentContent = content as { document: string; filename: string };
        return this.sendDocumentMessage(instanceToken, to, documentContent.document, documentContent.filename);
      case MessageType.STICKER:
        return this.sendStickerMessage(instanceToken, to, content as string);
      case MessageType.LOCATION:
        const locationContent = content as { latitude: number; longitude: number; name?: string };
        return this.sendLocationMessage(instanceToken, to, locationContent.latitude, locationContent.longitude, locationContent.name);
      default:
        console.error(`❌ Tipo de mensagem não suportado: ${type}`);
        return false;
    }
  }
}