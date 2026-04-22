import type { PropsWithChildren } from 'react';

type BadgeProps = PropsWithChildren<{
  tone?: 'default' | 'success' | 'danger';
}>;

export function Badge({ children, tone = 'default' }: BadgeProps) {
  const className = tone === 'default' ? 'badge' : `badge badge-${tone}`;
  return <span className={className}>{children}</span>;
}
