import { mdiAlertOctagonOutline, mdiBugOutline, mdiHomeOutline, mdiMapSearchOutline, mdiPencilOutline, mdiServerNetworkOff } from '@mdi/js';
import { Card } from '../components/Card';
import { classNames } from '../lib/classNames';
import { useI18n } from '../lib/i18n';
import st from './ErrorPage.module.scss';
import { p } from '../styles/primitives';

type ErrorPageVariant = 'not-found' | 'server-error';

type ErrorPageProps = {
  variant: ErrorPageVariant;
  isDebugMode: boolean;
  onBackToEdit: () => void;
  onOpenDebug: () => void;
};

const errorPageContent = {
  'not-found': {
    codeKey: 'notFoundCode',
    eyebrowKey: 'notFoundEyebrow',
    titleKey: 'notFoundTitle',
    subtitleKey: 'notFoundSubtitle',
    icon: mdiMapSearchOutline,
    accentIcon: mdiAlertOctagonOutline,
  },
  'server-error': {
    codeKey: 'serverCode',
    eyebrowKey: 'serverEyebrow',
    titleKey: 'serverTitle',
    subtitleKey: 'serverSubtitle',
    icon: mdiServerNetworkOff,
    accentIcon: mdiBugOutline,
  },
} satisfies Record<ErrorPageVariant, {
  accentIcon: string;
  codeKey: 'notFoundCode' | 'serverCode';
  eyebrowKey: 'notFoundEyebrow' | 'serverEyebrow';
  icon: string;
  subtitleKey: 'notFoundSubtitle' | 'serverSubtitle';
  titleKey: 'notFoundTitle' | 'serverTitle';
}>;

export function ErrorPage({ variant, isDebugMode, onBackToEdit, onOpenDebug }: ErrorPageProps) {
  const { messages } = useI18n();
  const content = errorPageContent[variant];
  const errorMessages = messages.pages.error;

  return (
    <Card className={classNames(st.card, st.errorCard)} bodyClassName={classNames(st.body, st.errorCardBody)} aria-labelledby={'error-title'}>
      <div className={classNames(st.visual, st.errorVisual)} aria-hidden={'true'}>
        <div className={classNames(st.map, st.errorMap)}>
          <div className={classNames(st.mapHeader, st.errorMapHeader)}>
            <span>{errorMessages[content.codeKey]}</span>
            <svg className={classNames(st.mapIcon, st.errorMapIcon)} viewBox={'0 0 24 24'}>
              <path d={content.accentIcon} fill={'currentColor'} />
            </svg>
          </div>
          <div className={classNames(st.mapRoute, st.errorMapRoute)}>
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className={classNames(
                  st.mapStop,
                  st.errorMapStop,
                  index === 2 ? st.lostStop : undefined,
                  index === 2 ? st.errorMapStopLost : undefined,
                )}
              />
            ))}
          </div>
        </div>
        <div className={classNames(st.iconBadge, st.errorIconBadge)}>
          <svg viewBox={'0 0 24 24'}>
            <path d={content.icon} fill={'currentColor'} />
          </svg>
        </div>
      </div>

      <div className={classNames(st.copy, st.errorCopy)}>
        <p className={p.sectionGroup}>{errorMessages[content.eyebrowKey]}</p>
        <h2 id={'error-title'} className={p.title}>{errorMessages[content.titleKey]}</h2>
        <p className={p.subtitle}>{errorMessages[content.subtitleKey]}</p>
      </div>

      <div className={classNames(st.actions, st.errorActions)}>
        <button type={'button'} className={p.buttonPrimary} onClick={onBackToEdit}>
          <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
            <path d={variant === 'not-found' ? mdiHomeOutline : mdiPencilOutline} fill={'currentColor'} />
          </svg>
          {messages.actions.backToEdit}
        </button>
        {isDebugMode ? (
          <button type={'button'} className={p.button} onClick={onOpenDebug}>
            <svg aria-hidden={'true'} className={p.buttonIconSvg} viewBox={'0 0 24 24'}>
              <path d={mdiBugOutline} fill={'currentColor'} />
            </svg>
            {messages.actions.openDebugTools}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
