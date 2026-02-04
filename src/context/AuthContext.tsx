// src/context/AuthContext.tsx (FIXED: Removed UI logic to prevent crash)

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode
} from 'react';
import { supabase } from '@/lib/supabaseClient';
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
        // 1. Initial Session Check
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Error getting initial session:", error);
            }

            if (session) {
                setSession(session);
                setUser(session.user);
                setIsLoading(false);
                return;
            }

            // If no session found yet, but we are in an OAuth redirect flow, 
            // wait for onAuthStateChange to handle the session.
            const isRedirect = window.location.hash.includes('access_token') ||
                window.location.search.includes('code=');

            if (isRedirect) {
                console.log("AuthContext: Redirect detected, waiting for session...");
                // Set a safety timeout in case auth fails silently
                setTimeout(() => setIsLoading(false), 5000);
                return;
            }

            setSession(null);
            setUser(null);
            setIsLoading(false);
        };

        getInitialSession();

        // 2. Listener for Auth State Changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setIsLoading(false);
            }
        );

        // Cleanup the listener on unmount
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []); // Dependency array is now empty

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