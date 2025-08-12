'use client';

import { MessageLog, MessageType } from '@/types';
import { useState } from 'react';

interface LogsPanelProps {
  logs: MessageLog[];
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isClearing, setIsClearing] = useState(false);

  const handleClearLogs = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/maturador/message-logs', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Recarregar a página para atualizar os logs
        window.location.reload();
      } else {
        alert('Erro ao limpar logs');
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      alert('Erro ao limpar logs');
    } finally {
      setIsClearing(false);
    }
  };

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case MessageType.TEXT:
        return '💬';
      case MessageType.AUDIO:
        return '🎵';
      case MessageType.IMAGE:
        return '🖼️';
      case MessageType.VIDEO:
        return '🎥';
      case MessageType.DOCUMENT:
        return '📄';
      case MessageType.STICKER:
        return '😀';
      case MessageType.LOCATION:
        return '📍';
      default:
        return '📱';
    }
  };

  const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
      case MessageType.TEXT:
        return 'text-blue-600 dark:text-blue-400';
      case MessageType.AUDIO:
        return 'text-purple-600 dark:text-purple-400';
      case MessageType.IMAGE:
        return 'text-green-600 dark:text-green-400';
      case MessageType.VIDEO:
        return 'text-red-600 dark:text-red-400';
      case MessageType.DOCUMENT:
        return 'text-yellow-600 dark:text-yellow-400';
      case MessageType.STICKER:
        return 'text-pink-600 dark:text-pink-400';
      case MessageType.LOCATION:
        return 'text-indigo-600 dark:text-indigo-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getMessageTypeLabel = (type: MessageType) => {
    switch (type) {
      case MessageType.TEXT:
        return 'Texto';
      case MessageType.AUDIO:
        return 'Áudio';
      case MessageType.IMAGE:
        return 'Imagem';
      case MessageType.VIDEO:
        return 'Vídeo';
      case MessageType.DOCUMENT:
        return 'Documento';
      case MessageType.STICKER:
        return 'Sticker';
      case MessageType.LOCATION:
        return 'Localização';
      default:
        return 'Desconhecido';
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Formatar número de telefone para exibição mais limpa
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
    }
    return phone;
  };

  const formatContent = (content: string, type: MessageType) => {
    if (!content) return '';
    
    switch (type) {
      case MessageType.TEXT:
        return content.length > 50 ? `${content.substring(0, 50)}...` : content;
      case MessageType.AUDIO:
        return '🎵 Áudio enviado';
      case MessageType.IMAGE:
        return content.includes('Caption') ? '🖼️ Imagem com legenda' : '🖼️ Imagem';
      case MessageType.VIDEO:
        return content.includes('Caption') ? '🎥 Vídeo com legenda' : '🎥 Vídeo';
      case MessageType.DOCUMENT:
        return '📄 Documento enviado';
      case MessageType.STICKER:
        return '😀 Sticker enviado';
      case MessageType.LOCATION:
        return '📍 Localização enviada';
      default:
        return content.length > 30 ? `${content.substring(0, 30)}...` : content;
    }
  };

  const filteredLogs = logs.filter(log => {
    const typeMatch = filterType === 'all' || log.type === filterType;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'success' && log.success) || 
      (filterStatus === 'failed' && !log.success);
    return typeMatch && statusMatch;
  });

  const stats = {
    total: logs.length,
    success: logs.filter(log => log.success).length,
    failed: logs.filter(log => !log.success).length,
    byType: logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Logs de Mensagens ({logs.length})
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ✅ {stats.success} | ❌ {stats.failed}
          </div>
          <button
            onClick={handleClearLogs}
            disabled={isClearing || logs.length === 0}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClearing ? 'Limpando...' : 'Limpar Logs'}
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
          <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
          <div className="font-semibold text-blue-800 dark:text-blue-200">{stats.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
          <div className="text-xs text-green-600 dark:text-green-400">Sucesso</div>
          <div className="font-semibold text-green-800 dark:text-green-200">{stats.success}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-center">
          <div className="text-xs text-red-600 dark:text-red-400">Falhas</div>
          <div className="font-semibold text-red-800 dark:text-red-200">{stats.failed}</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">
          <div className="text-xs text-purple-600 dark:text-purple-400">Taxa</div>
          <div className="font-semibold text-purple-800 dark:text-purple-200">
            {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Todos os tipos</option>
          <option value="TEXT">Texto</option>
          <option value="AUDIO">Áudio</option>
          <option value="IMAGE">Imagem</option>
          <option value="VIDEO">Vídeo</option>
          <option value="DOCUMENT">Documento</option>
          <option value="STICKER">Sticker</option>
          <option value="LOCATION">Localização</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Todos os status</option>
          <option value="success">Sucesso</option>
          <option value="failed">Falhas</option>
        </select>
      </div>

      {/* Lista de logs */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
            {logs.length === 0 ? 'Nenhuma mensagem enviada ainda' : 'Nenhum log encontrado com os filtros aplicados'}
          </p>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded border transition-colors ${
                log.success 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' 
                  : 'border-red-200 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      log.success 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {log.success ? '✅ Enviado' : '❌ Falha'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getMessageTypeColor(log.type)}`}>
                      {getMessageTypeIcon(log.type)} {getMessageTypeLabel(log.type)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {log.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    <span className="font-medium">De:</span> {formatPhoneNumber(log.from)} 
                    <span className="font-medium ml-2">Para:</span> {formatPhoneNumber(log.to)}
                  </div>
                  
                  {log.content && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Conteúdo:</span> {formatContent(log.content, log.type)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}