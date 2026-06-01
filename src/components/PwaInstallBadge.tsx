import { mdiClose, mdiDownload } from '@mdi/js';
import { classNames } from '../lib/classNames';
import { useI18n } from '../lib/i18n';
import st from './PwaInstallBadge.module.scss';

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

  if (!isVisible) { return null; }

  return (
    <aside className={classNames(st.root, st.pwaInstallBadge)} aria-labelledby={'pwa-install-badge-title'}>
      <div className={classNames(st.icon, st.pwaInstallBadgeIcon)} aria-hidden={'true'}>
        <svg viewBox={'0 0 24 24'}>
          <path d={mdiDownload} fill={'currentColor'} />
        </svg>
      </div>
      <div className={classNames(st.copy, st.pwaInstallBadgeCopy)}>
        <h2 id={'pwa-install-badge-title'}>{messages.pwaInstall.title}</h2>
        <p>
          {canPromptInstall
            ? messages.pwaInstall.description
            : messages.pwaInstall.unavailableDescription}
        </p>
      </div>
      <div className={classNames(st.actions, st.pwaInstallBadgeActions)}>
        {canPromptInstall ? (
          <button type={'button'} className={'button button-primary button-sm'} onClick={onInstall}>
            {messages.pwaInstall.installAction}
          </button>
        ) : null}
        <button
          type={'button'}
          className={classNames('button button-icon', st.dismiss, st.pwaInstallDismiss)}
          aria-label={messages.pwaInstall.dismissLabel}
          title={messages.pwaInstall.dismissLabel}
          onClick={onDismiss}
        >
          <svg viewBox={'0 0 24 24'} aria-hidden={'true'}>
            <path d={mdiClose} fill={'currentColor'} />
          </svg>
        </button>
      </div>
    </aside>
  );
}
