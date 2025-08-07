import { NextResponse } from 'next/server';
import { getDefaultConfig } from '@/lib/env-config';
import { WuzapiClient } from '@/lib/wuzapi';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Verificar configurações básicas
    const config = getDefaultConfig();
    const hasConfig = !!(config.baseUrl && config.token);
    
    // Verificar conexão com API Wuzapi
    let apiStatus = 'unknown';
    let connectedInstances = 0;
    
    if (hasConfig) {
      try {
        const wuzapi = new WuzapiClient(config.baseUrl, config.token);
        const instances = await wuzapi.getConnectedInstances();
        connectedInstances = instances.length;
        apiStatus = 'connected';
      } catch (error) {
        apiStatus = 'error';
      }
    }
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      config: {
        hasConfig,
        apiStatus,
        connectedInstances
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };
    
    // Determinar status HTTP baseado na saúde
    const isHealthy = hasConfig && apiStatus === 'connected';
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
} 