import type { PropsWithChildren } from 'react';
import { classNames } from '../lib/classNames';
import st from './Badge.module.scss';

type BadgeProps = PropsWithChildren<{
  className?: string;
  tone?: 'default' | 'success' | 'danger' | 'muted';
}>;

export function Badge({ children, className, tone = 'default' }: BadgeProps) {
  return (
    <span
      className={classNames(
        st.root,
        'badge',
        tone !== 'default' ? st[tone] : undefined,
        tone !== 'default' ? `badge-${tone}` : undefined,
        className,
      )}
    >
      {children}
    </span>
  );
}
