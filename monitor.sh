#!/bin/bash

# Script de Monitoramento para Maturador v2
# Uso: ./monitor.sh [--continuous]

CONTINUOUS=${1:-false}
LOG_FILE="monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

check_health() {
    local response=$(curl -s -w "%{http_code}" http://localhost:3000/api/health)
    local status_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$status_code" = "200" ]; then
        local is_healthy=$(echo $body | jq -r '.status')
        if [ "$is_healthy" = "healthy" ]; then
            log "✅ Health check: OK"
            return 0
        else
            log "⚠️ Health check: UNHEALTHY"
            return 1
        fi
    else
        log "❌ Health check: HTTP $status_code"
        return 1
    fi
}

check_maturador() {
    local response=$(curl -s http://localhost:3000/api/maturador/status)
    local is_running=$(echo $response | jq -r '.isRunning')
    local instances=$(echo $response | jq -r '.connectedInstances')
    local messages=$(echo $response | jq -r '.messagesSent')
    
    log "📊 Maturador Status:"
    log "   - Running: $is_running"
    log "   - Instances: $instances"
    log "   - Messages: $messages"
    
    if [ "$is_running" = "true" ]; then
        return 0
    else
        return 1
    fi
}

check_resources() {
    local cpu=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local memory=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    log "💻 Resources:"
    log "   - CPU: ${cpu}%"
    log "   - Memory: ${memory}%"
    log "   - Disk: ${disk}%"
    
    # Alertas
    if (( $(echo "$cpu > 80" | bc -l) )); then
        log "🚨 ALERTA: CPU alto: ${cpu}%"
    fi
    
    if (( $(echo "$memory > 80" | bc -l) )); then
        log "🚨 ALERTA: Memória alta: ${memory}%"
    fi
    
    if [ "$disk" -gt 80 ]; then
        log "🚨 ALERTA: Disco alto: ${disk}%"
    fi
}

check_containers() {
    log "🐳 Containers:"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | while read line; do
        log "   $line"
    done
    
    # Verificar se todos os containers estão rodando
    local running=$(docker-compose ps -q | wc -l)
    local total=$(docker-compose ps -q --filter "status=running" | wc -l)
    
    if [ "$running" = "$total" ] && [ "$running" -gt 0 ]; then
        log "✅ Todos os containers estão rodando"
    else
        log "❌ Alguns containers não estão rodando"
        return 1
    fi
}

send_alert() {
    local message="$1"
    log "🚨 ALERTA: $message"
    
    # Aqui você pode adicionar integração com:
    # - Email
    # - Slack
    # - Telegram
    # - Discord
    # - Webhook customizado
    
    # Exemplo para Telegram (descomente e configure):
    # curl -s -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
    #     -d "chat_id=<YOUR_CHAT_ID>" \
    #     -d "text=$message" \
    #     -d "parse_mode=HTML"
}

main() {
    log "🔍 Iniciando monitoramento..."
    
    # Verificar se Docker está rodando
    if ! docker info > /dev/null 2>&1; then
        log "❌ Docker não está rodando!"
        send_alert "Docker não está rodando no servidor"
        exit 1
    fi
    
    # Verificações
    local health_ok=true
    local maturador_ok=true
    local containers_ok=true
    
    if ! check_health; then
        health_ok=false
        send_alert "Health check falhou"
    fi
    
    if ! check_maturador; then
        maturador_ok=false
        send_alert "Maturador não está rodando"
    fi
    
    if ! check_containers; then
        containers_ok=false
        send_alert "Alguns containers não estão rodando"
    fi
    
    check_resources
    
    # Resumo
    log "📋 Resumo:"
    log "   - Health: $([ "$health_ok" = true ] && echo "✅" || echo "❌")"
    log "   - Maturador: $([ "$maturador_ok" = true ] && echo "✅" || echo "❌")"
    log "   - Containers: $([ "$containers_ok" = true ] && echo "✅" || echo "❌")"
    
    if [ "$health_ok" = true ] && [ "$maturador_ok" = true ] && [ "$containers_ok" = true ]; then
        log "🎉 Tudo funcionando perfeitamente!"
        return 0
    else
        log "⚠️ Alguns problemas detectados"
        return 1
    fi
}

# Execução
if [ "$CONTINUOUS" = "--continuous" ]; then
    log "🔄 Modo contínuo ativado (Ctrl+C para parar)"
    while true; do
        main
        sleep 300  # 5 minutos
    done
else
    main
fi 