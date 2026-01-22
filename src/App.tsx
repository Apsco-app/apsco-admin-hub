import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
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
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";


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
          <Routes>
            {/* Home Page */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="create-school" element={<CreateSchool />} />
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

export default App;