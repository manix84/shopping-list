import { mdiMenu } from '@mdi/js';
import type { PointerEvent } from 'react';
import { useEffect, useState } from 'react';
import { classNames } from '../lib/classNames';
import type { Messages } from '../lib/i18n';
import { useI18n } from '../lib/i18n';
import type { BackendStatus, PageKey } from '../types';
import { Badge } from './Badge';
import { Card } from './Card';
import { PageTabs } from './PageTabs';
import st from './AppHeader.module.scss';

const ONLINE_BADGE_DURATION_MS = 6_000;
const BADGE_FADE_DURATION_MS = 250;
const EASTER_EGG_TAP_COUNT = 7;
const EASTER_EGG_TAP_RESET_MS = 1_500;

type AppHeaderProps = {
  page: PageKey;
  hasItems: boolean;
  backendStatus: BackendStatus;
  resolvedTheme: 'light' | 'dark';
  isDebugMode?: boolean;
  onChangePage: (page: PageKey) => void;
  onRevealEasterEgg?: () => void;
};

const backendBadge = (status: BackendStatus, messages: Messages) => {
  if (status.state === 'connected') { return { tone: 'success' as const, label: messages.backendStatus.connected }; }
  if (status.state === 'checking') { return undefined; }
  if (status.state === 'error') { return { tone: 'danger' as const, label: messages.backendStatus.issue }; }
  return { tone: 'danger' as const, label: messages.backendStatus.frontendOnly };
};

export function AppHeader({
  page,
  hasItems,
  backendStatus,
  isDebugMode = false,
  onRevealEasterEgg,
  onChangePage,
}: AppHeaderProps) {
  const { messages } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connectionBadgeVisible, setConnectionBadgeVisible] = useState(false);
  const [connectionBadgeLeaving, setConnectionBadgeLeaving] = useState(false);
  const [offlineInfoOpen, setOfflineInfoOpen] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);
  const badge = backendBadge(backendStatus, messages);
  const canShowOfflineInfo = backendStatus.state === 'offline' || backendStatus.state === 'error';
  const mobileMenuLabel = mobileMenuOpen ? messages.mobileMenu.closeNavigation : messages.mobileMenu.openNavigation;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  useEffect(() => {
    if (!canShowOfflineInfo) {
      setOfflineInfoOpen(false);
    }
  }, [canShowOfflineInfo]);

  useEffect(() => {
    if (backendStatus.state === 'checking') {
      setConnectionBadgeVisible(false);
      setConnectionBadgeLeaving(false);
      return;
    }

    setConnectionBadgeVisible(true);
    setConnectionBadgeLeaving(false);

    if (backendStatus.state !== 'connected') { return; }

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
    setOfflineInfoOpen(false);
    onChangePage(nextPage);
  };

  useEffect(() => {
    if (logoTapCount === 0) { return undefined; }

    const resetTimer = window.setTimeout(() => setLogoTapCount(0), EASTER_EGG_TAP_RESET_MS);
    return () => window.clearTimeout(resetTimer);
  }, [logoTapCount]);

  const handleLogoPointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) { return; }
    if (event.pointerType !== 'mouse') {
      event.preventDefault();
    }

    setLogoTapCount((current) => {
      const next = current + 1;
      if (next >= EASTER_EGG_TAP_COUNT) {
        onRevealEasterEgg?.();
        return 0;
      }
      return next;
    });
  };

  const logoHref = `${import.meta.env.BASE_URL}logo-mark.png`;

  return (
    <header className={classNames(st.root, st.appHeader)}>
      <div className={classNames(st.inner, st.appHeaderInner)}>
        <Card
          className={classNames(st.card, st.appHeaderCard)}
          headerClassName={classNames(st.cardHeader, st.appHeaderCardHeader)}
          header={
            <div className={'title-row'}>
              <div className={classNames(st.titleBlock, st.titleBlockAlias)}>
                <span
                  className={classNames(st.icon, st.easterEggTrigger, st.appIcon, st.appIconEasterEggTrigger)}
                  aria-hidden={'true'}
                  onPointerDown={handleLogoPointerDown}
                >
                  <img className={classNames(st.iconImage, st.appIconImage)} src={logoHref} alt={''} width={'48'} height={'48'} />
                </span>
                <div>
                  <h1 className={p.title}>{messages.app.title}</h1>
                  <p className={p.subtitle}>{messages.app.subtitle}</p>
                </div>
              </div>

              <div className={classNames(st.actions, st.headerActions)}>
                {badge && connectionBadgeVisible ? (
                  <div className={classNames(st.connectionShell, st.connectionBadgeShell)} aria-live={'polite'}>
                    <button
                      type={'button'}
                      className={classNames(st.connectionButton, st.connectionBadgeButton)}
                      aria-expanded={canShowOfflineInfo ? offlineInfoOpen : undefined}
                      aria-describedby={canShowOfflineInfo && offlineInfoOpen ? 'offline-status-popover' : undefined}
                      disabled={!canShowOfflineInfo}
                      onClick={() => {
                        if (canShowOfflineInfo) {
                          setOfflineInfoOpen((current) => !current);
                        }
                      }}
                    >
                      <Badge
                        tone={badge.tone}
                        className={classNames(
                          st.connectionBadge,
                          st.connectionBadgeAlias,
                          connectionBadgeLeaving ? st.connectionLeaving : undefined,
                          connectionBadgeLeaving ? st.connectionBadgeLeavingAlias : undefined,
                        )}
                      >
                        {badge.label}
                      </Badge>
                    </button>
                    {canShowOfflineInfo && offlineInfoOpen ? (
                      <div id={'offline-status-popover'} className={classNames(st.connectionPopover, st.connectionPopoverAlias)} role={'tooltip'}>
                        <strong>{messages.backendStatus.offlineTitle}</strong>
                        <p>{messages.backendStatus.offlineDescription}</p>
                        <p>{messages.backendStatus.offlineSyncDescription}</p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <div className={classNames(st.desktopMenuShell, st.desktopMenuShellAlias)}>
                  <PageTabs page={page} hasItems={hasItems} showDebugTools={isDebugMode} onChange={handleChangePage} />
                </div>

                <div className={classNames(st.mobileMenuShell, st.mobileMenuShellAlias)}>
                  <button
                    type={'button'}
                    className={classNames('button', st.mobileMenuTrigger, st.mobileMenuTriggerAlias)}
                    aria-label={mobileMenuLabel}
                    aria-expanded={mobileMenuOpen}
                    aria-controls={mobileMenuOpen ? 'mobile-menu-panel' : undefined}
                    title={mobileMenuLabel}
                    onClick={() => setMobileMenuOpen((current) => !current)}
                  >
                    <span className={p.srOnly}>{mobileMenuLabel}</span>
                    <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
                      <path d={mdiMenu} fill={'currentColor'} />
                    </svg>
                  </button>

                  {mobileMenuOpen ? (
                    <div id={'mobile-menu-panel'} className={classNames(st.mobileMenuPanel, st.mobileMenuPanelAlias)}>
                      <PageTabs page={page} hasItems={hasItems} showDebugTools={isDebugMode} onChange={handleChangePage} />
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
