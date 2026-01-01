import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type ApplicantStatus = "pending" | "accepted" | "rejected";

interface Applicant {
  id: string;
  fullName: string;
  formerSchool: string;
  aggregates: number;
  dateOfBirth: string;
  gender: string;
  classApplied: string;
  status: ApplicantStatus;
  applicationDate: string;
  rejectedAt?: string;
}

const mockApplicants: Applicant[] = [
  { id: "1", fullName: "John Mukasa", formerSchool: "Kampala Primary School", aggregates: 12, dateOfBirth: "2010-03-15", gender: "Male", classApplied: "S1", status: "pending", applicationDate: "2024-01-15" },
  { id: "2", fullName: "Sarah Nambi", formerSchool: "St. Joseph's Primary", aggregates: 8, dateOfBirth: "2008-07-22", gender: "Female", classApplied: "S3", status: "accepted", applicationDate: "2024-01-14" },
  { id: "3", fullName: "Peter Okello", formerSchool: "Gulu Central Primary", aggregates: 15, dateOfBirth: "2009-11-08", gender: "Male", classApplied: "S2", status: "pending", applicationDate: "2024-01-13" },
  { id: "4", fullName: "Grace Atim", formerSchool: "Holy Cross Primary", aggregates: 10, dateOfBirth: "2010-02-28", gender: "Female", classApplied: "S1", status: "rejected", applicationDate: "2024-01-12", rejectedAt: new Date().toISOString() },
  { id: "5", fullName: "David Kato", formerSchool: "Mengo Primary School", aggregates: 6, dateOfBirth: "2007-05-10", gender: "Male", classApplied: "S4", status: "accepted", applicationDate: "2024-01-11" },
  { id: "6", fullName: "Mary Achieng", formerSchool: "Kisumu Academy", aggregates: 9, dateOfBirth: "2009-09-05", gender: "Female", classApplied: "S2", status: "pending", applicationDate: "2024-01-10" },
  { id: "7", fullName: "James Ouma", formerSchool: "Lake View Primary", aggregates: 14, dateOfBirth: "2010-01-20", gender: "Male", classApplied: "S1", status: "pending", applicationDate: "2024-01-09" },
  { id: "8", fullName: "Faith Nakimera", formerSchool: "Victory Primary", aggregates: 7, dateOfBirth: "2008-12-12", gender: "Female", classApplied: "S3", status: "accepted", applicationDate: "2024-01-08" },
];

type ColumnKey = "fullName" | "classApplied" | "aggregates" | "status" | "formerSchool" | "gender" | "dateOfBirth";

const allColumns: { key: ColumnKey; label: string; default: boolean }[] = [
  { key: "fullName", label: "Name", default: true },
  { key: "classApplied", label: "Class", default: true },
  { key: "aggregates", label: "Aggregates", default: true },
  { key: "status", label: "Status", default: true },
  { key: "formerSchool", label: "Former School", default: false },
  { key: "gender", label: "Gender", default: false },
  { key: "dateOfBirth", label: "Date of Birth", default: false },
];

const Applicants = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(
    allColumns.filter((c) => c.default).map((c) => c.key)
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "accept" | "reject";
    applicant: Applicant | null;
  }>({ open: false, action: "accept", applicant: null });
  
  const itemsPerPage = 8;

  // Filter out rejected applicants older than 24 hours
  const activeApplicants = applicants.filter((applicant) => {
    if (applicant.status === "rejected" && applicant.rejectedAt) {
      const rejectedTime = new Date(applicant.rejectedAt).getTime();
      const now = Date.now();
      const hoursSinceRejection = (now - rejectedTime) / (1000 * 60 * 60);
      return hoursSinceRejection < 24;
    }
    return true;
  });

  const filteredApplicants = activeApplicants.filter((applicant) => {
    const matchesSearch = applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || applicant.status === statusFilter;
    const matchesClass = classFilter === "all" || applicant.classApplied === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const paginatedApplicants = filteredApplicants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = (id: string, newStatus: ApplicantStatus) => {
    setApplicants((prev) =>
      prev.map((a) => 
        a.id === id 
          ? { 
              ...a, 
              status: newStatus,
              rejectedAt: newStatus === "rejected" ? new Date().toISOString() : undefined
            } 
          : a
      )
    );
    toast({
      title: newStatus === "accepted" ? "Applicant Accepted" : "Applicant Rejected",
      description: newStatus === "rejected" 
        ? "The applicant will be removed from the list in 24 hours."
        : "The application has been accepted.",
    });
    setConfirmDialog({ open: false, action: "accept", applicant: null });
  };

  const handleExport = (format: "csv" | "excel") => {
    const acceptedApplicants = applicants.filter((a) => a.status === "accepted");
    toast({
      title: `Exporting ${acceptedApplicants.length} accepted applicants`,
      description: `Downloading as ${format.toUpperCase()}...`,
    });
  };

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applicants</h1>
          <p className="text-muted-foreground">Review and manage applications</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Accepted
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              Download CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")}>
              Download Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="S1">S1</SelectItem>
            <SelectItem value="S2">S2</SelectItem>
            <SelectItem value="S3">S3</SelectItem>
            <SelectItem value="S4">S4</SelectItem>
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={visibleColumns.includes(col.key)}
                onCheckedChange={() => toggleColumn(col.key)}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {visibleColumns.includes("fullName") && <TableHead className="font-semibold">Name</TableHead>}
              {visibleColumns.includes("classApplied") && <TableHead className="font-semibold">Class</TableHead>}
              {visibleColumns.includes("aggregates") && <TableHead className="font-semibold">Aggregates</TableHead>}
              {visibleColumns.includes("formerSchool") && <TableHead className="font-semibold">Former School</TableHead>}
              {visibleColumns.includes("gender") && <TableHead className="font-semibold">Gender</TableHead>}
              {visibleColumns.includes("dateOfBirth") && <TableHead className="font-semibold">DOB</TableHead>}
              {visibleColumns.includes("status") && <TableHead className="font-semibold">Status</TableHead>}
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedApplicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center py-12 text-muted-foreground">
                  No applicants found
                </TableCell>
              </TableRow>
            ) : (
              paginatedApplicants.map((applicant, index) => (
                <TableRow 
                  key={applicant.id} 
                  className={`h-14 hover:bg-muted/30 transition-colors ${index % 2 === 1 ? 'bg-muted/10' : ''}`}
                >
                  {visibleColumns.includes("fullName") && (
                    <TableCell className="font-medium">{applicant.fullName}</TableCell>
                  )}
                  {visibleColumns.includes("classApplied") && (
                    <TableCell>{applicant.classApplied}</TableCell>
                  )}
                  {visibleColumns.includes("aggregates") && (
                    <TableCell className="font-semibold text-primary">{applicant.aggregates}</TableCell>
                  )}
                  {visibleColumns.includes("formerSchool") && (
                    <TableCell>{applicant.formerSchool}</TableCell>
                  )}
                  {visibleColumns.includes("gender") && (
                    <TableCell>{applicant.gender}</TableCell>
                  )}
                  {visibleColumns.includes("dateOfBirth") && (
                    <TableCell>{new Date(applicant.dateOfBirth).toLocaleDateString()}</TableCell>
                  )}
                  {visibleColumns.includes("status") && (
                    <TableCell>
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
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/dashboard/applicants/${applicant.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {applicant.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-success hover:text-success hover:bg-success/10"
                            onClick={() => setConfirmDialog({ open: true, action: "accept", applicant })}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmDialog({ open: true, action: "reject", applicant })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of{" "}
              {filteredApplicants.length}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
                ? `Are you sure you want to accept ${confirmDialog.applicant?.fullName}'s application?`
                : `Are you sure you want to reject ${confirmDialog.applicant?.fullName}'s application? They will be removed from the list in 24 hours.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.applicant && handleStatusChange(confirmDialog.applicant.id, confirmDialog.action === "accept" ? "accepted" : "rejected")}
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

export default Applicants;
