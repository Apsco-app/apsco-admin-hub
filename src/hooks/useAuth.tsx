// src/context/AuthContext.tsx (or src/hooks/useAuth.tsx)
// Final Fix: Ensures 'logout' property exists and is implemented

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

// 1. Define the correct type for the context
interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>; // 🚨 CRITICAL FIX: The missing logout function definition
}

// 2. Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. The Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch the initial session and user data
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Supabase session error:", error);
            }
            
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        };
        
        getInitialSession();

        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, currentSession) => {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Function to handle login (placeholder, assuming login is done elsewhere)
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error('Login error:', error.message);
        }
        // AuthStateChange listener handles setting user/session
        setIsLoading(false);
    };

    // 🚨 CRITICAL FIX: The actual logout implementation
    const logout = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        } else {
            // Clear local state immediately
            setUser(null);
            setSession(null);
        }
        setIsLoading(false);
        // Important: Force a full page redirect after logout to ensure all state is cleared
        window.location.href = '/login'; 
    };

    const value = {
        user,
        session,
        isLoading,
        login,
        logout, // Export the logout function
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Custom Hook for easy consumption
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};