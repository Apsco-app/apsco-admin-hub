// src/pages/auth/Login.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, GraduationCap, Users, FileCheck, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; 
import { supabase } from "@/lib/supabaseClient"; // ✅ FINAL FIX: Corrected import path
import apscoLogo from "@/assets/apsco-logo.png";
import googleIcon from "@/assets/google-icon.png";
import { Helmet } from "react-helmet-async";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"; 
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); 

    // Supabase Email/Password Sign In
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    
    setIsLoading(false);

    if (error) {
        toast({
            title: "Login Failed",
            description: error.message || "Invalid credentials or network error.",
            variant: "destructive",
        });
        return; 
    }
    
    // Successful login - AuthContext listener handles the session change
    navigate("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    // Supabase Google OAuth Sign In
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/dashboard`,
        },
    });

    // Since this is a redirect, we only handle the error before the redirect
    if (error) {
        setIsLoading(false);
        toast({
            title: "Google Sign-In Failed",
            description: error.message || "Could not start Google sign-in process.",
            variant: "destructive",
        });
    }
    // If no error, browser redirects to Google, then back to /dashboard
  };

  const features = [
    { icon: Users, label: "Manage Applicants" },
    { icon: FileCheck, label: "Verified Documents" },
    { icon: TrendingUp, label: "Analytics Dashboard" },
    { icon: GraduationCap, label: "Class Management" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Visual (BLUE PART RESTORED) */}
              <Helmet>
  <title>Login | APSCO</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Background, Floating Shapes, and Content (omitted for brevity) */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />


        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20">
          <div className="max-w-lg">
            <div className="flex items-center gap-4 mb-12">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <img src={apscoLogo} alt="APSCO" className="h-12 w-12 filter brightness-0 invert" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">APSCO</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              School Admissions <br/><span className="text-white/80">Made Simple</span>
            </h1>
            
            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Streamline your enrollment process with AI-powered document verification and real-time applicant tracking.
            </p>
            
            <div className="flex flex-wrap gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <feature.icon className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-medium text-white/90">{feature.label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-16 grid grid-cols-3 gap-8">
              <div><div className="text-3xl font-bold text-white">500+</div><div className="text-sm text-white/60">Schools</div></div>
              <div><div className="text-3xl font-bold text-white">50K+</div><div className="text-sm text-white/60">Applications</div></div>
              <div><div className="text-3xl font-bold text-white">98%</div><div className="text-sm text-white/60">Satisfaction</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 bg-background">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={apscoLogo} alt="APSCO" className="h-10 w-10" />
            <span className="text-2xl font-bold text-foreground">APSCO</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to manage your school admissions</p>
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 mb-6 text-base font-medium shadow-sm hover:shadow-md transition-shadow"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <img src={googleIcon} alt="Google" className="h-5 w-5 mr-3" />
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 text-base ${errors.email ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 text-base pr-12 ${errors.password ? "border-destructive" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-muted-foreground">
            New to APSCO?{" "}
            <Link to="/auth/register" className="text-primary font-semibold hover:underline">
              Register your school
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;