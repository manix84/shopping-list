import type { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';
import { classNames } from '../lib/classNames';
import st from './Card.module.scss';

type CardProps = PropsWithChildren<ComponentPropsWithoutRef<'section'> & {
  header?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}>;

export function Card({ header, className = '', headerClassName = '', bodyClassName = '', children, ...sectionProps }: CardProps) {
  return (
    <section {...sectionProps} className={classNames(st.root, st.card, className)}>
      {header ? <div className={classNames(st.header, st.cardHeader, headerClassName)}>{header}</div> : null}
      {children ? <div className={classNames(st.body, st.cardBody, bodyClassName)}>{children}</div> : null}
    </section>
  );
}
