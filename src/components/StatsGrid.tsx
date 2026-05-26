import { useI18n } from '../lib/i18n';
import { classNames } from '../lib/classNames';
import st from './StatsGrid.module.scss';

type StatsGridProps = {
  total: number;
  checkedTotal: number;
  progress: number;
};

export function StatsGrid({ total, checkedTotal, progress }: StatsGridProps) {
  const { messages } = useI18n();
  return (
    <div className={classNames(st.root, 'stats-grid')}>
      <div className={classNames(st.card, 'stat-card')}>
        <div className={classNames(st.label, 'stat-label')}>{messages.labels.items}</div>
        <div className={classNames(st.value, 'stat-value')}>{total}</div>
      </div>
      <div className={classNames(st.card, 'stat-card')}>
        <div className={classNames(st.label, 'stat-label')}>{messages.labels.done}</div>
        <div className={classNames(st.value, 'stat-value')}>{checkedTotal}</div>
      </div>
      <div className={classNames(st.card, 'stat-card')}>
        <div className={classNames(st.label, 'stat-label')}>{messages.labels.progress}</div>
        <div className={classNames(st.value, 'stat-value')}>{progress}%</div>
      </div>
    </div>
  );
}
