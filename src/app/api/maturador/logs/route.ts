import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logFile = './logs/api-requests.json';
    
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({
        success: false,
        message: 'Arquivo de logs não encontrado',
        logs: []
      });
    }

    const logContent = fs.readFileSync(logFile, 'utf8');
    const logs = JSON.parse(logContent);

    return NextResponse.json({
      success: true,
      message: 'Logs carregados com sucesso',
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Erro ao carregar logs:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro ao carregar logs',
      logs: []
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const logFile = './logs/api-requests.json';
    
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile);
    }

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