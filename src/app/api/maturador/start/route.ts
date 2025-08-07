import { NextResponse } from 'next/server';
import { WhatsAppMaturador } from '@/lib/maturador';
import { getDefaultConfig } from '@/lib/env-config';

// Referência global para a instância do maturador
declare global {
  var maturadorInstance: WhatsAppMaturador | null;
}

export async function POST() {
  try {
    if (global.maturadorInstance && global.maturadorInstance.isRunning()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Maturador já está rodando' 
      }, { status: 400 });
    }

    // Carregar configurações do .env no backend
    const config = getDefaultConfig();

    global.maturadorInstance = new WhatsAppMaturador(config);

    // Inicializar e iniciar o maturador
    await global.maturadorInstance.start();

      return NextResponse.json({ 
        success: true, 
        message: 'Maturador iniciado com sucesso',
        status: {
        isRunning: global.maturadorInstance.isRunning(),
          connectedInstances: global.maturadorInstance.getConnectedInstances().length,
        messagesSent: global.maturadorInstance.getMessageLogs().length
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar maturador:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Erro ao iniciar maturador: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}