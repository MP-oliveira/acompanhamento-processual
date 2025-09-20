import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle, Smartphone, Monitor } from 'lucide-react';
import './PWAInstaller.css';

const PWAInstaller = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = window.navigator.standalone === true;
      
      setIsStandalone(isStandaloneMode || isIOSStandalone);
      setIsInstalled(isStandaloneMode || isIOSStandalone);
    };

    checkIfInstalled();

    // Escutar evento de instalação
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    // Escutar evento de instalação concluída
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Mostrar prompt de instalação
      deferredPrompt.prompt();
      
      // Aguardar resposta do usuário
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      } else {
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Não mostrar novamente por 7 dias
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Não mostrar se já foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 dias em ms
      
      if (Date.now() - dismissedTime < sevenDays) {
        setShowInstallBanner(false);
      }
    }
  }, []);

  // Não mostrar se já está instalado ou não pode ser instalado
  if (isInstalled || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pwa-installer">
      <div className="pwa-installer-content">
        <div className="pwa-installer-icon">
          <Smartphone size={24} />
        </div>
        
        <div className="pwa-installer-text">
          <h3>Instalar JurisAcompanha</h3>
          <p>
            Instale nosso app para acesso rápido e funcionalidade offline.
          </p>
        </div>
        
        <div className="pwa-installer-actions">
          <button 
            className="pwa-installer-btn pwa-installer-btn-install"
            onClick={handleInstallClick}
          >
            <Download size={16} />
            Instalar
          </button>
          
          <button 
            className="pwa-installer-btn pwa-installer-btn-dismiss"
            onClick={handleDismiss}
            title="Não mostrar novamente"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstaller;
