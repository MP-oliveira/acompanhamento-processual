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
      })
      .catch((registrationError) => {
      });
  });
} else {
}
*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
