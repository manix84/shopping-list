type StatsGridProps = {
  total: number;
  checkedTotal: number;
  progress: number;
};

export function StatsGrid({ total, checkedTotal, progress }: StatsGridProps) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Items</div>
        <div className="stat-value">{total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Done</div>
        <div className="stat-value">{checkedTotal}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Progress</div>
        <div className="stat-value">{progress}%</div>
      </div>
    </div>
  );
}
