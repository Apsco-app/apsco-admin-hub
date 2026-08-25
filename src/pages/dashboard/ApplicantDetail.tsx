// src/pages/dashboard/ApplicantDetail.tsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  School,
  FileText,
  Check,
  X,
  ChevronDown,
  Mail,
  Phone,
  Calendar,
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
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

type ApplicantStatus = "pending" | "accepted" | "rejected";

interface ApplicantDetail {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  student_email: string | null;
  phone: string | null;
  status: ApplicantStatus;
  application_date: string;
  class_name: string;
  former_school: string | null;
  aggregates: any;

  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;

  application_data: Record<string, any>;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
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

  const fetchApplicantDetail = useCallback(async () => {
    if (!applicantId || !schoolId) return;

    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('applicants')
      .select(`
        id, 
        full_name, 
        date_of_birth,
        gender,
        student_email,
        phone,
        status, 
        application_date,
        former_school,
        aggregates,
        application_data,
        classes (name),
        profiles (full_name, phone, email)
      `)
      .eq('id', applicantId)
      .eq('school_id', schoolId)
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
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        student_email: data.student_email,
        phone: data.phone,
        status: data.status as ApplicantStatus,
        application_date: data.application_date,
        class_name: class_name || 'N/A',
        former_school: data.former_school,
        aggregates: data.aggregates || {},
        application_data: data.application_data || {},

        guardian_name: profile?.full_name || 'N/A',
        guardian_phone: profile?.phone || 'N/A',
        guardian_email: profile?.email || 'N/A',
      });
    }

    setIsLoading(false);
  }, [applicantId, schoolId]);

  useEffect(() => {
    if (schoolId && applicantId) {
      fetchApplicantDetail();
    }
  }, [schoolId, applicantId, fetchApplicantDetail]);

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
      return;
    }

    setApplicant({ ...applicant, status: newStatus });
    toast({
      title: "Status Updated",
      description: `Application status changed to ${newStatus}.`,
    });
  };

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

  const aggregateDisplay = applicant.aggregates?.ple_aggregate ||
    applicant.aggregates?.uce_aggregates ||
    'N/A';

  // Extract dynamic fields, excluding keys handled directly
  const excludedKeys = ['fullName', 'full_name', 'phone', 'email', 'student_email', 'formerSchool', 'former_school', 'gender', 'dateOfBirth', 'date_of_birth'];
  const customDataFields = Object.entries(applicant.application_data)
    .filter(([key, val]) => !excludedKeys.includes(key) && val !== null && val !== '');

  return (
    <div className="space-y-6 animate-fade-in">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        <div className="lg:col-span-2 space-y-6">

          <div className={`p-4 rounded-lg border ${statusClassName} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <FileBadge2 className="h-5 w-5" />
              <span className="font-semibold">Application Status:</span>
            </div>
            <span className="text-lg font-bold uppercase">
              {currentStatus}
            </span>
          </div>

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
                <DetailItem label="Date of Birth" value={formatDate(applicant.date_of_birth || applicant.application_data?.dateOfBirth)} icon={Calendar} />
                <DetailItem label="Gender" value={applicant.gender || applicant.application_data?.gender} icon={User} />
                <DetailItem label="Applicant Phone" value={applicant.phone || applicant.application_data?.phone} icon={Phone} />
                <DetailItem label="Applicant Email" value={applicant.student_email || applicant.application_data?.email} icon={Mail} />
                <DetailItem label="Date of Application" value={formatDate(applicant.application_date)} icon={Calendar} />
                <DetailItem label="Former School" value={applicant.former_school || applicant.application_data?.formerSchool || 'N/A'} icon={School} />
                <DetailItem label="Aggregate/Points" value={aggregateDisplay} icon={FileText} />

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

          <Collapsible defaultOpen className="border rounded-lg bg-card shadow-sm">
            <CollapsibleTrigger className="flex justify-between w-full p-4 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                Parent / Guardian Information
              </h2>
              <ChevronDown className="h-4 w-4 collapsible-indicator transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <DetailItem label="Guardian Name" value={applicant.application_data?.parentName || applicant.guardian_name} icon={User} />
                <DetailItem label="Guardian Phone" value={applicant.guardian_phone} icon={Phone} />
                <DetailItem label="Guardian Email" value={applicant.guardian_email} icon={Mail} />
                <DetailItem label="Home Address" value={applicant.application_data?.address} icon={School} />
                <DetailItem label="Parent NIN" value={applicant.application_data?.nin} icon={FileText} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

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