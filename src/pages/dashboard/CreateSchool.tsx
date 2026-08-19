import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';
import { useSchoolData } from '@/hooks/useSchoolData';
import { useAuth } from '@/context/AuthContext';

const CreateSchool = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { schoolId, isLoading: schoolLoading } = useSchoolData() as any;

    const [schoolName, setSchoolName] = useState('');
    const [address, setAddress] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    
    // New state variables
    const [feesRange, setFeesRange] = useState('');
    const [schoolType, setSchoolType] = useState('');
    const [curriculum, setCurriculum] = useState('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!schoolLoading && schoolId) {
            navigate('/dashboard', { replace: true });
        }
    }, [schoolId, schoolLoading, navigate]);

    // Helper function: Free Nominatim Geocoding
    const geocodeAddress = async (searchAddress: string) => {
        try {
            const query = encodeURIComponent(`${searchAddress}, Uganda`);
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'Apsco-Web-App' // Nominatim requires a user-agent header
                    }
                }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return { latitude: null, longitude: null };
    };

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
                    .from('school-assets')
                    .upload(filePath, logoFile);

                if (uploadError) {
                    if (uploadError.message.includes('bucket not found') || (uploadError as any).status === 404) {
                        throw new Error("Storage bucket 'school-assets' not found. Please create it in your Supabase Dashboard under Storage.");
                    }
                    throw uploadError;
                }
                logoUrl = filePath;
            }

            // 2. Fetch Geocoded Coordinates for the provided Address
            const { latitude, longitude } = await geocodeAddress(address.trim());

            // 3. Create School Entry with Coordinates
            const { data: newSchool, error: schoolError } = await supabase
                .from('schools')
                .insert({
                    name: schoolName.trim(),
                    type: schoolType,
                    curriculum: curriculum,
                    fees_range: feesRange.trim(),
                    address: address.trim(),
                    contact_email: contactEmail.trim(),
                    phone_number: phone.trim(),
                    logo_url: logoUrl,
                    user_id: userId,
                    status: 'pending',
                    latitude: latitude,
                    longitude: longitude,
                    is_verified: true // Official web dashboard creations are verified
                })
                .select('id')
                .single();

            if (schoolError) throw schoolError;

            // 4. Link Profile
            await supabase.from('profiles').update({ school_id: newSchool.id }).eq('id', userId);

            toast({ title: "Success!", description: "School profile created with location coordinates." });
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
                        
                        {/* New Type and Curriculum Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>School Type</Label>
                                <select
                                    value={schoolType}
                                    onChange={(e) => setSchoolType(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="" disabled>Select Type</option>
                                    <option value="Public">Public</option>
                                    <option value="Private">Private</option>
                                    <option value="International">International</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Curriculum</Label>
                                <select
                                    value={curriculum}
                                    onChange={(e) => setCurriculum(e.target.value)}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="" disabled>Select Curriculum</option>
                                    <option value="UNEB Curriculum">UNEB Curriculum</option>
                                    <option value="Accelerated Christian Education (ACE)">Accelerated Christian Education (ACE)</option>
                                    <option value="Cambridge curriculum">Cambridge curriculum</option>
                                    <option value="The American National Curriculum">The American National Curriculum</option>
                                </select>
                            </div>
                        </div>

                        {/* New Fees Range Input */}
                        <div className="space-y-2">
                            <Label>Fees Range</Label>
                            <Input 
                                value={feesRange} 
                                onChange={(e) => setFeesRange(e.target.value)} 
                                placeholder="e.g. 500,000 - 1,500,000 UGX per term"
                                required 
                            />
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
                            <Label>Physical Address (e.g. "Naalya, Wakiso")</Label>
                            <Input 
                                value={address} 
                                onChange={(e) => setAddress(e.target.value)} 
                                placeholder="e.g. Namugongo Road, Wakiso District"
                                required 
                            />
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