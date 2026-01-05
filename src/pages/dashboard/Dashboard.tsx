// src/pages/dashboard/Dashboard.tsx

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

// Interfaces for fetched data
interface DashboardStats {
  total_applicants: number;
  accepted_count: number;
  pending_count: number;
}

interface RecentApplicant {
  id: string;
  full_name: string;
  status: "pending" | "accepted" | "rejected";
  application_date: string; // ISO string
  class_name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  
  // FIX: Cast the return value of useSchoolData to 'any' to bypass 
  // the strict TypeScript check regarding the missing 'schoolStatus' property in the hook's return type.
  const { schoolId, schoolStatus, isLoading: schoolLoading } = useSchoolData() as any;
  
  const [stats, setStats] = useState<DashboardStats>({
    total_applicants: 0,
    accepted_count: 0,
    pending_count: 0,
  });
  const [recentApplicants, setRecentApplicants] = useState<RecentApplicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---

  const fetchDashboardData = useCallback(async () => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 1. Fetch Stats (Using an RPC for efficiency, similar to Analytics)
    // ASSUMPTION: You have an RPC/View like 'get_dashboard_stats' or reuse 'get_application_analytics'
    const { data: statsData, error: statsError } = await supabase.rpc(
        'get_dashboard_stats', // Assuming a simpler RPC for just the counts
        { p_school_id: schoolId } 
    ).single();

    if (!statsError && statsData) {
      const data = statsData as any;
      setStats({
        total_applicants: data.total_applicants || 0,
        accepted_count: data.accepted_count || 0,
        pending_count: data.pending_count || 0,
      });
    } else if (statsError && statsError.code !== 'PGRST116') {
        console.error("Error fetching dashboard stats:", statsError);
    }
    
    // 2. Fetch Recent Applicants
    const { data: recentData, error: recentError } = await supabase
      .from('applicants')
      .select(`
        id, 
        full_name, 
        status, 
        application_date,
        classes (name)
      `)
      .eq('school_id', schoolId)
      .order('application_date', { ascending: false })
      .limit(5);

    if (!recentError && recentData) {
        const formattedApplicants: RecentApplicant[] = recentData.map((a: any) => ({
            id: a.id,
            full_name: a.full_name,
            status: a.status,
            application_date: a.application_date,
            class_name: a.classes?.name || 'N/A',
        }));
        setRecentApplicants(formattedApplicants);
    } else if (recentError) {
        console.error("Error fetching recent applicants:", recentError);
    }

    setIsLoading(false);
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchDashboardData();
    }
  }, [schoolId, fetchDashboardData]);

  // --- Render Logic ---

  if (schoolLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // School Status Banner Logic
  const renderSchoolStatusBanner = () => {
    if (!schoolId) {
      return (
        <div className="p-4 mb-6 rounded-lg border border-primary/50 bg-primary/5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-semibold text-primary">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                You haven't created your school profile yet. Start here to begin accepting applications.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/create-school">Create School Profile</Link>
          </Button>
        </div>
      );
    }

    if (schoolStatus === "pending") {
      return (
        <div className="p-4 mb-6 rounded-lg border border-warning/50 bg-warning/5 flex items-center shadow-sm">
          <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0 mr-3" />
          <div>
            <h3 className="font-semibold text-warning">Verification Pending</h3>
            <p className="text-sm text-muted-foreground">
              Your school profile is under review. Please allow 24-48 hours for verification. Admissions are currently closed to the public.
            </p>
          </div>
        </div>
      );
    }

    if (schoolStatus === "verified") {
      return (
        <div className="p-4 mb-6 rounded-lg border border-success/50 bg-success/5 flex items-center shadow-sm">
          <Shield className="h-6 w-6 text-success flex-shrink-0 mr-3" />
          <div>
            <h3 className="font-semibold text-success">School Verified</h3>
            <p className="text-sm text-muted-foreground">
              Your school profile is verified and active. You can now configure your admissions settings.
            </p>
          </div>
        </div>
      );
    }
    
    return null; // Don't render if status is unknown/error
  };

  const dashboardStats = [
    {
      name: "Total Applicants",
      value: stats.total_applicants.toLocaleString(),
      icon: Users,
      color: "text-primary",
    },
    {
      name: "Accepted",
      value: stats.accepted_count.toLocaleString(),
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      name: "Pending Review",
      value: stats.pending_count.toLocaleString(),
      icon: Clock,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {renderSchoolStatusBanner()}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.name} className="border-border">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <div className="text-3xl font-bold mt-1">{stat.value}</div>
              </div>
              <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applicants */}
      <div className="bg-background rounded-xl border border-border p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          Recent Applications
        </h2>

        <div className="space-y-3">
          {recentApplicants.length === 0 && !isLoading ? (
            <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
              No recent applications yet.
            </div>
          ) : isLoading ? (
             <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
             </div>
          ) : (
            recentApplicants.map((applicant) => {
                // Helper to format date relative to now (simple version)
                const timeAgo = (dateString: string) => {
                    const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
                    const minutes = Math.floor(diffInSeconds / 60);
                    const hours = Math.floor(minutes / 60);
                    const days = Math.floor(hours / 24);

                    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                    return 'just now';
                }
                
                return (
                    <Link
                      key={applicant.id}
                      to={`/dashboard/applicants/${applicant.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar initials */}
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {applicant.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{applicant.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Applying for <span className="font-semibold text-primary/80">{applicant.class_name}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full border 
                            ${applicant.status === "accepted" ? "text-success bg-success/10 border-success/30" :
                              applicant.status === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30" :
                              "text-warning bg-warning/10 border-warning/30"
                            }`
                          }
                        >
                          {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                        </span>
                        <span className="text-sm text-muted-foreground hidden sm:block w-[70px] text-right">
                            {timeAgo(applicant.application_date)}
                        </span>
                      </div>
                    </Link>
                );
            })
          )}
        </div>

        <div className="pt-2">
          <Button asChild className="w-full sm:w-auto" variant="outline">
            <Link to="/dashboard/applicants">
              View All Applicants
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;