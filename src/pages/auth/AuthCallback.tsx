import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            console.log("AuthCallback: Component mounted. Hash:", window.location.hash, "Search:", window.location.search);

            // Check for error parameters in the URL
            const params = new URLSearchParams(window.location.search);
            const errorDescription = params.get('error_description');

            if (errorDescription) {
                console.error("AuthCallback: OAuth error detected:", errorDescription);
                setError(errorDescription);
                setTimeout(() => navigate('/auth/login'), 3000);
                return;
            }

            // Verify session availability 
            console.log("AuthCallback: Calling getSession...");
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("AuthCallback: getSession error:", sessionError);
                setError(sessionError.message);
                setTimeout(() => navigate('/auth/login'), 3000);
                return;
            }

            console.log("AuthCallback: getSession session exists?", !!session);

            if (session) {
                // Successful login
                console.log("AuthCallback: Session FOUND, redirecting to dashboard");
                navigate('/dashboard', { replace: true });
            } else {
                console.log("AuthCallback: No session in getSession. Setting up onAuthStateChange listener.");
                // Wait a moment for the session to be established by the Supabase client
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    console.log("AuthCallback: onAuthStateChange event received:", event, "session?", !!session);
                    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
                        console.log("AuthCallback: Handshake complete, redirecting to dashboard");
                        navigate('/dashboard', { replace: true });
                    }
                });

                // Safety timeout - if no session after 10 seconds, back to login
                setTimeout(() => {
                    if (!error) {
                        console.warn("AuthCallback: Timeout waiting for session. Redirecting to login.");
                        navigate('/auth/login');
                    }
                }, 10000);

                return () => {
                    console.log("AuthCallback: Cleaning up onAuthStateChange listener");
                    subscription.unsubscribe();
                };
            }
        };

        handleAuthCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-background p-4 text-center">
                <div className="text-red-500 text-xl font-semibold mb-2">Authentication Failed</div>
                <p className="text-muted-foreground mb-4">{error}</p>
                <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-10 w-10 mb-4 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Verifying authentication...</h2>
            <p className="text-muted-foreground">Please wait while we log you in.</p>
        </div>
    );
};

export default AuthCallback;
