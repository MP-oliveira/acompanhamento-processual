import { useState, useEffect, useCallback } from 'react';
// import { api } from '../services/api';

/**
 * Hook para gerenciar push notifications
 */
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar suporte e permissões
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      
      // Verificar permissão atual
      navigator.permissions.query({ name: 'notifications' }).then((result) => {
        setPermission(result.state);
      });
    }
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications não são suportadas neste navegador');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        return true;
      } else {
        setError('Permissão para notificações foi negada');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error);
      setError('Erro ao solicitar permissão para notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Registrar subscription no servidor
  const subscribeToPush = useCallback(async () => {
    if (!isSupported || permission !== 'granted') {
      setError('Permissão para notificações não concedida');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/push-sw.js');

      // Aguardar o service worker estar ativo
      await navigator.serviceWorker.ready;

      // Obter chave pública VAPID (temporariamente hardcoded)
      const vapidPublicKey = 'BHLHsf2Mlo0NWk2idM7L6RPi4DSDES3N-UH8kfZYb4FQIWsQ-JGBUIQHNZzj0PAL25HuWS8ZsL8ijLDTSNZrNOE';

      // Criar subscription
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });


      // Enviar subscription para o servidor
      const subscriptionData = {
        endpoint: pushSubscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')),
          auth: arrayBufferToBase64(pushSubscription.getKey('auth'))
        }
      };

      // await api.post('/push/subscribe', subscriptionData);

      setSubscription(subscriptionData);
      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar push subscription:', error);
      setError('Erro ao configurar notificações push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  // Desregistrar subscription
  const unsubscribeFromPush = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Desregistrar do servidor
      if (subscription) {
        // await api.post('/push/unsubscribe', { endpoint: subscription.endpoint });
      }

      // Desregistrar do navegador
      const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
      if (registration) {
        const pushSubscription = await registration.pushManager.getSubscription();
        if (pushSubscription) {
          await pushSubscription.unsubscribe();
        }
      }

      setSubscription(null);
      return true;
    } catch (error) {
      console.error('❌ Erro ao desregistrar push subscription:', error);
      setError('Erro ao remover notificações push');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async (message) => {
    setIsLoading(true);
    setError(null);

    try {
      // await api.post('/push/test', { message });
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação de teste:', error);
      setError('Erro ao enviar notificação de teste');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verificar se está inscrito
  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
      if (registration) {
        const pushSubscription = await registration.pushManager.getSubscription();
        if (pushSubscription) {
          const subscriptionData = {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')),
              auth: arrayBufferToBase64(pushSubscription.getKey('auth'))
            }
          };
          setSubscription(subscriptionData);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
    }
  }, [isSupported]);

  // Verificar subscription ao carregar
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      checkSubscription();
    }
  }, [isSupported, permission, checkSubscription]);

  return {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    checkSubscription
  };
};

// Funções auxiliares
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((byte) => binary += String.fromCharCode(byte));
  return window.btoa(binary);
}
