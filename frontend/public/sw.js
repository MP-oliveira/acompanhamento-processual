// Service Worker para JurisAcompanha PWA - Otimizado
const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `juris-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `juris-dynamic-${CACHE_VERSION}`;
const API_CACHE = `juris-api-${CACHE_VERSION}`;

// Recursos estáticos para cache
const staticAssets = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/icon-maskable.svg'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache primeiro, depois rede (para assets estáticos)
  CACHE_FIRST: 'cache-first',
  // Rede primeiro, depois cache (para APIs)
  NETWORK_FIRST: 'network-first',
  // Stale while revalidate (para conteúdo dinâmico)
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Cache estático aberto');
        return cache.addAll(staticAssets);
      }),
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('📦 Cache dinâmico aberto');
        return Promise.resolve();
      }),
      caches.open(API_CACHE).then(cache => {
        console.log('📦 Cache de API aberto');
        return Promise.resolve();
      })
    ]).catch((error) => {
      console.error('❌ Erro ao cachear recursos:', error);
    })
  );
  // Força ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker ativado');
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle de todas as abas
      self.clients.claim()
    ])
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

  const url = new URL(event.request.url);
  
  // Determinar estratégia de cache baseada no tipo de recurso
  if (url.pathname.startsWith('/api/')) {
    // APIs: Network First
    event.respondWith(networkFirstStrategy(event.request, API_CACHE));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    // Assets estáticos: Cache First
    event.respondWith(cacheFirstStrategy(event.request, STATIC_CACHE));
  } else if (url.pathname.startsWith('/assets/')) {
    // Assets do Vite: Cache First
    event.respondWith(cacheFirstStrategy(event.request, STATIC_CACHE));
  } else {
    // Páginas HTML: Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(event.request, DYNAMIC_CACHE));
  }
});

// Estratégia: Cache First (para assets estáticos)
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Cache First - Servindo do cache:', request.url);
      return cachedResponse;
    }

    console.log('🌐 Cache First - Buscando na rede:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      try {
        // Verificar se a resposta ainda pode ser clonada
        if (!networkResponse.bodyUsed) {
          await cache.put(request, networkResponse.clone());
        }
      } catch (error) {
        console.error('❌ Erro ao salvar no cache:', error);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Erro na estratégia Cache First:', error);
    throw error;
  }
}

// Estratégia: Network First (para APIs)
async function networkFirstStrategy(request, cacheName) {
  try {
    console.log('🌐 Network First - Tentando rede primeiro:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      try {
        // Verificar se a resposta ainda pode ser clonada
        if (!networkResponse.bodyUsed) {
          await cache.put(request, networkResponse.clone());
        }
      } catch (error) {
        console.error('❌ Erro ao salvar no cache:', error);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📦 Network First - Fallback para cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não há cache e rede falhou, retorna erro
    throw error;
  }
}

// Estratégia: Stale While Revalidate (para páginas) - DESABILITADA TEMPORARIAMENTE
async function staleWhileRevalidateStrategy(request, cacheName) {
  // Retornar diretamente da rede sem cache para evitar erros
  try {
    return await fetch(request);
  } catch (error) {
    console.error('❌ Erro na busca em background:', error);
    return null;
  }
}

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
