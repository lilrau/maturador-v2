'use client';

import { useState, useEffect } from 'react';
import { WuzapiInstance, MessageLog } from '@/types';
import { InstancesPanel } from './InstancesPanel';
import { LogsPanel } from './LogsPanel';
import { StatusPanel } from './StatusPanel';

export function MaturadorDashboard() {
  const [status, setStatus] = useState({
    isRunning: false,
    connectedInstances: 0,
    messagesSent: 0
  });
  const [instances, setInstances] = useState<WuzapiInstance[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar status inicial
    fetchStatus();
    
    // Atualizar status periodicamente
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/maturador/status');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          isRunning: data.isRunning,
          connectedInstances: data.connectedInstances,
          messagesSent: data.messagesSent
        });
        setInstances(data.instances || []);
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error);
    }
  };

  const handleStart = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/maturador/start', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
        // Atualizar status imediatamente
        fetchStatus();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(`Erro ao iniciar maturador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/maturador/stop', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
        // Atualizar status imediatamente
        fetchStatus();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(`Erro ao parar maturador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">WhatsApp Maturador v2</h1>
          <p className="text-gray-400">Sistema automatizado de conversas WhatsApp usando Wuz API</p>
        </header>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatusPanel 
            status={status}
            onStart={handleStart}
            onStop={handleStop}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InstancesPanel instances={instances} />
          <LogsPanel logs={logs} />
        </div>
      </div>
    </div>
  );
}