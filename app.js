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
