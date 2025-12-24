// Service Worker para PWA - Biblioteca Digital
const CACHE_NAME = 'biblioteca-v1.0.24';
const RUNTIME_CACHE = 'biblioteca-runtime';

// Arquivos para cachear na instalação
const PRECACHE_URLS = [
  '/',
  '/login',
  '/books',
  '/loans',
  '/reservations',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache aberto');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de API (sempre buscar do servidor)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Sem conexão com internet' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Estratégia: Network First, fallback para Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clonar resposta para cachear
        const responseToCache = response.clone();
        
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // Se falhar, buscar do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Se não tiver no cache, retornar página offline
          if (request.destination === 'document') {
            return caches.match('/');
          }
          
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronização em background:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Notificações Push
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Biblioteca Digital';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Se já tem uma janela aberta, focar nela
          for (let client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Senão, abrir nova janela
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Função auxiliar para sincronizar dados
async function syncData() {
  try {
    console.log('[SW] Sincronizando dados...');
    // Implementar lógica de sincronização aqui
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Erro ao sincronizar:', error);
    return Promise.reject(error);
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
