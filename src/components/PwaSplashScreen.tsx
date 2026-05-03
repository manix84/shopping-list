import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n';

const SPLASH_DURATION_MS = 2_350;
const PWA_SPLASH_ENABLED = import.meta.env.VITE_ENABLE_PWA_SPLASH === 'true';

const isStandalonePwa = (): boolean => {
  if (!PWA_SPLASH_ENABLED || typeof window === 'undefined') return false;

  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
};

export function PwaSplashScreen() {
  const { messages } = useI18n();
  const [visible, setVisible] = useState(() => isStandalonePwa());

  useEffect(() => {
    if (!visible) return;

    const timeoutId = window.setTimeout(() => {
      setVisible(false);
    }, SPLASH_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [visible]);

  if (!visible) return null;

  const logoHref = `${import.meta.env.BASE_URL}logo-animated-once.svg`;

  return (
    <div className={'pwa-splash'} role={'status'} aria-live={'polite'} aria-label={messages.app.title}>
      <div className={'pwa-splash-content'}>
        <img className={'pwa-splash-logo'} src={logoHref} alt={''} />
        <div className={'pwa-splash-title'}>{messages.app.title}</div>
      </div>
    </div>
  );
}
