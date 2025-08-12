import { NextResponse } from 'next/server';
import { logManager } from '@/lib/log-manager';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const phone = searchParams.get('phone');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let logs = logManager.getMessageLogs(limit);

    // Aplicar filtros
    if (type && type !== 'all') {
      logs = logs.filter(log => log.type === type);
    }

    if (status && status !== 'all') {
      if (status === 'success') {
        logs = logs.filter(log => log.success);
      } else if (status === 'failed') {
        logs = logs.filter(log => !log.success);
      }
    }

    if (phone) {
      logs = logs.filter(log => log.from === phone || log.to === phone);
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      logs = logs.filter(log => log.timestamp >= start && log.timestamp <= end);
    }

    const stats = logManager.getStats();

    return NextResponse.json({
      success: true,
      message: 'Logs carregados com sucesso',
      logs,
      stats,
      count: logs.length
    });
  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao carregar logs',
      logs: [],
      stats: { total: 0, success: 0, failed: 0, byType: {} },
      count: 0
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    logManager.clearLogs();
    
    return NextResponse.json({
      success: true,
      message: 'Logs limpos com sucesso'
    });
  } catch (error) {
    console.error('Erro ao limpar logs:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao limpar logs'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'cleanup') {
      logManager.cleanup();
      return NextResponse.json({
        success: true,
        message: 'Limpeza de logs realizada com sucesso'
      });
    }

    if (action === 'save') {
      logManager.forceSave();
      return NextResponse.json({
        success: true,
        message: 'Logs salvos com sucesso'
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Ação não reconhecida'
    }, { status: 400 });
  } catch (error) {
    console.error('Erro ao executar ação nos logs:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao executar ação'
    }, { status: 500 });
  }
} 