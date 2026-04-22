import type { PageKey } from '../types';

type PageTabsProps = {
  page: PageKey;
  onChange: (page: PageKey) => void;
};

export function PageTabs({ page, onChange }: PageTabsProps) {
  return (
    <div className="button-row">
      <button className={`button ${page === 'edit' ? 'button-active' : ''}`} onClick={() => onChange('edit')}>Edit list</button>
      <button className={`button ${page === 'route' ? 'button-active' : ''}`} onClick={() => onChange('route')}>Store route</button>
      <button className={`button ${page === 'settings' ? 'button-active' : ''}`} onClick={() => onChange('settings')}>Settings</button>
    </div>
  );
}
