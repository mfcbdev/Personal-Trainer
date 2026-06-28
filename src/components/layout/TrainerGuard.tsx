import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function TrainerGuard() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profile && profile.role !== 'trainer') return <Navigate to="/login" replace />;

  return <Outlet />;
}
