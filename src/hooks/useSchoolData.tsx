// src/hooks/useSchoolData.ts (FINAL & ROBUST VERSION)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient'; 
import { useAuth } from '@/context/AuthContext'; 
import { useToast } from '@/hooks/use-toast'; 
import { PostgrestError } from '@supabase/supabase-js';

type SchoolStatus = 'pending' | 'verified' | 'rejected' | null;

interface SchoolData {
    schoolId: string | null;
    schoolStatus: SchoolStatus;
    isLoading: boolean;
    schoolName: string | null;
    is_admissions_open: boolean;
    fetchSchoolData: () => Promise<void>; 
}

const DEFAULT_SCHOOL_DATA: Omit<SchoolData, 'fetchSchoolData'> = {
    schoolId: null,
    schoolStatus: null,
    isLoading: true,
    schoolName: null,
    is_admissions_open: false,
};

const SUPABASE_406_ERROR = 'PGRST406';

export const useSchoolData = (): SchoolData => {
    // Hooks must be called unconditionally at the top (React rule)
    const { user } = useAuth(); 
    
    // ✅ DEFINITIVE CRASH FIX: Do NOT destructure the result of useToast()
    // We store the result in a variable and check for its existence later.
    const toastHook = useToast(); 
    
    const [data, setData] = useState<Omit<SchoolData, 'fetchSchoolData'>>(DEFAULT_SCHOOL_DATA);
    
    const fetchSchoolData = useCallback(async () => {
        setData(prev => ({ ...prev, isLoading: true })); 
        
        if (!user) {
            setData({ ...DEFAULT_SCHOOL_DATA, isLoading: false });
            return;
        }

        try {
            // ... (Data fetching logic remains the same)
            let currentSchoolId: string | null = null;
            
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('school_id')
                .eq('id', user.id)
                .maybeSingle(); 

            if (profileError && profileError.code !== SUPABASE_406_ERROR) {
                throw profileError;
            }
            currentSchoolId = profile?.school_id || null;

            let school: any = null;
            
            if (currentSchoolId) {
                const { data: schoolData, error: schoolError } = await supabase
                    .from('schools')
                    .select('id, name, status, is_admissions_open')
                    .eq('id', currentSchoolId)
                    .maybeSingle(); 
                
                if (schoolError && schoolError.code !== SUPABASE_406_ERROR) {
                    throw schoolError;
                }
                
                if (schoolData) {
                    school = schoolData;
                }
            } 
            
            setData({
                schoolId: school?.id || null,
                schoolName: school?.name || null,
                schoolStatus: (school?.status as SchoolStatus) || null, 
                isLoading: false,
                is_admissions_open: school?.is_admissions_open || false,
            });
            
        } catch (error: PostgrestError | any) {
            console.error("Critical Error fetching school data:", error.message);
            
            if (error.code && error.code !== SUPABASE_406_ERROR) { 
                // ✅ SAFE CALL: Use optional chaining to call toast if the hook succeeded.
                if (toastHook?.toast && typeof toastHook.toast === 'function') {
                    toastHook.toast({
                        title: "Fatal Data Error",
                        description: "Failed to load school profile. Please refresh.",
                        variant: "destructive"
                    });
                } else {
                    console.warn("Could not display toast. Toast context is likely missing or uninitialized.");
                }
            }
            setData({ ...DEFAULT_SCHOOL_DATA, isLoading: false, schoolStatus: null });
        }
    }, [user, toastHook]); // toastHook is now a dependency

    useEffect(() => {
        if (user) {
            fetchSchoolData();
        } else {
            setData({ ...DEFAULT_SCHOOL_DATA, isLoading: false }); 
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]); 
    
    // Real-time listener
    useEffect(() => {
        if (!user) return;
        
        const schoolChannel = supabase
            .channel('school_changes_refresh')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'profiles' }, 
                () => { fetchSchoolData(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'schools' }, 
                () => { fetchSchoolData(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(schoolChannel);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return { ...data, fetchSchoolData };
};