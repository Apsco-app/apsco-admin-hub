import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
}

const mockApplicants: Applicant[] = [
  { id: "1", fullName: "John Mukasa", formerSchool: "Kampala Primary School", aggregates: 12, dateOfBirth: "2010-03-15", gender: "Male", classApplied: "S1", status: "pending", applicationDate: "2024-01-15" },
  { id: "2", fullName: "Sarah Nambi", formerSchool: "St. Joseph's Primary", aggregates: 8, dateOfBirth: "2008-07-22", gender: "Female", classApplied: "S3", status: "accepted", applicationDate: "2024-01-14" },
  { id: "3", fullName: "Peter Okello", formerSchool: "Gulu Central Primary", aggregates: 15, dateOfBirth: "2009-11-08", gender: "Male", classApplied: "S2", status: "pending", applicationDate: "2024-01-13" },
  { id: "4", fullName: "Grace Atim", formerSchool: "Holy Cross Primary", aggregates: 10, dateOfBirth: "2010-02-28", gender: "Female", classApplied: "S1", status: "rejected", applicationDate: "2024-01-12" },
  { id: "5", fullName: "David Kato", formerSchool: "Mengo Primary School", aggregates: 6, dateOfBirth: "2007-05-10", gender: "Male", classApplied: "S4", status: "accepted", applicationDate: "2024-01-11" },
  { id: "6", fullName: "Mary Achieng", formerSchool: "Kisumu Academy", aggregates: 9, dateOfBirth: "2009-09-05", gender: "Female", classApplied: "S2", status: "pending", applicationDate: "2024-01-10" },
  { id: "7", fullName: "James Ouma", formerSchool: "Lake View Primary", aggregates: 14, dateOfBirth: "2010-01-20", gender: "Male", classApplied: "S1", status: "pending", applicationDate: "2024-01-09" },
  { id: "8", fullName: "Faith Nakimera", formerSchool: "Victory Primary", aggregates: 7, dateOfBirth: "2008-12-12", gender: "Female", classApplied: "S3", status: "accepted", applicationDate: "2024-01-08" },
];

const Applicants = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch = applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.formerSchool.toLowerCase().includes(searchQuery.toLowerCase());
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
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    toast({
      title: `Applicant ${newStatus === "accepted" ? "Accepted" : "Rejected"}`,
      description: `The application has been ${newStatus}.`,
    });
  };

  const handleExport = (format: "csv" | "excel") => {
    const acceptedApplicants = applicants.filter((a) => a.status === "accepted");
    toast({
      title: `Exporting ${acceptedApplicants.length} accepted applicants`,
      description: `Downloading as ${format.toUpperCase()}...`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applicants</h1>
          <p className="text-muted-foreground">Manage and review student applications</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
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
      </div>

      {/* Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants Table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Applications ({filteredApplicants.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead className="hidden md:table-cell">Former School</TableHead>
                  <TableHead className="hidden lg:table-cell">Aggregates</TableHead>
                  <TableHead className="hidden lg:table-cell">DOB</TableHead>
                  <TableHead className="hidden sm:table-cell">Gender</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApplicants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No applicants found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApplicants.map((applicant) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="font-medium">{applicant.fullName}</TableCell>
                      <TableCell className="hidden md:table-cell">{applicant.formerSchool}</TableCell>
                      <TableCell className="hidden lg:table-cell">{applicant.aggregates}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {new Date(applicant.dateOfBirth).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{applicant.gender}</TableCell>
                      <TableCell>{applicant.classApplied}</TableCell>
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
                                onClick={() => handleStatusChange(applicant.id, "accepted")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleStatusChange(applicant.id, "rejected")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/dashboard/applicants/${applicant.id}`}>
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {applicant.status !== "accepted" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "accepted")}>
                                  Accept
                                </DropdownMenuItem>
                              )}
                              {applicant.status !== "rejected" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(applicant.id, "rejected")}>
                                  Reject
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredApplicants.length)} of{" "}
                {filteredApplicants.length} results
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Applicants;
