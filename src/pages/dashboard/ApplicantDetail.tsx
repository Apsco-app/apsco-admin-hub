// src/pages/dashboard/ApplicantDetail.tsx

import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Mail,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  MinusCircle,
  FileBadge2,
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
import { supabase } from "@/lib/supabase"; // <-- NEW
import { useSchoolData } from "@/hooks/useSchoolData"; // <-- NEW

type ApplicantStatus = "pending" | "accepted" | "rejected";

// Detailed Applicant Interface combining joins
interface ApplicantDetail {
  id: string;
  full_name: string;
  status: ApplicantStatus;
  application_date: string;
  class_name: string;
  former_school: string | null;
  aggregates: any; // jsonb for results

  // Profile (Contact/Guardian)
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;

  // Custom form fields (from aggregates or application_data jsonb)
  application_data: any;
}

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ApplicantDetail = () => {
  const { applicantId } = useParams<{ applicantId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { schoolId, isLoading: schoolLoading } = useSchoolData();

  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "accept" | "reject";
  }>({
    open: false,
    action: "accept",
  });

  // --- Data Fetching ---
  const fetchApplicantDetail = useCallback(async () => {
    if (!applicantId || !schoolId) return;

    setIsLoading(true);
    setError(null);

    // Fetch applicant details, joining profile and documents
    const { data, error } = await supabase
      .from('applicants')
      .select(`
        id, 
        full_name, 
        status, 
        application_date,
        former_school,
        aggregates,
        application_data,
        classes (name),
        profiles (full_name, phone, email)
      `)
      .eq('id', applicantId)
      .eq('school_id', schoolId) // Ensure this applicant belongs to the school
      .single();

    if (error) {
      console.error("Error fetching applicant detail:", error);
      setError("Failed to load applicant data. Applicant not found or access denied.");
      setApplicant(null);
    } else if (data) {
      const class_name = Array.isArray(data.classes) ? (data.classes[0] as any)?.name : (data.classes as any)?.name;
      const profile = Array.isArray(data.profiles) ? (data.profiles[0] as any) : (data.profiles as any);

      setApplicant({
        id: data.id,
        full_name: data.full_name,
        status: data.status as ApplicantStatus,
        application_date: data.application_date,
        class_name: class_name || 'N/A',
        former_school: data.former_school,
        aggregates: data.aggregates,
        application_data: data.application_data,

        guardian_name: profile?.full_name || 'N/A',
        guardian_phone: profile?.phone || 'N/A',
        guardian_email: profile?.email || 'N/A',

      } as ApplicantDetail);
    }

    setIsLoading(false);
  }, [applicantId, schoolId]);

  useEffect(() => {
    if (schoolId && applicantId) {
      fetchApplicantDetail();
    }
  }, [schoolId, applicantId, fetchApplicantDetail]);

  // --- Status Update Handler ---
  const handleStatusUpdate = async (newStatus: ApplicantStatus) => {
    if (!applicant) return;

    setConfirmDialog({ ...confirmDialog, open: false });
    setIsLoading(true);

    const { error } = await supabase
      .from('applicants')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', applicant.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Status update error:", error);
      return;
    }

    // Success: Update local state
    setApplicant({ ...applicant, status: newStatus });
    toast({
      title: "Status Updated",
      description: `Application status changed to ${newStatus}.`,
    });
  };



  // --- Render Logic ---

  if (schoolLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading application details...</p>
      </div>
    );
  }

  if (error || !applicant) {
    return (
      <div className="space-y-4 text-center p-10 border border-border rounded-lg mt-8">
        <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold text-destructive">Error Loading Applicant</h2>
        <p className="text-muted-foreground">{error || "Applicant details could not be found."}</p>
        <Button onClick={() => navigate('/dashboard/applicants')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applicants
        </Button>
      </div>
    );
  }

  const currentStatus = applicant.status;
  const statusClassName = currentStatus === "accepted" ? "text-success bg-success/10 border-success/30" :
    currentStatus === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30" :
      "text-warning bg-warning/10 border-warning/30";

  // Format aggregate for display
  const aggregateDisplay = applicant.aggregates?.ple_aggregate ||
    applicant.aggregates?.o_level_points ||
    'N/A';

  // Extract custom data fields
  const customDataFields = Object.entries(applicant.application_data || {})
    .filter(([key]) => !['full_name', 'class_name', 'former_school'].includes(key.toLowerCase().replace(/[^a-z0-9]/g, '_')));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Actions */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} disabled={isLoading}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">{applicant.full_name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Applied for: <span className="font-semibold text-primary">{applicant.class_name}</span></span>
              <span>•</span>
              <span>Application ID: {applicant.id.slice(0, 8)}...</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmDialog({ open: true, action: "reject" })}
            disabled={currentStatus === "rejected" || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            className="bg-success text-white hover:bg-success/90"
            onClick={() => setConfirmDialog({ open: true, action: "accept" })}
            disabled={currentStatus === "accepted" || isLoading}
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
        </div>
      </div>

      {/* Main Content: Status, Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Column 1: Core Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status Card */}
          <div className={`p-4 rounded-lg border ${statusClassName} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <FileBadge2 className="h-5 w-5" />
              <span className="font-semibold">Application Status:</span>
            </div>
            <span className="text-lg font-bold uppercase">
              {currentStatus}
            </span>
          </div>

          {/* Applicant Information */}
          <Collapsible defaultOpen className="border rounded-lg bg-card shadow-sm">
            <CollapsibleTrigger className="flex justify-between w-full p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Applicant Information
              </h2>
              <ChevronDown className="h-4 w-4 collapsible-indicator transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <DetailItem label="Full Name" value={applicant.full_name} icon={User} />
                <DetailItem label="Date of Application" value={formatDate(applicant.application_date)} icon={Calendar} />
                <DetailItem label="Former School" value={applicant.former_school || 'N/A'} icon={School} />
                <DetailItem label="Aggregate/Points" value={aggregateDisplay} icon={FileText} />

                {/* S5 Fields Display */}
                {applicant.application_data?.uceIndex && (
                  <DetailItem label="UCE Index Number" value={applicant.application_data.uceIndex} icon={FileText} />
                )}
                {applicant.application_data?.subjectCombination && (
                  <DetailItem label="Subject Combination" value={applicant.application_data.subjectCombination} icon={FileText} />
                )}
                {/* End S5 Fields */}

                {customDataFields.map(([key, value]) => (
                  <DetailItem
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={String(value)}
                    icon={FileText}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Guardian/Contact Information */}
          <Collapsible defaultOpen className="border rounded-lg bg-card shadow-sm">
            <CollapsibleTrigger className="flex justify-between w-full p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Contact Information
              </h2>
              <ChevronDown className="h-4 w-4 collapsible-indicator transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <DetailItem label="Guardian Name" value={applicant.guardian_name} icon={User} />
                <DetailItem label="Phone" value={applicant.guardian_phone} icon={Phone} />
                <DetailItem label="Email" value={applicant.guardian_email} icon={Mail} />
                {/* Note: You might want to add physical address here from profile if available */}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "accept" ? "Accept Application" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "accept"
                ? `Are you sure you want to accept ${applicant.full_name}'s application?`
                : `Are you sure you want to reject ${applicant.full_name}'s application?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              // FIX: Map the dialog action ("accept" or "reject") to the final status ("accepted" or "rejected")
              onClick={() => handleStatusUpdate(confirmDialog.action === "accept" ? "accepted" : "rejected")}
              className={confirmDialog.action === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
              disabled={isLoading}
            >
              {confirmDialog.action === "accept" ? "Accept" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Simple reusable component for detail rows
const DetailItem = ({ label, value, icon: Icon }: { label: string, value: string | number | null | undefined, icon: any }) => (
  <div className="space-y-1">
    <div className="text-xs font-medium uppercase text-muted-foreground flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </div>
    <p className="font-semibold text-foreground break-words">{value || 'N/A'}</p>
    <Separator className="mt-1 bg-border/50" />
  </div>
);


export default ApplicantDetail;