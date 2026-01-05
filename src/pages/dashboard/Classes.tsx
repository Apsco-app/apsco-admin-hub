// src/pages/dashboard/Classes.tsx (Corrected placeholder)

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Loader2, AlertTriangle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData"; // Assuming this is your hook

interface SchoolClass {
  id: string;
  name: string;
  capacity: number;
}

const Classes = () => {
  const { toast } = useToast();
  
  // FIX: Removed 'error' from destructuring and use 'as any' for safety
  const { schoolId, isLoading: schoolLoading } = useSchoolData() as any; 
  
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState(30);
  const [isClassAdding, setIsClassAdding] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(true);

  // --- Data Fetching ---

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
      fetchClasses();
    }
  }, [schoolId, fetchClasses]);

  // --- Handlers ---
  
  // ... (handleAddClass and handleDeleteClass logic as defined in Settings.tsx)

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
    if (!schoolId) return;

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId)
      .eq('school_id', schoolId);

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
    } else {
      setClasses(prev => prev.filter(c => c.id !== classId));
      toast({
        title: "Class Deleted",
        description: "The class was successfully removed.",
      });
    }
  };

  // --- Loading/Error State Render ---

  if (schoolLoading || isClassLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading classes...</p>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="space-y-4 text-center p-8 border border-border rounded-lg mt-8">
        <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">School Profile Required</h2>
        <p className="text-muted-foreground">Please ensure your school profile is created before managing classes.</p>
        <Button onClick={() => console.log("Navigate to create school page")} variant="default">
          Go to Setup
        </Button>
      </div>
    );
  }

  // --- Main Render ---

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">Class Management</h1>
      
      {/* Class Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Define Classes</CardTitle>
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

export default Classes;