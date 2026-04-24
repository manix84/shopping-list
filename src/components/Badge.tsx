import type { PropsWithChildren } from 'react';

type BadgeProps = PropsWithChildren<{
  className?: string;
  tone?: 'default' | 'success' | 'danger' | 'muted';
}>;

export function Badge({ children, className, tone = 'default' }: BadgeProps) {
  const toneClassName = tone === 'default' ? 'badge' : `badge badge-${tone}`;
  return <span className={className ? `${toneClassName} ${className}` : toneClassName}>{children}</span>;
}
