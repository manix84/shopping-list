import { mdiCloudAlert, mdiCloudCheck, mdiCloudSync } from '@mdi/js';
import { useEffect, useState } from 'react';
import type { Messages } from '../lib/i18n';
import { useI18n } from '../lib/i18n';
import type { SaveStatus } from '../types';

export const SAVE_STATUS_FADE_DURATION_MS = 250;
export const SAVE_CONFIRMATION_DURATION_MS = 1_000;

type SaveStatusIndicatorProps = {
  status: SaveStatus;
};

export const getSaveStatusIndicatorConfig = (status: SaveStatus, messages: Messages) => {
  if (status === 'idle') { return undefined; }
  if (status === 'saving') {
    return { icon: mdiCloudSync, label: messages.labels.saving };
  }
  if (status === 'error') {
    return { icon: mdiCloudAlert, label: messages.labels.saveFailed };
  }
  return { icon: mdiCloudCheck, label: messages.labels.saved };
};

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps) {
  const { messages } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const indicator = getSaveStatusIndicatorConfig(status, messages);

  useEffect(() => {
    if (status === 'idle') {
      setIsVisible(false);
      setIsLeaving(false);
      return;
    }

    setIsVisible(true);
    setIsLeaving(false);

    if (status !== 'saved') { return; }

    const fadeTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, SAVE_CONFIRMATION_DURATION_MS);
    const removeTimer = window.setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
    }, SAVE_CONFIRMATION_DURATION_MS + SAVE_STATUS_FADE_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [status]);

  if (!indicator || !isVisible) { return null; }

  return (
    <div
      className={`save-status save-status-${status} ${isLeaving ? 'save-status-leaving' : ''}`}
      role={'status'}
      aria-live={'polite'}
      aria-label={indicator.label}
      title={indicator.label}
    >
      <svg aria-hidden={'true'} className={'save-status-svg'} viewBox={'0 0 24 24'}>
        <path d={indicator.icon} fill={'currentColor'} />
      </svg>
    </div>
  );
}
