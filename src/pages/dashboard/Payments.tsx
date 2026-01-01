import { CreditCard, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Payments = () => {
  const { toast } = useToast();

  const handlePayment = () => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to payment gateway...",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments & License</h1>
        <p className="text-muted-foreground">Manage your digital admissions license</p>
      </div>

      {/* Current Status */}
      <Card className="border-border bg-success/5 border-success/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">License Active</h3>
              <p className="text-sm text-muted-foreground">
                Your license is valid until March 31, 2024
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Secondary School */}
        <Card className="border-border relative overflow-hidden">
          <div className="absolute top-0 right-0">
            <Badge className="m-4 bg-primary">Most Popular</Badge>
          </div>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Secondary School</CardTitle>
                <CardDescription>For secondary schools (S1-S6)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">UGX 150,000</span>
              </div>
              <p className="text-sm text-muted-foreground">per term</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Unlimited student applications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">AI-powered document verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Export to CSV/Excel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Analytics dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Email support</span>
              </div>
            </div>

            <Button className="w-full" onClick={handlePayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay for Term
            </Button>
          </CardContent>
        </Card>

        {/* University */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                <Building2 className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>University</CardTitle>
                <CardDescription>For universities and colleges</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">UGX 150,000</span>
              </div>
              <p className="text-sm text-muted-foreground">per semester</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Unlimited student applications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">AI-powered document verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Export to CSV/Excel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handlePayment}>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay for Semester
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Jan 15, 2024", amount: "UGX 150,000", status: "Paid", period: "Term 1, 2024" },
              { date: "Sep 10, 2023", amount: "UGX 150,000", status: "Paid", period: "Term 3, 2023" },
              { date: "May 8, 2023", amount: "UGX 150,000", status: "Paid", period: "Term 2, 2023" },
            ].map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{payment.period}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount}</p>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;
