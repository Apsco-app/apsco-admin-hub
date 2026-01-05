// src/pages/dashboard/CreateSchool.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSchoolData } from '@/hooks/useSchoolData';

const CreateSchool = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // Check if school already exists for the user
    // We cast to any as before, just in case the type definition isn't fully synchronized locally
    const { schoolId, schoolStatus, isLoading: schoolLoading } = useSchoolData() as any; 

    const [schoolName, setSchoolName] = useState('');
    const [address, setAddress] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Redirect if school already exists
    useEffect(() => {
        if (!schoolLoading && schoolId) {
            toast({
                title: "School Already Setup",
                description: "Redirecting to Dashboard...",
            });
            navigate('/dashboard');
        }
    }, [schoolId, schoolLoading, navigate, toast]);


    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || !schoolName.trim() || !address.trim() || !contactEmail.trim()) {
            return;
        }

        setIsSubmitting(true);

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user) {
            toast({
                title: "Authentication Error",
                description: "You must be logged in to create a school.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        const userId = userData.user.id;

        // 1. Create the new school entry
        const { data: newSchool, error: schoolError } = await supabase
            .from('schools')
            .insert({
                name: schoolName.trim(),
                address: address.trim(),
                contact_email: contactEmail.trim(),
                user_id: userId, // Link the user to the school as the primary admin/creator
                status: 'pending', // Set initial status to pending verification
                is_admissions_open: false,
            })
            .select('id')
            .single();

        if (schoolError || !newSchool) {
            toast({
                title: "Creation Failed",
                description: schoolError?.message || "Could not create the school profile.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }
        
        const newSchoolId = newSchool.id;

        // 2. Update the user's profile to link the new school_id
        const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ school_id: newSchoolId, updated_at: new Date().toISOString() })
            .eq('id', userId);

        if (profileUpdateError) {
            // Log this error but proceed, as the school record exists. 
            // In a real app, you might want to delete the school record here on failure.
            console.error("Failed to link school to profile:", profileUpdateError);
        }

        // Success Feedback and Navigation
        toast({
            title: "School Profile Created!",
            description: "Your school is now pending verification.",
            action: <CheckCircle2 className="h-5 w-5 text-success" />,
        });
        
        setIsSubmitting(false);
        // Navigate to the dashboard, which will now display the "Verification Pending" banner
        navigate('/dashboard');
    };

    if (schoolLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-lg text-muted-foreground">Checking school status...</p>
            </div>
        );
    }
    
    // If the school is already set up (checked in useEffect, but good to have a fallback render)
    if (schoolId) {
        return (
            <div className="space-y-4 text-center p-8 border border-success rounded-lg mt-8 bg-success/5">
                <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
                <h2 className="text-xl font-semibold text-success">School Setup Complete</h2>
                <p className="text-muted-foreground">Your school status is **{schoolStatus}**. Redirecting...</p>
            </div>
        );
    }


    return (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in pt-12">
            <Card>
                <CardHeader className="text-center">
                    <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
                    <CardTitle className="text-2xl">Create Your School Profile</CardTitle>
                    <p className="text-sm text-muted-foreground">This is the first step to manage applications.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateSchool} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="school-name">Official School Name</Label>
                            <Input
                                id="school-name"
                                value={schoolName}
                                onChange={(e) => setSchoolName(e.target.value)}
                                placeholder="e.g., St. Mary's High School"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="address">Physical Address / Location</Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="e.g., Plot 10, Kampala Road"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact-email">Admissions Contact Email</Label>
                            <Input
                                id="contact-email"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="admissions@schoolname.com"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="p-3 bg-warning/10 border border-warning/50 rounded-md flex items-start space-x-2">
                            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                                After creation, your school will be set to **"pending"** status and requires administrator verification before admissions can be opened.
                            </p>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                <Building2 className="h-5 w-5 mr-2" />
                            )}
                            Create School Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateSchool;