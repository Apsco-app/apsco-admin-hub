// src/components/SchoolDashboard.tsx (Save as .tsx)
import React, { useState } from 'react';
import Sidebar from './Sidebar'; 
import ApplicantList from './ApplicantList';
import ApplicantDetail from './ApplicantDetail'; 
// Use the custom hook to get the logged-in profile
import { useAuth } from '../hooks/useAuth';

const SchoolDashboard: React.FC = () => {
  const { profile } = useAuth(); // Get the current user profile data
  
  // State to simulate routing: 'dashboard', 'applicants', or 'applicant-detail'
  const [activeView, setActiveView] = useState('dashboard'); 
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Function to handle switching from the list view to the detail view
  const handleViewDetails = (id: string) => {
    setSelectedApplicationId(id);
    setActiveView('applicant-detail');
  };
  
  // Function to return to the list view after a status update
  const handleStatusUpdateComplete = () => {
    setActiveView('applicants');
    setSelectedApplicationId(null);
  };

  const renderContent = () => {
    // 1. Applicant Detail View
    if (activeView === 'applicant-detail' && selectedApplicationId) {
      return (
        <ApplicantDetail 
          applicationId={selectedApplicationId} 
          onStatusUpdate={handleStatusUpdateComplete}
        />
      );
    }
    // 2. Applicant List View
    if (activeView === 'applicants') {
      return (
        <ApplicantList 
          onViewDetails={handleViewDetails}
        />
      );
    }
    // 3. Other Placeholder Views
    if (activeView === 'classes' || activeView === 'admissions') {
      return <div className="p-6">Content for {activeView.toUpperCase()} View Coming Soon...</div>;
    }
    
    // 4. Default Dashboard View
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
        <p className="mb-8">Welcome, {profile?.full_name || 'Admin'}! Use the sidebar to manage your applications.</p>
        
        {/* Replace the broken 'Create School Profile' section with actual content */}
        <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">Total Applicants</div>
            <div className="bg-white p-6 rounded shadow">Accepted</div>
            <div className="bg-white p-6 rounded shadow">Pending Review</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar setActiveView={setActiveView} activeView={activeView} />
      <main className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default SchoolDashboard;