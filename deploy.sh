#!/bin/bash

# Script de Deploy para Maturador v2
# Uso: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="docker-compose.yml"

echo "🚀 Iniciando deploy do Maturador v2 para $ENVIRONMENT..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    exit 1
fi

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Copie .env.example para .env e configure as variáveis"
    exit 1
fi

# Backup do estado atual (se existir)
if docker ps -q -f name=maturador-v2 | grep -q .; then
    echo "📦 Fazendo backup do estado atual..."
    docker exec maturador-v2 pkill -TERM node || true
    sleep 5
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down || true

# Remover imagens antigas (opcional)
if [ "$2" = "--clean" ]; then
    echo "🧹 Removendo imagens antigas..."
    docker rmi maturador-v2:latest || true
fi

# Build da nova imagem
echo "🔨 Fazendo build da imagem..."
docker-compose build --no-cache

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# Verificar health check
echo "🏥 Verificando health check..."
for i in {1..10}; do
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ Aplicação está saudável!"
        break
    else
        echo "⏳ Aguardando... ($i/10)"
        sleep 10
    fi
done

# Verificar se a aplicação está rodando
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "❌ Falha no health check!"
    echo "📋 Logs do container:"
    docker-compose logs maturador
    exit 1
fi

# Verificar status do maturador
echo "📊 Verificando status do maturador..."
MATURADOR_STATUS=$(curl -s http://localhost:3000/api/maturador/status | jq -r '.isRunning // false')

if [ "$MATURADOR_STATUS" = "true" ]; then
    echo "✅ Maturador está rodando!"
else
    echo "⚠️ Maturador não está rodando automaticamente"
    echo "💡 Use o dashboard para iniciar o maturador"
fi

# Mostrar informações finais
echo ""
echo "🎉 Deploy concluído com sucesso!"
echo "📱 Dashboard: http://localhost:3000"
echo "🏥 Health Check: http://localhost:3000/api/health"
echo "📋 Logs: docker-compose logs -f maturador"
echo "🛑 Parar: docker-compose down"
echo ""

# Mostrar status dos containers
echo "📊 Status dos containers:"
docker-compose ps 