import { mdiAlertCircle, mdiAlertOctagon, mdiCheckCircle, mdiInformation } from '@mdi/js';

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type ToastPopupData = {
  id: number;
  tone: ToastTone;
  message: string;
  title?: string;
  showIcon?: boolean;
};

type ToastPopupProps = ToastPopupData;

export const iconForToastTone: Record<ToastTone, string> = {
  success: mdiCheckCircle,
  info: mdiInformation,
  warning: mdiAlertCircle,
  error: mdiAlertOctagon,
};

export const roleForToastTone = (tone: ToastTone) => tone === 'error' ? 'alert' : 'status';

export function ToastPopup({
  tone,
  title,
  message,
  showIcon = true,
}: ToastPopupProps) {
  const hasTitle = Boolean(title);

  return (
    <aside
      className={`toast-popup toast-popup-${tone} ${showIcon ? '' : 'toast-popup-no-icon'} ${hasTitle ? '' : 'toast-popup-no-title'}`}
      role={roleForToastTone(tone)}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon ? (
        <span className={'toast-popup-icon'} aria-hidden={'true'}>
          <svg viewBox={'0 0 24 24'}>
            <path d={iconForToastTone[tone]} fill={'currentColor'} />
          </svg>
        </span>
      ) : null}
      <span className={'toast-popup-copy'}>
        {title ? <strong>{title}</strong> : null}
        <span>{message}</span>
      </span>
    </aside>
  );
}
