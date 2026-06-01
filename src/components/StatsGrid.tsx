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
    <div className={classNames(st.root, st.statsGrid)}>
      <div className={classNames(st.card, st.statCard)}>
        <div className={classNames(st.label, st.statLabel)}>{messages.labels.items}</div>
        <div className={classNames(st.value, st.statValue)}>{total}</div>
      </div>
      <div className={classNames(st.card, st.statCard)}>
        <div className={classNames(st.label, st.statLabel)}>{messages.labels.done}</div>
        <div className={classNames(st.value, st.statValue)}>{checkedTotal}</div>
      </div>
      <div className={classNames(st.card, st.statCard)}>
        <div className={classNames(st.label, st.statLabel)}>{messages.labels.progress}</div>
        <div className={classNames(st.value, st.statValue)}>{progress}%</div>
      </div>
    </div>
  );
}
