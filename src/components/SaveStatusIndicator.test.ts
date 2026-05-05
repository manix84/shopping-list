import { mdiCloudAlert, mdiCloudCheck, mdiCloudSync } from '@mdi/js';
import { describe, expect, it } from 'vitest';
import { createMessages } from '../lib/i18n';
import type { SaveStatus } from '../types';
import {
  getSaveStatusIndicatorConfig,
  SAVE_CONFIRMATION_DURATION_MS,
  SAVE_STATUS_FADE_DURATION_MS,
} from './SaveStatusIndicator';

describe('SaveStatusIndicator helpers', () => {
  const messages = createMessages('en');

  it('maps visible save states to localized labels and icons', () => {
    const expected: Array<{ status: SaveStatus; label: string; icon: string }> = [
      { status: 'saving', label: messages.labels.saving, icon: mdiCloudSync },
      { status: 'saved', label: messages.labels.saved, icon: mdiCloudCheck },
      { status: 'error', label: messages.labels.saveFailed, icon: mdiCloudAlert },
    ];

    for (const { status, label, icon } of expected) {
      expect(getSaveStatusIndicatorConfig(status, messages)).toEqual({ label, icon });
    }
  });

  it('does not render a status for the idle state', () => {
    expect(getSaveStatusIndicatorConfig('idle', messages)).toBeUndefined();
  });

  it('uses the short saved confirmation timing', () => {
    expect(SAVE_CONFIRMATION_DURATION_MS).toBe(1_000);
    expect(SAVE_STATUS_FADE_DURATION_MS).toBe(250);
  });
});
