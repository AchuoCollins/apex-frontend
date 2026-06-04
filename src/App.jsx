import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider }    from './context/AuthContext';
import { MetricsProvider } from './context/MetricsContext';
import { ThemeProvider }   from './context/ThemeContext';
import AppLayout  from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';
import ScrollToTop from './components/shared/ScrollToTop';

/* Lazy-load all pages for code splitting */
const Landing          = lazy(() => import('./pages/Landing'));
const Login            = lazy(() => import('./pages/Login'));
const Register         = lazy(() => import('./pages/Register'));
const Dashboard        = lazy(() => import('./pages/Dashboard'));
const BodyMetrics      = lazy(() => import('./pages/BodyMetrics'));
const PhysiqueAnalysis = lazy(() => import('./pages/PhysiqueAnalysis'));
const TrainingPlan     = lazy(() => import('./pages/TrainingPlan'));
const Profile          = lazy(() => import('./pages/Profile'));
const Settings         = lazy(() => import('./pages/Settings'));
const NotFound         = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--color-bg)' }}>
      <div style={{ width:32, height:32, border:'3px solid var(--color-border)', borderTopColor:'var(--color-accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
} 

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MetricsProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <ScrollToTop />
              <Routes>
                <Route path="/"       element={<Landing />} />
                <Route element={<AuthLayout />}>
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/metrics"   element={<BodyMetrics />} />
                  <Route path="/analysis"  element={<PhysiqueAnalysis />} />
                  <Route path="/training"  element={<TrainingPlan />} />
                  <Route path="/profile"   element={<Profile />} />
                  <Route path="/settings"  element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </MetricsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
