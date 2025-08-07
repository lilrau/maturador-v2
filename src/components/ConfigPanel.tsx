'use client';

interface ConfigPanelProps {
  onTestConnection: () => void;
  isTestingConnection: boolean;
  config: { baseUrl: string; minIntervalSeconds: number; maxIntervalSeconds: number; };
}

export function ConfigPanel({ onTestConnection, isTestingConnection, config }: ConfigPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Configuração da API
      </h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Configurações Carregadas do .env
          </h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">URL Base:</span> {config.baseUrl || 'Não configurada'}
            </div>
            <div>
              <span className="font-medium">Intervalo:</span> {config.minIntervalSeconds}-{config.maxIntervalSeconds} segundos
            </div>
          </div>
        </div>

        <button
          onClick={onTestConnection}
          disabled={isTestingConnection || !config.baseUrl}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
        </button>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Configurações carregadas automaticamente do arquivo .env</p>
          <p>• Para alterar, edite o arquivo .env e reinicie o servidor</p>
          <p>• Teste a conexão antes de iniciar o maturador</p>
        </div>
      </div>
    </div>
  );
}