
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { 
  Building2, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

interface KYCFormData {
  // Business Information
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  businessAddress: string;
  businessPhone: string;
  
  // Personal Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  
  // Bank Account Information
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  
  // Payout Settings
  payoutInterval: string;
  minimumPayoutAmount: string;
}

interface KYCStatus {
  isVerified: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'incomplete';
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

const KYC: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock KYC status - in real app, this would come from backend
  const [kycStatus] = useState<KYCStatus>({
    isVerified: false,
    status: 'incomplete',
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<KYCFormData>({
    defaultValues: {
      ownerEmail: currentUser?.email || '',
      payoutInterval: 'weekly',
      minimumPayoutAmount: '100',
    }
  });

  const watchedPayoutInterval = watch('payoutInterval');

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const onSubmit = (data: KYCFormData) => {
    console.log('KYC Form submitted:', data);
    toast({
      title: "KYC Information Submitted",
      description: "Your KYC information has been submitted for review. You'll be notified once verified.",
    });
  };

  const getStatusBadge = () => {
    switch (kycStatus.status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Incomplete</Badge>;
    }
  };

  const getPayoutIntervalDescription = (interval: string) => {
    switch (interval) {
      case 'daily':
        return 'Payouts will be processed every day';
      case 'weekly':
        return 'Payouts will be processed every Monday';
      case 'biweekly':
        return 'Payouts will be processed every 2 weeks';
      case 'monthly':
        return 'Payouts will be processed on the 1st of each month';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">KYC Verification</h1>
              <p className="text-gray-600 mt-1">Complete your verification to start receiving payments</p>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              <Button 
                onClick={() => navigate('/owner/payments')}
                variant="outline"
              >
                View Payments
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...register('businessName', { required: 'Business name is required' })}
                      placeholder="Enter your business name"
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-600 mt-1">{errors.businessName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select onValueChange={(value) => setValue('businessType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="cafe">Cafe</SelectItem>
                        <SelectItem value="bakery">Bakery</SelectItem>
                        <SelectItem value="food_truck">Food Truck</SelectItem>
                        <SelectItem value="catering">Catering Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="registrationNumber">Business Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      {...register('registrationNumber')}
                      placeholder="Enter registration number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input
                      id="taxId"
                      {...register('taxId')}
                      placeholder="Enter tax ID"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="businessAddress">Business Address *</Label>
                  <Input
                    id="businessAddress"
                    {...register('businessAddress', { required: 'Business address is required' })}
                    placeholder="Enter complete business address"
                  />
                  {errors.businessAddress && (
                    <p className="text-sm text-red-600 mt-1">{errors.businessAddress.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="businessPhone">Business Phone *</Label>
                  <Input
                    id="businessPhone"
                    {...register('businessPhone', { required: 'Business phone is required' })}
                    placeholder="Enter business phone number"
                  />
                  {errors.businessPhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.businessPhone.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">Full Name *</Label>
                    <Input
                      id="ownerName"
                      {...register('ownerName', { required: 'Owner name is required' })}
                      placeholder="Enter full name"
                    />
                    {errors.ownerName && (
                      <p className="text-sm text-red-600 mt-1">{errors.ownerName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="ownerEmail">Email Address *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      {...register('ownerEmail', { required: 'Email is required' })}
                      placeholder="Enter email address"
                      disabled
                    />
                    {errors.ownerEmail && (
                      <p className="text-sm text-red-600 mt-1">{errors.ownerEmail.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="ownerPhone">Phone Number *</Label>
                    <Input
                      id="ownerPhone"
                      {...register('ownerPhone', { required: 'Phone number is required' })}
                      placeholder="Enter phone number"
                    />
                    {errors.ownerPhone && (
                      <p className="text-sm text-red-600 mt-1">{errors.ownerPhone.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="ownerAddress">Personal Address *</Label>
                  <Input
                    id="ownerAddress"
                    {...register('ownerAddress', { required: 'Personal address is required' })}
                    placeholder="Enter personal address"
                  />
                  {errors.ownerAddress && (
                    <p className="text-sm text-red-600 mt-1">{errors.ownerAddress.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bank Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      {...register('bankName', { required: 'Bank name is required' })}
                      placeholder="Enter bank name"
                    />
                    {errors.bankName && (
                      <p className="text-sm text-red-600 mt-1">{errors.bankName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      {...register('accountHolderName', { required: 'Account holder name is required' })}
                      placeholder="Enter account holder name"
                    />
                    {errors.accountHolderName && (
                      <p className="text-sm text-red-600 mt-1">{errors.accountHolderName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      {...register('accountNumber', { required: 'Account number is required' })}
                      placeholder="Enter account number"
                      type="password"
                    />
                    {errors.accountNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="routingNumber">Routing Number *</Label>
                    <Input
                      id="routingNumber"
                      {...register('routingNumber', { required: 'Routing number is required' })}
                      placeholder="Enter routing number"
                    />
                    {errors.routingNumber && (
                      <p className="text-sm text-red-600 mt-1">{errors.routingNumber.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payout Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Payout Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payoutInterval">Payout Interval *</Label>
                    <Select 
                      onValueChange={(value) => setValue('payoutInterval', value)}
                      defaultValue="weekly"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    {watchedPayoutInterval && (
                      <p className="text-sm text-gray-600 mt-1">
                        {getPayoutIntervalDescription(watchedPayoutInterval)}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="minimumPayoutAmount">Minimum Payout Amount (₹) *</Label>
                    <Input
                      id="minimumPayoutAmount"
                      type="number"
                      {...register('minimumPayoutAmount', { 
                        required: 'Minimum payout amount is required',
                        min: { value: 100, message: 'Minimum amount should be at least ₹100' }
                      })}
                      placeholder="100"
                      min="100"
                    />
                    {errors.minimumPayoutAmount && (
                      <p className="text-sm text-red-600 mt-1">{errors.minimumPayoutAmount.message}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      Payouts will only be processed if your balance exceeds this amount
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Payout Information</h4>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Payouts are processed automatically based on your selected interval</li>
                        <li>• A 2.9% + ₹2 processing fee applies to all payouts</li>
                        <li>• Bank transfers typically take 1-3 business days</li>
                        <li>• You can change these settings anytime after verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate('/owner/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" className="bg-food-orange hover:bg-orange-600">
                {kycStatus.status === 'incomplete' ? 'Submit for Verification' : 'Update Information'}
              </Button>
            </div>
          </form>

          {/* Status Information */}
          {kycStatus.status !== 'incomplete' && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Current Status:</span>
                    {getStatusBadge()}
                  </div>
                  {kycStatus.submittedAt && (
                    <div className="flex items-center justify-between">
                      <span>Submitted:</span>
                      <span>{new Date(kycStatus.submittedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {kycStatus.verifiedAt && (
                    <div className="flex items-center justify-between">
                      <span>Verified:</span>
                      <span>{new Date(kycStatus.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {kycStatus.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {kycStatus.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default KYC;
