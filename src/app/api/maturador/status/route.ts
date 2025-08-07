import { NextResponse } from 'next/server';
import { WuzapiClient } from '@/lib/wuzapi';
import { getDefaultConfig } from '@/lib/env-config';
import { WhatsAppMaturador } from '@/lib/maturador';

// Referência global para a instância do maturador
declare global {
  var maturadorInstance: WhatsAppMaturador | null;
}

export async function GET() {
  try {
    const instance = global.maturadorInstance;
    
    // Sempre buscar instâncias conectadas, independentemente do estado do maturador
    const config = getDefaultConfig();
    const wuzapi = new WuzapiClient(config.baseUrl, config.token);
    
    // Usar modo silencioso para evitar spam de logs
    const connectedInstances = await wuzapi.getConnectedInstances(true);
    
    if (!instance) {
      return NextResponse.json({
        isRunning: false,
        connectedInstances: connectedInstances.length,
        messagesSent: 0,
        instances: connectedInstances,
        logs: []
      });
    }

    // Usar os métodos da instância para obter o status correto
    const logs = instance.getMessageLogs();

    return NextResponse.json({
      isRunning: instance.isRunning(),
      connectedInstances: connectedInstances.length,
      messagesSent: logs.length,
      instances: connectedInstances,
      logs
    });
  } catch (error) {
    // Log apenas erros críticos
    console.error('Erro crítico ao obter status:', error);
    return NextResponse.json({
      isRunning: false,
      connectedInstances: 0,
      messagesSent: 0,
      instances: [],
      logs: []
    });
  }
}