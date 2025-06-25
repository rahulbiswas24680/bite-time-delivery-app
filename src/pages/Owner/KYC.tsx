
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Building2, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface KYCFormData {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  panNumber: string;
  gstNumber: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
}

interface KYCStatus {
  isSubmitted: boolean;
  isVerified: boolean;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

const KYC: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock KYC status - in real app, this would come from backend
  const [kycStatus, setKycStatus] = useState<KYCStatus>({
    isSubmitted: false,
    isVerified: false,
  });

  const form = useForm<KYCFormData>({
    defaultValues: {
      businessName: '',
      ownerName: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      panNumber: '',
      gstNumber: '',
      bankAccountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
    },
  });

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const onSubmit = (data: KYCFormData) => {
    console.log('KYC Form submitted:', data);
    
    // Mock submission
    setKycStatus({
      isSubmitted: true,
      isVerified: false,
      submittedAt: new Date().toISOString(),
    });
    
    toast({
      title: "KYC Form Submitted",
      description: "Your KYC form has been submitted for verification. We'll notify you once it's approved.",
    });
  };

  const getStatusBadge = () => {
    if (kycStatus.isVerified) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-4 h-4 mr-1" />Verified</Badge>;
    }
    if (kycStatus.isSubmitted) {
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 mr-1" />Under Review</Badge>;
    }
    return <Badge variant="outline"><AlertCircle className="w-4 h-4 mr-1" />Not Submitted</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">KYC Verification</h1>
              <p className="text-gray-600 mt-1">Complete your KYC to start receiving payments</p>
            </div>
            <div className="flex gap-2">
              {getStatusBadge()}
              <Button 
                onClick={() => navigate('/owner/payments')}
                variant="outline"
              >
                View Payments
              </Button>
            </div>
          </div>

          {kycStatus.isVerified ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center text-center">
                  <div>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">KYC Verified Successfully!</h3>
                    <p className="text-gray-600">You can now receive payments and manage your payouts.</p>
                    <Button 
                      onClick={() => navigate('/owner/payments')}
                      className="mt-4 bg-food-orange hover:bg-orange-600"
                    >
                      Go to Payment Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter business name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter owner name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter complete address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode *</FormLabel>
                            <FormControl>
                              <Input placeholder="Pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="panNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PAN Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="ABCDE1234F" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input placeholder="22AAAAA0000A1Z5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Bank Account Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Bank Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IFSC Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="HDFC0000123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account holder name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    className="bg-food-orange hover:bg-orange-600"
                    disabled={kycStatus.isSubmitted}
                  >
                    {kycStatus.isSubmitted ? 'Submitted for Review' : 'Submit KYC'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </main>
    </div>
  );
};

export default KYC;
