import { mdiAlertCircle, mdiAlertOctagon, mdiCheckCircle, mdiInformation } from '@mdi/js';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  iconForToastTone,
  roleForToastTone,
  ToastPopup,
  type ToastTone,
} from './ToastPopup';

describe('ToastPopup', () => {
  it('maps tones to roles and icons', () => {
    expect(roleForToastTone('success')).toBe('status');
    expect(roleForToastTone('info')).toBe('status');
    expect(roleForToastTone('warning')).toBe('status');
    expect(roleForToastTone('error')).toBe('alert');

    expect(iconForToastTone).toEqual({
      success: mdiCheckCircle,
      info: mdiInformation,
      warning: mdiAlertCircle,
      error: mdiAlertOctagon,
    });
  });

  it('renders each tone with its title, message, role, and icon', () => {
    const tones: ToastTone[] = ['success', 'info', 'warning', 'error'];

    for (const tone of tones) {
      const html = renderToStaticMarkup(createElement(ToastPopup, {
        id: 1,
        tone,
        title: `${tone} title`,
        message: `${tone} message`,
      }));

      expect(html).toContain(`toast-popup-${tone}`);
      expect(html).toContain(`role="${roleForToastTone(tone)}"`);
      expect(html).toContain(`${tone} title`);
      expect(html).toContain(`${tone} message`);
      expect(html).toContain(iconForToastTone[tone]);
      expect(html).toContain('toast-popup-icon');
    }
  });

  it('can render without an icon or title while keeping the message', () => {
    const html = renderToStaticMarkup(createElement(ToastPopup, {
      id: 1,
      tone: 'info',
      message: 'Plain message',
      showIcon: false,
    }));

    expect(html).toContain('Plain message');
    expect(html).toContain('toast-popup-no-icon');
    expect(html).toContain('toast-popup-no-title');
    expect(html).not.toContain('toast-popup-icon');
    expect(html).not.toContain('<strong>');
  });
});
