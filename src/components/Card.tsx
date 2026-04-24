import type { PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<{
  header?: ReactNode;
  className?: string;
  bodyClassName?: string;
}>;

export function Card({ header, className = '', bodyClassName = '', children }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {header ? <div className="card-header">{header}</div> : null}
      {children ? <div className={`card-body ${bodyClassName}`.trim()}>{children}</div> : null}
    </section>
  );
}
