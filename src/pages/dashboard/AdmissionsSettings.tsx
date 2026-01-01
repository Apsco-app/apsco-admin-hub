import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const availableClasses = [
  { id: "s1", name: "Senior 1" },
  { id: "s2", name: "Senior 2" },
  { id: "s3", name: "Senior 3" },
  { id: "s4", name: "Senior 4" },
  { id: "s5", name: "Senior 5" },
  { id: "s6", name: "Senior 6" },
];

const applicationFields = [
  { id: "fullName", name: "Full Name", required: true },
  { id: "dateOfBirth", name: "Date of Birth", required: true },
  { id: "gender", name: "Gender", required: true },
  { id: "formerSchool", name: "Former School", required: true },
  { id: "aggregates", name: "PLE Aggregates", required: false },
  { id: "parentName", name: "Parent/Guardian Name", required: false },
  { id: "phone", name: "Phone Number", required: false },
  { id: "email", name: "Email Address", required: false },
  { id: "address", name: "Home Address", required: false },
  { id: "healthInfo", name: "Health Information", required: false },
];

const AdmissionsSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(true);
  const [deadline, setDeadline] = useState<Date | undefined>(new Date("2024-03-15"));
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["s1", "s2"]);
  const [enabledFields, setEnabledFields] = useState<string[]>(
    applicationFields.filter((f) => f.required).map((f) => f.id)
  );

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleFieldToggle = (fieldId: string) => {
    const field = applicationFields.find((f) => f.id === fieldId);
    if (field?.required) return;

    setEnabledFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast({
      title: "Settings Saved",
      description: "Your admissions settings have been updated.",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admissions Settings</h1>
          <p className="text-muted-foreground">Configure your admissions preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Step 1: Admissions Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <h2 className="text-lg font-semibold">Admissions Status</h2>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6 ml-11">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="admissions-toggle" className="text-base font-medium">
                Accept Applications
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {admissionsOpen
                  ? "Your school is currently accepting applications"
                  : "Applications are currently closed"}
              </p>
            </div>
            <Switch
              id="admissions-toggle"
              checked={admissionsOpen}
              onCheckedChange={setAdmissionsOpen}
            />
          </div>
        </div>
      </div>

      {/* Step 2: Deadline */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <h2 className="text-lg font-semibold">Application Deadline</h2>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6 ml-11">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal",
                  !deadline && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {deadline ? format(deadline, "PPP") : "Select deadline"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Step 3: Classes */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            3
          </div>
          <h2 className="text-lg font-semibold">Classes Accepting Applications</h2>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6 ml-11">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableClasses.map((classItem) => (
              <button
                key={classItem.id}
                onClick={() => handleClassToggle(classItem.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all text-left",
                  selectedClasses.includes(classItem.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/30"
                )}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center transition-colors",
                  selectedClasses.includes(classItem.id)
                    ? "bg-primary border-primary"
                    : "border-muted-foreground/30"
                )}>
                  {selectedClasses.includes(classItem.id) && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="font-medium">{classItem.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 4: Application Fields */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            4
          </div>
          <h2 className="text-lg font-semibold">Application Form Fields</h2>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6 ml-11">
          <p className="text-sm text-muted-foreground mb-4">
            Select which fields applicants must fill out. Required fields cannot be disabled.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {applicationFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  enabledFields.includes(field.id)
                    ? "border-primary/30 bg-primary/5"
                    : "border-border",
                  field.required && "opacity-60"
                )}
              >
                <Checkbox
                  checked={enabledFields.includes(field.id)}
                  onCheckedChange={() => handleFieldToggle(field.id)}
                  disabled={field.required}
                />
                <div className="flex-1">
                  <span className="font-medium text-sm">{field.name}</span>
                  {field.required && (
                    <span className="text-xs text-muted-foreground ml-2">(Required)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsSettings;
