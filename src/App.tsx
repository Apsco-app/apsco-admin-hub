import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthCallback from "./pages/auth/AuthCallback";
// DashboardLayout lives in src/components; use a correct relative path
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import CreateSchool from "./pages/dashboard/CreateSchool";
import Applicants from "./pages/dashboard/Applicants";
import ApplicantDetail from "./pages/dashboard/ApplicantDetail";
import Classes from "./pages/dashboard/Classes";
import AdmissionsSettings from "./pages/dashboard/AdmissionsSettings";
import Analytics from "./pages/dashboard/Analytics";
import Payments from "./pages/dashboard/Payments";
import Settings from "./pages/dashboard/Settings";
import PendingVerification from "./pages/dashboard/PendingVerification";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";


const queryClient = new QueryClient();

const App = () => (
  // 🚨 CRITICAL FIX: AuthProvider MUST be the outermost functional context
  // This ensures the useAuth hook works everywhere.
  <AuthProvider>
    {/* All other contexts and providers that may be required by AuthProvider's children */}
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthStateListener />
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="create-school" element={<CreateSchool />} />
              <Route path="pending-approval" element={<PendingVerification />} />
              <Route path="applicants" element={<Applicants />} />
              <Route path="applicants/:id" element={<ApplicantDetail />} />
              <Route path="classes" element={<Classes />} />
              <Route path="admissions-settings" element={<AdmissionsSettings />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="payments" element={<Payments />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

function AuthStateListener() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If we have a session, and we're at the root or login page, redirect to dashboard
    if (session) {
      const path = location.pathname;
      if (path === '/' || path === '/auth/login' || path === '/auth/register') {
        navigate('/dashboard');
      }
    }
  }, [session, navigate, location]);

  return null;
}

export default App;