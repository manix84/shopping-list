import type { PageKey } from '../types';
import { useI18n } from '../lib/i18n';
import { classNames } from '../lib/classNames';
import { p } from '../styles/primitives';

type PageTabsProps = {
  page: PageKey;
  hasItems: boolean;
  showDebugTools?: boolean;
  onChange: (page: PageKey) => void;
};

export function PageTabs({ page, hasItems, showDebugTools = false, onChange }: PageTabsProps) {
  const { messages } = useI18n();

  return (
    <nav className={p.buttonRow} aria-label={messages.app.title}>
      <button
        type={'button'}
        className={page === 'edit' ? classNames(p.button, p.buttonActive) : p.button}
        aria-current={page === 'edit' ? 'page' : undefined}
        onClick={() => onChange('edit')}
      >
        {messages.nav.editList}
      </button>
      <button
        type={'button'}
        className={page === 'route' ? classNames(p.button, p.buttonActive) : p.button}
        aria-current={page === 'route' ? 'page' : undefined}
        aria-disabled={!hasItems}
        onClick={() => onChange(hasItems ? 'route' : 'edit')}
      >
        {messages.nav.route}
      </button>
      <button
        type={'button'}
        className={page === 'settings' ? classNames(p.button, p.buttonActive) : p.button}
        aria-current={page === 'settings' ? 'page' : undefined}
        onClick={() => onChange('settings')}
      >
        {messages.nav.settings}
      </button>
      <button
        type={'button'}
        className={page === 'about' ? classNames(p.button, p.buttonActive) : p.button}
        aria-current={page === 'about' ? 'page' : undefined}
        onClick={() => onChange('about')}
      >
        {messages.nav.about}
      </button>
      {showDebugTools ? (
        <button
          type={'button'}
          className={page === 'debug' ? classNames(p.button, p.buttonActive) : p.button}
          aria-current={page === 'debug' ? 'page' : undefined}
          onClick={() => onChange('debug')}
        >
          {messages.nav.debugTools}
        </button>
      ) : null}
    </nav>
  );
}
