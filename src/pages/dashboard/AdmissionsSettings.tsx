import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Settings2, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const requiredFields = [
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
    requiredFields.filter((f) => f.required).map((f) => f.id)
  );

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleFieldToggle = (fieldId: string) => {
    const field = requiredFields.find((f) => f.id === fieldId);
    if (field?.required) return; // Can't disable required fields

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
    <div className="space-y-6 animate-fade-in">
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

      {/* Main Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admissions Status */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Admissions Status</CardTitle>
                <CardDescription>Control whether you're accepting applications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="admissions-toggle" className="font-medium">
                  Accept Applications
                </Label>
                <p className="text-sm text-muted-foreground">
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

            <div className="space-y-2">
              <Label>Admission Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
          </CardContent>
        </Card>

        {/* Classes Accepting Applications */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Classes Accepting Applications</CardTitle>
            <CardDescription>Select which classes are open for enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {availableClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    selectedClasses.includes(classItem.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleClassToggle(classItem.id)}
                >
                  <Checkbox
                    checked={selectedClasses.includes(classItem.id)}
                    onCheckedChange={() => handleClassToggle(classItem.id)}
                  />
                  <span className="font-medium">{classItem.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Form Fields */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Application Form Fields</CardTitle>
          <CardDescription>
            Choose which fields to include in the application form. Required fields cannot be
            disabled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requiredFields.map((field) => (
              <div
                key={field.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-colors",
                  enabledFields.includes(field.id)
                    ? "border-primary/30 bg-primary/5"
                    : "border-border",
                  field.required && "opacity-75"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={enabledFields.includes(field.id)}
                    onCheckedChange={() => handleFieldToggle(field.id)}
                    disabled={field.required}
                  />
                  <div>
                    <span className="font-medium">{field.name}</span>
                    {field.required && (
                      <span className="text-xs text-muted-foreground ml-2">(Required)</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionsSettings;
