'use client';

interface StatusPanelProps {
  status: {
    isRunning: boolean;
    connectedInstances: number;
    messagesSent: number;
  };
  onStart: () => void;
  onStop: () => void;
  isLoading?: boolean;
}

export function StatusPanel({ status, onStart, onStop, isLoading = false }: StatusPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Status do Maturador
      </h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status:
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            status.isRunning 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {status.isRunning ? 'Executando' : 'Parado'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Instâncias Conectadas:
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {status.connectedInstances}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mensagens Enviadas:
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {status.messagesSent}
          </span>
        </div>

        <div className="pt-4 space-y-2">
          {!status.isRunning ? (
            <button
              onClick={onStart}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Maturador'}
            </button>
          ) : (
            <button
              onClick={onStop}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              {isLoading ? 'Parando...' : 'Parar Maturador'}
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Mínimo 2 instâncias conectadas para funcionar</p>
          <p>• Mensagens são enviadas automaticamente</p>
          <p>• Cada instância tem uma personalidade única</p>
        </div>
      </div>
    </div>
  );
}