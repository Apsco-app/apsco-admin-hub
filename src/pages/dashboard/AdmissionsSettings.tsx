// src/pages/dashboard/AdmissionsSettings.tsx

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, Loader2, Check, ChevronDown, ChevronUp, MinusCircle, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

// 1. Application Fields Definition
const applicationFields = [
  // PERSONAL INFORMATION
  { id: "fullName", name: "Full Name", category: "Personal Information", required: true },
  { id: "dateOfBirth", name: "Date of Birth", category: "Personal Information", required: true },
  { id: "gender", name: "Gender", category: "Personal Information", required: true },
  { id: "religion", name: "Religion", category: "Personal Information", required: true },
  { id: "nationality", name: "Nationality", category: "Personal Information", required: true },
  { id: "parentName", name: "Parent/Guardian Name", category: "Personal Information", required: true },
  { id: "phone", name: "Phone Number", category: "Personal Information", required: true },
  { id: "email", name: "Email Address", category: "Personal Information", required: false },
  { id: "address", name: "Home Address", category: "Personal Information", required: true },
  { id: "healthInfo", name: "Health Information", category: "Personal Information", required: false },
  { id: "hobbies", name: "Hobbies & Talents", category: "Personal Information", required: false },
  { id: "sports", name: "Favorite Sports", category: "Personal Information", required: false },
  { id: "careerInterest", name: "Career Interests", category: "Personal Information", required: false },
  { id: "nin", name: "Parent's National ID Number (NIN)", category: "Personal Information", required: true },

  // GENERIC ACADEMIC
  { id: "formerSchool", name: "Former School Name", category: "Academic Background", required: true },
  { id: "formerSchoolLocation", name: "Former School Location", category: "Academic Background", required: false },

  // PRIMARY ENTRY (S.1-S.3)
  { id: "lin", name: "LIN (Learner ID)", category: "Primary Entry Requirements (PLE)", required: false },
  { id: "pleIndex", name: "PLE Index Number", category: "Primary Entry Requirements (PLE)", required: false },

  { id: "pleEnglish", name: "PLE English Score", category: "Primary Entry Requirements (PLE)", required: false },
  { id: "pleMath", name: "PLE Mathematics Score", category: "Primary Entry Requirements (PLE)", required: false },
  { id: "pleScience", name: "PLE Science Score", category: "Primary Entry Requirements (PLE)", required: false },
  { id: "pleSst", name: "PLE SST Score", category: "Primary Entry Requirements (PLE)", required: false },
  { id: "pleAggregates", name: "Total PLE Aggregates", category: "Primary Entry Requirements (PLE)", required: false },
  { id: "pleDivision", name: "PLE Division", category: "Primary Entry Requirements (PLE)", required: false },

  // A-LEVEL ENTRY (S.5-S.6)
  { id: "uceIndex", name: "UCE Index Number", category: "A-Level Entry Requirements (UCE)", required: false },
  { id: "uceAggregates", name: "UCE Aggregates (Best 8)", category: "A-Level Entry Requirements (UCE)", required: false },
  { id: "oLevelSchoolName", name: "'O' Level School Name", category: "A-Level Entry Requirements (UCE)", required: false },
  { id: "oLevelSchoolLocation", name: "'O' Level School Location", category: "A-Level Entry Requirements (UCE)", required: false },
  { id: "subjectCombination", name: "Subject Combination (e.g. PCM/ICT)", category: "A-Level Entry Requirements (UCE)", required: false },
];

const categories = Array.from(new Set(applicationFields.map(f => f.category)));
const defaultRequiredFields = applicationFields.filter((f) => f.required).map((f) => f.id);

function getClassConfig(c: any): { id: string; enabled_fields: string[] | null; is_admissions_enabled: boolean } | null {
  const raw = c.class_field_config;
  if (raw == null) return null;
  const config = Array.isArray(raw) ? raw[0] : raw;
  if (!config || typeof config !== 'object') return null;
  return {
    id: config.id,
    enabled_fields: config.enabled_fields ?? null,
    is_admissions_enabled: config.is_admissions_enabled ?? false,
  };
}

// 2. Interfaces for state management
interface ClassSetting {
  id: string;
  name: string;
  config_id: string | null;
  is_admissions_enabled: boolean;
  enabled_fields: string[];
  is_collapsible_open: boolean;
}

interface GlobalSettings {
  settings_id: string | null;
  is_open: boolean;
  deadline_date: Date | undefined;
  decision_date: Date | undefined;
}

const AdmissionsSettings = () => {
  const { toast } = useToast();
  const { schoolId, isLoading: schoolLoading } = useSchoolData() as any;

  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<{ global: GlobalSettings, classes: ClassSetting[] } | null>(null);

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    settings_id: null,
    is_open: false,
    deadline_date: undefined,
    decision_date: undefined,
  });

  // Per-Class Settings State
  const [classSettings, setClassSettings] = useState<ClassSetting[]>([]);

  // --- Data Fetching ---
  const fetchSettings = useCallback(async () => {
    if (!schoolId) {
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);

    try {
      // 1. Fetch all classes and their field configs
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
            id, 
            name,
            class_field_config (id, enabled_fields, is_admissions_enabled)
          `)
        .eq('school_id', schoolId)
        .order('name', { ascending: true });

      if (classError) {
        console.error("Error fetching class settings:", classError);
        toast({
          title: "Error",
          description: `Failed to load class configuration: ${classError.message}`,
          variant: "destructive"
        });
      } else {
        const formattedClasses: ClassSetting[] = classData.map((c: any) => {
          const config = getClassConfig(c);
          const savedFields = config?.enabled_fields;
          const enabledFields = (savedFields !== null && savedFields !== undefined && Array.isArray(savedFields))
            ? savedFields
            : [];
          const finalFields = Array.from(new Set([...defaultRequiredFields, ...enabledFields]));

          return {
            id: c.id,
            name: c.name,
            config_id: config?.id ?? null,
            is_admissions_enabled: config?.is_admissions_enabled ?? false,
            enabled_fields: finalFields,
            is_collapsible_open: false,
          };
        });
        setClassSettings(formattedClasses);
      }

      // 2. Fetch Global Admission Settings (including decision_date)
      const { data: globalData, error: globalError } = await supabase
        .from('admissions_settings')
        .select('id, is_open, deadline_date, decision_date')
        .eq('school_id', schoolId)
        .maybeSingle();

      let loadedGlobal: GlobalSettings;
      if (globalError) {
        console.error("Error fetching global settings:", globalError);
        toast({
          title: "Data Load Error",
          description: `Global Settings: ${globalError.message} (Code: ${globalError.code})`,
          variant: "destructive"
        });
        loadedGlobal = { settings_id: null, is_open: false, deadline_date: undefined, decision_date: undefined };
        setGlobalSettings(loadedGlobal);
      } else if (globalData) {
        loadedGlobal = {
          settings_id: globalData.id,
          is_open: globalData.is_open,
          deadline_date: globalData.deadline_date ? new Date(globalData.deadline_date) : undefined,
          decision_date: globalData.decision_date ? new Date(globalData.decision_date) : undefined,
        };
        setGlobalSettings(loadedGlobal);
      } else {
        loadedGlobal = { settings_id: null, is_open: false, deadline_date: undefined, decision_date: undefined };
        setGlobalSettings(loadedGlobal);
      }

      if (classData) {
        setLastSavedState({
          global: { ...loadedGlobal },
          classes: classData.map((c: any) => {
            const config = getClassConfig(c);
            const savedFields = config?.enabled_fields;
            const enabledFields = (savedFields !== null && savedFields !== undefined && Array.isArray(savedFields))
              ? savedFields
              : [];
            const finalFields = Array.from(new Set([...defaultRequiredFields, ...enabledFields]));
            return {
              id: c.id,
              name: c.name,
              config_id: config?.id ?? null,
              is_admissions_enabled: config?.is_admissions_enabled ?? false,
              enabled_fields: finalFields,
              is_collapsible_open: false,
            };
          }),
        });
      }
    } catch (error: any) {
      console.error("Unexpected error loading settings:", error);
      toast({
        title: "System Error",
        description: `Error: ${error.message || JSON.stringify(error)}`,
        variant: "destructive"
      });
    } finally {
      setIsDataLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Track unsaved changes
  useEffect(() => {
    if (lastSavedState) {
      const globalChanged =
        globalSettings.is_open !== lastSavedState.global.is_open ||
        globalSettings.deadline_date?.getTime() !== lastSavedState.global.deadline_date?.getTime() ||
        globalSettings.decision_date?.getTime() !== lastSavedState.global.decision_date?.getTime();

      const classesChanged = JSON.stringify(classSettings.map(c => ({
        id: c.id,
        is_admissions_enabled: c.is_admissions_enabled,
        enabled_fields: c.enabled_fields.sort()
      }))) !== JSON.stringify(lastSavedState.classes.map(c => ({
        id: c.id,
        is_admissions_enabled: c.is_admissions_enabled,
        enabled_fields: c.enabled_fields.sort()
      })));

      setHasUnsavedChanges(globalChanged || classesChanged);
    }
  }, [globalSettings, classSettings, lastSavedState]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleGlobalSettingChange = (key: keyof GlobalSettings, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClassToggle = (classId: string) => {
    setClassSettings((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, is_admissions_enabled: !c.is_admissions_enabled } : c
      )
    );
  };

  const handleFieldToggle = (classId: string, fieldId: string) => {
    const field = applicationFields.find((f) => f.id === fieldId);
    if (field?.required) return;

    setClassSettings((prev) =>
      prev.map((c) => {
        if (c.id !== classId) return c;

        const currentFields = c.enabled_fields;
        const newFields = currentFields.includes(fieldId)
          ? currentFields.filter((id) => id !== fieldId)
          : [...currentFields, fieldId];

        return { ...c, enabled_fields: newFields };
      })
    );
  };

  // --- Save Handler ---
  const handleSave = async () => {
    if (!schoolId) {
      toast({
        title: "Save Error",
        description: "Critical Error: School ID is missing. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    let success = true;

    try {
      // 1. Save Global Admissions Settings (UPSERT)
      const globalPayload = {
        school_id: schoolId,
        is_open: globalSettings.is_open,
        deadline_date: globalSettings.deadline_date ? format(globalSettings.deadline_date, 'yyyy-MM-dd') : null,
        decision_date: globalSettings.decision_date ? format(globalSettings.decision_date, 'yyyy-MM-dd') : null,
        ...(globalSettings.settings_id && { id: globalSettings.settings_id })
      };

      const { data: globalUpdate, error: globalError } = await supabase
        .from('admissions_settings')
        .upsert(globalPayload, { onConflict: 'school_id' })
        .select('id')
        .single();

      if (globalError) {
        console.error("Global settings save failed:", globalError);
        toast({ title: "Error", description: `Failed to save global settings: ${globalError.message}`, variant: "destructive" });
        success = false;
      } else {
        if (globalUpdate && !globalSettings.settings_id) {
          setGlobalSettings(prev => ({ ...prev, settings_id: globalUpdate.id }));
        }

        const { error: schoolUpdateError } = await supabase
          .from('schools')
          .update({ is_admissions_open: globalSettings.is_open })
          .eq('id', schoolId);

        if (schoolUpdateError) {
          console.error("Failed to sync with schools table:", schoolUpdateError);
        }
      }

      // 2. Save Per-Class Field Configurations
      const classUpdates = classSettings.map(c => {
        const nonRequiredFields = c.enabled_fields.filter(fieldId => !defaultRequiredFields.includes(fieldId));

        const updatePayload: any = {
          school_id: schoolId,
          class_id: c.id,
          is_admissions_enabled: c.is_admissions_enabled,
          enabled_fields: nonRequiredFields.length > 0 ? nonRequiredFields : [],
        };

        if (c.config_id) {
          updatePayload.id = c.config_id;
        }

        return updatePayload;
      });

      const { data: configUpdates, error: configError } = await supabase
        .from('class_field_config')
        .upsert(classUpdates, {
          onConflict: 'class_id',
          ignoreDuplicates: false
        })
        .select('id, class_id, enabled_fields, is_admissions_enabled');

      if (configError) {
        console.error("Class settings save failed:", configError);
        toast({ title: "Error", description: `Failed to save class configurations: ${configError.message}`, variant: "destructive" });
        success = false;
      } else if (configUpdates) {
        setClassSettings(prev => {
          const updated = prev.map(c => {
            const saved = configUpdates.find((u: any) => u.class_id === c.id);
            if (saved) {
              return {
                ...c,
                config_id: saved.id,
              };
            }
            return c;
          });

          if (success) {
            setLastSavedState({
              global: { ...globalSettings },
              classes: updated.map(c => ({ ...c })),
            });
            setHasUnsavedChanges(false);
          }

          return updated;
        });

        for (const c of classSettings) {
          await supabase
            .from('classes')
            .update({ accepting_applications: c.is_admissions_enabled })
            .eq('id', c.id);
        }
      }

      if (success) {
        toast({ title: "Settings Saved", description: "Your admissions settings have been successfully updated.", action: <Check className="h-5 w-5 text-success" /> });
      }
    } catch (error: any) {
      console.error("Unexpected error saving settings:", error);
      toast({
        title: "Save Failed",
        description: `Unexpected error: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (schoolLoading || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading admissions configuration...</p>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="space-y-4 text-center p-8 border border-border rounded-lg mt-8 max-w-xl mx-auto">
        <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold text-destructive">Setup Required</h2>
        <p className="text-muted-foreground">Please create your school profile first to configure admissions settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admissions Settings</h1>
          <p className="text-muted-foreground">Configure your admissions preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              if (e.shiftKey) {
                window.location.reload();
              } else {
                fetchSettings();
              }
            }}
            disabled={isSaving || isDataLoading}
            title="Click to refresh data. Shift+Click to forcefully reload the page."
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isDataLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || (!hasUnsavedChanges && !isDataLoading)}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {hasUnsavedChanges ? "Save Changes" : "All Changes Saved"}
              </>
            )}
          </Button>
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground flex items-center">
              You have unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Step 1: Admissions Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <h2 className="text-lg font-semibold">Admissions Status & Key Dates</h2>
        </div>
        <div className="bg-background rounded-xl border border-border p-6 ml-11">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="admissions-toggle" className="font-medium">
                Admissions Open Globally
              </Label>
              <p className="text-sm text-muted-foreground">
                When disabled, no applications can be submitted, regardless of per-class settings.
              </p>
            </div>
            <Switch
              id="admissions-toggle"
              checked={globalSettings.is_open}
              onCheckedChange={(checked) => handleGlobalSettingChange('is_open', checked)}
              disabled={isSaving}
            />
          </div>

          {/* Date Pickers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Application Deadline */}
            <div className="space-y-2">
              <Label className="font-medium block">Admissions Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !globalSettings.deadline_date && "text-muted-foreground"
                    )}
                    disabled={isSaving}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {globalSettings.deadline_date ? (
                      format(globalSettings.deadline_date, "PPP")
                    ) : (
                      <span>Set deadline date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={globalSettings.deadline_date}
                    onSelect={(date) => handleGlobalSettingChange('deadline_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Applications will be automatically closed after this date.
              </p>
            </div>

            {/* Decision Release Date */}
            <div className="space-y-2">
              <Label className="font-medium block">Decision Release Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !globalSettings.decision_date && "text-muted-foreground"
                    )}
                    disabled={isSaving}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {globalSettings.decision_date ? (
                      format(globalSettings.decision_date, "PPP")
                    ) : (
                      <span>Set decision release date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={globalSettings.decision_date}
                    onSelect={(date) => handleGlobalSettingChange('decision_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Date by which applicants receive their acceptance or rejection status.
              </p>
            </div>
          </div>

          {globalSettings.decision_date && (
            <p className="mt-4 rounded-md bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Decision Release Date:</span>{" "}
              {format(globalSettings.decision_date, "PPP")}
            </p>
          )}
        </div>
      </div>

      {/* Step 2: Per-Class Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            2
          </div>
          <h2 className="text-lg font-semibold">Per-Class Admissions and Fields</h2>
        </div>
        <div className="bg-background rounded-xl border border-border p-6 ml-11 space-y-6">
          <p className="text-sm text-muted-foreground">
            Control admissions status and required fields for each class level individually.
          </p>

          <div className="space-y-4">
            {classSettings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No classes found. Please create classes in the **Classes** section first.
              </div>
            ) : (
              classSettings.map((classItem) => (
                <Collapsible
                  key={classItem.id}
                  open={classItem.is_collapsible_open}
                  onOpenChange={(open) => setClassSettings(prev => prev.map(c =>
                    c.id === classItem.id ? { ...c, is_collapsible_open: open } : c
                  ))}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer bg-muted/10 hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-base">{classItem.name}</span>
                          <div className="flex items-center gap-2">
                            {classItem.is_admissions_enabled ?
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/20 text-success uppercase tracking-wider">Open</span> :
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-destructive/20 text-destructive uppercase tracking-wider">Closed</span>
                            }
                            <span className="text-[10px] text-muted-foreground uppercase">| {classItem.enabled_fields.length} Fields Configured</span>
                          </div>
                        </div>
                      </div>
                      {classItem.is_collapsible_open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <Label htmlFor={`class-toggle-${classItem.id}`} className="font-medium">
                          Admissions Open for {classItem.name}
                          <p className="text-xs text-muted-foreground">Override global status to close admissions for this class only.</p>
                        </Label>
                        <Switch
                          id={`class-toggle-${classItem.id}`}
                          checked={classItem.is_admissions_enabled}
                          onCheckedChange={() => handleClassToggle(classItem.id)}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-6 pt-4">
                        {categories.map((category) => (
                          <div key={category} className="space-y-3">
                            <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                              <FileText className="h-4 w-4" />
                              {category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {applicationFields
                                .filter((f) => f.category === category)
                                .map((field) => (
                                  <div
                                    key={field.id}
                                    className={cn(
                                      "flex items-center space-x-2 p-3 rounded-md border transition-colors",
                                      classItem.enabled_fields.includes(field.id)
                                        ? "border-primary/30 bg-primary/5"
                                        : "border-transparent bg-background",
                                      field.required && "opacity-60"
                                    )}
                                  >
                                    <Checkbox
                                      id={`${classItem.id}-${field.id}`}
                                      checked={classItem.enabled_fields.includes(field.id)}
                                      onCheckedChange={() => handleFieldToggle(classItem.id, field.id)}
                                      disabled={field.required || isSaving}
                                      className="h-4 w-4"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Label
                                        htmlFor={`${classItem.id}-${field.id}`}
                                        className="text-sm cursor-pointer block"
                                      >
                                        {field.name}
                                      </Label>
                                      {field.required && (
                                        <span className="text-[10px] text-muted-foreground uppercase">(Required)</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsSettings;