import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';

export default function SessionPage() {
  const { id } = useParams();

  return (
    <div>
      <PageHeader title="Sesión" />
      <p className="text-sm text-zinc-500">Sesión: {id}</p>
    </div>
  );
}
