import type { ReactNode } from 'react';

export function DesignSystemStory({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className={'shopping-shell'} style={{ paddingBlock: 24 }}>
        {children}
      </div>
    </main>
  );
}

export function StorySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={'card'}>
      <div className={'card-header'}>
        <h2 className={'title title-sm'}>{title}</h2>
      </div>
      <div className={'card-body stack'}>{children}</div>
    </section>
  );
}
