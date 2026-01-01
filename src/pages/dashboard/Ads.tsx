import { useState } from "react";
import { Megaphone, Plus, Eye, MoreHorizontal, Calendar, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Ad {
  id: string;
  title: string;
  description: string;
  status: "active" | "paused" | "ended";
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
}

const mockAds: Ad[] = [
  {
    id: "1",
    title: "Open Admissions for 2024",
    description: "Announcing open admissions for S1-S4. Apply now through the APSCO app!",
    status: "active",
    impressions: 12500,
    clicks: 450,
    startDate: "2024-01-01",
    endDate: "2024-03-15",
  },
  {
    id: "2",
    title: "Scholarship Opportunities",
    description: "Limited scholarships available for exceptional students. Apply early!",
    status: "paused",
    impressions: 8200,
    clicks: 320,
    startDate: "2024-01-15",
    endDate: "2024-02-28",
  },
];

const Ads = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>(mockAds);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
  });

  const handleCreateAd = () => {
    if (!newAd.title.trim() || !newAd.description.trim()) return;

    const ad: Ad = {
      id: Date.now().toString(),
      title: newAd.title,
      description: newAd.description,
      status: "active",
      impressions: 0,
      clicks: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };

    setAds((prev) => [ad, ...prev]);
    setNewAd({ title: "", description: "" });
    setIsDialogOpen(false);

    toast({
      title: "Advertisement Created",
      description: "Your ad is now live on the APSCO platform.",
    });
  };

  const toggleAdStatus = (id: string) => {
    setAds((prev) =>
      prev.map((ad) =>
        ad.id === id
          ? { ...ad, status: ad.status === "active" ? "paused" : "active" }
          : ad
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Advertisements</h1>
          <p className="text-muted-foreground">Promote your school to prospective students</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="adTitle">Ad Title</Label>
                <Input
                  id="adTitle"
                  placeholder="e.g., Open Admissions for 2024"
                  value={newAd.title}
                  onChange={(e) => setNewAd((prev) => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adDescription">Description</Label>
                <Textarea
                  id="adDescription"
                  placeholder="Describe your advertisement..."
                  value={newAd.description}
                  onChange={(e) => setNewAd((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleCreateAd}>
                  Create Ad
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
                <Megaphone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ads.length}</p>
                <p className="text-sm text-muted-foreground">Total Ads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ads.reduce((acc, ad) => acc + ad.impressions, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {ads.reduce((acc, ad) => acc + ad.clicks, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {ads.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No Advertisements Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first ad to promote your school to prospective students
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          ads.map((ad) => (
            <Card key={ad.id} className="border-border">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{ad.title}</h3>
                      <Badge
                        variant="secondary"
                        className={
                          ad.status === "active"
                            ? "bg-success/10 text-success"
                            : ad.status === "paused"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{ad.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(ad.startDate).toLocaleDateString()} -{" "}
                        {new Date(ad.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {ad.impressions.toLocaleString()} impressions
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {ad.clicks.toLocaleString()} clicks
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toggleAdStatus(ad.id)}>
                        {ad.status === "active" ? "Pause Ad" : "Resume Ad"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>Edit Ad</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete Ad</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Ads;
