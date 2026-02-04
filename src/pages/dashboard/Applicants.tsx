// src/pages/dashboard/Applicants.tsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  Settings2,
  Filter,
  Loader2,
  MinusCircle,
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
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

type ApplicantStatus = "pending" | "accepted" | "rejected";

interface Applicant {
  id: string;
  full_name: string;
  application_date: string;
  class_name: string;
  status: ApplicantStatus;
  aggregates: number | null;
}

interface ClassItem {
  id: string;
  name: string;
}

const ROWS_PER_PAGE = 10;

const Applicants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { schoolId, isLoading: schoolLoading } = useSchoolData();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filter State ---
  const [page, setPage] = useState(0); // 0-indexed page number
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | "all">("all");
  const [classFilter, setClassFilter] = useState<string | "all">("all");
  const [sortColumn, setSortColumn] = useState<keyof Applicant>("application_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // --- UI State ---
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "accept" | "reject";
    applicant: Applicant | null;
  }>({
    open: false,
    action: "accept",
    applicant: null,
  });

  const [columnVisibility, setColumnVisibility] = useState<Record<keyof Applicant | 'actions', boolean>>({
    full_name: true,
    class_name: true,
    application_date: true,
    status: true,
    aggregates: true,
    id: false, // Hidden by default
    actions: true,
  });


  // --- Data Fetching ---

  const fetchApplicants = useCallback(async () => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const from = page * ROWS_PER_PAGE;
    const to = from + ROWS_PER_PAGE - 1;

    let query = supabase
      .from('applicants')
      .select(`
        id, 
        full_name, 
        status, 
        application_date,
        aggregates,
        classes (name)
      `, { count: 'exact' }) // Request exact count
      .eq('school_id', schoolId)
      .order(sortColumn, { ascending: sortDirection === 'asc' })
      .range(from, to);

    // Apply filters
    if (statusFilter !== "all") {
      query = query.eq('status', statusFilter);
    }

    if (classFilter !== "all") {
      // Need to filter on the joined column (class_id)
      query = query.eq('class_id', classFilter);
    }

    if (searchQuery.trim()) {
      // Simple search on full_name
      query = query.ilike('full_name', `%${searchQuery.trim()}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching applicants:", error);
      toast({ title: "Error", description: "Failed to load applicant list.", variant: "destructive" });
      setApplicants([]);
      setTotalCount(0);
    } else {
      const formattedApplicants: Applicant[] = data.map((a: any) => ({
        id: a.id,
        full_name: a.full_name,
        application_date: a.application_date,
        status: a.status as ApplicantStatus,
        aggregates: a.aggregates?.pleAggregates || a.aggregates?.ple_aggregate || a.aggregates?.o_level_points || null,
        class_name: a.classes?.name || 'N/A',
      }));

      setApplicants(formattedApplicants);
      setTotalCount(count || 0);
    }

    setIsLoading(false);
  }, [schoolId, page, statusFilter, classFilter, searchQuery, sortColumn, sortDirection, toast]);

  // Fetch classes once
  const fetchClasses = useCallback(async () => {
    if (!schoolId) return;

    const { data, error } = await supabase
      .from('classes')
      .select('id, name')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching classes:", error);
    } else {
      setClasses(data as ClassItem[]);
    }
  }, [schoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId, fetchClasses]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  // --- Action Handlers ---

  const handleStatusChange = async (applicantId: string, newStatus: ApplicantStatus) => {
    setConfirmDialog({ ...confirmDialog, open: false });
    setIsLoading(true);

    const { error } = await supabase
      .from('applicants')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', applicantId)
      .eq('school_id', schoolId); // Security check

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

    // Success: Refresh data to show updated status
    toast({
      title: "Status Updated",
      description: `Applicant status changed to ${newStatus}.`,
    });
    fetchApplicants();
  };

  const handleSort = (column: keyof Applicant) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    // In a real application, this would trigger a backend process
    toast({
      title: "Export Initiated",
      description: "A CSV export of all applicants is being generated and will be downloaded shortly.",
    });
    // Mock delay
    setTimeout(() => console.log("Simulating CSV download..."), 1000);
  };


  // --- Pagination Logic ---

  const totalPages = Math.ceil(totalCount / ROWS_PER_PAGE);
  const startRange = totalCount === 0 ? 0 : page * ROWS_PER_PAGE + 1;
  const endRange = Math.min((page + 1) * ROWS_PER_PAGE, totalCount);


  // --- Render Logic ---

  const renderSortIndicator = (column: keyof Applicant) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return null;
  };

  const columns: { key: keyof Applicant | 'actions', label: string, sortable: boolean }[] = [
    { key: "full_name", label: "Applicant Name", sortable: true },
    { key: "class_name", label: "Class", sortable: false }, // Class name is complex to sort via Supabase join without an RPC
    { key: "aggregates", label: "Aggregate/Points", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "application_date", label: "Applied On", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  if (!schoolId) {
    return (
      <div className="space-y-4 text-center p-8 border border-border rounded-lg mt-8">
        <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">School Profile Required</h2>
        <p className="text-muted-foreground">Please create and verify your school profile to view applicants.</p>
        <Button onClick={() => navigate('/create-school')} variant="default">
          {/* FIX: Changed variant="primary" to variant="default" to resolve the type error */}
          Setup School
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Applicant Management</h1>
        <Button onClick={handleExport} variant="outline" disabled={isLoading || totalCount === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0); // Reset to first page on search
              }}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex w-full sm:w-auto space-x-2 justify-end">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(val) => {
            setStatusFilter(val as ApplicantStatus | "all");
            setPage(0); // Reset to first page
          }} disabled={isLoading}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Class Filter */}
          <Select value={classFilter} onValueChange={(val) => {
            setClassFilter(val);
            setPage(0); // Reset to first page
          }} disabled={isLoading}>
            <SelectTrigger className="w-[150px]">
              <Settings2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" disabled={isLoading}>
                <Settings2 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.key}
                  checked={columnVisibility[col.key] as boolean}
                  onCheckedChange={(checked) => setColumnVisibility((prev) => ({ ...prev, [col.key]: checked }))}
                  disabled={col.key === 'full_name' || col.key === 'actions'} // Lock name and actions
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Applicant Table */}
      <div className="rounded-md border bg-card/70 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(col => columnVisibility[col.key]).map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key as keyof Applicant)}
                  className={col.sortable ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                >
                  {col.label}
                  {renderSortIndicator(col.key as keyof Applicant)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.filter(col => columnVisibility[col.key]).length} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : applicants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.filter(col => columnVisibility[col.key]).length} className="h-24 text-center text-muted-foreground">
                  No applicants found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              applicants.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-muted/50 transition-colors">
                  {columnVisibility.full_name && <TableCell className="font-medium min-w-[200px]">{applicant.full_name}</TableCell>}
                  {columnVisibility.class_name && <TableCell>{applicant.class_name}</TableCell>}
                  {columnVisibility.aggregates && <TableCell>{applicant.aggregates || 'N/A'}</TableCell>}
                  {columnVisibility.status && (
                    <TableCell>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border 
                          ${applicant.status === "accepted" ? "text-success bg-success/10 border-success/30" :
                            applicant.status === "rejected" ? "text-destructive bg-destructive/10 border-destructive/30" :
                              "text-warning bg-warning/10 border-warning/30"
                          }`
                        }
                      >
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </span>
                    </TableCell>
                  )}
                  {columnVisibility.application_date && (
                    <TableCell>{new Date(applicant.application_date).toLocaleDateString()}</TableCell>
                  )}
                  {columnVisibility.actions && (
                    <TableCell className="w-[150px]">
                      <div className="flex items-center space-x-2">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <Link to={`/dashboard/applicants/${applicant.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={applicant.status === 'rejected'}>
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="text-success focus:text-success"
                              disabled={applicant.status === 'accepted'}
                              onClick={() => setConfirmDialog({ open: true, action: "accept", applicant })}
                            >
                              <Check className="h-4 w-4 mr-2" /> Accept
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              disabled={applicant.status === 'rejected'}
                              onClick={() => setConfirmDialog({ open: true, action: "reject", applicant })}
                            >
                              <X className="h-4 w-4 mr-2" /> Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {startRange} to {endRange} of {totalCount} applicants
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1 || isLoading || totalCount === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open: false, applicant: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "accept" ? "Accept Application" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "accept"
                ? `Are you sure you want to accept ${confirmDialog.applicant?.full_name}'s application?`
                : `Are you sure you want to reject ${confirmDialog.applicant?.full_name}'s application?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.applicant && handleStatusChange(
                confirmDialog.applicant.id,
                confirmDialog.action === "accept" ? "accepted" : "rejected"
              )}
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

export default Applicants;