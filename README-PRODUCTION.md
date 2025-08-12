# 🚀 Maturador v2 - Guia de Produção

Este guia explica como fazer o deploy do Maturador v2 em produção usando Docker.

## 📋 Pré-requisitos

- **Docker** (versão 20.10+)
- **Docker Compose** (versão 2.0+)
- **VPS/Server** com pelo menos 2GB RAM
- **Domínio** (opcional, para HTTPS)

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <seu-repositorio>
cd maturador-v2
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configure o domínio (opcional)
Se você tem um domínio, edite o arquivo `nginx.conf`:
```nginx
server_name seu-dominio.com;
```

### 4. Configure SSL (opcional)
```bash
mkdir ssl
# Coloque seus certificados em ssl/cert.pem e ssl/key.pem
# Descomente as linhas SSL no nginx.conf
```

## 🚀 Deploy

### Deploy Automático
```bash
chmod +x deploy.sh
./deploy.sh production
```

### Deploy Manual
```bash
# Build e start
docker-compose up -d --build

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f maturador
```

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Status do Maturador
```bash
curl http://localhost:3000/api/maturador/status
```

### Logs em Tempo Real
```bash
docker-compose logs -f maturador
```

## 🔧 Comandos Úteis

### Reiniciar Aplicação
```bash
docker-compose restart maturador
```

### Atualizar Código
```bash
git pull
./deploy.sh production --clean
```

### Backup
```bash
# Backup dos logs
docker cp maturador-v2:/app/logs ./backup/logs-$(date +%Y%m%d)

# Backup das configurações
cp .env ./backup/env-$(date +%Y%m%d)
```

### Parar Serviços
```bash
docker-compose down
```

## 🔒 Segurança

### Firewall
```bash
# Permitir apenas portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Atualizações
```bash
# Atualizar sistema
apt update && apt upgrade -y

# Atualizar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## 📈 Performance

### Otimizações Recomendadas
- **RAM**: Mínimo 2GB, recomendado 4GB
- **CPU**: 2 cores mínimo
- **Disco**: 20GB mínimo
- **Rede**: 100Mbps mínimo

### Monitoramento de Recursos
```bash
# Uso de recursos
docker stats

# Logs do sistema
journalctl -u docker.service -f
```

## 🚨 Troubleshooting

### Aplicação não inicia
```bash
# Verificar logs
docker-compose logs maturador

# Verificar configurações
docker-compose config

# Reiniciar com logs
docker-compose up maturador
```

### Problemas de Conexão
```bash
# Testar conectividade
curl -v http://localhost:3000/api/health

# Verificar portas
netstat -tlnp | grep :3000
```

### Problemas de Memória
```bash
# Verificar uso de memória
free -h

# Limpar cache Docker
docker system prune -a
```

## 📞 Suporte

### Logs Importantes
- **Aplicação**: `docker-compose logs maturador`
- **Nginx**: `docker-compose logs nginx`
- **Sistema**: `journalctl -f`

### Informações do Sistema
```bash
# Versões
docker --version
docker-compose --version
node --version

# Status dos serviços
systemctl status docker
docker-compose ps
```

## 🔄 CI/CD (Opcional)

### GitHub Actions
Crie `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.4
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /path/to/maturador-v2
            git pull
            ./deploy.sh production
```

## 📝 Checklist de Deploy

- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Arquivo .env configurado
- [ ] Domínio configurado (se aplicável)
- [ ] SSL configurado (se aplicável)
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Monitoramento configurado
- [ ] Health check funcionando
- [ ] Maturador funcionando

## 🎯 Próximos Passos

1. **Monitoramento**: Configure alertas para downtime
2. **Backup**: Automatize backups diários
3. **SSL**: Configure certificados Let's Encrypt
4. **CDN**: Configure Cloudflare ou similar
5. **Logs**: Configure ELK Stack ou similar 