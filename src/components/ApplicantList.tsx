// src/components/ApplicantList.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useSchoolData } from '@/hooks/useSchoolData';

interface ApplicantSummary {
    id: string;
    full_name: string;
    // Ensure the status type aligns with your database enum
    status: 'new' | 'reviewed' | 'accepted' | 'rejected';
    submitted_at: string;
}

// **NEW PROP INTERFACE**
interface ApplicantListProps {
    onViewDetails: (id: string) => void; // Function passed from the parent for navigation
}

// **UPDATED COMPONENT SIGNATURE**
const ApplicantList: React.FC<ApplicantListProps> = ({ onViewDetails }) => {
    const { isLoading: authLoading } = useAuth();
    const { schoolId, isLoading: schoolLoading } = useSchoolData();
    const [applicants, setApplicants] = useState<ApplicantSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Wait for the auth and school data to load
        if (authLoading || schoolLoading || !schoolId) {
            setLoading(authLoading || schoolLoading);
            return;
        }

        const fetchApplicants = async () => {
            // Fetch applications belonging to the school, joining the profiles table for the name
            const { data, error } = await supabase
                .from('applications')
                .select(`
          id,
          status,
          submitted_at,
          profile:applicant_id ( full_name ) 
        `)
                .eq('school_id', schoolId)
                .order('submitted_at', { ascending: false });

            if (error) {
                console.error('Error fetching applicants:', error.message);
            } else if (data) {
                const summaries: ApplicantSummary[] = data.map((app: any) => ({
                    id: app.id,
                    status: app.status,
                    submitted_at: new Date(app.submitted_at).toLocaleDateString(),
                    full_name: app.profile?.full_name || 'N/A',
                }));
                setApplicants(summaries);
            }
            setLoading(false);
        };

        fetchApplicants();
    }, [schoolId, authLoading, schoolLoading]);

    // Function to determine badge style based on status
    const getStatusBadge = (status: ApplicantSummary['status']) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'reviewed':
                return 'bg-blue-100 text-blue-800';
            case 'new':
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };


    if (loading) return <p className="p-4">Loading applications...</p>;
    if (!schoolId) return <p className="p-4">You must be logged in as a school owner to view applications.</p>;
    if (applicants.length === 0) return <p className="p-4">No applications received yet for your school.</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-6">Incoming Applications</h2>
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="relative px-6 py-3">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applicants.map((applicant) => (
                            <tr key={applicant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {applicant.full_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {applicant.submitted_at}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(applicant.status)}`}>
                                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {/* **CRITICAL CHANGE**: Calls the prop to switch view */}
                                    <button
                                        onClick={() => onViewDetails(applicant.id)}
                                        className="text-indigo-600 hover:text-indigo-900 transition duration-150"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicantList;