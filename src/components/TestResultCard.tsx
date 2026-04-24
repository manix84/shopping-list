import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { useI18n } from '../lib/i18n';

type TestResultCardProps = {
  title: string;
  expected: ReactNode;
  actual: ReactNode;
  passed: boolean;
};

export function TestResultCard({ title, expected, actual, passed }: TestResultCardProps) {
  const { messages } = useI18n();
  return (
    <div className="test-card">
      <div className="card-body">
        <div className="item-row">
          <div>
            <div><strong>{title}</strong></div>
            <div className="small-text">
              {messages.pages.debug.expected} {expected}
            </div>
            <div className="small-text">
              {messages.pages.debug.got} {actual}
            </div>
          </div>
          <Badge tone={passed ? 'success' : 'danger'}>{passed ? messages.pages.debug.pass : messages.pages.debug.fail}</Badge>
        </div>
      </div>
    </div>
  );
}
