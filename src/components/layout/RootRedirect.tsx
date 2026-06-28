import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function RootRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role === 'trainer') return <Navigate to="/t/dashboard" replace />;
  if (profile?.role === 'client') {
    return profile.onboarding_completed
      ? <Navigate to="/c/today" replace />
      : <Navigate to="/onboarding" replace />;
  }

  return null;
}
