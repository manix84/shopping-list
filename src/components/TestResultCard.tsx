import type { ReactNode } from 'react';
import { Badge } from './Badge';

type TestResultCardProps = {
  title: string;
  expected: ReactNode;
  actual: ReactNode;
  passed: boolean;
};

export function TestResultCard({ title, expected, actual, passed }: TestResultCardProps) {
  return (
    <div className="test-card">
      <div className="card-body">
        <div className="item-row">
          <div>
            <div><strong>{title}</strong></div>
            <div className="small-text">expected {expected}</div>
            <div className="small-text">got {actual}</div>
          </div>
          <Badge tone={passed ? 'success' : 'danger'}>{passed ? 'Pass' : 'Fail'}</Badge>
        </div>
      </div>
    </div>
  );
}
