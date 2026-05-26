import { mdiAlertCircle, mdiAlertOctagon, mdiCheckCircle, mdiInformation } from '@mdi/js';
import { classNames } from '../lib/classNames';
import st from './ToastPopup.module.scss';

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
      className={classNames(
        st.root,
        st[tone],
        'toast-popup',
        `toast-popup-${tone}`,
        showIcon ? undefined : st.noIcon,
        showIcon ? undefined : 'toast-popup-no-icon',
        hasTitle ? undefined : st.noTitle,
        hasTitle ? undefined : 'toast-popup-no-title',
      )}
      role={roleForToastTone(tone)}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon ? (
        <span className={classNames(st.icon, 'toast-popup-icon')} aria-hidden={'true'}>
          <svg viewBox={'0 0 24 24'}>
            <path d={iconForToastTone[tone]} fill={'currentColor'} />
          </svg>
        </span>
      ) : null}
      <span className={classNames(st.copy, 'toast-popup-copy')}>
        {title ? <strong>{title}</strong> : null}
        <span>{message}</span>
      </span>
    </aside>
  );
}
