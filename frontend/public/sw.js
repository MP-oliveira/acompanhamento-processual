// Service Worker de limpeza ULTRA agressiva
console.log('🚨 Service Worker: LIMPEZA ULTRA AGRESSIVA INICIADA');

// Imediatamente limpar tudo
self.addEventListener('install', (event) => {
  console.log('🚨 FORÇANDO INSTALAÇÃO IMEDIATA');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚨 ATIVAÇÃO - LIMPANDO TUDO');
  
  event.waitUntil(
    // Limpar TODOS os caches
    caches.keys().then(cacheNames => {
      console.log('🗑️ Caches encontrados:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => {
          console.log('💥 DESTRUINDO cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('✅ Todos os caches destruídos');
      
      // Desregistrar este service worker
      return self.registration.unregister().then(success => {
        console.log('💥 Service Worker DESREGISTRADO:', success);
        
        // Forçar reload de TODOS os clientes
        return self.clients.matchAll().then(clients => {
          console.log('🔄 Recarregando', clients.length, 'clientes');
          clients.forEach(client => {
            if (client.url && client.navigate) {
              client.navigate(client.url);
            } else if (client.postMessage) {
              client.postMessage({ type: 'FORCE_RELOAD_NOW' });
            }
          });
        });
      });
    })
  );
});

// NÃO interceptar NENHUMA requisição
self.addEventListener('fetch', (event) => {
  // Deixar tudo passar direto - sem cache
  return;
});

// Forçar atualização imediata
console.log('🚨 Service Worker carregado - iniciando destruição...');