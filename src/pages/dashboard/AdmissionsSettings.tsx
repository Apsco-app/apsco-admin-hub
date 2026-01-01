import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, Loader2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  { id: "oLevelResults", name: "O-Level Results", required: false },
  { id: "aLevelResults", name: "A-Level Results", required: false },
  { id: "parentName", name: "Parent/Guardian Name", required: false },
  { id: "phone", name: "Phone Number", required: false },
  { id: "email", name: "Email Address", required: false },
  { id: "address", name: "Home Address", required: false },
  { id: "healthInfo", name: "Health Information", required: false },
  { id: "documents", name: "Document Uploads", required: false },
];

const defaultRequiredFields = applicationFields.filter((f) => f.required).map((f) => f.id);

type ClassFieldSettings = Record<string, string[]>;

const AdmissionsSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [admissionsOpen, setAdmissionsOpen] = useState(true);
  const [deadline, setDeadline] = useState<Date | undefined>(new Date("2024-03-15"));
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["s1", "s2"]);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  
  // Per-class field settings - each class has its own enabled fields
  const [classFieldSettings, setClassFieldSettings] = useState<ClassFieldSettings>(() => {
    const initial: ClassFieldSettings = {};
    availableClasses.forEach((c) => {
      initial[c.id] = [...defaultRequiredFields];
    });
    return initial;
  });

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleFieldToggle = (classId: string, fieldId: string) => {
    const field = applicationFields.find((f) => f.id === fieldId);
    if (field?.required) return;

    setClassFieldSettings((prev) => {
      const currentFields = prev[classId] || [...defaultRequiredFields];
      const newFields = currentFields.includes(fieldId)
        ? currentFields.filter((id) => id !== fieldId)
        : [...currentFields, fieldId];
      return { ...prev, [classId]: newFields };
    });
  };

  const getEnabledFieldCount = (classId: string) => {
    const fields = classFieldSettings[classId] || defaultRequiredFields;
    return fields.length;
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

      {/* Step 3: Classes with Per-Class Field Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            3
          </div>
          <h2 className="text-lg font-semibold">Classes & Application Fields</h2>
        </div>
        
        <div className="bg-background rounded-xl border border-border p-6 ml-11">
          <p className="text-sm text-muted-foreground mb-4">
            Enable classes for admissions and customize which fields each class requires from applicants.
          </p>
          
          <div className="space-y-3">
            {availableClasses.map((classItem) => {
              const isSelected = selectedClasses.includes(classItem.id);
              const isExpanded = expandedClass === classItem.id;
              const enabledFields = classFieldSettings[classItem.id] || defaultRequiredFields;
              
              return (
                <Collapsible
                  key={classItem.id}
                  open={isExpanded && isSelected}
                  onOpenChange={(open) => setExpandedClass(open ? classItem.id : null)}
                >
                  <div
                    className={cn(
                      "rounded-lg border transition-all",
                      isSelected ? "border-primary/50 bg-primary/5" : "border-border"
                    )}
                  >
                    {/* Class Header */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => handleClassToggle(classItem.id)}
                        className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{classItem.name}</span>
                        {isSelected && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {getEnabledFieldCount(classItem.id)} fields enabled
                          </span>
                        )}
                      </div>
                      
                      {isSelected && (
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="ml-1 text-xs">Fields</span>
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                    
                    {/* Expandable Field Settings */}
                    <CollapsibleContent>
                      <div className="border-t border-border/50 p-4 bg-muted/20">
                        <p className="text-xs text-muted-foreground mb-3">
                          Select which fields {classItem.name} applicants must fill out:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {applicationFields.map((field) => (
                            <div
                              key={field.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-md border transition-colors",
                                enabledFields.includes(field.id)
                                  ? "border-primary/30 bg-primary/5"
                                  : "border-transparent bg-background",
                                field.required && "opacity-60"
                              )}
                            >
                              <Checkbox
                                checked={enabledFields.includes(field.id)}
                                onCheckedChange={() => handleFieldToggle(classItem.id, field.id)}
                                disabled={field.required}
                                className="h-4 w-4"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm truncate block">{field.name}</span>
                                {field.required && (
                                  <span className="text-[10px] text-muted-foreground">(Required)</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsSettings;
