'use client';

import { MessageLog, MessageType } from '@/types';
import { useState, useEffect } from 'react';

interface LogsPanelProps {
  logs: MessageLog[];
}

interface ApiRequestLog {
  timestamp: string;
  endpoint: string;
  token: string;
  body: any;
  headers: any;
  response?: any;
  error?: {
    message: string;
    status?: number;
    data?: any;
  };
}

export function LogsPanel({ logs }: LogsPanelProps) {
  const [apiLogs, setApiLogs] = useState<ApiRequestLog[]>([]);
  const [showApiLogs, setShowApiLogs] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchApiLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/maturador/logs');
      const data = await response.json();
      if (data.success) {
        setApiLogs(data.logs);
      }
    } catch (error) {
      console.error('Erro ao carregar logs da API:', error);
    }
    setLoading(false);
  };

  const clearApiLogs = async () => {
    try {
      await fetch('/api/maturador/logs', { method: 'DELETE' });
      setApiLogs([]);
    } catch (error) {
      console.error('Erro ao limpar logs da API:', error);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Logs de Mensagens
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowApiLogs(!showApiLogs)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showApiLogs ? 'Ocultar' : 'Mostrar'} Logs da API
          </button>
          {showApiLogs && (
            <>
              <button
                onClick={fetchApiLogs}
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Atualizar'}
              </button>
              <button
                onClick={clearApiLogs}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Limpar
              </button>
            </>
          )}
        </div>
      </div>

      {showApiLogs && (
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Logs da API ({apiLogs.length})
          </h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {apiLogs.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Nenhum log da API encontrado
              </p>
            ) : (
              apiLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border ${
                    log.error ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-green-200 bg-green-50 dark:bg-green-900/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          log.error ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {log.error ? '❌ ERRO' : '✅ SUCESSO'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        <strong>Endpoint:</strong> {log.endpoint}
                      </div>
                      <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        <strong>Token:</strong> {log.token}
                      </div>
                      <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        <strong>Body:</strong> {JSON.stringify(log.body, null, 2)}
                      </div>
                      {log.error && (
                        <div className="text-sm font-mono text-red-700 dark:text-red-300 mt-2">
                          <strong>Erro:</strong> {log.error.message}
                          {log.error.status && ` (Status: ${log.error.status})`}
                          {log.error.data && (
                            <div className="mt-1">
                              <strong>Resposta:</strong> {JSON.stringify(log.error.data, null, 2)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nenhuma mensagem enviada ainda
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded border ${
                log.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.success ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {log.success ? '✅ Enviado' : '❌ Falha'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getMessageTypeColor(log.type)}`}>
                      {getMessageTypeIcon(log.type)} {log.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {log.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>De:</strong> {log.from} <strong>Para:</strong> {log.to}
                  </div>
                  {log.content && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      <strong>Conteúdo:</strong> {log.content.substring(0, 100)}
                      {log.content.length > 100 && '...'}
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