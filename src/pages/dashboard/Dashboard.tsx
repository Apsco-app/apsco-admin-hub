import { Link } from "react-router-dom";
import { Users, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    name: "Total Applicants",
    value: "124",
    icon: Users,
  },
  {
    name: "Accepted",
    value: "67",
    icon: CheckCircle2,
  },
  {
    name: "Pending Review",
    value: "42",
    icon: Clock,
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
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your admissions</p>
      </div>

      {/* Stats - 3 cards only */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-border bg-background">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applicants - Primary focus */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Applicants</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/applicants">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="bg-background rounded-xl border border-border divide-y divide-border">
          {recentApplicants.map((applicant) => (
            <Link
              key={applicant.id}
              to={`/dashboard/applicants/${applicant.id}`}
              className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {applicant.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{applicant.name}</p>
                  <p className="text-sm text-muted-foreground">Applying for {applicant.class}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
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
                <span className="text-sm text-muted-foreground hidden sm:block">{applicant.date}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="pt-2">
          <Button asChild className="w-full sm:w-auto">
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
