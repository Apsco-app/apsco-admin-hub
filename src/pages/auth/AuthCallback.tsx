import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            // Check for error parameters in the URL
            const params = new URLSearchParams(window.location.search);
            const errorDescription = params.get('error_description');

            if (errorDescription) {
                setError(errorDescription);
                setTimeout(() => navigate('/auth/login'), 3000);
                return;
            }

            // Verify session availability 
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Auth Callback Error:", sessionError);
                setError(sessionError.message);
                setTimeout(() => navigate('/auth/login'), 3000);
                return;
            }

            if (session) {
                // Successful login
                console.log("AuthCallback: Session found, redirecting to dashboard");
                navigate('/dashboard', { replace: true });
            } else {
                // Wait a moment for the session to be established by the Supabase client
                // (It processes the hash fragment automatically)
                const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                    if (event === 'SIGNED_IN' && session) {
                        navigate('/dashboard', { replace: true });
                    }
                });

                // Safety timeout - if no session after 5 seconds, back to login
                setTimeout(() => {
                    if (!error) { // Don't overwrite existing error
                        console.warn("AuthCallback: Timeout waiting for session");
                        navigate('/auth/login');
                    }
                }, 5000);

                return () => subscription.unsubscribe();
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
