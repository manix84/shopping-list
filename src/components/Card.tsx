import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';

type CardProps = PropsWithChildren<ComponentPropsWithoutRef<'section'> & {
  header?: ReactNode;
  className?: string;
  bodyClassName?: string;
}>;

export function Card({ header, className = '', bodyClassName = '', children, ...sectionProps }: CardProps) {
  return (
    <section {...sectionProps} className={`card ${className}`.trim()}>
      {header ? <div className={'card-header'}>{header}</div> : null}
      {children ? <div className={`card-body ${bodyClassName}`.trim()}>{children}</div> : null}
    </section>
  );
}
