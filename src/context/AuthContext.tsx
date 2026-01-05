// src/context/AuthContext.tsx

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
import { useToast } from '@/hooks/use-toast'; // Assuming useToast is set up

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
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Initial loading state

    useEffect(() => {
        // 1. Initial Session Check (runs once on mount)
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Error getting initial session:", error);
            }
            
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        };
        
        getInitialSession();

        // 2. Listener for Auth State Changes (runs whenever login/logout occurs)
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);
                setIsLoading(false); // Authentication state is now known
                
                // Optional: Notify user on specific events
                if (event === 'SIGNED_IN') {
                    toast({
                        title: "Signed In",
                        description: "Welcome to your admissions dashboard!",
                    });
                }
            }
        );

        // Cleanup the listener on unmount
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, [toast]);

    const signOut = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        setIsLoading(false);
        
        if (error) {
            toast({
                title: "Logout Failed",
                description: error.message,
                variant: "destructive",
            });
            return;
        }
        
        // No need to manually clear user/session state, the listener handles it.
        toast({
            title: "Signed Out",
            description: "You have been successfully signed out.",
        });
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