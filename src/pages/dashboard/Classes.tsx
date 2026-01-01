import { useState } from "react";
import { Plus, Trash2, Users, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
      description: `${newClassName} has been added successfully.`,
    });
  };

  const handleDeleteClass = (id: string, name: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    toast({
      title: "Class Removed",
      description: `${name} has been removed.`,
    });
  };

  const toggleAcceptingApplications = (id: string) => {
    setClasses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, acceptingApplications: !c.acceptingApplications } : c
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground">Manage classes and enrollment capacity</p>
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
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{classes.length}</p>
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.filter((c) => c.acceptingApplications).length}
                </p>
                <p className="text-sm text-muted-foreground">Accepting Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {classes.reduce((acc, c) => acc + c.enrolled, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{classItem.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClass(classItem.id, classItem.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Enrollment</span>
                  <span className="font-medium">
                    {classItem.enrolled} / {classItem.capacity}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(classItem.enrolled / classItem.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Accepting Applications</span>
                <Button
                  variant={classItem.acceptingApplications ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAcceptingApplications(classItem.id)}
                >
                  {classItem.acceptingApplications ? "Yes" : "No"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Classes;
