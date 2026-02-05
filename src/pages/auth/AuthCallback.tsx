// src/pages/auth/AuthCallback.tsx
// This page handles the OAuth callback flow.
// It actively processes the OAuth tokens and redirects to the appropriate page.

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState('Processing authentication...');
    const processedRef = useRef(false);

    useEffect(() => {
        // Prevent double-processing in React strict mode
        if (processedRef.current) return;
        processedRef.current = true;

        const handleCallback = async () => {
            try {
                console.log('AuthCallback: Processing OAuth callback...');
                console.log('AuthCallback: Current URL:', window.location.href);

                // Check for error in URL hash first
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const errorDesc = hashParams.get('error_description');
                if (errorDesc) {
                    setError(decodeURIComponent(errorDesc));
                    return;
                }

                // Check for PKCE code in query params (Supabase PKCE flow)
                const urlParams = new URLSearchParams(window.location.search);
                const code = urlParams.get('code');

                if (code) {
                    console.log('AuthCallback: Found auth code, exchanging for session...');
                    setStatus('Exchanging authentication code...');

                    // Exchange the code for a session
                    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) {
                        console.error('AuthCallback: Code exchange failed:', exchangeError);
                        setError(exchangeError.message);
                        return;
                    }

                    if (data.session) {
                        console.log('AuthCallback: Session established via code exchange');
                        redirectToDestination();
                        return;
                    }
                }

                // If no code, check if tokens are in hash (implicit flow) or session already exists
                setStatus('Verifying session...');

                // Poll for session establishment (Supabase onAuthStateChange might need time)
                let attempts = 0;
                const maxAttempts = 20; // 10 seconds total

                const pollForSession = async () => {
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session) {
                        console.log('AuthCallback: Session found!', session.user?.email);
                        redirectToDestination();
                        return;
                    }

                    attempts++;
                    if (attempts < maxAttempts) {
                        setStatus(`Waiting for session... (${attempts}/${maxAttempts})`);
                        setTimeout(pollForSession, 500);
                    } else {
                        console.error('AuthCallback: Session timeout after', attempts, 'attempts');
                        setError('Authentication timed out. Please try again.');
                    }
                };

                pollForSession();

            } catch (err: any) {
                console.error('AuthCallback: Unexpected error:', err);
                setError(err.message || 'An unexpected error occurred');
            }
        };

        const redirectToDestination = () => {
            // Check for stored redirect destination (e.g., from Register page)
            const storedRedirect = localStorage.getItem('auth_redirect_to');
            localStorage.removeItem('auth_redirect_to');

            const destination = storedRedirect || '/dashboard';
            console.log('AuthCallback: Redirecting to:', destination);

            // Use replace to prevent back-button issues
            navigate(destination, { replace: true });
        };

        handleCallback();
    }, [navigate]);

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
            <p className="text-lg text-muted-foreground">{status}</p>
        </div>
    );
};

export default AuthCallback;
