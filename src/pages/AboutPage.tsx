import { useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { DebugLink } from '../components/DebugLink';
import { useI18n } from '../lib/i18n';
import { appVersion } from '../version';

const logoHref = `${import.meta.env.BASE_URL}logo-animated-loop.svg`;
const avatarHref = `${import.meta.env.BASE_URL}rob-avatar.png`;
const DEBUG_MODE_TAP_COUNT = 7;
const DEBUG_MODE_TAP_RESET_MS = 2_000;

type AboutPageProps = {
  isDebugMode: boolean;
  onEnableDebugMode: () => void;
  onOpenDebug: () => void;
};

export function AboutPage({ isDebugMode, onEnableDebugMode, onOpenDebug }: AboutPageProps) {
  const { messages } = useI18n();
  const about = messages.pages.about;
  const versionTapCountRef = useRef(0);
  const versionTapResetTimerRef = useRef<number>();

  const handleVersionTap = () => {
    if (isDebugMode) { return; }

    if (versionTapResetTimerRef.current) {
      window.clearTimeout(versionTapResetTimerRef.current);
    }

    versionTapCountRef.current += 1;
    if (versionTapCountRef.current >= DEBUG_MODE_TAP_COUNT) {
      versionTapCountRef.current = 0;
      onEnableDebugMode();
      return;
    }

    versionTapResetTimerRef.current = window.setTimeout(() => {
      versionTapCountRef.current = 0;
    }, DEBUG_MODE_TAP_RESET_MS);
  };

  useEffect(() => () => {
    if (versionTapResetTimerRef.current) {
      window.clearTimeout(versionTapResetTimerRef.current);
    }
  }, []);

  return (
    <div className={'about-page'}>
      <Card className={'about-card'} bodyClassName={'about-card-body'} aria-labelledby={'about-title'}>
        <div className={'about-hero'}>
          <div className={'about-logo-lockup'}>
            <img className={'about-app-logo'} src={logoHref} alt={''} width={'180'} height={'180'} />
            <a
              className={'about-avatar-link'}
              href={'https://github.com/manix84'}
              rel={'noopener noreferrer'}
              target={'_blank'}
              aria-label={about.authorProfileLabel}
            >
              <img className={'about-avatar-badge'} src={avatarHref} alt={''} width={'64'} height={'64'} />
            </a>
          </div>

          <div className={'about-heading'}>
            <h2 id={'about-title'} className={'title title-md'}>{messages.app.title}</h2>
            <p className={'subtitle'}>{about.tagline}</p>
          </div>
        </div>

        <dl className={'about-spec-list'}>
          <div>
            <dt>{about.versionLabel}</dt>
            <dd>
              <span onPointerUp={handleVersionTap}>
                {appVersion}
              </span>
            </dd>
          </div>
          <div>
            <dt>{about.authorLabel}</dt>
            <dd>{about.authorValue}</dd>
          </div>
          <div>
            <dt>{about.costLabel}</dt>
            <dd>{about.costValue}</dd>
          </div>
          <div>
            <dt>{about.privacyLabel}</dt>
            <dd>{about.privacyValue}</dd>
          </div>
          <div>
            <dt>{about.purposeLabel}</dt>
            <dd>{about.purposeValue}</dd>
          </div>
        </dl>

        <div className={'about-copy stack'}>
          <p>{about.bodyIntro}</p>
          <p>{about.bodyPrivacy}</p>
          <p>{about.bodyAuthor}</p>
        </div>

        <div className={'about-actions'}>
          <a className={'button button-primary'} href={'https://github.com/manix84/shopping-list'} rel={'noopener noreferrer'} target={'_blank'}>
            {about.sourceAction}
          </a>
          <a className={'button'} href={'https://github.com/sponsors/manix84'} rel={'noopener noreferrer'} target={'_blank'}>
            {about.sponsorAction}
          </a>
        </div>

        {isDebugMode ? <DebugLink onOpen={onOpenDebug} /> : null}

        <p className={'about-footnote'}>{about.sponsorFootnote}</p>
      </Card>
    </div>
  );
}
