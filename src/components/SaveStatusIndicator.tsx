import { mdiCloudAlert, mdiCloudCheck, mdiCloudSync } from '@mdi/js';
import { useEffect, useState } from 'react';
import { classNames } from '../lib/classNames';
import type { Messages } from '../lib/i18n';
import { useI18n } from '../lib/i18n';
import type { SaveStatus } from '../types';
import st from './SaveStatusIndicator.module.scss';

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
  if (status === 'syncing') {
    return { icon: mdiCloudSync, label: messages.labels.syncing };
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
      className={classNames(
        st.root,
        st[status],
        st.saveStatus,
        st[`saveStatus${status[0].toUpperCase()}${status.slice(1)}`],
        isLeaving ? st.leaving : undefined,
        isLeaving ? st.saveStatusLeaving : undefined,
      )}
      role={'status'}
      aria-live={'polite'}
      aria-label={indicator.label}
      title={indicator.label}
    >
      <svg aria-hidden={'true'} className={classNames(st.svg, st.saveStatusSvg)} viewBox={'0 0 24 24'}>
        <path d={indicator.icon} fill={'currentColor'} />
      </svg>
    </div>
  );
}
