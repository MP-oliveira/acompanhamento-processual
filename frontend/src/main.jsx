import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Service Worker de limpeza ULTRA agressiva
if ('serviceWorker' in navigator) {
  console.log('🚨 Iniciando limpeza ULTRA agressiva...');
  
  // Primeiro, tentar desregistrar qualquer SW existente
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('🗑️ Encontrados', registrations.length, 'service workers para remover');
    registrations.forEach(registration => {
      registration.unregister().then(success => {
        console.log('💥 SW removido:', success);
      });
    });
  });

  window.addEventListener('load', () => {
    // Registrar o SW de limpeza
    navigator.serviceWorker.register('/sw.js?v=' + Date.now())
      .then((registration) => {
        console.log('🚨 SW de limpeza registrado:', registration.scope);
        
        // Escutar mensagens do Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'FORCE_RELOAD_NOW') {
            console.log('🚨 FORÇANDO RELOAD IMEDIATO...');
            window.location.reload(true);
          }
        });
      })
      .catch((registrationError) => {
        console.log('❌ Falha no registro do SW:', registrationError);
      });
  });
} else {
  console.log('ℹ️ Service Worker não suportado');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
