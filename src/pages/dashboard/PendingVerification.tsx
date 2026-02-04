import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, RefreshCw, LayoutDashboard, Loader2 } from 'lucide-react';
import { useSchoolData } from '@/hooks/useSchoolData';

const PendingVerification = () => {
    const navigate = useNavigate();
    // Connect to the global school data hook which has real-time subscriptions
    const { schoolStatus, schoolId, isLoading, fetchSchoolData, profileError } = useSchoolData() as any;

    // Auto-redirect when status changes to verified
    useEffect(() => {
        if (schoolStatus === 'verified') {
            navigate('/dashboard', { replace: true });
        }
    }, [schoolStatus, navigate]);

    // Polling fallback: Check status every 5 seconds
    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchSchoolData();
        }, 5000);

        return () => clearInterval(intervalId);
    }, [fetchSchoolData]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto p-4 animate-fade-in">
            <Card className="w-full text-center border-2 border-primary/20 shadow-lg">
                <CardHeader className="pb-2">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <ShieldCheck className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">Verification Pending</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Your school profile has been successfully submitted!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-muted/50 p-6 rounded-lg text-left space-y-4">
                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                            What happens next?
                        </h3>
                        <p className="text-muted-foreground ml-8">
                            Our administrators will review your school details and documents. This process usually takes 24-48 hours.
                            <br />
                            <span className="text-xs text-primary font-medium mt-1 block">
                                (This page will automatically update when you are verified.)
                            </span>
                        </p>

                        <h3 className="font-semibold flex items-center gap-2">
                            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                            Can I use the dashboard?
                        </h3>
                        <p className="text-muted-foreground ml-8">
                            You have limited access to the dashboard until your school is verified. You cannot accept applications or publish admission updates yet.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => fetchSchoolData()}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Check Status Needed
                        </Button>
                        <Button onClick={() => navigate('/dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Go to Dashboard
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground pt-4">
                        Need urgent approval? Contact support at <a href="mailto:apsco.app@gmail.com" className="text-primary hover:underline">apsco.app@gmail.com</a>
                    </p>

                    {/* Debug Info - Remove before production */}
                    <div className="mt-6 p-2 bg-slate-100 rounded text-left text-xs font-mono text-slate-500 overflow-auto">
                        <p className="font-bold border-b border-slate-300 mb-1">Debug Info:</p>
                        <p>Status: <span className="text-blue-600">{schoolStatus || 'null'}</span></p>
                        <p>ID: {schoolId || 'null'}</p>
                        <p>Loading: {isLoading ? 'true' : 'false'}</p>
                        {profileError && <p className="text-red-600 font-bold mt-1">Error: {profileError}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PendingVerification;
