import type { ReactNode } from 'react';
import st from '../App.module.scss';
import { Card } from '../components/Card';
import { classNames } from '../lib/classNames';

export function DesignSystemStory({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className={classNames(st.shell, st.shoppingShell)} style={{ paddingBlock: 24 }}>
        {children}
      </div>
    </main>
  );
}

export function StorySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card header={<h2 className={'title title-sm'}>{title}</h2>} bodyClassName={'stack'}>
      {children}
    </Card>
  );
}
