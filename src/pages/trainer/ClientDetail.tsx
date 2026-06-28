import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';

export default function ClientDetail() {
  const { id } = useParams();

  return (
    <div>
      <PageHeader title="Detalle de cliente" />
      <p className="text-sm text-zinc-500">Cliente: {id}</p>
    </div>
  );
}
