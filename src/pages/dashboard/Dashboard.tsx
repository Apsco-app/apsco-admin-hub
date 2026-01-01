import { Link } from "react-router-dom";
import {
  Users,
  FileCheck,
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    name: "Total Applicants",
    value: "124",
    change: "+12%",
    changeType: "positive",
    icon: Users,
  },
  {
    name: "Accepted",
    value: "67",
    change: "+8%",
    changeType: "positive",
    icon: CheckCircle2,
  },
  {
    name: "Pending Review",
    value: "42",
    change: "-5%",
    changeType: "negative",
    icon: Clock,
  },
  {
    name: "Rejected",
    value: "15",
    change: "+2%",
    changeType: "neutral",
    icon: XCircle,
  },
];

const recentApplicants = [
  { id: "1", name: "John Mukasa", class: "S1", status: "pending", date: "2 hours ago" },
  { id: "2", name: "Sarah Nambi", class: "S3", status: "accepted", date: "5 hours ago" },
  { id: "3", name: "Peter Okello", class: "S2", status: "pending", date: "1 day ago" },
  { id: "4", name: "Grace Atim", class: "S1", status: "rejected", date: "1 day ago" },
  { id: "5", name: "David Kato", class: "S4", status: "accepted", date: "2 days ago" },
];

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your school's admissions</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/applicants">
            View All Applicants
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    stat.changeType === "positive"
                      ? "bg-success/10 text-success"
                      : stat.changeType === "negative"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applicants */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Applicants</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/applicants">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplicants.map((applicant) => (
                <Link
                  key={applicant.id}
                  to={`/dashboard/applicants/${applicant.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {applicant.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{applicant.name}</p>
                      <p className="text-sm text-muted-foreground">Applying for {applicant.class}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`status-badge ${
                        applicant.status === "accepted"
                          ? "status-accepted"
                          : applicant.status === "rejected"
                          ? "status-rejected"
                          : "status-pending"
                      }`}
                    >
                      {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{applicant.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/dashboard/admissions-settings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Manage Admission Period
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/dashboard/classes">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Configure Classes
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/dashboard/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Admission Insights</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your acceptance rate is 54% this term. View detailed analytics to optimize your admissions.
                  </p>
                  <Button size="sm" variant="link" className="px-0 mt-2" asChild>
                    <Link to="/dashboard/analytics">
                      View Analytics
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
