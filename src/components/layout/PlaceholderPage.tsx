import { PageHeader } from './PageHeader';

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <p className="text-sm text-zinc-500">Próximamente.</p>
    </div>
  );
}
