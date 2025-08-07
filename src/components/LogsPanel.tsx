'use client';

import { MessageLog, MessageType } from '@/types';

interface LogsPanelProps {
  logs: MessageLog[];
}

export function LogsPanel({ logs }: LogsPanelProps) {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Log de Mensagens ({logs.length})
      </h2>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Nenhuma mensagem enviada ainda</p>
            <p className="text-xs mt-1">Inicie o maturador para ver os logs</p>
          </div>
        ) : (
          logs.slice().reverse().map((log) => (
            <div
              key={log.id}
              className={`border-l-4 pl-3 py-2 ${
                log.success 
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                  : 'border-red-400 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {getMessageTypeIcon(log.type)}
                  </span>
                  <span className={`text-sm font-medium ${getMessageTypeColor(log.type)}`}>
                    {log.type.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {log.success ? 'Enviado' : 'Falhou'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">De:</span> {log.from} →{' '}
                <span className="font-medium">Para:</span> {log.to}
              </div>
              
              {log.type === MessageType.TEXT && (
                <div className="text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded px-2 py-1">
                  {log.content}
                </div>
              )}
              
              {log.type !== MessageType.TEXT && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {log.type === MessageType.LOCATION ? 'Localização compartilhada' : 'Mídia enviada'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {logs.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>• Mostrando as últimas 100 mensagens</p>
          <p>• Logs são atualizados em tempo real</p>
        </div>
      )}
    </div>
  );
}