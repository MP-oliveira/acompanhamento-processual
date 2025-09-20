// Service Worker para JurisAcompanha PWA
const CACHE_NAME = 'juris-acompanha-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ Erro ao cachear recursos:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de extensões do Chrome
  if (event.request.url.startsWith('chrome-extension://') || 
      event.request.url.startsWith('moz-extension://') ||
      event.request.url.startsWith('safari-extension://')) {
    return;
  }

  // Estratégia: Cache First para recursos estáticos, Network First para API
  if (event.request.url.includes('/api/')) {
    // Para APIs: Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a resposta é válida, clone e armazene no cache
          if (response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              try {
                cache.put(event.request, responseClone);
              } catch (error) {
                console.warn('Não foi possível cachear a resposta:', error);
              }
            });
          }
          return response;
        })
        .catch(() => {
          // Se a rede falha, tenta buscar no cache
          return caches.match(event.request);
        })
    );
  } else {
    // Para recursos estáticos: Cache First
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Se encontrou no cache, retorna
          if (response) {
            return response;
          }
          
          // Se não encontrou, busca na rede e armazena no cache
          return fetch(event.request).then((response) => {
            // Verifica se é uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona a resposta
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (error) {
                  console.warn('Não foi possível cachear o recurso:', error);
                }
              });

            return response;
          });
        })
    );
  }
});

// Notificações Push (para futuras implementações)
self.addEventListener('push', (event) => {
  console.log('📱 Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do JurisAcompanha',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/icon-96x96.svg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-96x96.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('JurisAcompanha', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificação clicada');
  
  event.notification.close();

  if (event.action === 'explore') {
    // Abre o app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
    event.notification.close();
  } else {
    // Comportamento padrão: abre o app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensagem do app para o Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
