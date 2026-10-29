// src/components/common/PwaInstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  });

  useEffect(() => {
    if (installed) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 2500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'To install on iPhone/iPad: Tap the Share button in Safari and select "Add to Home Screen" 📲'
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (installed || !showPrompt) return null;

  return (
    <div className="pwa-install-banner" role="banner">
      <div className="pwa-banner-left">
        <div className="pwa-icon-box">
          <Smartphone size={20} className="text-blue-600" />
        </div>
        <div>
          <h4 className="pwa-banner-title">Install EduPulse Mobile App</h4>
          <p className="pwa-banner-desc">
            Add to home screen for faster loading & offline timetable access.
          </p>
        </div>
      </div>

      <div className="pwa-banner-actions">
        <button className="btn-pwa-install" onClick={handleInstallClick}>
          <Download size={15} />
          <span>Install</span>
        </button>
        <button
          className="btn-pwa-dismiss"
          onClick={() => setShowPrompt(false)}
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
