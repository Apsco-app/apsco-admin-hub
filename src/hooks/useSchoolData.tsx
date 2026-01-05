// src/hooks/useSchoolData.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Assuming @/lib/supabase is your client setup

interface SchoolData {
  schoolId: string | undefined;
  schoolName: string | undefined;
  schoolStatus: 'pending' | 'verified' | 'rejected' | undefined;
  isLoading: boolean;
}

// Assuming the 'profiles' table links users to 'schools'
// and 'schools' table contains 'name' and 'status'
export const useSchoolData = (): SchoolData => {
  const [data, setData] = useState<SchoolData>({
    schoolId: undefined,
    schoolName: undefined,
    schoolStatus: undefined,
    isLoading: true,
  });

  useEffect(() => {
    const fetchSchool = async () => {
      setData((prev) => ({ ...prev, isLoading: true }));
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        setData({ schoolId: undefined, schoolName: undefined, schoolStatus: undefined, isLoading: false });
        return;
      }
      
      const userId = userData.user.id;

      // 1. Fetch the user's profile to get the school_id
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('id', userId)
        .single();
        
      const school_id = profileData?.school_id;

      if (profileError || !school_id) {
        setData({ schoolId: undefined, schoolName: undefined, schoolStatus: undefined, isLoading: false });
        return;
      }

      // 2. Fetch the school details using the school_id
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, status')
        .eq('id', school_id)
        .single();

      if (schoolError || !schoolData) {
        console.error("Error fetching school details:", schoolError);
        setData({ schoolId: school_id, schoolName: undefined, schoolStatus: undefined, isLoading: false });
        return;
      }

      // 3. Set the final data
      setData({
        schoolId: schoolData.id,
        schoolName: schoolData.name,
        schoolStatus: schoolData.status as 'pending' | 'verified' | 'rejected',
        isLoading: false,
      });
    };

    fetchSchool();
  }, []);

  return data;
};

// IMPORTANT: This correctly types the hook's return, which should eliminate 
// the need for 'as any' in Dashboard.tsx and Settings.tsx after a full refresh!