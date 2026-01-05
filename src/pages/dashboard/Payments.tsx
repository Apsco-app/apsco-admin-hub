// src/pages/dashboard/Payments.tsx

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Building2, DollarSign, Plus, Loader2, Trash2, MinusCircle, Settings2, Save } from "lucide-react"; // <-- FIX 1: Added Save
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { supabase } from "@/lib/supabase";
import { useSchoolData } from "@/hooks/useSchoolData";

// Combined Class & Fee Interface
interface ClassFeeItem {
  id: string; // class ID
  name: string; // class name
  fee_id: string | null; // class_fees ID (null if no fee is set)
  fee_amount: number | null; // class_fees.fee_amount_ugx
  is_active: boolean | null; // class_fees.is_active
  current_fee_input: number | ''; // User input for the fee
}

const Payments = () => {
  const { toast } = useToast();
  const { schoolId, isLoading: schoolLoading } = useSchoolData();

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Fee state
  const [classFees, setClassFees] = useState<ClassFeeItem[]>([]);
  const [defaultFee, setDefaultFee] = useState<number | ''>(0); // Global fee for classes without specific config

  const handlePayment = () => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to payment gateway...",
    });
  };

  // --- Data Fetching ---

  // Fetches all classes and joins with class_fees to see if a custom fee is set
  const fetchFees = async () => {
    if (!schoolId) {
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);

    // This query is complex: Fetch all classes for the school, AND
    // attempt to join the class_fees table based on class_id.
    const { data, error } = await supabase
      .from('classes')
      .select(`
        id, 
        name,
        class_fees (id, fee_amount_ugx, is_active, class_id)
      `)
      .eq('school_id', schoolId)
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching fees:", error);
      toast({
        title: "Error",
        description: "Failed to load fee configuration. " + error.message,
        variant: "destructive",
      });
      setIsDataLoading(false);
      return;
    }

    // Process the data
    const formattedFees: ClassFeeItem[] = data.map((c: any) => {
      const feeData = c.class_fees.find((f: any) => f.class_id === c.id);

      return {
        id: c.id,
        name: c.name,
        fee_id: feeData ? feeData.id : null,
        fee_amount: feeData ? feeData.fee_amount_ugx : null,
        is_active: feeData ? feeData.is_active : null,
        current_fee_input: feeData ? feeData.fee_amount_ugx : '',
      };
    });
    
    // Attempt to find a "school-wide" default fee (class_id is NULL)
    const { data: defaultFeeData } = await supabase
        .from('class_fees')
        .select('fee_amount_ugx')
        .eq('school_id', schoolId)
        .is('class_id', null)
        .single();

    setDefaultFee(defaultFeeData ? defaultFeeData.fee_amount_ugx : 0);

    setClassFees(formattedFees);
    setIsDataLoading(false);
  };

  useEffect(() => {
    if (schoolId) {
      fetchFees();
    }
  }, [schoolId]);


  // --- CRUD Handlers ---

  const updateDefaultFee = async () => {
    if (!schoolId) return;
    setIsLoading(true);

    const feeValue = defaultFee === '' ? 0 : defaultFee;

    // First, try to find the existing default fee row (class_id IS NULL)
    const { data: existingFee, error: fetchError } = await supabase
        .from('class_fees')
        .select('id')
        .eq('school_id', schoolId)
        .is('class_id', null)
        .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'no rows found', which is expected
        console.error("Fetch Default Fee Error:", fetchError);
        setIsLoading(false);
        toast({ title: "Error", description: "Failed to check existing fee.", variant: "destructive" });
        return;
    }
    
    let dbError = null;

    if (existingFee) {
        // UPDATE existing default fee
        const { error } = await supabase
            .from('class_fees')
            .update({ fee_amount_ugx: feeValue, is_active: feeValue > 0 })
            .eq('id', existingFee.id);
        dbError = error;
    } else if (feeValue > 0) {
        // INSERT new default fee (only if amount is positive)
        const { error } = await supabase
            .from('class_fees')
            .insert({ 
                school_id: schoolId, 
                fee_amount_ugx: feeValue, 
                class_id: null,
                is_active: true
            });
        dbError = error;
    }
    
    setIsLoading(false);
    
    if (dbError) {
        console.error("Default Fee Save Error:", dbError);
        toast({ title: "Save Failed", description: `Could not save default fee: ${dbError.message}`, variant: "destructive" });
    } else {
        toast({ title: "Success", description: "Default application fee updated." });
    }
  };

  const updateClassFee = async (classItem: ClassFeeItem) => {
    if (!schoolId) return;
    setIsLoading(true);

    const feeValue = classItem.current_fee_input === '' ? 0 : classItem.current_fee_input;
    const isUpdating = classItem.fee_id;
    
    let dbError = null;
    let data = null;

    if (isUpdating && feeValue > 0) {
        // UPDATE existing class fee
        const { data: updateData, error } = await supabase
            .from('class_fees')
            .update({ fee_amount_ugx: feeValue, is_active: true })
            .eq('id', classItem.fee_id)
            .select()
            .single();
        dbError = error;
        data = updateData;
    } else if (isUpdating && feeValue === 0) {
        // DELETE existing class fee if set to 0 to revert to default/none
        const { error } = await supabase
            .from('class_fees')
            .delete()
            .eq('id', classItem.fee_id);
        dbError = error;
        // If deleted, we need to reset the fee_id/amount in local state
        if (!error) {
             setClassFees(prev => prev.map(c => 
                c.id === classItem.id ? { ...c, fee_id: null, fee_amount: null, is_active: null, current_fee_input: '' } : c
            ));
        }
    } else if (!isUpdating && feeValue > 0) {
        // INSERT new class fee
        const { data: insertData, error } = await supabase
            .from('class_fees')
            .insert({ 
                school_id: schoolId, 
                class_id: classItem.id, 
                fee_amount_ugx: feeValue,
                is_active: true
            })
            .select()
            .single();
        dbError = error;
        data = insertData;
    }

    setIsLoading(false);

    if (dbError) {
        console.error(`Class Fee Save Error for ${classItem.name}:`, dbError);
        toast({ title: "Save Failed", description: `Could not save fee for ${classItem.name}: ${dbError.message}`, variant: "destructive" });
    } else if (data) {
        // Update local state with the new/updated fee row
        setClassFees(prev => prev.map(c => 
            c.id === classItem.id ? { 
                ...c, 
                fee_id: data.id, 
                fee_amount: data.fee_amount_ugx, 
                is_active: data.is_active, 
                current_fee_input: data.fee_amount_ugx
            } : c
        ));
        toast({ title: "Success", description: `Fee for ${classItem.name} saved.` });
    } else if (!isUpdating && feeValue === 0) {
        toast({ title: "Success", description: `Custom fee for ${classItem.name} cleared (reverts to default).` });
    }
  };


  // --- Render Logic ---

  if (schoolLoading || isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-lg text-muted-foreground">Loading payment and fee settings...</p>
      </div>
    );
  }
  
  if (!schoolId) {
    return (
        <div className="space-y-4 text-center p-8 border border-border rounded-lg mt-8">
            <MinusCircle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">School Profile Not Found</h2>
            <p className="text-muted-foreground">You must create a school profile first.</p>
        </div>
    );
  }


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments & License</h1>
        <p className="text-muted-foreground">Manage your digital admissions license and application fees</p>
      </div>

      {/* Current License Status */}
      <Card className="border-border bg-success/5 border-success/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">License Active</h3>
              <CardDescription>
                Your school has an active license to use the admissions system.
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">Next Due: 2025-01-01</p>
              <Badge variant="secondary" className="mt-1 text-xs">Annual Plan</Badge>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <Button onClick={handlePayment} disabled={isLoading} className="text-sm h-9">
              Manage Subscription
            </Button>
          </div >
        </CardContent>
      </Card>


      {/* --- Application Fees Configuration --- */}
      <div className="pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
            1
          </div>
          <h2 className="text-lg font-semibold">Application Fees Configuration</h2>
        </div>
        
        <Card className="border-border ml-11">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Application Fee Settings
            </CardTitle>
            <CardDescription>
                Set the default fee for applicants. You can override this fee for specific classes below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Default Fee Setting */}
            <div className="space-y-2 pb-4 border-b border-border">
                <Label htmlFor="default-fee" className="font-medium">Default School Application Fee (UGX)</Label>
                <div className="flex gap-3">
                    <Input
                        id="default-fee"
                        type="number"
                        placeholder="e.g., 50000"
                        value={defaultFee}
                        onChange={(e) => setDefaultFee(parseInt(e.target.value) || '')}
                        min="0"
                        className="max-w-xs"
                        disabled={isLoading}
                    />
                    <Button onClick={updateDefaultFee} disabled={isLoading || defaultFee === ''}>
                        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Default
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                    This fee applies to all classes unless a class-specific fee is set. Set to 0 for free applications.
                </p>
            </div>


            {/* Per-Class Fees */}
            <div className="space-y-4">
                <p className="font-medium flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    Class-Specific Overrides
                </p>
                <div className="grid gap-3">
                    {classFees.length === 0 ? (
                        <div className="text-center p-6 border border-dashed rounded-lg text-muted-foreground">
                            No classes found. Please add classes on the "Manage Classes" page first.
                        </div>
                    ) : (
                        classFees.map((classItem) => (
                            <div key={classItem.id} className="flex items-center gap-4 p-3 rounded-lg border bg-muted/20">
                                <span className="font-semibold w-24 flex-shrink-0">{classItem.name}</span>
                                
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor={`fee-${classItem.id}`} className="text-xs font-normal text-muted-foreground block">
                                        Custom Fee (UGX)
                                    </Label>
                                    <Input
                                        id={`fee-${classItem.id}`}
                                        type="number"
                                        placeholder={`Default: ${defaultFee || 'Free'}`}
                                        value={classItem.current_fee_input}
                                        onChange={(e) => {
                                            const newValue = parseInt(e.target.value) || '';
                                            setClassFees(prev => prev.map(c => 
                                                c.id === classItem.id ? { ...c, current_fee_input: newValue } : c
                                            ));
                                        }}
                                        min="0"
                                        className="h-9"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="flex-shrink-0">
                                    <Button 
                                        onClick={() => updateClassFee(classItem)} 
                                        disabled={isLoading || classItem.current_fee_input === ''}
                                        className="h-9 w-24"
                                    >
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Fee'}
                                    </Button>
                                </div>
                                <div className="text-right w-24 text-sm flex-shrink-0">
                                    {classItem.fee_amount !== null ? (
                                        <Badge variant="default" className="bg-success/20 text-success hover:bg-success/30">
                                            UGX {classItem.fee_amount.toLocaleString()}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Using Default</Badge>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Payment History (Original Content) */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Jan 15, 2024", amount: "UGX 150,000", status: "Paid", period: "Term 1, 2024" },
              { date: "Sep 10, 2023", amount: "UGX 150,000", status: "Paid", period: "Term 3, 2023" },
              { date: "May 8, 2023", amount: "UGX 150,000", status: "Paid", period: "Term 2, 2023" },
            ].map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div>
                  <p className="font-medium">{payment.period}</p>
                  <p className="text-sm text-muted-foreground">{payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{payment.amount}</p>
                  <Badge 
                    variant="default" // <-- FIX 2: Changed to default variant
                    className="mt-1 bg-success/20 text-success hover:bg-success/20" // <-- FIX 2: Added success styling via className
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payments;