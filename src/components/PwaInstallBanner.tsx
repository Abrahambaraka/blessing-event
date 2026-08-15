import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'be_pwa_install_dismissed';

const PwaInstallBanner: React.FC = () => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-sm z-[200] bg-navy text-white rounded-xl shadow-2xl border border-gold/30 p-4">
      <div className="flex items-start gap-3">
        <Download size={22} className="text-gold shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Installer Blessing Event</p>
          <p className="text-white/70 text-xs mt-1">Accédez à la billetterie depuis votre écran d'accueil.</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={install}
              className="px-3 py-1.5 bg-gold text-white text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              Installer
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="px-3 py-1.5 text-white/70 text-xs uppercase tracking-wider"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="text-white/50 hover:text-white shrink-0" aria-label="Fermer">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PwaInstallBanner;
