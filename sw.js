// Service Worker para PWA TV
const CACHE_NAME = 'pwa-tv-v1.0.0';
const STATIC_CACHE = 'pwa-tv-static-v1';
const DYNAMIC_CACHE = 'pwa-tv-dynamic-v1';

// Arquivos para cache estático
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Recursos externos para cache
const EXTERNAL_RESOURCES = [
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Cache dos arquivos estáticos
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('[SW] Cacheando arquivos estáticos...');
                return cache.addAll(STATIC_FILES);
            }),
            // Cache dos recursos externos
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('[SW] Cacheando recursos externos...');
                return cache.addAll(EXTERNAL_RESOURCES.map(url => new Request(url, { mode: 'cors' })));
            })
        ]).then(() => {
            console.log('[SW] Cache concluído com sucesso!');
            // Força a ativação imediata
            return self.skipWaiting();
        })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // Limpa caches antigos
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Removendo cache antigo:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Assume controle de todas as abas
            self.clients.claim()
        ])
    );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Estratégia para diferentes tipos de recursos
    if (request.method === 'GET') {
        // Arquivos estáticos - Cache First
        if (STATIC_FILES.includes(url.pathname) || url.pathname === '/') {
            event.respondWith(cacheFirst(request, STATIC_CACHE));
        }
        // Recursos de mídia - Cache First
        else if (request.destination === 'video' || 
                 request.destination === 'audio' || 
                 request.destination === 'image') {
            event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
        }
        // APIs e outros recursos - Network First
        else {
            event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        }
    }
});

// Estratégia Cache First
async function cacheFirst(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            console.log('[SW] Cache hit:', request.url);
            return cachedResponse;
        }
        
        console.log('[SW] Cache miss, buscando na rede:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Erro no cache first:', error);
        return new Response('Recurso não disponível offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Estratégia Network First
async function networkFirst(request, cacheName) {
    try {
        console.log('[SW] Tentando rede primeiro:', request.url);
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Rede falhou, tentando cache:', request.url);
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Página offline personalizada
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        return new Response('Recurso não disponível offline', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then((status) => {
                event.ports[0].postMessage({ status });
            });
            break;
            
        default:
            console.log('[SW] Mensagem desconhecida:', type);
    }
});

// Função para limpar todos os caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] Todos os caches foram limpos');
}

// Função para obter status do cache
async function getCacheStatus() {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        status[cacheName] = keys.length;
    }
    
    return status;
}

// Notificações push (para funcionalidades futuras)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver Detalhes',
                    icon: '/icon-192.png'
                },
                {
                    action: 'close',
                    title: 'Fechar',
                    icon: '/icon-192.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background Sync (para funcionalidades futuras)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    console.log('[SW] Executando sincronização em background...');
    // Implementar lógica de sincronização aqui
}

// Periodic Background Sync (para funcionalidades futuras)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(doPeriodicSync());
    }
});

async function doPeriodicSync() {
    console.log('[SW] Executando sincronização periódica...');
    // Implementar lógica de sincronização periódica aqui
}
