// src/hooks/useAuth.ts
import React, { useState, useEffect, useContext, ReactNode, FC } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js'; 

// === 1. Type Definitions ===
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  school_id: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

// === 2. Context Initialization (Exported for external use if needed) ===
// This line *must* be clean and separated.
export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// === 3. Auth Provider Component ===
interface AuthProviderProps {
    children: ReactNode;
}

// **Structural Fix: Component Definition**
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- BEGIN FUNCTION BODIES (Contents unchanged) ---

  const fetchProfile = async (currentUser: User) => {
      const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`id, full_name, school_id`)
          .eq('id', currentUser.id)
          .single();

      if (profileError) {
          console.error("Error fetching profile:", profileError);
          setProfile(null);
      } else if (profileData) {
          setProfile({
              id: profileData.id,
              email: currentUser.email || '', 
              full_name: profileData.full_name,
              school_id: profileData.school_id,
          });
      } else {
           setProfile(null);
      }
      setLoading(false);
  };
  
  const handleAuthChange = (currentUser: User | null) => {
      setUser(currentUser);
      if (currentUser) {
          setLoading(true);
          fetchProfile(currentUser);
      } else {
          setProfile(null);
          setLoading(false);
      }
  };

  useEffect(() => {
    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        handleAuthChange(currentUser);
      }
    );
    
    supabase.auth.getSession().then(({ data }) => {
        const session = data?.session;
        const currentUser = session?.user ?? null;
        
        if (!currentUser) {
            setLoading(false);
        }
        handleAuthChange(currentUser);
    });

    return () => {
      if (authSubscription?.subscription) {
        authSubscription.subscription.unsubscribe();
      }
    };
  }, []);
  
  // --- END FUNCTION BODIES ---

  // Return block
  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; // <-- This brace MUST be the final one for the component definition

// === 4. Custom Hook ===
export const useAuth = () => {
  // We use the exported AuthContext variable here
  const context = useContext(AuthContext); 
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};