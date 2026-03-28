// src/hooks/useSchoolData.ts (FINAL & ROBUST VERSION)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

type SchoolStatus = 'pending' | 'verified' | 'rejected' | null;

interface SchoolData {
    schoolId: string | null;
    schoolStatus: SchoolStatus;
    isLoading: boolean;
    schoolName: string | null;
    schoolLogo: string | null;
    is_admissions_open: boolean;
    fetchSchoolData: () => Promise<void>;
    profileError?: string | null;
}

const DEFAULT_SCHOOL_DATA: Omit<SchoolData, 'fetchSchoolData'> = {
    schoolId: null,
    schoolStatus: null,
    isLoading: true,
    schoolName: null,
    schoolLogo: null,
    is_admissions_open: false,
    profileError: null,
};

const SUPABASE_406_ERROR = 'PGRST406';

export const useSchoolData = (): SchoolData => {
    const { user } = useAuth();
    const toastHook = useToast();

    const [data, setData] = useState<Omit<SchoolData, 'fetchSchoolData'>>(DEFAULT_SCHOOL_DATA);

    const fetchSchoolData = useCallback(async () => {
        setData(prev => ({ ...prev, isLoading: true }));

        if (!user) {
            setData({ ...DEFAULT_SCHOOL_DATA, isLoading: false });
            return;
        }

        try {
            // 🔥 FIX: Fetch school directly using user_id instead of profiles
            const { data: school, error: schoolError } = await supabase
                .from('schools')
                .select('id, name, status, is_admissions_open, logo_url')
                .eq('user_id', user.id)
                .maybeSingle();

            if (schoolError && schoolError.code !== SUPABASE_406_ERROR) {
                setData(prev => ({ ...prev, profileError: schoolError.message }));
                throw schoolError;
            }

            if (!school) {
                setData({
                    ...DEFAULT_SCHOOL_DATA,
                    isLoading: false,
                    profileError: "No school found for this user."
                });
                return;
            }

            setData({
                schoolId: school.id,
                schoolName: school.name,
                schoolLogo: school.logo_url,
                schoolStatus: (school.status as SchoolStatus) || null,
                isLoading: false,
                is_admissions_open: school.is_admissions_open || false,
                profileError: null,
            });

        } catch (error: PostgrestError | any) {
            console.error("Critical Error fetching school data:", error.message);

            const debugMsg = error.message || "Unknown error";

            if (error.code && error.code !== SUPABASE_406_ERROR) {
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

            setData({
                ...DEFAULT_SCHOOL_DATA,
                isLoading: false,
                schoolStatus: null,
                profileError: debugMsg
            });
        }
    }, [user, toastHook]);

    useEffect(() => {
        if (user) {
            fetchSchoolData();
        } else {
            setData({ ...DEFAULT_SCHOOL_DATA, isLoading: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

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