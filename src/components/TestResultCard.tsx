import type { ReactNode } from 'react';
import { Badge } from './Badge';
import { useI18n } from '../lib/i18n';

type TestResultCardProps = {
  title: string;
  expected: ReactNode;
  actual: ReactNode;
  passed: boolean;
  tone?: 'default' | 'success' | 'danger' | 'muted';
  label?: string;
};

export function TestResultCard({ title, expected, actual, passed, tone, label }: TestResultCardProps) {
  const { messages } = useI18n();
  const badgeTone = tone ?? (passed ? 'success' : 'danger');
  const badgeLabel = label ?? (passed ? messages.pages.debug.pass : messages.pages.debug.fail);

  return (
    <div className={'test-card'}>
      <div className={'card-body'}>
        <div className={'item-row'}>
          <div>
            <div>
              <strong>{title}</strong>
            </div>
            <div className={'small-text'}>
              {messages.pages.debug.expected} {expected}
            </div>
            <div className={'small-text'}>
              {messages.pages.debug.got} {actual}
            </div>
          </div>
          <Badge tone={badgeTone}>{badgeLabel}</Badge>
        </div>
      </div>
    </div>
  );
}
