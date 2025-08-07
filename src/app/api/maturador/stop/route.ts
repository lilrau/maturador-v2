import { NextResponse } from 'next/server';
import { WhatsAppMaturador } from '@/lib/maturador';

// Referência global para a instância do maturador
declare global {
  var maturadorInstance: WhatsAppMaturador | null;
}

export async function POST() {
  try {
    if (!global.maturadorInstance || !global.maturadorInstance.isRunning()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Maturador não está rodando' 
      }, { status: 400 });
    }

    global.maturadorInstance.stop();
    global.maturadorInstance = null;

    return NextResponse.json({ 
      success: true, 
      message: 'Maturador parado com sucesso',
      status: {
        isRunning: false,
        connectedInstances: 0,
        messagesSent: 0
      }
    });
  } catch (error) {
    console.error('Erro ao parar maturador:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Erro ao parar maturador: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 });
  }
}