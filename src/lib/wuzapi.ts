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

  async getConnectedInstances(silent: boolean = false): Promise<WuzapiInstance[]> {
    try {
      const instances = await this.getInstances();
      
      // Log apenas quando não está em modo silencioso
      if (!silent) {
        console.log(`📊 Total de instâncias encontradas: ${instances.length}`);
      }
      
      // Filtrar apenas instâncias que começam com "matura" e estão conectadas
      const filteredInstances = instances.filter(instance => {
        const isConnected = instance.connected;
        const isLoggedIn = instance.loggedIn;
        const startsWithMatura = instance.name.toLowerCase().startsWith('matura');
        
        return isConnected && isLoggedIn && startsWithMatura;
      });
      
      // Log apenas quando não está em modo silencioso
      if (!silent) {
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

  async sendTextMessage(instanceToken: string, to: string, message: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem de texto:', error);
      return false;
    }
  }

  async sendAudioMessage(instanceToken: string, to: string, audioBase64: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending audio message:', error);
      return false;
    }
  }

  async sendImageMessage(instanceToken: string, to: string, imageBase64: string, caption?: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending image message:', error);
      return false;
    }
  }

  async sendVideoMessage(instanceToken: string, to: string, videoBase64: string, caption?: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending video message:', error);
      return false;
    }
  }

  async sendDocumentMessage(instanceToken: string, to: string, documentBase64: string, filename: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending document message:', error);
      return false;
    }
  }

  async sendStickerMessage(instanceToken: string, to: string, stickerBase64: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
      console.error('Error sending sticker message:', error);
      return false;
    }
  }

  async sendLocationMessage(instanceToken: string, to: string, latitude: number, longitude: number, name?: string): Promise<boolean> {
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
      
      return response.data.success && response.data.code === 200;
    } catch (error) {
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
          const imageContent = content as Record<string, unknown>;
          return await this.sendImageMessage(
            instanceToken, 
            to, 
            imageContent.image as string, 
            imageContent.caption as string
          );
        
        case MessageType.VIDEO:
          const videoContent = content as Record<string, unknown>;
          return await this.sendVideoMessage(
            instanceToken, 
            to, 
            videoContent.video as string, 
            videoContent.caption as string
          );
        
        case MessageType.DOCUMENT:
          const documentContent = content as Record<string, unknown>;
          return await this.sendDocumentMessage(
            instanceToken, 
            to, 
            documentContent.document as string, 
            documentContent.filename as string
          );
        
        case MessageType.STICKER:
          return await this.sendStickerMessage(instanceToken, to, content as string);
        
        case MessageType.LOCATION:
          const locationContent = content as Record<string, unknown>;
          return await this.sendLocationMessage(
            instanceToken, 
            to, 
            locationContent.latitude as number, 
            locationContent.longitude as number, 
            locationContent.name as string
          );
        
        default:
          console.error(`❌ Tipo de mensagem não suportado: ${type}`);
          return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem do tipo ${type}:`, error);
      return false;
    }
  }

  private getRandomCaption(type: 'image' | 'video'): string {
    const captions = {
      image: [
        'Linda imagem! 📸',
        'Que foto incrível! ✨',
        'Muito bonita! 😍',
        'Adorei! 🎉',
        'Que momento especial! 🌟',
        'Linda! 💖',
        'Incrível! 🔥',
        'Que legal! 😊',
        'Muito bom! 👍',
        'Fantástico! 🎊'
      ],
      video: [
        'Vídeo muito legal! 🎥',
        'Que vídeo incrível! ✨',
        'Adorei o vídeo! 😍',
        'Muito bom! 🎉',
        'Que momento especial! 🌟',
        'Incrível! 💖',
        'Fantástico! 🔥',
        'Que legal! 😊',
        'Muito bom! 👍',
        'Excelente! 🎊'
      ]
    };
    
    const typeCaptions = captions[type];
    return typeCaptions[Math.floor(Math.random() * typeCaptions.length)];
  }

  private getRandomFilename(): string {
    const filenames = [
      'documento.pdf',
      'planilha.xlsx',
      'relatorio.docx',
      'manual.pdf',
      'informacoes.pdf',
      'dados.csv',
      'arquivo.txt',
      'apresentacao.pptx',
      'imagem.jpg',
      'video.mp4'
    ];
    
    return filenames[Math.floor(Math.random() * filenames.length)];
  }
}
