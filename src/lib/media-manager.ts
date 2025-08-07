import { MessageType } from '@/types';

export class MediaManager {
  private imageBase64: string = '';
  private audioBase64: string = '';
  private locations: Array<{ name: string; latitude: number; longitude: number }> = [];

  constructor() {
    this.initializeMedia();
  }

  private initializeMedia(): void {
    // Sample base64 image (1x1 transparent pixel)
    this.imageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Sample base64 audio (very short silence)
    this.audioBase64 = 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    // Sample locations
    this.locations = [
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
        return this.getRandomText();
      
      case MessageType.AUDIO:
        return this.audioBase64;
      
      case MessageType.IMAGE:
        return {
          image: this.imageBase64,
          caption: this.getRandomImageCaption()
        };
      
      case MessageType.VIDEO:
        return {
          video: this.imageBase64, // Using image as placeholder for video
          caption: this.getRandomVideoCaption()
        };
      
      case MessageType.DOCUMENT:
        return {
          document: this.generateDocumentBase64(),
          filename: this.getRandomDocumentName()
        };
      
      case MessageType.STICKER:
        return this.imageBase64;
      
      case MessageType.LOCATION:
        return this.getRandomLocation();
      
      default:
        return this.getRandomText();
    }
  }

  private getRandomText(): string {
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

  private getRandomImageCaption(): string {
    const captions = [
      'Olha essa foto!',
      'Que legal, né?',
      'Tirei agora pouco',
      'Gostaram?',
      'Linda imagem',
      'Compartilhando com vocês',
      'Momento especial',
      'Registro do dia'
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  }

  private getRandomVideoCaption(): string {
    const captions = [
      'Vídeo incrível!',
      'Assistam esse vídeo',
      'Muito legal esse vídeo',
      'Compartilhando com vocês',
      'Vale a pena assistir',
      'Vídeo do momento',
      'Gravei para vocês',
      'Que vídeo legal!'
    ];
    return captions[Math.floor(Math.random() * captions.length)];
  }

  private getRandomDocumentName(): string {
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

  private generateDocumentBase64(): string {
    // Simple text document as base64
    const content = 'Este é um documento de exemplo gerado pelo maturador.';
    return Buffer.from(content).toString('base64');
  }

  private getRandomLocation(): { latitude: number; longitude: number; name: string } {
    const location = this.locations[Math.floor(Math.random() * this.locations.length)];
    
    // Add some random variation to coordinates
    const latVariation = (Math.random() - 0.5) * 0.01; // ±0.005 degrees
    const lngVariation = (Math.random() - 0.5) * 0.01; // ±0.005 degrees
    
    return {
      latitude: location.latitude + latVariation,
      longitude: location.longitude + lngVariation,
      name: location.name
    };
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
}