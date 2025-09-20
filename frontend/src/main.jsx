import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Service Worker para Push Notifications (temporariamente desabilitado)
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Registrar o Service Worker para Push Notifications
    navigator.serviceWorker.register('/push-sw.js')
      .then((registration) => {
        console.log('🔔 Push Service Worker registrado:', registration.scope);
      })
      .catch((registrationError) => {
        console.log('❌ Falha no registro do Push SW:', registrationError);
      });
  });
} else {
  console.log('ℹ️ Service Worker não suportado');
}
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
