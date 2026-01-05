// src/pages/dashboard/Analytics.tsx

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
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

const Analytics = () => {
  const { schoolId, isLoading: schoolLoading } = useSchoolData();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("last_6_months"); // State for potential future filtering

  // --- Data Fetching ---
  const fetchAnalyticsData = useCallback(async () => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // ASSUMPTION: You have created a Supabase RPC function (or a view with filters) 
    // named 'get_application_analytics' which returns all necessary structured data.
    const { data: analyticsData, error: fetchError } = await supabase.rpc(
      'get_application_analytics',
      { p_school_id: schoolId } // Pass school_id as parameter
    ).single();

    if (fetchError) {
      console.error("Error fetching analytics data:", fetchError);
      setError("Failed to load analytics data. Please ensure the 'get_application_analytics' function exists and is correctly configured.");
      setData(null);
    } else if (analyticsData) {
        // FIX: Cast analyticsData to 'any' to resolve 'unknown' type error
        const data = analyticsData as any;

        setData({
            total_applicants: data.total_applicants || 0,
            accepted_count: data.accepted_count || 0,
            rejected_count: data.rejected_count || 0,
            pending_count: data.pending_count || 0,
            monthly_applications: data.monthly_applications || [],
            class_applications: data.class_applications || [],
        });
    }

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
        <p className="text-muted-foreground">{error || "No analytics data available for this school."}</p>
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
  ].filter(d => d.value > 0); // Filter out zero values for better chart display

  // Map monthly data for the chart
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
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_6_months">Last 6 Months</SelectItem>
            <SelectItem value="current_year">Current Year</SelectItem>
            <SelectItem value="all_time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Application Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="applications" name="Total Applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accepted" name="Accepted" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Application Status Split</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No applications recorded yet.</p>
              )}
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Distribution */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Applications by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classDistribution}>
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
  );
};

export default Analytics;