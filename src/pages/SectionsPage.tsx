import type { CountryConfig } from '../types';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { classNames } from '../lib/classNames';
import { useI18n } from '../lib/i18n';
import st from './SectionsPage.module.scss';

type SectionsPageProps = {
  config: CountryConfig;
};

export function SectionsPage({ config }: SectionsPageProps) {
  const { messages } = useI18n();

  return (
    <Card
      header={
        <>
          <h2 className={'title title-md'}>{messages.pages.sections.title}</h2>
          <p className={'subtitle'}>{messages.pages.sections.subtitle}</p>
        </>
      }
      bodyClassName={'stack'}
    >
      <div className={'stack'}>
        {config.groups.map((group) => (
          <div key={group.key} className={classNames(st.card, 'section-card')}>
            <div className={classNames(st.heading, st.spacing, 'section-heading', 'section-spacing')}>
              <div className={'section-group'}>
                {messages.labels.routeOrder} {group.order}
              </div>
              <h3 className={classNames(st.title, 'section-title')}>{group.label}</h3>
            </div>
            <div className={'badge-row'}>
              {group.sections.map((section) => (
                <Badge key={section.key}>{section.label}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
