import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';

export default function ProgramEditor() {
  const { id, pid } = useParams();

  return (
    <div>
      <PageHeader title="Programa" />
      <p className="text-sm text-zinc-500">
        Cliente: {id} {pid && `· Programa: ${pid}`}
      </p>
    </div>
  );
}
