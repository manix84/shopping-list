import { mdiClose, mdiDownload } from '@mdi/js';
import { useI18n } from '../lib/i18n';

type PwaInstallBadgeProps = {
  canPromptInstall: boolean;
  isVisible: boolean;
  onDismiss: () => void;
  onInstall: () => void;
};

export function PwaInstallBadge({
  canPromptInstall,
  isVisible,
  onDismiss,
  onInstall,
}: PwaInstallBadgeProps) {
  const { messages } = useI18n();

  if (!isVisible) return null;

  return (
    <aside className="pwa-install-badge" aria-labelledby="pwa-install-badge-title">
      <div className="pwa-install-badge-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d={mdiDownload} fill="currentColor" />
        </svg>
      </div>
      <div className="pwa-install-badge-copy">
        <h2 id="pwa-install-badge-title">{messages.pwaInstall.title}</h2>
        <p>
          {canPromptInstall
            ? messages.pwaInstall.description
            : messages.pwaInstall.unavailableDescription}
        </p>
      </div>
      <div className="pwa-install-badge-actions">
        {canPromptInstall ? (
          <button type="button" className="button button-primary button-sm" onClick={onInstall}>
            {messages.pwaInstall.installAction}
          </button>
        ) : null}
        <button
          type="button"
          className="button button-icon pwa-install-dismiss"
          aria-label={messages.pwaInstall.dismissLabel}
          onClick={onDismiss}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={mdiClose} fill="currentColor" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
