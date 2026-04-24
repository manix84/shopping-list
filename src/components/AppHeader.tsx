import { Card } from './Card';
import { PageTabs } from './PageTabs';
import { Badge } from './Badge';
import type { BackendStatus, PageKey } from '../types';

type AppHeaderProps = {
  page: PageKey;
  backendStatus: BackendStatus;
  onChangePage: (page: PageKey) => void;
};

const backendBadge = (status: BackendStatus) => {
  if (status.state === 'connected') return { tone: 'success' as const, label: 'Backend connected' };
  if (status.state === 'checking') return { tone: 'muted' as const, label: 'Backend checking' };
  if (status.state === 'error') return { tone: 'danger' as const, label: 'Backend issue' };
  return { tone: 'muted' as const, label: 'Frontend only' };
};

export function AppHeader({ page, backendStatus, onChangePage }: AppHeaderProps) {
  const badge = backendBadge(backendStatus);

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
          <div className="header-actions">
            <Badge tone={badge.tone}>{badge.label}</Badge>
            <PageTabs page={page} onChange={onChangePage} />
          </div>
        </div>
      }
    />
  );
}
