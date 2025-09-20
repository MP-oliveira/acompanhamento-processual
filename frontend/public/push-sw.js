// Service Worker para Push Notifications
const CACHE_NAME = 'juris-acompanha-push-v1';
const VAPID_PUBLIC_KEY = 'BHLHsf2Mlo0NWk2idM7L6RPi4DSDES3N-UH8kfZYb4FQIWsQ-JGBUIQHNZzj0PAL25HuWS8ZsL8ijLDTSNZrNOE';

console.log('🔔 Push Service Worker carregado');

// Evento de instalação
self.addEventListener('install', (event) => {
  console.log('🔔 Push SW: Instalando...');
  self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', (event) => {
  console.log('🔔 Push SW: Ativando...');
  event.waitUntil(self.clients.claim());
});

// Evento de push (receber notificação)
self.addEventListener('push', (event) => {
  console.log('📱 Push recebido:', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
      console.log('📱 Dados da notificação:', data);
    } catch (error) {
      console.error('❌ Erro ao parsear dados do push:', error);
      data = {
        title: 'JurisAcompanha',
        body: event.data.text() || 'Nova notificação',
        icon: '/icons/icon-192x192.svg'
      };
    }
  } else {
    data = {
      title: 'JurisAcompanha',
      body: 'Nova notificação',
      icon: '/icons/icon-192x192.svg'
    };
  }

  const options = {
    title: data.title || 'JurisAcompanha',
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icons/icon-192x192.svg',
    badge: data.badge || '/icons/icon-72x72.svg',
    tag: data.tag || 'juris-acompanha',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/action-view.svg'
      },
      {
        action: 'dismiss',
        title: 'Dispensar',
        icon: '/icons/action-dismiss.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Clique na notificação:', event);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  if (action === 'dismiss') {
    console.log('❌ Notificação dispensada');
    return;
  }
  
  // URL para abrir (padrão ou da notificação)
  let urlToOpen = '/';
  
  if (data.url) {
    urlToOpen = data.url;
  } else if (data.type === 'process-alert' && data.processId) {
    urlToOpen = `/processos/${data.processId}`;
  } else if (data.type === 'deadline' && data.processId) {
    urlToOpen = `/processos/${data.processId}`;
  } else if (data.type === 'system') {
    urlToOpen = '/dashboard';
  }
  
  console.log('🔗 Abrindo URL:', urlToOpen);
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Navegar para a URL na janela existente
            return client.navigate(urlToOpen).then(() => client.focus());
          }
        }
        
        // Abrir nova janela se não houver janela existente
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Evento de fechamento da notificação
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificação fechada:', event);
  
  // Aqui você pode enviar analytics ou marcar como lida
  const data = event.notification.data || {};
  if (data.alertId) {
    // Marcar alerta como lido (opcional)
    console.log('📝 Marcar alerta como lido:', data.alertId);
  }
});

// Evento de erro
self.addEventListener('error', (event) => {
  console.error('❌ Erro no Push SW:', event);
});

// Evento de mensagem (comunicação com o app)
self.addEventListener('message', (event) => {
  console.log('💬 Mensagem recebida no Push SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Push Service Worker configurado com sucesso');
