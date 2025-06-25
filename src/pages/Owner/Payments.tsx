
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Settings, TrendingUp, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface PaymentRecord {
  id: string;
  shopName: string;
  orderDate: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'paid' | 'pending' | 'processing';
  payoutDate?: string;
}

interface PayoutSummary {
  totalEarnings: number;
  totalPaid: number;
  pendingAmount: number;
  thisMonthEarnings: number;
}

const Payments: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  // Mock payment data - in real app, this would come from backend
  const [paymentRecords] = useState<PaymentRecord[]>([
    {
      id: 'PAY001',
      shopName: 'Downtown Pizza',
      orderDate: '2024-01-15',
      amount: 1500,
      commission: 150,
      netAmount: 1350,
      status: 'paid',
      payoutDate: '2024-01-20',
    },
    {
      id: 'PAY002',
      shopName: 'Downtown Pizza',
      orderDate: '2024-01-16',
      amount: 2200,
      commission: 220,
      netAmount: 1980,
      status: 'paid',
      payoutDate: '2024-01-21',
    },
    {
      id: 'PAY003',
      shopName: 'Downtown Pizza',
      orderDate: '2024-01-18',
      amount: 1800,
      commission: 180,
      netAmount: 1620,
      status: 'pending',
    },
    {
      id: 'PAY004',
      shopName: 'Downtown Pizza',
      orderDate: '2024-01-19',
      amount: 3200,
      commission: 320,
      netAmount: 2880,
      status: 'processing',
    },
  ]);

  const payoutSummary: PayoutSummary = {
    totalEarnings: paymentRecords.reduce((sum, record) => sum + record.netAmount, 0),
    totalPaid: paymentRecords.filter(r => r.status === 'paid').reduce((sum, record) => sum + record.netAmount, 0),
    pendingAmount: paymentRecords.filter(r => r.status !== 'paid').reduce((sum, record) => sum + record.netAmount, 0),
    thisMonthEarnings: paymentRecords.filter(r => new Date(r.orderDate).getMonth() === new Date().getMonth()).reduce((sum, record) => sum + record.netAmount, 0),
  };

  React.useEffect(() => {
    if (!currentUser || currentUser.role !== 'owner') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const filteredRecords = paymentRecords.filter(record => {
    const recordDate = new Date(record.orderDate);
    if (dateRange.from && recordDate < dateRange.from) return false;
    if (dateRange.to && recordDate > dateRange.to) return false;
    return true;
  });

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Payment ID': record.id,
      'Shop Name': record.shopName,
      'Order Date': record.orderDate,
      'Order Amount': record.amount,
      'Commission': record.commission,
      'Net Amount': record.netAmount,
      'Status': record.status,
      'Payout Date': record.payoutDate || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payment Records');
    
    const fileName = `payment_records_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Excel Downloaded",
      description: `Payment records exported to ${fileName}`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Payment Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your earnings and manage payouts</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/owner/kyc')}
                variant="outline"
              >
                <Settings className="w-4 h-4 mr-2" />
                KYC Settings
              </Button>
              <Button 
                onClick={exportToExcel}
                className="bg-food-orange hover:bg-orange-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <IndianRupee className="w-8 h-8 text-food-orange" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold">₹{payoutSummary.totalEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-green-600">₹{payoutSummary.totalPaid.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <IndianRupee className="w-8 h-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                    <p className="text-2xl font-bold text-yellow-600">₹{payoutSummary.pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-blue-600">₹{payoutSummary.thisMonthEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Records Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Payment Records</CardTitle>
                <div className="flex gap-4 items-center">
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {dateRange.from ? format(dateRange.from, 'MMM dd') : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.from}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {dateRange.to ? format(dateRange.to, 'MMM dd') : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.to}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {(dateRange.from || dateRange.to) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setDateRange({ from: undefined, to: undefined })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Shop Name</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Order Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payout Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.id}</TableCell>
                        <TableCell>{record.shopName}</TableCell>
                        <TableCell>{format(new Date(record.orderDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>₹{record.amount.toLocaleString()}</TableCell>
                        <TableCell>₹{record.commission.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">₹{record.netAmount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          {record.payoutDate ? format(new Date(record.payoutDate), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No payment records found for the selected date range.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Payments;
