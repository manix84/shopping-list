import { useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { classNames } from '../lib/classNames';
import { useI18n } from '../lib/i18n';
import { appVersion } from '../version';
import st from './AboutPage.module.scss';

const logoHref = `${import.meta.env.BASE_URL}logo-animated-loop.svg`;
const avatarHref = `${import.meta.env.BASE_URL}rob-avatar.png`;
const DEBUG_MODE_TAP_COUNT = 7;
const DEBUG_MODE_TAP_RESET_MS = 2_000;

type AboutPageProps = {
  isDebugMode: boolean;
  isUpdateAvailable: boolean;
  onEnableDebugMode: () => void;
  onAlreadyDebugMode: () => void;
  onRefreshUpdate: () => void;
};

export function AboutPage({
  isDebugMode,
  isUpdateAvailable,
  onEnableDebugMode,
  onAlreadyDebugMode,
  onRefreshUpdate,
}: AboutPageProps) {
  const { messages } = useI18n();
  const about = messages.pages.about;
  const runtimeHostname =
    typeof window === 'undefined' ? messages.pages.debug.unavailable : window.location.hostname || window.location.host;
  const versionTapCountRef = useRef(0);
  const versionTapResetTimerRef = useRef<number>();

  const handleVersionTap = () => {
    if (versionTapResetTimerRef.current) {
      window.clearTimeout(versionTapResetTimerRef.current);
    }

    versionTapCountRef.current += 1;
    if (versionTapCountRef.current >= DEBUG_MODE_TAP_COUNT) {
      versionTapCountRef.current = 0;
      if (isDebugMode) {
        onAlreadyDebugMode();
        return;
      }
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
    <div className={classNames(st.page, st.aboutPage)}>
      <Card className={classNames(st.card, st.aboutCard)} bodyClassName={classNames(st.body, st.aboutCardBody)} aria-labelledby={'about-title'}>
        <div className={classNames(st.hero, st.aboutHero)}>
          <div className={classNames(st.logoLockup, st.aboutLogoLockup)}>
            <img className={classNames(st.appLogo, st.aboutAppLogo)} src={logoHref} alt={''} width={'180'} height={'180'} />
            <a
              className={classNames(st.avatarLink, st.aboutAvatarLink)}
              href={'https://github.com/manix84'}
              rel={'noopener noreferrer'}
              target={'_blank'}
              aria-label={about.authorProfileLabel}
            >
              <img className={classNames(st.avatarBadge, st.aboutAvatarBadge)} src={avatarHref} alt={''} width={'64'} height={'64'} />
            </a>
          </div>

          <div className={classNames(st.heading, st.aboutHeading)}>
            <h2 id={'about-title'} className={'title title-md'}>{messages.app.title}</h2>
            <p className={'subtitle'}>{about.tagline}</p>
          </div>
        </div>

        <dl className={classNames(st.specList, st.aboutSpecList)}>
          <div>
            <dt>{about.versionLabel}</dt>
            <dd className={classNames(st.versionValue, st.aboutVersionValue)}>
              <span onPointerUp={handleVersionTap}>
                {appVersion}
              </span>
              {isUpdateAvailable ? (
                <span className={classNames(st.updateAction, st.aboutUpdateAction)}>
                  {' ('}
                  <button className={'button button-link'} type={'button'} onClick={onRefreshUpdate}>
                    {about.updateAvailableAction}
                  </button>
                  {')'}
                </span>
              ) : null}
            </dd>
          </div>
          <div>
            <dt>{about.hostLabel}</dt>
            <dd>{runtimeHostname}</dd>
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

        <div className={classNames(st.copy, st.aboutCopy, 'stack')}>
          <p>{about.bodyIntro}</p>
          <p>{about.bodyPrivacy}</p>
          <p>{about.bodyAuthor}</p>
        </div>

        <div className={classNames(st.actions, st.aboutActions)}>
          <a className={'button button-primary'} href={'https://github.com/manix84/shopping-list'} rel={'noopener noreferrer'} target={'_blank'}>
            {about.sourceAction}
          </a>
          <a className={'button'} href={'https://github.com/sponsors/manix84'} rel={'noopener noreferrer'} target={'_blank'}>
            {about.sponsorAction}
          </a>
        </div>

        <p className={classNames(st.footnote, st.aboutFootnote)}>{about.sponsorFootnote}</p>
      </Card>
    </div>
  );
}
