// src/pages/dashboard/Analytics.tsx (FIXED: Replaced missing RPC with client-side aggregation)

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  MinusCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

// Interfaces for fetched data
interface MonthlyApplicationData {
  month_name: string;
  applications: number;
  accepted: number;
  rejected: number;
}

interface ClassApplicationData {
  class_name: string;
  applications: number;
}

interface AnalyticsData {
  total_applicants: number;
  accepted_count: number;
  rejected_count: number;
  pending_count: number;
  monthly_applications: MonthlyApplicationData[];
  class_applications: ClassApplicationData[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--destructive))", "hsl(var(--warning))"];

// Utility function to format month/year (needed for charting)
const formatMonthYear = (date: Date): string => {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const Analytics = () => {
  const { schoolId, isLoading: schoolLoading } = useSchoolData();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("all_time"); // Changed default to 'all_time'

  // --- Data Fetching & Aggregation ---
  const fetchAnalyticsData = useCallback(async () => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // 1. Fetch ALL relevant applicant data for client-side aggregation
    // FIX: Replaced missing RPC 'get_application_analytics' with direct query
    const { data: allApplicants, error: fetchError } = await supabase
        .from('applicants')
        .select(`
            id, 
            status, 
            application_date,
            classes (name)
        `)
        .eq('school_id', schoolId);

    if (fetchError) {
        console.error("Error fetching analytics data:", fetchError);
        setError("Failed to load applicants data for analytics. Check database connection and policies.");
        setData(null);
        setIsLoading(false);
        return;
    }
    
    // 2. Client-side Aggregation
    const applicants = allApplicants || [];
    let accepted_count = 0;
    let rejected_count = 0;
    let pending_count = 0;
    const monthlyMap = new Map<string, { applications: number, accepted: number, rejected: number, date: Date }>();
    const classMap = new Map<string, number>();

    applicants.forEach((a: any) => {
        // Status Counts
        if (a.status === 'accepted') accepted_count++;
        else if (a.status === 'rejected') rejected_count++;
        else if (a.status === 'pending') pending_count++;

        // Monthly Applications (assuming application_date is ISO string)
        const date = new Date(a.application_date);
        const monthKey = formatMonthYear(date); // e.g., 'Jan 2024'

        const monthlyEntry = monthlyMap.get(monthKey) || { applications: 0, accepted: 0, rejected: 0, date: date };
        monthlyEntry.applications++;
        if (a.status === 'accepted') monthlyEntry.accepted++;
        if (a.status === 'rejected') monthlyEntry.rejected++;
        
        monthlyMap.set(monthKey, monthlyEntry);
        
        // Class Applications
        const className = a.classes?.name || 'Unassigned';
        classMap.set(className, (classMap.get(className) || 0) + 1);
    });

    // Convert Maps to array interfaces
    const monthly_applications: MonthlyApplicationData[] = Array.from(monthlyMap, ([month_name, counts]) => ({ 
        month_name, 
        applications: counts.applications,
        accepted: counts.accepted,
        rejected: counts.rejected,
        date: counts.date, // Include date for sorting
    })).sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort by date ascending

    const class_applications: ClassApplicationData[] = Array.from(classMap, ([class_name, applications]) => ({
        class_name,
        applications
    }));


    // 3. Set Final State
    setData({
        total_applicants: applicants.length,
        accepted_count,
        rejected_count,
        pending_count,
        monthly_applications,
        class_applications,
    });


    setIsLoading(false);
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchAnalyticsData();
    }
  }, [schoolId, fetchAnalyticsData]);

  // --- Derived Data for Charts ---

  if (schoolLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Generating school analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 text-center p-10 border border-border rounded-lg mt-8">
        <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold text-destructive">Analytics Error</h2>
        <p className="text-muted-foreground">{error || "No analytics data available for this school. Please ensure you have created a school profile and have applicants."}</p>
      </div>
    );
  }

  const {
    total_applicants,
    accepted_count,
    rejected_count,
    pending_count,
    monthly_applications,
    class_applications,
  } = data;

  const stats = [
    {
      name: "Total Applications",
      value: total_applicants.toLocaleString(),
      icon: Users,
      color: "text-primary",
    },
    {
      name: "Accepted Applicants",
      value: accepted_count.toLocaleString(),
      icon: CheckCircle2,
      color: "text-success",
    },
    {
      name: "Pending Review",
      value: pending_count.toLocaleString(),
      icon: Clock,
      color: "text-warning",
    },
    {
      name: "Rejected Applicants",
      value: rejected_count.toLocaleString(),
      icon: XCircle,
      color: "text-destructive",
    },
  ];

  const statusData = [
    { name: "Accepted", value: accepted_count, color: COLORS[1] },
    { name: "Pending", value: pending_count, color: COLORS[3] },
    { name: "Rejected", value: rejected_count, color: COLORS[2] },
  ].filter(d => d.value > 0); 
  
  // Use the monthly applications data for the monthly chart
  const monthlyChartData = monthly_applications.map(m => ({
      month: m.month_name,
      applications: m.applications,
      accepted: m.accepted,
      rejected: m.rejected,
  }));

  // Map class data for the chart
  const classDistribution = class_applications.map(c => ({
      class: c.class_name,
      applications: c.applications,
  }));

  // Custom Recharts Tooltip Content component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border rounded-md shadow-lg bg-card text-sm">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((p: any, index: number) => (
            <p key={index} style={{ color: p.color }}>
              {p.name}: <span className="font-medium">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Admissions Analytics</h1>
        <Select value={timeframe} onValueChange={setTimeframe} disabled={isLoading}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_time">All Time</SelectItem>
            {/* Future: <SelectItem value="last_6_months">Last 6 Months</SelectItem> */}
            {/* Future: <SelectItem value="this_year">This Year</SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <div className="text-3xl font-bold pt-1">{stat.value}</div>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-70`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Monthly Applications Chart */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Application Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applications" name="Total Applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" name="Accepted" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              <span className="text-xl font-bold text-foreground">{total_applicants.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
          </CardContent>
        </Card>

        {/* Class Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Applications by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={classDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="class" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Applications"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;