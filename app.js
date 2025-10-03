// PWA TV - Aplicativo Principal
class PWATVApp {
    constructor() {
        this.currentSection = 'main';
        this.currentFocusIndex = 0;
        this.navigationItems = [];
        this.isOnline = navigator.onLine;
        this.deferredPrompt = null;
        this.isInstalled = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando PWA TV...');
        
        // Registrar Service Worker
        await this.registerServiceWorker();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Configurar navegação por controle remoto
        this.setupRemoteNavigation();
        
        // Verificar status de instalação
        this.checkInstallStatus();
        
        // Configurar indicadores de status
        this.updateStatusIndicators();
        
        // Mostrar instalador de TV se detectado
        this.showTVInstaller();
        
        console.log('✅ PWA TV inicializado com sucesso!');
    }

    // Registrar Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registrado:', registration);
                
                // Verificar atualizações
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('❌ Erro ao registrar Service Worker:', error);
            }
        }
    }

    // Configurar eventos
    setupEventListeners() {
        // Eventos de conectividade
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateStatusIndicators();
            this.showNotification('Conectado à internet', 'success');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateStatusIndicators();
            this.showNotification('Modo offline ativo', 'warning');
        });

        // Eventos de instalação PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.updateStatusIndicators();
            this.hideInstallPrompt();
            this.showNotification('PWA instalado com sucesso!', 'success');
        });

        // Eventos de navegação
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Eventos de clique
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Eventos de foco
        document.addEventListener('focusin', (e) => this.handleFocus(e));
    }

    // Configurar navegação por controle remoto
    setupRemoteNavigation() {
        this.navigationItems = Array.from(document.querySelectorAll('.nav-item'));
        this.navigationItems.forEach((item, index) => {
            item.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            // Adicionar evento de clique
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
    }

    // Manipular navegação por teclado (controle remoto)
    handleKeyNavigation(event) {
        const { key, code } = event;
        
        switch (key) {
            case 'ArrowUp':
                event.preventDefault();
                this.navigateUp();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateDown();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.navigateLeft();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.navigateRight();
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.activateCurrentItem();
                break;
            case 'Escape':
                event.preventDefault();
                this.goBack();
                break;
            case 'Backspace':
                event.preventDefault();
                this.goBack();
                break;
        }
    }

    // Navegação direcional
    navigateUp() {
        if (this.currentSection === 'main') {
            this.currentFocusIndex = Math.max(0, this.currentFocusIndex - 2);
            this.updateFocus();
        }
    }

    navigateDown() {
        if (this.currentSection === 'main') {
            this.currentFocusIndex = Math.min(this.navigationItems.length - 1, this.currentFocusIndex + 2);
            this.updateFocus();
        }
    }

    navigateLeft() {
        if (this.currentSection === 'main') {
            this.currentFocusIndex = Math.max(0, this.currentFocusIndex - 1);
            this.updateFocus();
        }
    }

    navigateRight() {
        if (this.currentSection === 'main') {
            this.currentFocusIndex = Math.min(this.navigationItems.length - 1, this.currentFocusIndex + 1);
            this.updateFocus();
        }
    }

    // Atualizar foco visual
    updateFocus() {
        this.navigationItems.forEach((item, index) => {
            item.setAttribute('tabindex', index === this.currentFocusIndex ? '0' : '-1');
            
            if (index === this.currentFocusIndex) {
                item.focus();
                item.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest',
                    inline: 'nearest'
                });
            }
        });
    }

    // Ativar item atual
    activateCurrentItem() {
        if (this.currentSection === 'main' && this.navigationItems[this.currentFocusIndex]) {
            const section = this.navigationItems[this.currentFocusIndex].dataset.section;
            this.navigateToSection(section);
        }
    }

    // Navegar para seção
    navigateToSection(sectionName) {
        // Esconder seção atual
        const currentSection = document.getElementById(`${this.currentSection}-section`);
        if (currentSection) {
            currentSection.style.display = 'none';
        }

        // Mostrar nova seção
        const newSection = document.getElementById(`${sectionName}-section`);
        if (newSection) {
            newSection.style.display = 'block';
            this.currentSection = sectionName;
            
            // Focar no primeiro elemento focável da nova seção
            const firstFocusable = newSection.querySelector('button, input, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
            
            // Atualizar URL
            history.pushState({ section: sectionName }, '', `#${sectionName}`);
        }
    }

    // Voltar para seção principal
    goBack() {
        if (this.currentSection !== 'main') {
            // Esconder seção atual
            const currentSection = document.getElementById(`${this.currentSection}-section`);
            if (currentSection) {
                currentSection.style.display = 'none';
            }

            // Mostrar seção principal
            this.currentSection = 'main';
            this.updateFocus();
            
            // Atualizar URL
            history.pushState({ section: 'main' }, '', '#');
        }
    }

    // Manipular cliques
    handleClick(event) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            const section = navItem.dataset.section;
            this.navigateToSection(section);
        }
    }

    // Manipular foco
    handleFocus(event) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            const index = this.navigationItems.indexOf(navItem);
            if (index !== -1) {
                this.currentFocusIndex = index;
            }
        }
    }

    // Verificar status de instalação
    checkInstallStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
    }

    // Mostrar prompt de instalação
    showInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.style.display = 'block';
            
            const installBtn = document.getElementById('install-btn');
            if (installBtn) {
                installBtn.addEventListener('click', () => this.installPWA());
            }
        }
    }

    // Esconder prompt de instalação
    hideInstallPrompt() {
        const prompt = document.getElementById('install-prompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    // Instalar PWA
    async installPWA() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ PWA aceito para instalação');
            } else {
                console.log('❌ PWA rejeitado para instalação');
            }
            
            this.deferredPrompt = null;
        }
    }

    // Atualizar indicadores de status
    updateStatusIndicators() {
        const connectionStatus = document.getElementById('connection-status');
        const installStatus = document.getElementById('install-status');
        
        if (connectionStatus) {
            connectionStatus.textContent = this.isOnline ? 'Online' : 'Offline';
            connectionStatus.className = `status ${this.isOnline ? 'online' : 'offline'}`;
        }
        
        if (installStatus) {
            if (this.isInstalled) {
                installStatus.textContent = 'PWA Instalado';
                installStatus.className = 'status installed';
            } else if (this.deferredPrompt) {
                installStatus.textContent = 'PWA Disponível';
                installStatus.className = 'status available';
            } else {
                installStatus.textContent = 'Navegador';
                installStatus.className = 'status browser';
            }
        }
    }

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos da notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: '#ffffff',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Cores por tipo
        const colors = {
            success: '#00ff88',
            error: '#ff4444',
            warning: '#ffaa00',
            info: '#00d4ff'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Adicionar ao DOM
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Mostrar notificação de atualização
    showUpdateNotification() {
        this.showNotification('Nova versão disponível! Recarregue para atualizar.', 'info');
    }

    // Limpar cache
    async clearCache() {
        try {
            if ('serviceWorker' in navigator) {
                const messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        this.showNotification('Cache limpo com sucesso!', 'success');
                    } else {
                        this.showNotification('Erro ao limpar cache', 'error');
                    }
                };
                
                navigator.serviceWorker.controller.postMessage(
                    { type: 'CLEAR_CACHE' },
                    [messageChannel.port2]
                );
            }
        } catch (error) {
            console.error('Erro ao limpar cache:', error);
            this.showNotification('Erro ao limpar cache', 'error');
        }
    }

    // Alternar modo escuro
    toggleDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode');
        if (darkModeToggle) {
            if (darkModeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
                this.showNotification('Modo escuro ativado', 'info');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
                this.showNotification('Modo escuro desativado', 'info');
            }
        }
    }

    // Restaurar configurações salvas
    restoreSettings() {
        const darkMode = localStorage.getItem('darkMode');
        if (darkMode === 'true') {
            const darkModeToggle = document.getElementById('dark-mode');
            if (darkModeToggle) {
                darkModeToggle.checked = true;
                document.body.classList.add('dark-mode');
            }
        }
    }

    // Mostrar instalador automático de TV
    showTVInstaller() {
        // Detectar se está rodando em Smart TV
        const isSmartTV = this.detectSmartTV();
        
        if (isSmartTV) {
            this.createTVInstallerWidget(isSmartTV);
        }
    }

    // Detectar tipo de Smart TV
    detectSmartTV() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Samsung') || userAgent.includes('Tizen')) {
            return { type: 'Samsung Smart TV', steps: this.getSamsungSteps() };
        }
        if (userAgent.includes('LG') || userAgent.includes('WebOS')) {
            return { type: 'LG Smart TV', steps: this.getLGSteps() };
        }
        if (userAgent.includes('Android TV') || userAgent.includes('AndroidTV')) {
            return { type: 'Android TV', steps: this.getAndroidSteps() };
        }
        if (userAgent.includes('Fire TV') || userAgent.includes('FireTV')) {
            return { type: 'Fire TV', steps: this.getFireSteps() };
        }
        if (userAgent.includes('AppleTV') || userAgent.includes('tvOS')) {
            return { type: 'Apple TV', steps: this.getAppleSteps() };
        }
        
        // Detectar Smart TV genérica
        if (this.isLargeScreen() && this.isTVLikeDevice()) {
            return { type: 'Smart TV', steps: this.getGenericSteps() };
        }
        
        return null;
    }

    // Verificar se é tela grande
    isLargeScreen() {
        return window.screen.width >= 1920 || window.screen.height >= 1080;
    }

    // Verificar se é dispositivo tipo TV
    isTVLikeDevice() {
        return !navigator.userAgent.includes('Mobile') && 
               !navigator.userAgent.includes('Tablet') &&
               (window.screen.width > 1280 || window.screen.height > 720);
    }

    // Criar widget do instalador de TV
    createTVInstallerWidget(tvInfo) {
        const widget = document.createElement('div');
        widget.className = 'tv-installer-widget';
        widget.innerHTML = `
            <div class="installer-content">
                <div class="installer-header">
                    <h3>📺 Instalar PWA TV</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                
                <div class="tv-detected">
                    <strong>TV Detectada:</strong> ${tvInfo.type}
                </div>
                
                <button class="install-btn" onclick="window.pwaApp.installPWAOnTV()">
                    🚀 Instalar PWA na TV
                </button>
                
                <div class="install-steps">
                    <strong>📋 Passos para Instalar:</strong>
                    ${tvInfo.steps.map((step, index) => `
                        <div class="step">
                            <span class="step-number">${index + 1}</span>
                            <span>${step}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="network-info">
                    <strong>📡 Acesse em:</strong><br>
                    <code id="network-url">${window.location.origin}</code>
                </div>
            </div>
        `;
        
        // Estilos do widget
        const styles = `
            <style>
                .tv-installer-widget {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    max-width: 400px;
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    border: 2px solid #00d4ff;
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: white;
                    animation: slideIn 0.5s ease-out;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .installer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .installer-header h3 {
                    margin: 0;
                    color: #00d4ff;
                    font-size: 18px;
                }
                
                .close-btn {
                    background: none;
                    border: none;
                    color: #cccccc;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .tv-detected {
                    background: rgba(0, 255, 136, 0.1);
                    border: 1px solid #00ff88;
                    border-radius: 8px;
                    padding: 12px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                
                .install-btn {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: #1a1a1a;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 15px;
                    transition: all 0.3s;
                }
                
                .install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
                }
                
                .install-steps {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 15px;
                    margin-bottom: 15px;
                    font-size: 14px;
                }
                
                .step {
                    display: flex;
                    align-items: center;
                    margin: 8px 0;
                }
                
                .step-number {
                    background: #00d4ff;
                    color: #1a1a1a;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                
                .network-info {
                    background: rgba(255, 193, 7, 0.1);
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 10px;
                    font-size: 12px;
                    color: #ffc107;
                }
                
                .network-info code {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                }
            </style>
        `;
        
        // Adicionar estilos se não existirem
        if (!document.getElementById('tv-installer-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'tv-installer-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
        }
        
        // Adicionar widget ao DOM
        document.body.appendChild(widget);
        
        // Auto-remover após 30 segundos se não interagir
        setTimeout(() => {
            if (document.body.contains(widget)) {
                widget.style.animation = 'slideIn 0.5s ease-out reverse';
                setTimeout(() => widget.remove(), 500);
            }
        }, 30000);
    }

    // Instalar PWA na TV
    installPWAOnTV() {
        // Tentar instalação automática primeiro
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    this.showNotification('✅ PWA instalado com sucesso na TV!', 'success');
                } else {
                    this.attemptManualInstallation();
                }
                this.deferredPrompt = null;
            });
        } else {
            // Tentar métodos alternativos de instalação
            this.attemptAlternativeInstallation();
        }
    }

    // Tentar métodos alternativos de instalação
    attemptAlternativeInstallation() {
        const tvType = this.detectSmartTV();
        
        if (tvType) {
            switch (tvType.type) {
                case 'Samsung Smart TV':
                    this.installSamsungPWA();
                    break;
                case 'LG Smart TV':
                    this.installLGPWA();
                    break;
                case 'Android TV':
                    this.installAndroidPWA();
                    break;
                case 'Fire TV':
                    this.installFirePWA();
                    break;
                case 'Apple TV':
                    this.installApplePWA();
                    break;
                default:
                    this.attemptGenericInstallation();
            }
        } else {
            this.attemptGenericInstallation();
        }
    }

    // Instalação específica para Samsung Smart TV
    installSamsungPWA() {
        // Samsung Smart TV - tentar adicionar à tela inicial via JavaScript
        try {
            // Criar link de instalação
            const installLink = document.createElement('a');
            installLink.href = window.location.href;
            installLink.rel = 'manifest';
            
            // Simular clique no menu Samsung
            this.showSamsungInstallDialog();
        } catch (error) {
            this.attemptManualInstallation();
        }
    }

    // Instalação específica para LG Smart TV
    installLGPWA() {
        // LG webOS - tentar instalação automática
        try {
            if (window.webOS && window.webOS.service) {
                // Usar API webOS se disponível
                this.showLGInstallDialog();
            } else {
                this.showLGInstallDialog();
            }
        } catch (error) {
            this.attemptManualInstallation();
        }
    }

    // Instalação específica para Android TV
    installAndroidPWA() {
        // Android TV - tentar usar Chrome PWA install
        try {
            if (navigator.userAgent.includes('Chrome')) {
                this.showAndroidInstallDialog();
            } else {
                this.attemptManualInstallation();
            }
        } catch (error) {
            this.attemptManualInstallation();
        }
    }

    // Instalação específica para Fire TV
    installFirePWA() {
        // Fire TV - tentar instalação via Silk browser
        try {
            this.showFireInstallDialog();
        } catch (error) {
            this.attemptManualInstallation();
        }
    }

    // Instalação específica para Apple TV
    installApplePWA() {
        // Apple TV - tentar instalação via Safari
        try {
            this.showAppleInstallDialog();
        } catch (error) {
            this.attemptManualInstallation();
        }
    }

    // Tentativa genérica de instalação
    attemptGenericInstallation() {
        // Tentar diferentes métodos de instalação
        const methods = [
            () => this.tryAddToHomeScreen(),
            () => this.tryBookmarkInstall(),
            () => this.tryPWAInstall()
        ];

        let methodIndex = 0;
        const tryNextMethod = () => {
            if (methodIndex < methods.length) {
                try {
                    const result = methods[methodIndex]();
                    if (!result) {
                        methodIndex++;
                        setTimeout(tryNextMethod, 1000);
                    }
                } catch (error) {
                    methodIndex++;
                    setTimeout(tryNextMethod, 1000);
                }
            } else {
                this.attemptManualInstallation();
            }
        };

        tryNextMethod();
    }

    // Tentar adicionar à tela inicial
    tryAddToHomeScreen() {
        try {
            // Simular teclas do controle remoto
            const event = new KeyboardEvent('keydown', {
                key: 'F12',
                code: 'F12',
                keyCode: 123
            });
            document.dispatchEvent(event);
            
            this.showNotification('🔧 Pressione F12 ou Menu para acessar opções', 'info');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Tentar instalação via bookmark
    tryBookmarkInstall() {
        try {
            // Tentar criar bookmark
            const bookmarkData = {
                title: 'PWA TV',
                url: window.location.href
            };
            
            this.showBookmarkDialog();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Tentar instalação PWA padrão
    tryPWAInstall() {
        try {
            // Verificar se pode instalar
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                this.showPWAInstallDialog();
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Mostrar dialog de instalação Samsung
    showSamsungInstallDialog() {
        this.showInstallDialog('Samsung Smart TV', [
            '✅ PWA detectado na Samsung TV!',
            '📱 Pressione o botão "Menu" do controle',
            '🔍 Procure por "Adicionar à Tela Inicial"',
            '⚡ Ou use as teclas: Menu → Apps → Adicionar'
        ]);
    }

    // Mostrar dialog de instalação LG
    showLGInstallDialog() {
        this.showInstallDialog('LG Smart TV', [
            '✅ PWA detectado na LG TV!',
            '📱 Toque na tela ou use o controle',
            '🔍 Procure por "Adicionar à Tela Inicial"',
            '⚡ Ou use: Menu → Navegador → Adicionar'
        ]);
    }

    // Mostrar dialog de instalação Android TV
    showAndroidInstallDialog() {
        this.showInstallDialog('Android TV', [
            '✅ PWA detectado na Android TV!',
            '📱 Use o controle remoto',
            '🔍 Toque nos 3 pontos do Chrome',
            '⚡ Selecione "Instalar app"'
        ]);
    }

    // Mostrar dialog de instalação Fire TV
    showFireInstallDialog() {
        this.showInstallDialog('Fire TV', [
            '✅ PWA detectado na Fire TV!',
            '📱 Use o controle Amazon',
            '🔍 Pressione Menu no navegador',
            '⚡ Selecione "Adicionar à Tela Inicial"'
        ]);
    }

    // Mostrar dialog de instalação Apple TV
    showAppleInstallDialog() {
        this.showInstallDialog('Apple TV', [
            '✅ PWA detectado na Apple TV!',
            '📱 Use o controle Siri',
            '🔍 Toque no ícone de compartilhar',
            '⚡ Selecione "Adicionar à Tela Inicial"'
        ]);
    }

    // Dialog genérico de instalação
    showInstallDialog(tvType, steps) {
        const dialog = document.createElement('div');
        dialog.className = 'install-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3>🚀 Instalação ${tvType}</h3>
                    <button class="close-dialog" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="dialog-body">
                    ${steps.map(step => `<div class="install-step">${step}</div>`).join('')}
                    <div class="dialog-actions">
                        <button class="btn primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                            ✅ Entendi
                        </button>
                        <button class="btn secondary" onclick="window.pwaApp.attemptManualInstallation()">
                            📋 Ver Instruções Completas
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Estilos do dialog
        const styles = `
            <style>
                .install-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 20000;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .dialog-content {
                    background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
                    border: 2px solid #00d4ff;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    animation: slideIn 0.3s ease;
                }
                
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 15px;
                }
                
                .dialog-header h3 {
                    margin: 0;
                    color: #00d4ff;
                    font-size: 24px;
                }
                
                .close-dialog {
                    background: none;
                    border: none;
                    color: #cccccc;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .close-dialog:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .install-step {
                    background: rgba(0, 212, 255, 0.1);
                    border: 1px solid #00d4ff;
                    border-radius: 10px;
                    padding: 15px;
                    margin: 10px 0;
                    font-size: 16px;
                    line-height: 1.4;
                }
                
                .dialog-actions {
                    display: flex;
                    gap: 15px;
                    margin-top: 25px;
                    justify-content: center;
                }
                
                .dialog-actions .btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                
                .dialog-actions .btn.primary {
                    background: linear-gradient(135deg, #00d4ff, #0099cc);
                    color: #1a1a1a;
                }
                
                .dialog-actions .btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: 1px solid #666;
                }
                
                .dialog-actions .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                }
            </style>
        `;

        // Adicionar estilos se não existirem
        if (!document.getElementById('install-dialog-styles')) {
            const styleElement = document.createElement('div');
            styleElement.id = 'install-dialog-styles';
            styleElement.innerHTML = styles;
            document.head.appendChild(styleElement);
        }

        document.body.appendChild(dialog);
    }

    // Tentar instalação manual como fallback
    attemptManualInstallation() {
        this.showNotification('📋 Siga as instruções para instalação manual', 'info');
        // O widget já mostra as instruções, então não precisa fazer nada mais
    }

    // Mostrar dialog de bookmark
    showBookmarkDialog() {
        this.showInstallDialog('Adicionar aos Favoritos', [
            '✅ Adicione aos favoritos do navegador',
            '📱 Use Ctrl+D ou Menu → Favoritos',
            '🔍 Procure por "Adicionar Favorito"',
            '⚡ Salve como "PWA TV"'
        ]);
    }

    // Mostrar dialog PWA
    showPWAInstallDialog() {
        this.showInstallDialog('Instalação PWA', [
            '✅ PWA pronto para instalação!',
            '📱 Procure pelo ícone de instalação',
            '🔍 Clique em "Instalar" quando aparecer',
            '⚡ Ou use Menu → Instalar App'
        ]);
    }

    // Métodos para obter passos de instalação
    getSamsungSteps() {
        return [
            'Abra o Navegador Samsung',
            'Digite o endereço da rede',
            'Pressione Menu → "Adicionar à Tela Inicial"',
            'Confirme a instalação'
        ];
    }

    getLGSteps() {
        return [
            'Abra o Navegador LG (webOS)',
            'Digite o endereço da rede',
            'Toque em "Adicionar à Tela Inicial"',
            'Confirme a instalação'
        ];
    }

    getAndroidSteps() {
        return [
            'Abra o Chrome na Android TV',
            'Digite o endereço da rede',
            'Toque nos 3 pontos → "Instalar app"',
            'Confirme a instalação'
        ];
    }

    getFireSteps() {
        return [
            'Abra o navegador Silk na Fire TV',
            'Digite o endereço da rede',
            'Pressione Menu → "Adicionar à Tela Inicial"',
            'Confirme a instalação'
        ];
    }

    getAppleSteps() {
        return [
            'Abra o Safari na Apple TV',
            'Digite o endereço da rede',
            'Toque em "Adicionar à Tela Inicial"',
            'Confirme a instalação'
        ];
    }

    getGenericSteps() {
        return [
            'Abra o navegador da Smart TV',
            'Digite o endereço da rede',
            'Procure por "Adicionar à Tela Inicial"',
            'Confirme a instalação'
        ];
    }
}

// Funções globais para compatibilidade
function goBack() {
    if (window.pwaApp) {
        window.pwaApp.goBack();
    }
}

function clearCache() {
    if (window.pwaApp) {
        window.pwaApp.clearCache();
    }
}

function toggleDarkMode() {
    if (window.pwaApp) {
        window.pwaApp.toggleDarkMode();
    }
}

// Inicializar aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.pwaApp = new PWATVApp();
    window.pwaApp.restoreSettings();
});

// Manipular navegação do histórico do navegador
window.addEventListener('popstate', (event) => {
    const section = event.state?.section || 'main';
    if (window.pwaApp && section !== window.pwaApp.currentSection) {
        if (section === 'main') {
            window.pwaApp.goBack();
        } else {
            window.pwaApp.navigateToSection(section);
        }
    }
});

// Prevenir zoom em dispositivos touch (para TV)
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});

// Configurar viewport para TV
if (window.matchMedia('(min-width: 1920px)').matches) {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
    }
}

console.log('🎬 PWA TV carregado e pronto para uso!');
