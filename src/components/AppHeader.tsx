import { useEffect, useState } from 'react';
import { Card } from './Card';
import { PageTabs } from './PageTabs';
import { useI18n } from '../lib/i18n';
import type { PageKey } from '../types';

type AppHeaderProps = {
  page: PageKey;
  onChangePage: (page: PageKey) => void;
};

export function AppHeader({ page, onChangePage }: AppHeaderProps) {
  const { messages } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <button type="button" className={`button ${page === 'edit' ? 'button-active' : ''}`} onClick={() => handleChangePage('edit')}>
                  {messages.nav.editList}
                </button>
                <button type="button" className={`button ${page === 'route' ? 'button-active' : ''}`} onClick={() => handleChangePage('route')}>
                  {messages.nav.storeRoute}
                </button>
                <button type="button" className={`button ${page === 'settings' ? 'button-active' : ''}`} onClick={() => handleChangePage('settings')}>
                  {messages.nav.settings}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      }
    />
  );
}
