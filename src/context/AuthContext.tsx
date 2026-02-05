// src/context/AuthContext.tsx (FIXED: Removed UI logic to prevent crash)

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

// --- Types ---
interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

// --- Context ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider Component ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Helper to detect OAuth redirect flow
        const isOAuthRedirect = () => {
            const hasAccessToken = window.location.hash.includes('access_token');
            const hasCode = window.location.search.includes('code=');
            const isCallbackPath = window.location.pathname === '/auth/callback';
            return hasAccessToken || hasCode || isCallbackPath;
        };

        // 1. Initial Session Check
        const getInitialSession = async () => {
            console.log('AuthContext: Checking initial session...');
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("AuthContext: Error getting initial session:", error);
            }

            if (session) {
                console.log('AuthContext: Found existing session for:', session.user?.email);
                setSession(session);
                setUser(session.user);
                setIsLoading(false);
                return;
            }

            // If no session found yet, but we are in an OAuth redirect flow, 
            // wait for onAuthStateChange to handle the session.
            if (isOAuthRedirect()) {
                console.log("AuthContext: OAuth redirect detected, waiting for session establishment...");
                // AuthCallback will handle processing, but set a safety timeout
                setTimeout(() => {
                    console.log("AuthContext: Safety timeout reached");
                    setIsLoading(false);
                }, 10000); // Increased to 10 seconds to give more time
                return;
            }

            console.log('AuthContext: No session found, not in OAuth flow');
            setSession(null);
            setUser(null);
            setIsLoading(false);
        };

        getInitialSession();

        // 2. Listener for Auth State Changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                console.log('AuthContext: Auth state changed:', event, newSession?.user?.email);
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setIsLoading(false);
            }
        );

        // Cleanup the listener on unmount
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []); // Dependency array is empty

    const signOut = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();

        if (error) {
            setIsLoading(false); // Only stop loading on error
            console.error("Logout Failed:", error);
            throw error; // Throw error for the calling component to catch
        }

        // On success, redirect to clear all state. isLoading is not set to false.
        window.location.href = '/auth/login';
    };

    // Show a global loading indicator while the initial session is being fetched
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 mr-3 animate-spin text-primary" />
                <span className="text-xl text-muted-foreground">Loading application...</span>
            </div>
        );
    }

    const value: AuthContextType = { user, session, isLoading, signOut };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};