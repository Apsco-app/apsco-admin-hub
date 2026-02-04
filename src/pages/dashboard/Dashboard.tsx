// src/pages/dashboard/Dashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, Clock, ArrowRight, Activity, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSchoolData } from "@/hooks/useSchoolData";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { schoolId, schoolName, schoolLogo, isLoading: schoolLoading } = useSchoolData();
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!schoolId) return;
      try {
        // Run all counts in parallel for speed
        const [total, accepted, pending, rejected] = await Promise.all([
          supabase.from("applicants").select("*", { count: "exact", head: true }).eq("school_id", schoolId),
          supabase.from("applicants").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "accepted"),
          supabase.from("applicants").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "pending"),
          supabase.from("applicants").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("status", "rejected"),
        ]);

        setStats({
          total: total.count || 0,
          accepted: accepted.count || 0,
          pending: pending.count || 0,
          rejected: rejected.count || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    if (schoolId) {
      fetchStats();
    }
  }, [schoolId]);

  const acceptanceRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  if (schoolLoading) {
    return <div className="p-8 space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>;
  }

  return (
    <div className="relative min-h-[80vh]">
      {/* 1. Dynamic Transparent Background Logo */}
      {schoolLogo && (
        <div
          className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.03]"
          style={{
            backgroundImage: `url(${schoolLogo})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
            filter: "grayscale(100%)" // Optional: makes it look more like a watermark
          }}
        />
      )}

      {/* 2. Main Dashboard Content */}
      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">Overview</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back to <span className="font-semibold text-foreground">{schoolName}</span>
            </p>
          </div>
          <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all">
            <Link to="/dashboard/applicants">
              View All Applicants <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* 3. Real Stat Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applicants"
            value={stats.total}
            icon={Users}
            loading={loadingStats}
            description="All time applications"
          />
          <StatCard
            title="Accepted Students"
            value={stats.accepted}
            icon={UserCheck}
            className="border-green-200 bg-green-50/50"
            iconClass="text-green-600"
            loading={loadingStats}
            description="Successfully admitted"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
            className="border-yellow-200 bg-yellow-50/50"
            iconClass="text-yellow-600"
            loading={loadingStats}
            description="Awaiting decision"
          />
          <StatCard
            title="Acceptance Rate"
            value={`${acceptanceRate}%`}
            icon={Activity}
            loading={loadingStats}
            description="Based on current data"
          />
        </div>

        {/* 4. Quick Actions / Next Steps */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your most recent applications will appear here.
                <Link to="/dashboard/applicants" className="text-primary hover:underline ml-1">View list</Link>.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link to="/dashboard/admissions-settings" className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2" /> Configure Admissions
              </Link>
              <Link to="/dashboard/classes" className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2" /> Manage Classes
              </Link>
              <Link to="/dashboard/settings" className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                <span className="w-2 h-2 rounded-full bg-gray-500 mr-2" /> School Settings
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  className,
  iconClass,
  loading,
  description
}: {
  title: string,
  value: string | number,
  icon: any,
  className?: string,
  iconClass?: string,
  loading: boolean,
  description?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 text-muted-foreground ${iconClass}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
