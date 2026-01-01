import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  School,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const mockApplicantDetails = {
  id: "1",
  fullName: "John Mukasa",
  formerSchool: "Kampala Primary School",
  aggregates: 12,
  dateOfBirth: "2010-03-15",
  gender: "Male",
  classApplied: "S1",
  status: "pending" as "pending" | "accepted" | "rejected",
  applicationDate: "2024-01-15",
  email: "parent@email.com",
  phone: "+256 700 123 456",
  address: "Plot 45, Kampala Road, Kampala",
  parentName: "Mr. Robert Mukasa",
  subjects: [
    { name: "English", grade: "D1" },
    { name: "Mathematics", grade: "C3" },
    { name: "Science", grade: "D2" },
    { name: "Social Studies", grade: "C4" },
  ],
  documents: [
    { name: "PLE Results Slip", type: "pdf" },
    { name: "Birth Certificate", type: "pdf" },
    { name: "Passport Photo", type: "image" },
    { name: "School Leaving Letter", type: "pdf" },
  ],
};

const ApplicantDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const applicant = mockApplicantDetails;

  const handleAction = (action: "accept" | "reject") => {
    toast({
      title: `Application ${action === "accept" ? "Accepted" : "Rejected"}`,
      description: `${applicant.fullName}'s application has been ${action}ed.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/dashboard/applicants">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applicants
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {applicant.fullName.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{applicant.fullName}</h1>
            <p className="text-muted-foreground">
              Applying for {applicant.classApplied} • Applied on{" "}
              {new Date(applicant.applicationDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border-border bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Review the applicant's details and make a decision
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleAction("reject")}
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => handleAction("accept")}>
                <Check className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{applicant.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{applicant.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {new Date(applicant.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Parent/Guardian</p>
                <p className="font-medium">{applicant.parentName}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{applicant.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{applicant.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{applicant.address}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <School className="h-5 w-5 text-primary" />
              Academic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Former School</p>
              <p className="font-medium">{applicant.formerSchool}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PLE Aggregates</p>
              <p className="text-2xl font-bold text-primary">{applicant.aggregates}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2">Subject Grades</p>
              <div className="space-y-2">
                {applicant.subjects.map((subject) => (
                  <div key={subject.name} className="flex justify-between items-center">
                    <span className="text-sm">{subject.name}</span>
                    <span className="font-medium text-primary">{subject.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Uploaded Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {applicant.documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-[120px]">{doc.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{doc.type}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicantDetail;
