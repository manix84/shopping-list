import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';
import { classNames } from '../lib/classNames';
import st from './Card.module.scss';

type CardProps = PropsWithChildren<ComponentPropsWithoutRef<'section'> & {
  header?: ReactNode;
  className?: string;
  bodyClassName?: string;
}>;

export function Card({ header, className = '', bodyClassName = '', children, ...sectionProps }: CardProps) {
  return (
    <section {...sectionProps} className={classNames(st.root, 'card', className)}>
      {header ? <div className={classNames(st.header, 'card-header')}>{header}</div> : null}
      {children ? <div className={classNames(st.body, 'card-body', bodyClassName)}>{children}</div> : null}
    </section>
  );
}
