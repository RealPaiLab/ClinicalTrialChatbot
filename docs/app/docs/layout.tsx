import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';

/* `links` is emptied here: the sidebar carries the documentation tree only. */
export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={source.getPageTree()} {...baseOptions()} links={[]}>
      {children}
    </DocsLayout>
  );
}
