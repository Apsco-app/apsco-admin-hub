// src/components/layout/DashboardLayout.tsx 

import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, CheckCircle2, AlertTriangle, Home, Users, BookOpen, UserCheck, BarChart, Settings, Wrench, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/context/AuthContext';
import { useSchoolData } from '@/hooks/useSchoolData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import apscoLogo from '@/assets/apsco-logo.png';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const { signOut, user, isLoading: isAuthLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            // On success, the signOut function from context handles the redirect.
        } catch (error: any) {
            // On failure, now we can safely show a toast.
            toast({
                title: "Logout Failed",
                description: error.message || "An unexpected error occurred during logout.",
                variant: "destructive",
            });
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 mr-3 animate-spin text-primary" />
                <span className="text-xl text-muted-foreground">Loading application data...</span>
            </div>
        );
    }

    const {
        schoolId,
        schoolName,
        schoolStatus,
        isLoading: isSchoolLoading
    } = useSchoolData() as any;
    console.log("DashboardLayout - schoolId:", schoolId, "isSchoolLoading:", isSchoolLoading);

    // Add reliable redirect logic for new users
    useEffect(() => {
        if (!isSchoolLoading && !schoolId &&
            location.pathname !== '/dashboard/create-school' &&
            location.pathname !== '/dashboard/pending-approval') {
            navigate('/dashboard/create-school', { replace: true });
        }
    }, [isSchoolLoading, schoolId, location.pathname, navigate]);

    // Protect the dashboard: Redirect to home if no session
    // We rely on useAuth() to handle the loading state first (above).
    // If we passed the loading check and still have no user, redirect.
    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate('/');
        }
    }, [isAuthLoading, user, navigate]);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home, requiredStatus: null },
        { name: 'Applicants', path: '/dashboard/applicants', icon: Users, requiredStatus: 'verified' },
        { name: 'Classes', path: '/dashboard/classes', icon: BookOpen, requiredStatus: 'verified' },
        { name: 'Admissions', path: '/dashboard/admissions-settings', icon: UserCheck, requiredStatus: 'verified' },
        { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart, requiredStatus: 'verified' },
        { name: 'Settings', path: '/dashboard/settings', icon: Settings, requiredStatus: 'verified' },
    ];

    const currentSchoolName = schoolName || "School Admin";
    const currentSchoolStatus = schoolStatus || "loading";

    let statusText = '';
    let statusColor = '';
    const isVerified = currentSchoolStatus === 'verified';

    if (isSchoolLoading) {
        statusText = 'Loading...';
        statusColor = 'bg-gray-500 animate-pulse';
    } else if (!schoolId) {
        statusText = 'Setup Required';
        statusColor = 'bg-red-500';
    } else if (currentSchoolStatus === 'pending') {
        statusText = 'Verification Pending';
        statusColor = 'bg-yellow-500';
    } else if (isVerified) {
        statusText = 'Verified';
        statusColor = 'bg-green-600';
    } else {
        statusText = 'Error';
        statusColor = 'bg-red-500';
    }

    const SidebarContent = (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 flex items-center justify-between h-16 border-b">
                <div className="flex items-center space-x-2">
                    <img src={apscoLogo} alt="APSCO Logo" className="h-7 w-7" />
                    <div className="text-xl font-bold text-primary">APSCO</div>
                </div>
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <nav className="flex-grow p-4 space-y-2">
                {navItems.map((item) => {
                    const requiresVerification = item.requiredStatus === 'verified';
                    const isDisabled = requiresVerification && !isVerified && !!schoolId;

                    return (
                        <TooltipProvider key={item.path}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                                        className="w-full justify-start"
                                        onClick={() => navigate(item.path)}
                                        disabled={isDisabled}
                                    >
                                        <item.icon className="h-4 w-4 mr-3" />
                                        {item.name}
                                    </Button>
                                </TooltipTrigger>
                                {isDisabled && (
                                    <TooltipContent>
                                        <p>Verification required to access.</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
            </nav>

            <div className="p-4 border-t flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Admin" />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                            {user?.email?.[0]?.toUpperCase() || 'AD'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold">Admin</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 text-red-500" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Logout</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className="hidden lg:flex w-64 flex-shrink-0 border-r">
                {SidebarContent}
            </aside>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden bg-black/50"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div className="absolute left-0 top-0 h-full w-64 bg-white" onClick={(e) => e.stopPropagation()}>
                        {SidebarContent}
                    </div>
                </div>
            )}

            <div className="flex flex-col flex-1 overflow-y-auto">
                <header className="h-16 flex items-center justify-between px-4 border-b bg-white flex-shrink-0">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6" />
                        </Button>
                        <h1 className="text-lg font-semibold flex items-center">
                            {currentSchoolName}
                            <span
                                className={`ml-3 px-2.5 py-0.5 text-xs font-medium rounded-full text-white ${statusColor}`}
                            >
                                {statusText}
                            </span>
                        </h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        {isVerified ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>School Verified</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Verification Pending / Setup Required</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Admin" />
                            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                                {user?.email?.[0]?.toUpperCase() || 'AD'}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {(!schoolId && !isSchoolLoading) &&
                        location.pathname !== '/dashboard/create-school' &&
                        location.pathname !== '/dashboard/pending-approval' ? (
                        <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                            <Wrench className="h-16 w-16 text-primary mb-4 animate-bounce" />
                            <h2 className="text-2xl font-bold mb-2">Setup Your School Profile</h2>
                            <p className="text-muted-foreground mb-6">Redirecting you to the creation page...</p>
                            <Button onClick={() => navigate('/dashboard/create-school')}>Go to Setup</Button>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
