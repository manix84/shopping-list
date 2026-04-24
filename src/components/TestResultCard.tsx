import type { ReactNode } from 'react';
import { Badge } from './Badge';

type TestResultCardProps = {
  title: string;
  expected: ReactNode;
  actual: ReactNode;
  passed: boolean;
  tone?: 'default' | 'success' | 'danger' | 'muted';
  label?: string;
};

export function TestResultCard({ title, expected, actual, passed, tone, label }: TestResultCardProps) {
  const badgeTone = tone ?? (passed ? 'success' : 'danger');
  const badgeLabel = label ?? (passed ? 'Pass' : 'Fail');

  return (
    <div className="test-card">
      <div className="card-body">
        <div className="item-row">
          <div>
            <div><strong>{title}</strong></div>
            <div className="small-text">expected {expected}</div>
            <div className="small-text">got {actual}</div>
          </div>
          <Badge tone={badgeTone}>{badgeLabel}</Badge>
        </div>
      </div>
    </div>
  );
}
