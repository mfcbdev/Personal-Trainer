import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { TrainerGuard } from './components/layout/TrainerGuard';
import { ClientGuard } from './components/layout/ClientGuard';
import { OnboardingGuard } from './components/layout/OnboardingGuard';
import { GuestOnly } from './components/layout/GuestOnly';
import { TrainerShell } from './components/layout/TrainerShell';
import { ClientShell } from './components/layout/ClientShell';
import { RootRedirect } from './components/layout/RootRedirect';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import InvitePage from './pages/auth/InvitePage';
import OnboardingFlow from './pages/onboarding/OnboardingFlow';

import Dashboard from './pages/trainer/Dashboard';
import ClientList from './pages/trainer/ClientList';
import ClientDetail from './pages/trainer/ClientDetail';
import ProgramEditor from './pages/trainer/ProgramEditor';
import SessionEditor from './pages/trainer/SessionEditor';
import ExerciseLibrary from './pages/trainer/ExerciseLibrary';
import TrainerSettings from './pages/trainer/TrainerSettings';

import TodayPage from './pages/client/TodayPage';
import CalendarPage from './pages/client/CalendarPage';
import SessionPage from './pages/client/SessionPage';
import ProgressPage from './pages/client/ProgressPage';
import ProfilePage from './pages/client/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            <Route element={<GuestOnly />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/invite/:token" element={<InvitePage />} />
            </Route>

            <Route element={<OnboardingGuard />}>
              <Route path="/onboarding" element={<OnboardingFlow />} />
            </Route>

            <Route path="/t" element={<TrainerGuard />}>
              <Route element={<TrainerShell />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<ClientList />} />
                <Route path="clients/:id" element={<ClientDetail />} />
                <Route path="clients/:id/program/:pid" element={<ProgramEditor />} />
                <Route path="clients/:id/program/:pid/session/:sid" element={<SessionEditor />} />
                <Route path="exercises" element={<ExerciseLibrary />} />
                <Route path="settings" element={<TrainerSettings />} />
              </Route>
            </Route>

            <Route path="/c" element={<ClientGuard />}>
              <Route element={<ClientShell />}>
                <Route path="today" element={<TodayPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="session/:id" element={<SessionPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
