import type { PageKey } from '../types';
import { useI18n } from '../lib/i18n';

type PageTabsProps = {
  page: PageKey;
  hasItems: boolean;
  onChange: (page: PageKey) => void;
};

export function PageTabs({ page, hasItems, onChange }: PageTabsProps) {
  const { messages } = useI18n();
  const shoppingListPage = hasItems ? 'route' : 'edit';

  return (
    <div className="button-row">
      <button
        type="button"
        className={`button ${page === 'edit' || page === 'route' ? 'button-active' : ''}`}
        onClick={() => onChange(shoppingListPage)}
      >
        {messages.nav.shoppingList}
      </button>
      <button type="button" className={`button ${page === 'sections' ? 'button-active' : ''}`} onClick={() => onChange('sections')}>
        {messages.nav.sections}
      </button>
      <button type="button" className={`button ${page === 'settings' ? 'button-active' : ''}`} onClick={() => onChange('settings')}>
        {messages.nav.settings}
      </button>
    </div>
  );
}
