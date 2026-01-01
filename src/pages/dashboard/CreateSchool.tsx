import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CreateSchool = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    schoolType: "",
    email: "",
    phone: "",
    location: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = "School name is required";
    }
    if (!formData.schoolType) {
      newErrors.schoolType = "Please select a school type";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    toast({
      title: "School Created Successfully",
      description: "Your school is pending verification. We'll notify you once verified.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Create Your School Profile</h1>
        <p className="text-muted-foreground mt-1">
          Complete your school details to start receiving applications
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>School Information</CardTitle>
              <CardDescription>Enter your school's official details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                name="schoolName"
                placeholder="St. Mary's Secondary School"
                value={formData.schoolName}
                onChange={handleChange}
                className={errors.schoolName ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.schoolName && (
                <p className="text-sm text-destructive">{errors.schoolName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolType">School Type</Label>
              <Select
                value={formData.schoolType}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, schoolType: value }));
                  if (errors.schoolType) {
                    setErrors((prev) => ({ ...prev, schoolType: "" }));
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.schoolType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondary">Secondary School</SelectItem>
                  <SelectItem value="university">University</SelectItem>
                </SelectContent>
              </Select>
              {errors.schoolType && (
                <p className="text-sm text-destructive">{errors.schoolType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admissions@school.edu"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+256 700 000 000"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Kampala, Uganda"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? "border-destructive" : ""}
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create School"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        After submission, your school will be marked as{" "}
        <span className="font-medium text-warning">Pending Verification</span>. Our team will
        verify your details within 24-48 hours.
      </p>
    </div>
  );
};

export default CreateSchool;
