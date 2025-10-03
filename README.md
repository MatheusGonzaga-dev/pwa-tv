# PWA TV - Site de Teste para Smart TV

Um site PWA (Progressive Web App) otimizado para testar funcionalidades em dispositivos TV e Smart TV.

## 🚀 Funcionalidades

- **PWA Completo**: Manifest, Service Worker e cache offline
- **Navegação por Controle Remoto**: Suporte para navegação com setas e Enter
- **Design Responsivo**: Otimizado para telas grandes (TV)
- **Modo Offline**: Funciona sem conexão à internet
- **Testes de Mídia**: Vídeo, áudio e galeria de imagens
- **Configurações**: Modo escuro e gerenciamento de cache

## 📁 Estrutura do Projeto

```
pwa-tv/
├── index.html              # Página principal
├── styles.css              # Estilos otimizados para TV
├── app.js                  # Lógica da aplicação
├── sw.js                   # Service Worker
├── manifest.json           # Manifest do PWA
├── create-icons.html       # Gerador de ícones
└── README.md              # Este arquivo
```

## 🛠️ Como Usar

### 1. Gerar Ícones
1. Abra `create-icons.html` no navegador
2. Clique nos botões para gerar e baixar os ícones
3. Salve os ícones como `icon-192.png` e `icon-512.png` na pasta do projeto

### 2. Servir o Site
Para testar o PWA, você precisa servir os arquivos via HTTP (não file://). Algumas opções:

#### Opção 1: Python (Recomendado)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Opção 2: Node.js
```bash
npx serve .
```

#### Opção 3: Live Server (VS Code)
Instale a extensão "Live Server" e clique com botão direito no `index.html` → "Open with Live Server"

### 3. Acessar o Site
Abra o navegador e acesse:
- `http://localhost:8000` (Python)
- `http://localhost:3000` (serve)
- Ou a porta indicada pelo Live Server

## 🎮 Navegação por Controle Remoto

O site foi projetado para funcionar com controles remotos de TV:

- **Setas**: Navegar entre os itens
- **Enter/Espaço**: Selecionar item
- **Escape/Backspace**: Voltar

### Testando em Smart TV

1. **Samsung Smart TV**: Use o navegador integrado
2. **LG Smart TV**: Use o navegador WebOS
3. **Android TV**: Use o navegador Chrome
4. **Fire TV**: Use o navegador Silk

## 📱 Funcionalidades PWA

### Instalação
- O site pode ser instalado como app nativo
- Aparecerá prompt de instalação em navegadores compatíveis
- Funciona offline após instalação

### Cache Offline
- Arquivos estáticos são cacheados automaticamente
- Recursos de mídia são salvos para uso offline
- Estratégia de cache otimizada para TV

### Service Worker
- Cache inteligente de recursos
- Funcionamento offline
- Atualizações automáticas

## 🎨 Design para TV

### Características
- **Telas Grandes**: Otimizado para resoluções 1920x1080+
- **Alto Contraste**: Cores vibrantes para melhor visibilidade
- **Navegação Clara**: Elementos grandes e bem espaçados
- **Foco Visível**: Indicadores claros de seleção

### Responsividade
- **TV (1920px+)**: Layout em grid 4 colunas
- **Desktop (768-1199px)**: Layout adaptativo
- **Mobile (<768px)**: Layout em coluna única

## 🧪 Seções de Teste

### 1. Vídeos
- Teste de reprodução de vídeo HTML5
- Controles nativos do navegador
- Suporte a diferentes formatos

### 2. Imagens
- Galeria responsiva
- Carregamento lazy
- Otimizada para telas grandes

### 3. Áudio
- Player de áudio HTML5
- Controles nativos
- Teste de reprodução de som

### 4. Configurações
- Modo escuro/claro
- Status do cache
- Informações do PWA

## 🔧 Personalização

### Cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
    --primary-color: #1a1a1a;
    --accent-color: #00d4ff;
    --text-color: #ffffff;
}
```

### Conteúdo
Modifique o HTML em `index.html` para adicionar suas próprias seções e conteúdo.

### Funcionalidades
Adicione novas funcionalidades em `app.js` na classe `PWATVApp`.

## 🐛 Solução de Problemas

### Service Worker não registra
- Certifique-se de que está servindo via HTTP/HTTPS
- Verifique o console do navegador para erros
- Limpe o cache do navegador

### Ícones não aparecem
- Gere os ícones usando `create-icons.html`
- Verifique se os arquivos estão na pasta correta
- Confirme os caminhos no `manifest.json`

### Navegação não funciona
- Teste primeiro no navegador desktop
- Verifique se o JavaScript está habilitado
- Use as setas do teclado para navegar

## 📊 Compatibilidade

### Navegadores
- ✅ Chrome/Chromium (Android TV, Smart TV)
- ✅ Firefox (Android TV)
- ✅ Safari (Apple TV)
- ✅ Edge (Smart TV Windows)

### Sistemas
- ✅ Android TV
- ✅ Samsung Smart TV (Tizen)
- ✅ LG Smart TV (webOS)
- ✅ Fire TV (FireOS)
- ✅ Apple TV (tvOS)

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para testes e desenvolvimento.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novas funcionalidades
- Melhorar a documentação

---

**Desenvolvido para testar PWA em dispositivos TV e Smart TV** 📺
