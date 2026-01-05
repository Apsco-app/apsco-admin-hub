// src/components/ApplicantDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient'; 

// Define the full structure of the data we expect to fetch
interface ApplicationData {
  id: string;
  status: 'new' | 'reviewed' | 'accepted' | 'rejected';
  submitted_at: string;
  // Assuming these fields exist in your applications table:
  essay: string; 
  references: string;
  // Joined profile data:
  applicant_name: string;
}

interface ApplicantDetailProps {
  applicationId: string; // The ID of the application to view
  onStatusUpdate: (appId: string, newStatus: string) => void; // Callback for when status changes
}

const statusOptions = ['new', 'reviewed', 'accepted', 'rejected'];

const ApplicantDetail: React.FC<ApplicantDetailProps> = ({ applicationId, onStatusUpdate }) => {
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ApplicationData['status'] | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      // Fetch application details and join the applicant's profile to get the name
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          *,
          profile:applicant_id ( full_name )
        `)
        .eq('id', applicationId)
        .single();
      
      if (error) {
        console.error('Error fetching application detail:', error.message);
        setData(null);
      } else if (application) {
        const detail: ApplicationData = {
          ...application,
          applicant_name: application.profile?.full_name || 'N/A',
        };
        setData(detail);
        setNewStatus(detail.status);
      }
      setLoading(false);
    };

    if (applicationId) {
      fetchDetail();
    }
  }, [applicationId]);

  // --- Status Update Handler ---
  const handleStatusUpdate = useCallback(async () => {
    if (!newStatus || newStatus === data?.status) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating status:', error.message);
      alert('Failed to update status.');
    } else {
      // Update local state and notify parent component
      setData((prev) => (prev ? { ...prev, status: newStatus } : null));
      onStatusUpdate(applicationId, newStatus);
      alert(`Status updated to ${newStatus.toUpperCase()}.`);
    }
    setIsUpdating(false);
  }, [applicationId, data?.status, newStatus, onStatusUpdate]);

  if (loading) return <div className="p-6">Loading applicant details...</div>;
  if (!data) return <div className="p-6">Application not found or access denied.</div>;

  // --- Render Component ---
  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-3xl font-bold mb-4">{data.applicant_name}'s Application</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700">
        <div>
          <p className="font-semibold">Application ID:</p>
          <p>{data.id}</p>
        </div>
        <div>
          <p className="font-semibold">Submitted On:</p>
          <p>{new Date(data.submitted_at).toLocaleDateString()}</p>
        </div>
        <div className="col-span-2">
          <p className="font-semibold">Current Status:</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            data.status === 'accepted' ? 'bg-green-100 text-green-800' :
            data.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {data.status.toUpperCase()}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-6 mb-2 border-b pb-1">Applicant Essay</h3>
      <p className="bg-gray-100 p-4 rounded text-gray-800 whitespace-pre-wrap">{data.essay || "No essay provided."}</p>
      
      <h3 className="text-xl font-semibold mt-6 mb-2 border-b pb-1">References/Notes</h3>
      <p className="bg-gray-100 p-4 rounded text-gray-800 whitespace-pre-wrap">{data.references || "No references/notes provided."}</p>

      {/* Status Update Control */}
      <div className="mt-8 pt-4 border-t">
        <h3 className="text-xl font-semibold mb-3">Change Application Status</h3>
        <div className="flex items-center space-x-4">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as ApplicationData['status'])}
            className="p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={newStatus === data.status || isUpdating}
            className={`px-4 py-2 rounded text-white font-medium transition duration-150 ${
              newStatus === data.status || isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isUpdating ? 'Updating...' : 'Save Status Change'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;