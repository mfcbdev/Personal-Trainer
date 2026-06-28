import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function OnboardingGuard() {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.onboarding_completed) return <Navigate to="/c/today" replace />;

  return <Outlet />;
}
