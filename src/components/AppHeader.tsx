import { Card } from './Card';
import { PageTabs } from './PageTabs';
import type { PageKey } from '../types';

type AppHeaderProps = {
  page: PageKey;
  onChangePage: (page: PageKey) => void;
};

export function AppHeader({ page, onChangePage }: AppHeaderProps) {
  return (
    <Card
      header={
        <div className="title-row">
          <div className="title-block">
            <div className="app-icon">🛒</div>
            <div>
              <h1 className="title">Smart Shopping List</h1>
              <p className="subtitle">Country-aware supermarket routing, with the UK setup as the default.</p>
            </div>
          </div>
          <PageTabs page={page} onChange={onChangePage} />
        </div>
      }
    />
  );
}
