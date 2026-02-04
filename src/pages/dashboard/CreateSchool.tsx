// src/pages/dashboard/CreateSchool.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2, CheckCircle2, AlertTriangle, Upload, Phone } from 'lucide-react';
import { useSchoolData } from '@/hooks/useSchoolData';
import { useAuth } from '@/context/AuthContext';

const CreateSchool = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { schoolId, schoolStatus, isLoading: schoolLoading } = useSchoolData() as any;

    const [schoolName, setSchoolName] = useState('');
    const [address, setAddress] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!schoolLoading && schoolId) {
            navigate('/dashboard', { replace: true });
        }
    }, [schoolId, schoolLoading, navigate]);

    const handleCreateSchool = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const userId = user?.id;

        try {
            let logoUrl = null;

            // 1. Upload Logo if exists
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `logos/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('school-assets') // Make sure this bucket exists in Supabase
                    .upload(filePath, logoFile);

                if (uploadError) {
                    if (uploadError.message.includes('bucket not found') || (uploadError as any).status === 404) {
                        throw new Error("Storage bucket 'school-assets' not found. Please create it in your Supabase Dashboard under Storage.");
                    }
                    throw uploadError;
                }
                logoUrl = filePath;
            }

            // 2. Create School Entry
            const { data: newSchool, error: schoolError } = await supabase
                .from('schools')
                .insert({
                    name: schoolName.trim(),
                    address: address.trim(),
                    contact_email: contactEmail.trim(),
                    phone_number: phone.trim(),
                    logo_url: logoUrl,
                    user_id: userId,
                    status: 'pending',
                })
                .select('id')
                .single();

            if (schoolError) throw schoolError;

            // 3. Link Profile
            await supabase.from('profiles').update({ school_id: newSchool.id }).eq('id', userId);

            toast({ title: "Success!", description: "School profile created and pending verification." });
            navigate('/dashboard/pending-approval');

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 pt-12">
            <Card>
                <CardHeader className="text-center">
                    <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
                    <CardTitle>Create School Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateSchool} className="space-y-4">
                        <div className="space-y-2">
                            <Label>School Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Official School Name</Label>
                            <Input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Contact Email</Label>
                                <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Physical Address</Label>
                            <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Building2 className="mr-2" />}
                            Create School Profile
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateSchool;