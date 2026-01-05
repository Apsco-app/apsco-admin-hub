// src/pages/dashboard/Settings.tsx

import { useState, useEffect, useCallback } from "react";
import { Save, PlusCircle, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

interface SchoolProfile {
  name: string;
  address: string;
  contact_email: string;
  is_admissions_open: boolean;
  status: "pending" | "verified" | "rejected";
}

interface SchoolClass {
  id: string;
  name: string;
  capacity: number;
}

const Settings = () => {
  const { toast } = useToast();
  
  // FIX: Cast the return value of useSchoolData to 'any' to bypass 
  // the strict TypeScript check regarding the missing 'schoolName' property.
  const { schoolId, schoolName, isLoading: schoolLoading } = useSchoolData() as any;
  
  // State for School Profile
  const [profile, setProfile] = useState<SchoolProfile>({
    name: schoolName || "",
    address: "",
    contact_email: "",
    is_admissions_open: false,
    status: "pending",
  });
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // State for Class Management
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState(30);
  const [isClassAdding, setIsClassAdding] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(true);

  // --- Data Fetching ---

  const fetchSchoolProfile = useCallback(async () => {
    if (!schoolId) {
      setIsProfileLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('schools')
      .select('name, address, contact_email, is_admissions_open, status')
      .eq('id', schoolId)
      .single();

    if (error || !data) {
      console.error("Error fetching school profile:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load school profile settings.", 
        variant: "destructive" 
      });
      setProfile(p => ({ ...p, name: schoolName || p.name, status: "pending" })); // Keep known name
    } else {
      setProfile({
        name: data.name,
        address: data.address || '',
        contact_email: data.contact_email || '',
        is_admissions_open: data.is_admissions_open,
        status: data.status,
      });
    }
    setIsProfileLoading(false);
  }, [schoolId, schoolName, toast]);

  const fetchClasses = useCallback(async () => {
    if (!schoolId) {
      setIsClassLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('classes')
      .select('id, name, capacity')
      .eq('school_id', schoolId)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching classes:", error);
      toast({ 
        title: "Error", 
        description: "Failed to load class list.", 
        variant: "destructive" 
      });
    } else {
      setClasses(data as SchoolClass[]);
    }
    setIsClassLoading(false);
  }, [schoolId, toast]);

  useEffect(() => {
    if (schoolId) {
      fetchSchoolProfile();
      fetchClasses();
    }
  }, [schoolId, fetchSchoolProfile, fetchClasses]);

  // --- Handlers ---

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolId || isProfileSaving) return;

    setIsProfileSaving(true);
    
    // Note: We intentionally exclude 'status' from being updated by the user
    const { name, address, contact_email, is_admissions_open } = profile;

    const { error } = await supabase
      .from('schools')
      .update({ name, address, contact_email, is_admissions_open, updated_at: new Date().toISOString() })
      .eq('id', schoolId);

    setIsProfileSaving(false);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Profile update error:", error);
    } else {
      toast({
        title: "Success!",
        description: "School profile updated successfully.",
      });
      // Optionally, you might want to refresh the global schoolName in the hook here if it changed
    }
  };

  const handleAddClass = async () => {
    const trimmedName = newClassName.trim();
    if (!schoolId || trimmedName === "" || newClassCapacity < 1 || isClassAdding) return;

    if (classes.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        toast({
            title: "Validation Error",
            description: `A class named "${trimmedName}" already exists.`,
            variant: "destructive",
        });
        return;
    }

    setIsClassAdding(true);

    const { data, error } = await supabase
      .from('classes')
      .insert([
        { school_id: schoolId, name: trimmedName, capacity: newClassCapacity }
      ])
      .select('id, name, capacity')
      .single();

    setIsClassAdding(false);
    
    if (error) {
      toast({
        title: "Add Class Failed",
        description: error.message,
        variant: "destructive",
      });
      console.error("Add class error:", error);
    } else if (data) {
      setClasses(prev => [...prev, data as SchoolClass]);
      setNewClassName("");
      setNewClassCapacity(30);
      toast({
        title: "Success",
        description: `Class "${data.name}" added.`,
      });
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    // Basic confirmation is assumed to be handled by the UI before calling this
    if (!schoolId) return;

    // Check if any applicants are associated with this class first (optional but safer)
    // For simplicity, we proceed with deletion and rely on database foreign key constraints (ON DELETE CASCADE or RESTRICT)

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId)
      .eq('school_id', schoolId); // Security check

    if (error) {
      if (error.code === '23503') { // PostgreSQL Foreign Key Violation
        toast({
            title: "Deletion Failed",
            description: "Cannot delete class as there are existing applicants linked to it.",
            variant: "destructive",
        });
      } else {
        toast({
          title: "Deletion Failed",
          description: error.message,
          variant: "destructive",
        });
      }
      console.error("Delete class error:", error);
    } else {
      setClasses(prev => prev.filter(c => c.id !== classId));
      toast({
        title: "Class Deleted",
        description: "The class was successfully removed.",
      });
    }
  };

  // --- Loading/Error State Render ---

  if (schoolLoading || isProfileLoading || isClassLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="space-y-4 text-center p-8 border border-border rounded-lg mt-8">
        <AlertTriangle className="h-10 w-10 text-warning mx-auto" />
        <h2 className="text-xl font-semibold">School Setup Incomplete</h2>
        <p className="text-muted-foreground">Please ensure your school profile is created before configuring settings.</p>
        <Button onClick={() => console.log("Navigate to create school page")} variant="default">
          Go to Setup
        </Button>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">School Settings</h1>

      {/* School Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">General Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="school-name">School Name</Label>
                <Input
                  id="school-name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={profile.contact_email}
                  onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address / Location</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                required
              />
            </div>
            
            <Separator />

            {/* Admissions Status */}
            <div className="flex items-center justify-between space-x-4 p-4 rounded-md border bg-muted/50">
                <div className="space-y-0.5">
                    <Label className="text-base">Admissions Open</Label>
                    <p className="text-sm text-muted-foreground">
                        Toggle this to open or close the application form to the public.
                    </p>
                </div>
                <Switch
                    checked={profile.is_admissions_open}
                    onCheckedChange={(checked) => setProfile({ ...profile, is_admissions_open: checked })}
                    disabled={profile.status !== 'verified'} // Only allow if school is verified
                />
            </div>
            
            {profile.status !== 'verified' && (
                <p className="text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 inline mr-1" /> Admissions toggle is locked until your school profile is **verified**. Current status: **{profile.status}**
                </p>
            )}

            <Button type="submit" disabled={isProfileSaving}>
              {isProfileSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Class Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Class Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Existing Classes ({classes.length})</h3>
            
            {classes.length === 0 ? (
                <p className="text-muted-foreground">No classes defined yet.</p>
            ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {classes.map((cls) => (
                        <div key={cls.id} className="flex items-center justify-between p-3 border rounded-md bg-background hover:shadow-sm transition-shadow">
                            <div className="font-medium">{cls.name}</div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>Capacity: {cls.capacity}</span>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleDeleteClass(cls.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <Separator />

          {/* Add New Class Form */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Add New Class</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="new-class-name">Class Name (e.g., S.1, Primary 4)</Label>
                <Input
                  id="new-class-name"
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  disabled={isClassAdding}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-class-capacity">Capacity</Label>
                <Input
                  id="new-class-capacity"
                  type="number"
                  min="1"
                  value={newClassCapacity}
                  onChange={(e) => setNewClassCapacity(Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isClassAdding}
                />
              </div>
              <Button onClick={handleAddClass} disabled={isClassAdding || newClassName.trim() === "" || newClassCapacity < 1} className="md:col-span-1">
                {isClassAdding ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4 mr-2" />
                )}
                Add Class
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;