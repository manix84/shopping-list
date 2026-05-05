import { mdiAlertOctagonOutline, mdiBugOutline, mdiHomeOutline, mdiMapSearchOutline, mdiPencilOutline, mdiServerNetworkOff } from '@mdi/js';
import { Card } from '../components/Card';
import { useI18n } from '../lib/i18n';

type ErrorPageVariant = 'not-found' | 'server-error';

type ErrorPageProps = {
  variant: ErrorPageVariant;
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
    shelves: ['Produce', 'Bakery', 'Pantry', 'Frozen', 'Checkout'],
  },
  'server-error': {
    codeKey: 'serverCode',
    eyebrowKey: 'serverEyebrow',
    titleKey: 'serverTitle',
    subtitleKey: 'serverSubtitle',
    icon: mdiServerNetworkOff,
    accentIcon: mdiBugOutline,
    shelves: ['Request', 'API', 'Database', 'Sync', 'Retry'],
  },
} satisfies Record<ErrorPageVariant, {
  accentIcon: string;
  codeKey: 'notFoundCode' | 'serverCode';
  eyebrowKey: 'notFoundEyebrow' | 'serverEyebrow';
  icon: string;
  shelves: string[];
  subtitleKey: 'notFoundSubtitle' | 'serverSubtitle';
  titleKey: 'notFoundTitle' | 'serverTitle';
}>;

export function ErrorPage({ variant, onBackToEdit, onOpenDebug }: ErrorPageProps) {
  const { messages } = useI18n();
  const content = errorPageContent[variant];
  const errorMessages = messages.pages.error;

  return (
    <Card className={'error-card'} bodyClassName={'error-card-body'} aria-labelledby={'error-title'}>
      <div className={'error-visual'} aria-hidden={'true'}>
        <div className={'error-map'}>
          <div className={'error-map-header'}>
            <span>{errorMessages[content.codeKey]}</span>
            <svg className={'error-map-icon'} viewBox={'0 0 24 24'}>
              <path d={content.accentIcon} fill={'currentColor'} />
            </svg>
          </div>
          <div className={'error-map-route'}>
            {content.shelves.map((shelf, index) => (
              <div key={shelf} className={`error-map-stop ${index === 2 ? 'error-map-stop-lost' : ''}`}>
                <span>{shelf}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={'error-icon-badge'}>
          <svg viewBox={'0 0 24 24'}>
            <path d={content.icon} fill={'currentColor'} />
          </svg>
        </div>
      </div>

      <div className={'error-copy'}>
        <p className={'section-group'}>{errorMessages[content.eyebrowKey]}</p>
        <h2 id={'error-title'} className={'title'}>{errorMessages[content.titleKey]}</h2>
        <p className={'subtitle'}>{errorMessages[content.subtitleKey]}</p>
      </div>

      <div className={'error-actions'}>
        <button type={'button'} className={'button button-primary'} onClick={onBackToEdit}>
          <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
            <path d={variant === 'not-found' ? mdiHomeOutline : mdiPencilOutline} fill={'currentColor'} />
          </svg>
          {messages.actions.backToEdit}
        </button>
        <button type={'button'} className={'button'} onClick={onOpenDebug}>
          <svg aria-hidden={'true'} className={'button-icon-svg'} viewBox={'0 0 24 24'}>
            <path d={mdiBugOutline} fill={'currentColor'} />
          </svg>
          {messages.actions.openDebugTools}
        </button>
      </div>
    </Card>
  );
}
