import { Card } from '../components/Card';
import { useI18n } from '../lib/i18n';
import { appVersion } from '../version';

const logoHref = `${import.meta.env.BASE_URL}logo-animated-loop.svg`;
const avatarHref = `${import.meta.env.BASE_URL}rob-avatar.png`;

export function AboutPage() {
  const { messages } = useI18n();
  const about = messages.pages.about;

  return (
    <div className="about-page">
      <Card className="about-card" bodyClassName="about-card-body" aria-labelledby="about-title">
        <div className="about-hero">
          <div className="about-logo-lockup">
            <img className="about-app-logo" src={logoHref} alt="" width="180" height="180" />
            <a
              className="about-avatar-link"
              href="https://github.com/manix84"
              rel="noopener noreferrer"
              target="_blank"
              aria-label={about.authorProfileLabel}
            >
              <img className="about-avatar-badge" src={avatarHref} alt="" width="64" height="64" />
            </a>
          </div>

          <div className="about-heading">
            <h2 id="about-title" className="title title-md">{messages.app.title}</h2>
            <p className="subtitle">{about.tagline}</p>
          </div>
        </div>

        <dl className="about-spec-list">
          <div>
            <dt>{about.versionLabel}</dt>
            <dd>{appVersion}</dd>
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

        <div className="about-copy stack">
          <p>{about.bodyIntro}</p>
          <p>{about.bodyPrivacy}</p>
          <p>{about.bodyAuthor}</p>
        </div>

        <div className="about-actions">
          <a className="button button-primary" href="https://github.com/manix84/shopping-list" rel="noopener noreferrer" target="_blank">
            {about.sourceAction}
          </a>
          <a className="button" href="https://github.com/sponsors/manix84" rel="noopener noreferrer" target="_blank">
            {about.sponsorAction}
          </a>
        </div>

        <p className="about-footnote">{about.sponsorFootnote}</p>
      </Card>
    </div>
  );
}
