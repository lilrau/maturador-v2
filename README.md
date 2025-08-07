# WhatsApp Maturador v2

Sistema automatizado de conversas WhatsApp usando a Wuz API, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- **Conversas Automatizadas**: Múltiplas instâncias WhatsApp conversando entre si
- **Personalidades Únicas**: Cada instância possui uma personalidade com comportamentos específicos
- **Tipos de Mensagem Variados**: Texto, áudio, imagem, vídeo, documento, sticker e localização
- **Interface Web Moderna**: Dashboard completo para monitoramento e controle
- **Logs em Tempo Real**: Acompanhe todas as mensagens enviadas
- **Configuração Flexível**: Intervalos personalizáveis entre mensagens

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Wuz API** - Integração WhatsApp
- **pnpm** - Gerenciador de pacotes

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- Conta na Wuz API
- Pelo menos 2 instâncias WhatsApp conectadas

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd maturador-v2
```

2. Instale as dependências:
```bash
pnpm install
```

3. Execute o projeto:
```bash
pnpm dev
```

4. Acesse `http://localhost:3000`

## ⚙️ Configuração

1. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env` com suas configurações:**
   ```env
   WUZAPI_BASE_URL=https://api.wuzapi.com
   WUZAPI_ADMIN_TOKEN=seu_token_aqui
   MIN_INTERVAL_SECONDS=5
   MAX_INTERVAL_SECONDS=30
   BASE64_MEDIA_PATH=./base64_media
   LOG_DIR=./logs
   ```

### 3. Configure a API Wuzapi

No dashboard, você pode ajustar:
- **URL Base**: URL da sua instância Wuzapi (carregada do .env)
- **Token**: Token de administrador da Wuzapi (carregado do .env)
- **Intervalos**: Tempo mínimo e máximo entre mensagens (em segundos, carregados do .env)

### 4. Teste a Conexão

Clique em "Testar Conexão" para verificar se a API está funcionando e se há instâncias conectadas.

### 5. Inicie o Maturador

Com pelo menos 2 instâncias conectadas, clique em "Iniciar Maturador".

## 🎭 Personalidades

O sistema inclui 5 personalidades diferentes:

### 1. **Casual Frequente**
- Envia mensagens frequentemente
- Usa emojis e gírias
- Prefere texto e áudio

### 2. **Profissional**
- Comunicação formal
- Raramente usa emojis
- Prefere texto e documentos

### 3. **Coruja Noturna**
- Mais ativo durante a noite
- Envia áudios e imagens
- Vocabulário relacionado ao sono

### 4. **Minimalista**
- Mensagens curtas e diretas
- Poucos emojis
- Principalmente texto

### 5. **Borboleta Social**
- Muito sociável
- Usa muitos emojis
- Varia entre todos os tipos de mídia

## 📊 Monitoramento

O dashboard oferece:

- **Status em Tempo Real**: Veja se o maturador está rodando
- **Instâncias Conectadas**: Lista de todas as instâncias WhatsApp
- **Logs de Mensagens**: Histórico das últimas 100 mensagens
- **Estatísticas**: Contadores de instâncias e mensagens

## 🔄 Tipos de Mensagem

- **📝 Texto**: Mensagens de texto com personalidade
- **🎵 Áudio**: Arquivos de áudio base64
- **🖼️ Imagem**: Imagens com legendas
- **🎥 Vídeo**: Vídeos com legendas
- **📄 Documento**: Arquivos diversos
- **😀 Sticker**: Figurinhas
- **📍 Localização**: Coordenadas geográficas

## 🛡️ Segurança

- Tokens são armazenados localmente no navegador
- Não há persistência de dados sensíveis no servidor
- Configurações salvas em localStorage

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Iniciar produção
pnpm start

# Linting
pnpm lint
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## ⚠️ Aviso Legal

Este software é apenas para fins educacionais e de teste. Use com responsabilidade e respeite os termos de serviço do WhatsApp e da Wuz API.
