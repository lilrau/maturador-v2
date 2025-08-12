import { MessageType } from '@/types';
import { getMediaPath } from './env-config';
import fs from 'fs';
import path from 'path';

export class MediaManager {
  private imageBase64: string = '';
  private audioBase64: string = '';
  private documentBase64: string = '';
  private videoBase64: string = '';
  private stickerBase64: string = '';
  private locations: Array<{ name: string; latitude: number; longitude: number }> = [];
  private mediaLoaded: boolean = false;

  constructor() {
    this.initializeMedia();
  }

  private async initializeMedia(): Promise<void> {
    try {
      const mediaPath = getMediaPath();
      console.log(`📁 Carregando mídia de: ${mediaPath}`);

      // Carregar arquivos base64 reais
      await this.loadBase64Files(mediaPath);
      
      // Carregar localizações
      this.loadLocations();
      
      this.mediaLoaded = true;
      console.log('✅ Mídia carregada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar mídia, usando fallbacks:', error);
      this.loadFallbackMedia();
    }
  }

  private async loadBase64Files(mediaPath: string): Promise<void> {
    // Carregar áudio
    const audioPath = path.join(mediaPath, 'audio.json');
    if (fs.existsSync(audioPath)) {
      try {
        const audioData = JSON.parse(fs.readFileSync(audioPath, 'utf8'));
        const rawAudio = audioData.base64 || this.getFallbackAudio();
        this.audioBase64 = this.ensureAudioMimeType(rawAudio);
        console.log(`✅ Áudio carregado: ${this.audioBase64.substring(0, 50)}...`);
      } catch (audioError) {
        console.error('❌ Erro ao carregar áudio:', audioError);
        this.audioBase64 = this.getFallbackAudio();
      }
    } else {
      this.audioBase64 = this.getFallbackAudio();
    }

    // Carregar imagem
    const imagePath = path.join(mediaPath, 'image.json');
    if (fs.existsSync(imagePath)) {
      try {
        const imageData = JSON.parse(fs.readFileSync(imagePath, 'utf8'));
        const rawImage = imageData.base64 || this.getFallbackImage();
        this.imageBase64 = this.ensureImageMimeType(rawImage);
        console.log(`✅ Imagem carregada: ${this.imageBase64.substring(0, 50)}...`);
      } catch (imageError) {
        console.error('❌ Erro ao carregar imagem:', imageError);
        this.imageBase64 = this.getFallbackImage();
      }
    } else {
      this.imageBase64 = this.getFallbackImage();
    }

    // Carregar vídeo
    const videoPath = path.join(mediaPath, 'video.json');
    if (fs.existsSync(videoPath)) {
      try {
        const videoData = JSON.parse(fs.readFileSync(videoPath, 'utf8'));
        const rawVideo = videoData.base64 || this.getFallbackVideo();
        this.videoBase64 = this.ensureVideoMimeType(rawVideo);
        console.log(`✅ Vídeo carregado: ${this.videoBase64.substring(0, 50)}...`);
      } catch (videoError) {
        console.error('❌ Erro ao carregar vídeo:', videoError);
        this.videoBase64 = this.getFallbackVideo();
      }
    } else {
      this.videoBase64 = this.getFallbackVideo();
    }

    // Carregar documento
    const documentPath = path.join(mediaPath, 'document.json');
    if (fs.existsSync(documentPath)) {
      try {
        const documentData = JSON.parse(fs.readFileSync(documentPath, 'utf8'));
        const rawDocument = documentData.base64 || this.getFallbackDocument();
        this.documentBase64 = this.ensureDocumentMimeType(rawDocument);
        console.log(`✅ Documento carregado: ${this.documentBase64.substring(0, 50)}...`);
      } catch (documentError) {
        console.error('❌ Erro ao carregar documento:', documentError);
        this.documentBase64 = this.getFallbackDocument();
      }
    } else {
      this.documentBase64 = this.getFallbackDocument();
    }

    // Carregar sticker
    const stickerPath = path.join(mediaPath, 'sticker.json');
    if (fs.existsSync(stickerPath)) {
      try {
        const stickerData = JSON.parse(fs.readFileSync(stickerPath, 'utf8'));
        const rawSticker = stickerData.base64 || this.getFallbackSticker();
        this.stickerBase64 = this.ensureStickerMimeType(rawSticker);
        console.log(`✅ Sticker carregado: ${this.stickerBase64.substring(0, 50)}...`);
      } catch (stickerError) {
        console.error('❌ Erro ao carregar sticker:', stickerError);
        this.stickerBase64 = this.getFallbackSticker();
      }
    } else {
      this.stickerBase64 = this.getFallbackSticker();
    }
  }

  private loadLocations(): void {
    try {
      const mediaPath = getMediaPath();
      const locationPath = path.join(mediaPath, 'location.js');
      
      if (fs.existsSync(locationPath)) {
        // Para arquivos .js, podemos tentar carregar como módulo ou ler como texto
        const locationContent = fs.readFileSync(locationPath, 'utf8');
        // Por enquanto, usar localizações padrão
        this.locations = this.getFallbackLocations();
      } else {
        this.locations = this.getFallbackLocations();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar localizações:', error);
      this.locations = this.getFallbackLocations();
    }
  }

  private loadFallbackMedia(): void {
    this.imageBase64 = this.getFallbackImage();
    this.audioBase64 = this.getFallbackAudio();
    this.documentBase64 = this.getFallbackDocument();
    this.videoBase64 = this.getFallbackVideo();
    this.stickerBase64 = this.getFallbackSticker();
    this.locations = this.getFallbackLocations();
  }

  private getFallbackAudio(): string {
    return 'data:audio/ogg;base64,iVBORw0a';
  }

  private getFallbackImage(): string {
    return 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  private getFallbackVideo(): string {
    return 'data:video/mp4;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  private getFallbackDocument(): string {
    return 'data:application/octet-stream;base64,aG9sYSBxdWUKdGFs';
  }

  private getFallbackSticker(): string {
    return 'data:image/webp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  private getFallbackLocations(): Array<{ name: string; latitude: number; longitude: number }> {
    return [
      { name: 'São Paulo, SP', latitude: -23.5505, longitude: -46.6333 },
      { name: 'Rio de Janeiro, RJ', latitude: -22.9068, longitude: -43.1729 },
      { name: 'Brasília, DF', latitude: -15.7942, longitude: -47.8822 },
      { name: 'Salvador, BA', latitude: -12.9714, longitude: -38.5014 },
      { name: 'Fortaleza, CE', latitude: -3.7319, longitude: -38.5267 },
      { name: 'Belo Horizonte, MG', latitude: -19.9191, longitude: -43.9386 },
      { name: 'Manaus, AM', latitude: -3.1190, longitude: -60.0217 },
      { name: 'Curitiba, PR', latitude: -25.4284, longitude: -49.2733 },
      { name: 'Recife, PE', latitude: -8.0476, longitude: -34.8770 },
      { name: 'Porto Alegre, RS', latitude: -30.0346, longitude: -51.2177 }
    ];
  }

  getMediaContent(type: MessageType): string | Record<string, unknown> {
    switch (type) {
      case MessageType.TEXT:
        return this.getRandomMessage();
      case MessageType.AUDIO:
        return this.ensureAudioMimeType(this.audioBase64);
      case MessageType.IMAGE:
        return this.ensureImageMimeType(this.imageBase64);
      case MessageType.VIDEO:
        return this.ensureVideoMimeType(this.videoBase64);
      case MessageType.DOCUMENT:
        return this.ensureDocumentMimeType(this.documentBase64);
      case MessageType.STICKER:
        return this.ensureStickerMimeType(this.stickerBase64);
      case MessageType.LOCATION:
        return this.getRandomLocation();
      default:
        return this.getRandomMessage();
    }
  }

  private ensureAudioMimeType(audioBase64: string): string {
    if (audioBase64.startsWith('data:audio/')) {
      return audioBase64;
    }
    if (!audioBase64.startsWith('data:')) {
      return `data:audio/ogg;base64,${audioBase64}`;
    }
    const base64Match = audioBase64.match(/^data:[^;]+;base64,(.+)$/);
    if (base64Match) {
      return `data:audio/ogg;base64,${base64Match[1]}`;
    }
    return audioBase64;
  }

  private ensureImageMimeType(imageBase64: string): string {
    if (imageBase64.startsWith('data:image/')) {
      return imageBase64;
    }
    if (!imageBase64.startsWith('data:')) {
      return `data:image/jpeg;base64,${imageBase64}`;
    }
    const base64Match = imageBase64.match(/^data:[^;]+;base64,(.+)$/);
    if (base64Match) {
      return `data:image/jpeg;base64,${base64Match[1]}`;
    }
    return imageBase64;
  }

  private ensureVideoMimeType(videoBase64: string): string {
    if (videoBase64.startsWith('data:video/')) {
      return videoBase64;
    }
    if (!videoBase64.startsWith('data:')) {
      return `data:video/mp4;base64,${videoBase64}`;
    }
    const base64Match = videoBase64.match(/^data:[^;]+;base64,(.+)$/);
    if (base64Match) {
      return `data:video/mp4;base64,${base64Match[1]}`;
    }
    return videoBase64;
  }

  private ensureDocumentMimeType(documentBase64: string): string {
    if (documentBase64.startsWith('data:application/')) {
      return documentBase64;
    }
    if (!documentBase64.startsWith('data:')) {
      return `data:application/octet-stream;base64,${documentBase64}`;
    }
    const base64Match = documentBase64.match(/^data:[^;]+;base64,(.+)$/);
    if (base64Match) {
      return `data:application/octet-stream;base64,${base64Match[1]}`;
    }
    return documentBase64;
  }

  private ensureStickerMimeType(stickerBase64: string): string {
    if (stickerBase64.startsWith('data:image/')) {
      return stickerBase64;
    }
    if (!stickerBase64.startsWith('data:')) {
      return `data:image/webp;base64,${stickerBase64}`;
    }
    const base64Match = stickerBase64.match(/^data:[^;]+;base64,(.+)$/);
    if (base64Match) {
      return `data:image/webp;base64,${base64Match[1]}`;
    }
    return stickerBase64;
  }

  private getRandomLocation(): Record<string, unknown> {
    const location = this.locations[Math.floor(Math.random() * this.locations.length)];
    
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name
    };
  }

  private getRandomMessage(): string {
    const messages = [
      'Oi, tudo bem?',
      'Como você está?',
      'Que dia lindo!',
      'Espero que esteja tudo bem',
      'Tenha um ótimo dia!',
      'Até mais!',
      'Falou!',
      'Abraços',
      'Beijos',
      'Tchau!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Method to update media content if needed
  updateImageBase64(base64: string): void {
    this.imageBase64 = base64;
  }

  updateAudioBase64(base64: string): void {
    this.audioBase64 = base64;
  }

  addLocation(name: string, latitude: number, longitude: number): void {
    this.locations.push({ name, latitude, longitude });
  }

  isMediaLoaded(): boolean {
    return this.mediaLoaded;
  }
}