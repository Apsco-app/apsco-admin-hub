// src/pages/dashboard/AdmissionsSettings.tsx (FIXED)

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save, Loader2, Check, ChevronDown, ChevronUp, MinusCircle, FileText } from "lucide-react"; // <--- FIX: Added FileText
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

// 1. Application Fields Definition (Static for all schools, managed here)
const applicationFields = [
  { id: "fullName", name: "Full Name", required: true },
  { id: "dateOfBirth", name: "Date of Birth", required: true },
  { id: "gender", name: "Gender", required: true },
  { id: "formerSchool", name: "Former School", required: true },
  { id: "aggregates", name: "PLE Aggregates", required: false },
  { id: "oLevelResults", name: "O-Level Results", required: false },
  { id: "aLevelResults", name: "A-Level Results", required: false },
  { id: "parentName", name: "Parent/Guardian Name", required: true }, 
  { id: "phone", name: "Phone Number", required: true }, 
  { id: "email", name: "Email Address", required: false },
  { id: "address", name: "Home Address", required: false },
  { id: "healthInfo", name: "Health Information", required: false },
  { id: "documents", name: "Document Uploads", required: false },
];

const defaultRequiredFields = applicationFields.filter((f) => f.required).map((f) => f.id);

// 2. Interfaces for state management
interface ClassSetting {
  id: string; // class.id
  name: string; // class.name
  config_id: string | null; // class_field_config.id
  is_admissions_enabled: boolean;
  enabled_fields: string[]; // class_field_config.enabled_fields (JSONB array)
  is_collapsible_open: boolean; // UI state for my previous fix's Collapsible
}

interface GlobalSettings {
    settings_id: string | null;
    is_open: boolean;
    deadline_date: Date | undefined;
}


const AdmissionsSettings = () => {
  const { toast } = useToast();
  // Ensure useSchoolData is safely cast to 'any' for consistency
  const { schoolId, isLoading: schoolLoading } = useSchoolData() as any; 
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
      settings_id: null,
      is_open: false,
      deadline_date: undefined,
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
        toast({ title: "Error", description: "Failed to load class configuration.", variant: "destructive" });
    } else {
        const formattedClasses: ClassSetting[] = classData.map((c: any) => {
            const config = c.class_field_config[0]; // Assuming one config per class
            const enabledFields = config?.enabled_fields || defaultRequiredFields;

            // Ensure required fields are always included, even if DB config is old/missing them
            const finalFields = Array.from(new Set([...defaultRequiredFields, ...enabledFields]));
            
            return {
                id: c.id,
                name: c.name,
                config_id: config?.id || null,
                is_admissions_enabled: config?.is_admissions_enabled || false,
                enabled_fields: finalFields,
                is_collapsible_open: false, // Default to closed
            };
        });
        setClassSettings(formattedClasses);
    }
    
    // 2. Fetch Global Admission Settings (using the admissions_settings table as per original logic)
    const { data: globalData, error: globalError } = await supabase
        .from('admissions_settings')
        .select('id, is_open, deadline_date')
        .eq('school_id', schoolId)
        .single();
    
    if (globalError && globalError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching global settings:", globalError);
        toast({ title: "Error", description: "Failed to load global admissions settings.", variant: "destructive" });
    } else if (globalData) {
        setGlobalSettings({
            settings_id: globalData.id,
            is_open: globalData.is_open,
            deadline_date: globalData.deadline_date ? new Date(globalData.deadline_date) : undefined,
        });
    }

    setIsDataLoading(false);
  }, [schoolId, toast]);

  useEffect(() => {
    if (schoolId) {
      fetchSettings();
    }
  }, [schoolId, fetchSettings]);


  // --- State Handlers (Preserving original logic) ---

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
    if (field?.required) return; // Cannot disable required fields

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
    if (!schoolId) return;
    setIsSaving(true);
    let success = true;

    // 1. Save Global Admissions Settings (UPSERT)
    const globalPayload = {
        school_id: schoolId,
        is_open: globalSettings.is_open,
        deadline_date: globalSettings.deadline_date ? format(globalSettings.deadline_date, 'yyyy-MM-dd') : null,
        // Include ID for update, omit for insert
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
    } else if (globalUpdate && !globalSettings.settings_id) {
        // Update local state with the new ID if it was an INSERT
        setGlobalSettings(prev => ({ ...prev, settings_id: globalUpdate.id }));
    }

    // 2. Save Per-Class Field Configurations (Loop and UPSERT)
    const classUpdates = classSettings.map(c => ({
        school_id: schoolId,
        class_id: c.id,
        is_admissions_enabled: c.is_admissions_enabled,
        // The DB field only needs non-required fields, as required fields are application logic
        enabled_fields: c.enabled_fields.filter(fieldId => !defaultRequiredFields.includes(fieldId)), 
        // Include ID for update, omit for insert
        ...(c.config_id && { id: c.config_id })
    }));
    
    // Use an upsert with multiple rows
    const { data: configUpdates, error: configError } = await supabase
        .from('class_field_config')
        // Conflict targets class_id, ensuring only one config per class
        .upsert(classUpdates, { onConflict: 'class_id' }) 
        .select('id, class_id');

    if (configError) {
        console.error("Class settings save failed:", configError);
        toast({ title: "Error", description: `Failed to save class configurations: ${configError.message}`, variant: "destructive" });
        success = false;
    } else if (configUpdates) {
        // Update local state with new IDs for any inserts
        setClassSettings(prev => prev.map(c => {
            const updated = configUpdates.find((u: any) => u.class_id === c.id);
            if (updated && !c.config_id) {
                return { ...c, config_id: updated.id };
            }
            return c;
        }));
    }

    setIsSaving(false);
    if (success) {
        toast({ title: "Settings Saved", description: "Your admissions settings have been successfully updated.", action: <Check className="h-5 w-5 text-success" />, });
    }
  };


  // --- Render Logic (CRITICAL STABILITY FIX) ---

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
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
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

      {/* Step 1: Admissions Status - RETAINED DESIGN */}
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
          <div className="mt-6 space-y-2">
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
                    <span>Set a deadline date</span>
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
        </div>
      </div>

      {/* Step 2: Per-Class Configuration - RETAINED DESIGN */}
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
                    c.id === classItem.id ? {...c, is_collapsible_open: open} : c
                  ))}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 cursor-pointer bg-muted/20 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{classItem.name}</span>
                        <div className="text-xs text-muted-foreground">
                            {classItem.is_admissions_enabled ? 
                                <span className="text-success font-medium">Open</span> : 
                                <span className="text-destructive font-medium">Closed</span>
                            } 
                            | {classItem.enabled_fields.length} Fields
                        </div>
                      </div>
                      {classItem.is_collapsible_open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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

                        <div className="space-y-3">
                            <h3 className="text-base font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Required Application Fields
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {applicationFields.map((field) => (
                                    <div 
                                        key={field.id}
                                        className={cn(
                                            "flex items-center space-x-2 p-3 rounded-md border transition-colors",
                                            classItem.enabled_fields.includes(field.id)
                                                ? "border-primary/30 bg-primary/5"
                                                : "border-transparent bg-background",
                                            field.required && "opacity-60" // Dim required fields
                                        )}
                                    >
                                        <Checkbox
                                            checked={classItem.enabled_fields.includes(field.id)}
                                            onCheckedChange={() => handleFieldToggle(classItem.id, field.id)}
                                            disabled={field.required || isSaving}
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