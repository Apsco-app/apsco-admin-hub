// src/pages/dashboard/Classes.tsx (FIXED)

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Trash2, Loader2, AlertTriangle, MinusCircle, School } from "lucide-react"; // <--- FIX: Added School
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "@/components/ui/toast";

interface SchoolClass {
  id: string;
  name: string;
}

const Classes = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { schoolId, isLoading: schoolLoading } = useSchoolData() as any;

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [isClassAdding, setIsClassAdding] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(true);
  const [isClassDeleting, setIsClassDeleting] = useState<string | null>(null);

  // --- Data Fetching ---
  const fetchClasses = useCallback(async () => {
    if (!schoolId) {
      setIsClassLoading(false);
      return;
    }

    setIsClassLoading(true);

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('school_id', schoolId)
        .order('name', { ascending: true });

      if (error) throw error;

      setClasses(data || []);
    } catch (error: any) {
      console.error("Error fetching classes:", error.message);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive"
      });
    } finally {
      setIsClassLoading(false);
    }
  }, [schoolId, toast]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // --- Add Class Handler ---
  const handleAddClass = async () => {
    const trimmedName = newClassName.trim();
    if (!schoolId || trimmedName === "" || isClassAdding) return;

    if (classes.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast({
        title: "Validation Error",
        description: `A class named "${trimmedName}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    setIsClassAdding(true);

    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          name: trimmedName,
          school_id: schoolId,
        })
        .select('id, name')
        .single();

      if (error) throw error;

      setClasses(prev => [...prev, data as SchoolClass]);
      setNewClassName("");
      toast({
        title: "Class Added",
        description: `Please configure admission settings for "${data.name}" immediately.`,
        action: (
          <ToastAction altText="Configure" onClick={() => navigate('/dashboard/admissions-settings')}>
            Configure
          </ToastAction>
        ),
      });

    } catch (error: any) {
      console.error("Error adding class:", error.message);
      toast({
        title: "Error",
        description: "Failed to add class. It may already exist.",
        variant: "destructive"
      });
    } finally {
      setIsClassAdding(false);
    }
  };

  // --- Delete Class Handler ---
  const handleDeleteClass = async (classId: string, className: string) => {
    if (!schoolId) return;
    setIsClassDeleting(classId); // Set loading state for this specific class

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
        .eq('school_id', schoolId);

      if (error) throw error;

      setClasses(prev => prev.filter(c => c.id !== classId));
      toast({
        title: "Success",
        description: `Class "${className}" deleted.`,
        variant: "default",
      });

    } catch (error: any) {
      console.error("Error deleting class:", error.message);
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
    } finally {
      setIsClassDeleting(null);
    }
  };


  // --- Render Logic (CRITICAL STABILITY FIX) ---

  if (schoolLoading || isClassLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading school classes...</p>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="space-y-4 text-center p-10 border border-border rounded-lg mt-8 max-w-xl mx-auto">
        <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold text-destructive">Setup Required</h2>
        <p className="text-muted-foreground">Please create your school profile first to manage classes.</p>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight border-b pb-4">Manage Classes</h1>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-primary">
            <PlusCircle className="h-6 w-6" /> Add New Class
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-class-name">Class Name (e.g., S.1, S.5)</Label>
                <Input
                  id="new-class-name"
                  placeholder="Enter class name"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  disabled={isClassAdding}
                />
              </div>

              <Button onClick={handleAddClass} disabled={isClassAdding || newClassName.trim() === ""} className="min-w-[120px]">
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

      <Separator />

      {/* Existing Classes List - RETAINED DESIGN */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            Existing Classes ({classes.length})
          </CardTitle>
          {classes.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Classes define the available entry points for applicants. Start by adding one above.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {classes.length > 0 && (
            <div className="space-y-3">
              {classes.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 rounded-lg border border-border transition-shadow hover:shadow-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-lg">{classItem.name}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Placeholder for future links/actions (kept the original structure) */}
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={true}
                      className="text-muted-foreground/50"
                    >
                      View Applicants
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                      disabled={isClassDeleting === classItem.id || isClassDeleting !== null}
                    >
                      {isClassDeleting === classItem.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Classes;