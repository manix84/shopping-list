import type { CountryConfig } from '../types';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

type SectionsPageProps = {
  config: CountryConfig;
};

export function SectionsPage({ config }: SectionsPageProps) {
  return (
    <Card
      header={
        <>
          <h2 className="title title-md">Sections</h2>
          <p className="subtitle">Read-only store grouping reference for the selected country profile.</p>
        </>
      }
      bodyClassName="stack"
    >
      <div className="stack">
        {config.groups.map((group) => (
          <div key={group.key} className="section-card">
            <div className="section-heading section-spacing">
              <div className="section-group">Route order {group.order}</div>
              <h3 className="section-title">{group.label}</h3>
            </div>
            <div className="badge-row">
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
