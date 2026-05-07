import type { PageKey } from '../types';
import { useI18n } from '../lib/i18n';

type PageTabsProps = {
  page: PageKey;
  hasItems: boolean;
  showDebugTools?: boolean;
  onChange: (page: PageKey) => void;
};

export function PageTabs({ page, hasItems, showDebugTools = false, onChange }: PageTabsProps) {
  const { messages } = useI18n();

  return (
    <nav className={'button-row'} aria-label={messages.app.title}>
      <button
        type={'button'}
        className={`button ${page === 'edit' ? 'button-active' : ''}`}
        aria-current={page === 'edit' ? 'page' : undefined}
        onClick={() => onChange('edit')}
      >
        {messages.nav.editList}
      </button>
      <button
        type={'button'}
        className={`button ${page === 'route' ? 'button-active' : ''}`}
        aria-current={page === 'route' ? 'page' : undefined}
        aria-disabled={!hasItems}
        onClick={() => onChange(hasItems ? 'route' : 'edit')}
      >
        {messages.nav.route}
      </button>
      <button
        type={'button'}
        className={`button ${page === 'settings' ? 'button-active' : ''}`}
        aria-current={page === 'settings' ? 'page' : undefined}
        onClick={() => onChange('settings')}
      >
        {messages.nav.settings}
      </button>
      <button
        type={'button'}
        className={`button ${page === 'about' ? 'button-active' : ''}`}
        aria-current={page === 'about' ? 'page' : undefined}
        onClick={() => onChange('about')}
      >
        {messages.nav.about}
      </button>
      {showDebugTools ? (
        <button
          type={'button'}
          className={`button ${page === 'debug' ? 'button-active' : ''}`}
          aria-current={page === 'debug' ? 'page' : undefined}
          onClick={() => onChange('debug')}
        >
          {messages.nav.debugTools}
        </button>
      ) : null}
    </nav>
  );
}
