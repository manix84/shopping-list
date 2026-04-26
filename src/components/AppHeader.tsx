import { useEffect, useState } from 'react';
import { mdiMenu } from '@mdi/js';
import { Badge } from './Badge';
import { Card } from './Card';
import { PageTabs } from './PageTabs';
import { useI18n } from '../lib/i18n';
import type { Messages } from '../lib/i18n';
import type { BackendStatus, PageKey } from '../types';

const ONLINE_BADGE_DURATION_MS = 6_000;
const BADGE_FADE_DURATION_MS = 250;

type AppHeaderProps = {
  page: PageKey;
  hasItems: boolean;
  backendStatus: BackendStatus;
  resolvedTheme: 'light' | 'dark';
  onChangePage: (page: PageKey) => void;
};

const backendBadge = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') return { tone: 'success' as const, label: messages.backendStatus.connected };
  if (status.state === 'checking') return undefined;
  if (status.state === 'error') return { tone: 'danger' as const, label: messages.backendStatus.issue };
  return { tone: 'danger' as const, label: messages.backendStatus.frontendOnly };
};

export function AppHeader({ page, hasItems, backendStatus, onChangePage }: AppHeaderProps) {
  const { messages } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectionBadgeVisible, setConnectionBadgeVisible] = useState(false);
  const [connectionBadgeLeaving, setConnectionBadgeLeaving] = useState(false);
  const badge = backendBadge(backendStatus, messages);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  useEffect(() => {
    if (backendStatus.state === 'checking') {
      setConnectionBadgeVisible(false);
      setConnectionBadgeLeaving(false);
      return;
    }

    setConnectionBadgeVisible(true);
    setConnectionBadgeLeaving(false);

    if (backendStatus.state !== 'connected') return;

    const fadeTimer = window.setTimeout(() => {
      setConnectionBadgeLeaving(true);
    }, ONLINE_BADGE_DURATION_MS);
    const removeTimer = window.setTimeout(() => {
      setConnectionBadgeVisible(false);
      setConnectionBadgeLeaving(false);
    }, ONLINE_BADGE_DURATION_MS + BADGE_FADE_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [backendStatus.state]);

  const handleChangePage = (nextPage: PageKey) => {
    setMobileMenuOpen(false);
    onChangePage(nextPage);
  };

  const logoHref = `${import.meta.env.BASE_URL}logo-mark.png`;

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Card
          className="app-header-card"
          header={
            <div className="title-row">
              <div className="title-block">
                <div className="app-icon">
                  <img className="app-icon-image" src={logoHref} alt="" />
                </div>
                <div>
                  <h1 className="title">{messages.app.title}</h1>
                  <p className="subtitle">{messages.app.subtitle}</p>
                </div>
              </div>

              <div className="header-actions">
                {badge && connectionBadgeVisible ? (
                  <Badge
                    tone={badge.tone}
                    className={`connection-badge ${connectionBadgeLeaving ? 'connection-badge-leaving' : ''}`}
                  >
                    {badge.label}
                  </Badge>
                ) : null}
                <div className="desktop-menu-shell">
                  <PageTabs page={page} hasItems={hasItems} onChange={handleChangePage} />
                </div>

                <div className="mobile-menu-shell">
                  <button
                    type="button"
                    className="button mobile-menu-trigger"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-menu-panel"
                    onClick={() => setMobileMenuOpen((current) => !current)}
                  >
                    <span className="sr-only">{messages.mobileMenu.openNavigation}</span>
                    <svg aria-hidden="true" className="button-icon-svg" viewBox="0 0 24 24">
                      <path d={mdiMenu} fill="currentColor" />
                    </svg>
                  </button>

                  {mobileMenuOpen ? (
                    <div id="mobile-menu-panel" className="mobile-menu-panel">
                      <PageTabs page={page} hasItems={hasItems} onChange={handleChangePage} />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          }
        />
      </div>
    </header>
  );
}
