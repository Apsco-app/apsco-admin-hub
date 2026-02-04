// src/pages/auth/AuthCallback.tsx
// This page handles the OAuth callback flow.
// It waits for the session to be established, then redirects to the dashboard.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const { session, isLoading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If we have a session, redirect to dashboard
        if (session) {
            navigate('/dashboard', { replace: true });
            return;
        }

        // If loading is finished and we still don't have a session, something went wrong
        if (!isLoading && !session) {
            // Check for error in URL hash (Supabase Auth error format)
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const errorDesc = hashParams.get('error_description');

            if (errorDesc) {
                setError(decodeURIComponent(errorDesc));
            } else {
                // Give it a moment, then redirect to login if no session
                const timeout = setTimeout(() => {
                    setError('Authentication timed out. Please try again.');
                }, 5000);
                return () => clearTimeout(timeout);
            }
        }
    }, [session, isLoading, navigate]);

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-2">Authentication Failed</h1>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Verifying authentication...</p>
        </div>
    );
};

export default AuthCallback;
