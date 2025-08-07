'use client';

import { WuzapiInstance } from '@/types';

interface InstancesPanelProps {
  instances: WuzapiInstance[];
}

export function InstancesPanel({ instances }: InstancesPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Instâncias WhatsApp ({instances.length})
      </h2>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {instances.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Nenhuma instância conectada</p>
            <p className="text-xs mt-1">Configure a API e teste a conexão</p>
          </div>
        ) : (
          instances.map((instance) => (
            <div
              key={instance.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800 dark:text-white truncate">
                  {instance.name || `Instância ${instance.id}`}
                </h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    instance.connected 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {instance.connected ? 'Conectado' : 'Desconectado'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    instance.loggedIn 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {instance.loggedIn ? 'Logado' : 'Não Logado'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><span className="font-medium">ID:</span> {instance.id}</p>
                <p><span className="font-medium">JID:</span> {instance.jid}</p>
                {instance.expiration && (
                  <p>
                    <span className="font-medium">Expira:</span>{' '}
                    {new Date(instance.expiration * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {instances.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          <p>• Apenas instâncias conectadas e logadas participam do maturador</p>
          <p>• Cada instância recebe uma personalidade aleatória</p>
        </div>
      )}
    </div>
  );
}