import { useEffect, useState } from 'react';
import { Badge } from './Badge';
import { Card } from './Card';
import { PageTabs } from './PageTabs';
import { useI18n } from '../lib/i18n';
import type { Messages } from '../lib/i18n';
import type { BackendStatus, PageKey } from '../types';

type AppHeaderProps = {
  page: PageKey;
  backendStatus: BackendStatus;
  onChangePage: (page: PageKey) => void;
};

const backendBadge = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') return { tone: 'success' as const, label: messages.backendStatus.connected };
  if (status.state === 'checking') return { tone: 'muted' as const, label: messages.backendStatus.checking };
  if (status.state === 'error') return { tone: 'danger' as const, label: messages.backendStatus.issue };
  return { tone: 'muted' as const, label: messages.backendStatus.frontendOnly };
};

export function AppHeader({ page, backendStatus, onChangePage }: AppHeaderProps) {
  const { messages } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const badge = backendBadge(backendStatus, messages);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  const handleChangePage = (nextPage: PageKey) => {
    setMobileMenuOpen(false);
    onChangePage(nextPage);
  };

  return (
    <Card
      header={
        <div className="title-row">
          <div className="title-block">
            <div className="app-icon">🛒</div>
            <div>
              <h1 className="title">{messages.app.title}</h1>
              <p className="subtitle">{messages.app.subtitle}</p>
            </div>
          </div>

          <div className="header-actions">
            <Badge tone={badge.tone}>{badge.label}</Badge>
            <PageTabs page={page} onChange={handleChangePage} />

            <div className="mobile-menu-shell">
              <button
                type="button"
                className="button mobile-menu-trigger"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu-panel"
                onClick={() => setMobileMenuOpen((current) => !current)}
              >
                <span className="sr-only">{messages.mobileMenu.openNavigation}</span>
                <span aria-hidden="true" className="mobile-menu-icon">
                  <span />
                  <span />
                  <span />
                </span>
              </button>

              {mobileMenuOpen ? (
                <div id="mobile-menu-panel" className="mobile-menu-panel">
                  <PageTabs page={page} onChange={handleChangePage} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      }
    />
  );
}
