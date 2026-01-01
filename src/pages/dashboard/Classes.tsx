import { useState } from "react";
import { Plus, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  acceptingApplications: boolean;
}

const initialClasses: ClassItem[] = [
  { id: "1", name: "Senior 1", capacity: 120, enrolled: 67, acceptingApplications: true },
  { id: "2", name: "Senior 2", capacity: 100, enrolled: 85, acceptingApplications: true },
  { id: "3", name: "Senior 3", capacity: 100, enrolled: 92, acceptingApplications: false },
  { id: "4", name: "Senior 4", capacity: 80, enrolled: 78, acceptingApplications: false },
  { id: "5", name: "Senior 5", capacity: 60, enrolled: 55, acceptingApplications: false },
  { id: "6", name: "Senior 6", capacity: 60, enrolled: 48, acceptingApplications: false },
];

const Classes = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassCapacity, setNewClassCapacity] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; classItem: ClassItem | null }>({
    open: false,
    classItem: null,
  });

  const handleAddClass = () => {
    if (!newClassName.trim() || !newClassCapacity) return;

    const newClass: ClassItem = {
      id: Date.now().toString(),
      name: newClassName,
      capacity: parseInt(newClassCapacity),
      enrolled: 0,
      acceptingApplications: true,
    };

    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
    setNewClassCapacity("");
    setIsDialogOpen(false);

    toast({
      title: "Class Added",
      description: `${newClassName} has been added.`,
    });
  };

  const handleDeleteClass = () => {
    if (!deleteDialog.classItem) return;
    setClasses((prev) => prev.filter((c) => c.id !== deleteDialog.classItem!.id));
    toast({
      title: "Class Removed",
      description: `${deleteDialog.classItem.name} has been removed.`,
    });
    setDeleteDialog({ open: false, classItem: null });
  };

  const toggleAcceptingApplications = (id: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, acceptingApplications: !c.acceptingApplications } : c
      )
    );
    const classItem = classes.find((c) => c.id === id);
    toast({
      title: classItem?.acceptingApplications ? "Applications Closed" : "Applications Open",
      description: `${classItem?.name} is now ${classItem?.acceptingApplications ? "closed" : "open"} for applications.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground">Manage classes and admissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name</Label>
                <Input
                  id="className"
                  placeholder="e.g., Senior 1"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="e.g., 100"
                  value={newClassCapacity}
                  onChange={(e) => setNewClassCapacity(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAddClass}>
                  Add Class
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Classes List */}
      <div className="bg-background rounded-xl border border-border divide-y divide-border">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{classItem.name}</p>
                <p className="text-sm text-muted-foreground">
                  {classItem.enrolled} / {classItem.capacity} enrolled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {classItem.acceptingApplications ? "Open" : "Closed"}
                </span>
                <Switch
                  checked={classItem.acceptingApplications}
                  onCheckedChange={() => toggleAcceptingApplications(classItem.id)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialog({ open: true, classItem })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteDialog.classItem?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classes;
