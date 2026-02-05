// src/pages/auth/Register.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Shield, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast"; // <-- NOW AVAILABLE
import { supabase } from "@/lib/supabase"; // <-- NOW AVAILABLE
import apscoLogo from "@/assets/apsco-logo.png";
import googleIcon from "@/assets/google-icon.png";
import { Helmet } from "react-helmet-async";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "School name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    // Supabase Email/Password Sign Up
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          // Store the school name as user metadata for initial setup
          school_name: formData.schoolName
        }
      }
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during sign up.",
        variant: "destructive",
      });
      return;
    }

    // Successful Sign Up
    if (data.user) {
      // User logged in directly after sign up (default Supabase behavior)
      toast({
        title: "Registration Successful",
        description: "Account created! Please complete your school setup.",
      });
      navigate("/dashboard/create-school");
    } else if (data.session === null) {
      // Email confirmation is required (if configured in Supabase settings)
      toast({
        title: "Confirmation Required",
        description: "A confirmation link has been sent to your email. Please verify your account before logging in.",
      });
      navigate("/auth/login");
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);

    // Store intended destination for after OAuth callback
    // This allows AuthCallback to redirect new users to create-school
    localStorage.setItem('auth_redirect_to', '/dashboard/create-school');

    // Supabase Google OAuth Sign Up/In
    // CRITICAL FIX: Always redirect through /auth/callback for proper token processing
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setIsLoading(false);
      localStorage.removeItem('auth_redirect_to');
      toast({
        title: "Google Sign-Up Failed",
        description: error.message || "Could not start Google sign-up process.",
        variant: "destructive",
      });
    }
    // If successful, the redirect handles the rest.
  };

  const benefits = [
    { icon: Shield, title: "Verified Documents", desc: "AI-powered verification of student records" },
    { icon: Clock, title: "Save Time", desc: "Reduce manual data entry by 80%" },
    { icon: Sparkles, title: "Smart Insights", desc: "Analytics to optimize your admissions" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Visual (omitted for brevity) */}
      <Helmet>
        <title>Register School | APSCO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="hidden lg:flex flex-1 relative overflow-hidden">
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
              Transform Your <br /><span className="text-white/80">Admissions Process</span>
            </h1>

            <p className="text-lg text-white/70 mb-12 leading-relaxed">
              Join hundreds of schools across Uganda using APSCO to modernize their student enrollment.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <benefit.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{benefit.title}</h3>
                    <p className="text-sm text-white/70">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 bg-background">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={apscoLogo} alt="APSCO" className="h-10 w-10" />
            <span className="text-2xl font-bold text-foreground">APSCO</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">Register your school to get started</p>
          </div>

          {/* Google Sign Up */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 mb-6 text-base font-medium shadow-sm hover:shadow-md transition-shadow"
            onClick={handleGoogleSignUp}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-sm font-medium">School Name</Label>
              <Input
                id="schoolName"
                name="schoolName"
                type="text"
                placeholder="St. Mary's Secondary School"
                value={formData.schoolName}
                onChange={handleChange}
                className={`h-12 text-base ${errors.schoolName ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {errors.schoolName && (
                <p className="text-sm text-destructive">{errors.schoolName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@school.edu"
                value={formData.email}
                onChange={handleChange}
                className={`h-12 text-base ${errors.email ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`h-12 text-base ${errors.confirmPassword ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;