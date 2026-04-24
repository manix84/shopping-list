import type { PageKey } from '../types';
import { useI18n } from '../lib/i18n';

type PageTabsProps = {
  page: PageKey;
  onChange: (page: PageKey) => void;
};

export function PageTabs({ page, onChange }: PageTabsProps) {
  const { messages } = useI18n();
  return (
    <div className="button-row">
      <button type="button" className={`button ${page === 'edit' ? 'button-active' : ''}`} onClick={() => onChange('edit')}>
        {messages.nav.editList}
      </button>
      <button type="button" className={`button ${page === 'route' ? 'button-active' : ''}`} onClick={() => onChange('route')}>
        {messages.nav.storeRoute}
      </button>
      <button type="button" className={`button ${page === 'settings' ? 'button-active' : ''}`} onClick={() => onChange('settings')}>
        {messages.nav.settings}
      </button>
    </div>
  );
}
