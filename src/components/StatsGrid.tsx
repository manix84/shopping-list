import { useI18n } from '../lib/i18n';

type StatsGridProps = {
  total: number;
  checkedTotal: number;
  progress: number;
};

export function StatsGrid({ total, checkedTotal, progress }: StatsGridProps) {
  const { messages } = useI18n();
  return (
    <div className={'stats-grid'}>
      <div className={'stat-card'}>
        <div className={'stat-label'}>{messages.labels.items}</div>
        <div className={'stat-value'}>{total}</div>
      </div>
      <div className={'stat-card'}>
        <div className={'stat-label'}>{messages.labels.done}</div>
        <div className={'stat-value'}>{checkedTotal}</div>
      </div>
      <div className={'stat-card'}>
        <div className={'stat-label'}>{messages.labels.progress}</div>
        <div className={'stat-value'}>{progress}%</div>
      </div>
    </div>
  );
}
