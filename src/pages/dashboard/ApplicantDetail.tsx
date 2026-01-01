import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  School,
  FileText,
  Download,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [applicant, setApplicant] = useState(mockApplicantDetails);
  const [personalOpen, setPersonalOpen] = useState(true);
  const [academicOpen, setAcademicOpen] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "accept" | "reject";
  }>({ open: false, action: "accept" });

  const handleAction = (action: "accept" | "reject") => {
    const newStatus = action === "accept" ? "accepted" : "rejected";
    setApplicant({ ...applicant, status: newStatus });
    toast({
      title: `Application ${action === "accept" ? "Accepted" : "Rejected"}`,
      description: action === "reject" 
        ? `${applicant.fullName} will be removed from the list in 24 hours.`
        : `${applicant.fullName}'s application has been accepted.`,
    });
    setConfirmDialog({ open: false, action: "accept" });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="-ml-2">
        <Link to="/dashboard/applicants">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applicants
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {applicant.fullName.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{applicant.fullName}</h1>
            <p className="text-muted-foreground">
              Applying for {applicant.classApplied} • {new Date(applicant.applicationDate).toLocaleDateString()}
            </p>
          </div>
        </div>
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

      {/* Action Buttons */}
      {applicant.status === "pending" && (
        <div className="flex gap-3 p-4 bg-muted/30 rounded-xl border border-border">
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setConfirmDialog({ open: true, action: "reject" })}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button onClick={() => setConfirmDialog({ open: true, action: "accept" })}>
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Student Details */}
        <div className="space-y-4">
          {/* Personal Info */}
          <Collapsible open={personalOpen} onOpenChange={setPersonalOpen}>
            <div className="bg-background rounded-xl border border-border overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Personal Information</span>
                  </div>
                  {personalOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="font-medium">{new Date(applicant.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Parent/Guardian</p>
                      <p className="font-medium">{applicant.parentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{applicant.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{applicant.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{applicant.address}</p>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Academic Info */}
          <Collapsible open={academicOpen} onOpenChange={setAcademicOpen}>
            <div className="bg-background rounded-xl border border-border overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <School className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Academic Information</span>
                  </div>
                  {academicOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Former School</p>
                    <p className="font-medium">{applicant.formerSchool}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PLE Aggregates</p>
                    <p className="text-3xl font-bold text-primary">{applicant.aggregates}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Subject Grades</p>
                    <div className="grid grid-cols-2 gap-2">
                      {applicant.subjects.map((subject) => (
                        <div key={subject.name} className="flex justify-between items-center p-2 bg-muted/30 rounded-lg">
                          <span className="text-sm">{subject.name}</span>
                          <span className="font-semibold text-primary">{subject.grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Right Column - Documents */}
        <div>
          <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
            <div className="bg-background rounded-xl border border-border overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Documents</span>
                  </div>
                  {documentsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-3">
                  <Separator />
                  {applicant.documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground uppercase">{doc.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "accept" ? "Accept Application" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "accept" 
                ? `Are you sure you want to accept ${applicant.fullName}'s application?`
                : `Are you sure you want to reject ${applicant.fullName}'s application? They will be removed from the list in 24 hours.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction(confirmDialog.action)}
              className={confirmDialog.action === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {confirmDialog.action === "accept" ? "Accept" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApplicantDetail;
