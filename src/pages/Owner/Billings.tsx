import { db } from '@/backend/firebase';
import Navbar from '@/components/Layout/Navbar';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPaymentRecord, SubscriptionPlan, UserSubscription } from '@/utils/types';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where, writeBatch, Timestamp } from 'firebase/firestore';
import { CreditCard, History, Wallet, Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { calculateDaysLeft, calculatePeriodEnd } from '@/utils/helper';
import { useNavigate } from 'react-router-dom';
import { getUserShopCount } from '@/backend/shop';
import ReactPaginate from 'react-paginate';

const Billings = () => {
  const { currentUser, currentShopId, currentShopSlug } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan & { expires?: string; daysLeft?: number } | null>(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [shopCount, setShopCount] = useState(0);
  const [mandateLoading, setMandateLoading] = useState(false);
  const [renewalLoading, setRenewalLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
const itemsPerPage = 3;

  const subscriptionStatus = !userSubscription
    ? 'Free tier'
    : userSubscription?.status === 'trialing'
      ? 'Free trial'
      : userSubscription?.status === 'active' && currentPlan?.daysLeft > 0
        ? 'Active subscription'
        : 'Expired subscription / inactive';

  const navigate = useNavigate();

  // Helper function to format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';

    try {
      let date;
      if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        // JavaScript Date
        date = timestamp;
      } else if (typeof timestamp === 'string') {
        // ISO string
        date = new Date(timestamp);
      } else {
        return 'N/A';
      }

      return date.toLocaleDateString('en-IN');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  useEffect(() => {
    console.log('---', currentUser, currentShopId);
    if (currentUser === undefined || currentShopId === undefined) return;
    if (!currentUser && !currentShopId) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'owner') {
      navigate(`/customer/${currentShopSlug}/menu`);
    } else if (!currentShopId) {
      navigate('/not-found');
    }
  }, [currentUser, currentShopId, currentShopSlug, navigate]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch all available plans first
        const plansQuery = query(collection(db, 'subscriptions'));
        const plansSnapshot = await getDocs(plansQuery);
        const plansData = plansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('***plans', plansData);
        setPlans(plansData);

        // 2. Fetch user's active subscription and payment history
        const userSubSnap = await getDoc(doc(db, 'userSubscriptions', currentUser.id));
        const paymentsQuery = query(
          collection(db, 'subscriptionPaymentRecord'),
          where('userId', '==', currentUser.id),
          orderBy('createdAt', 'desc')
        );
        const paymentsSnap = await getDocs(paymentsQuery);

        // 3. Process subscription data
        if (userSubSnap.exists()) {
          const userData = userSubSnap.data();
          console.log('***userSubscription', userData);
          setUserSubscription(userData);
          setSubscriptionId(userData.razorpaySubscriptionId || '');

          // Find matching plan from already fetched plans
          const plan = plansData.find(p => p.id === userData.planId);
          if (plan) {
            setCurrentPlan({
              ...plan,
              expires: formatDate(userData.currentPeriodEnd),
              daysLeft: calculateDaysLeft(userData.currentPeriodEnd),
            } as SubscriptionPlan & { expires?: string; daysLeft?: number });
            // Align the selected plan UI with the active subscription
            setSelectedPlan(plan);
          }

          // 4. Process payment history from subscriptionPaymentRecord collection
          const paymentDocs = paymentsSnap.docs;
          const formattedHistory = paymentDocs.map(doc => ({
            id: doc.id,
            date: formatDate(doc.data().createdAt),
            amount: `₹${(doc.data().amount || 0) / 100}`,
            status: doc.data().status || 'unknown',
            method: doc.data().method || 'razorpay',
            details: doc.data().details || "Subscription Payment",
            invoiceUrl: doc.data().invoiceUrl
          }));

          console.log('Formatted payment history (from collection):', formattedHistory);
          setPaymentHistory(formattedHistory);
        } else {
          // If no active subscription, default to the first plan
          setSelectedPlan(plansData[0] || null);
          setPaymentHistory([]);
        }


        // 5. Fetch shop count
        if (currentUser?.id) {
          const count = await getUserShopCount(currentUser.id);
          setShopCount(count);
        }

      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription data"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time listener for new payments
    const paymentsUnsubscribe = onSnapshot(
      query(
        collection(db, 'subscriptionPaymentRecord'),
        where('userId', '==', currentUser.id),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        console.log('Real-time payment update:', snapshot.docChanges());

        // Process new payments from snapshot
        const newPayments = snapshot.docs.map(doc => {
          const payment = doc.data();
          return {
            id: doc.id,
            date: formatDate(payment.createdAt),
            amount: `₹${(payment.amount || 0) / 100}`,
            status: payment.status || 'unknown',
            method: payment.method || 'razorpay',
            details: payment.details || "Subscription Payment",
            invoiceUrl: payment.invoiceUrl
          };
        });

        // Update state with new payments, ensuring no duplicates
        setPaymentHistory(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const filteredNew = newPayments.filter(p => !existingIds.has(p.id));
          return [...filteredNew, ...prev];
        });
      },
      (error) => {
        console.error("Error in payment history listener:", error);
      }
    );

    return () => paymentsUnsubscribe();
  }, [currentUser?.id]);

  const handleSetupMandate = async () => {
    try {
      setMandateLoading(true);
      const shopCount = currentUser?.id ? await getUserShopCount(currentUser.id) : 0;

      // 1. Create Razorpay order (one-time payment)
      const res = await axios.post('http://localhost:5000/api/payments/create-subscription', {
        planId: selectedPlan.id,
        shopNumbers: shopCount,
        pricePerShop: selectedPlan.priceInPaise,
        planName: selectedPlan.name,
        features: selectedPlan.features,
        billingCycle: selectedPlan.billingCycle
      });
      console.log('LLL', res.data)
      if (res.data.success && res.data.orderId) {
        console.log('amount', res.data.totalAmount);
        const options = {
          key: res.data.razorpayKey,
          amount: res.data.totalAmount,
          currency: 'INR',
          name: 'Stackorq',
          image: '/favicon.svg',
          description: `${res.data.planName} Subscription for ${shopCount} shop(s)`,
          order_id: res.data.orderId,
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: currentUser.phone
          },
          theme: { color: '#3399cc' },
          handler: async function (response) {
            try {
              toast({ title: 'Payment successful!', description: 'Subscription Activated!' });

              const periodDays = selectedPlan?.billingCycle === 'yearly' ? 365 : 30;

              // Create payment record
              const paymentRecord = {
                id: response.razorpay_payment_id,
                userId: currentUser.id,
                amount: res.data.totalAmount,
                currency: 'INR',
                status: 'paid',
                method: 'razorpay',
                details: "Subscription Payment",
                razorpayPaymentId: response.razorpay_payment_id,
                createdAt: Timestamp.now()
              };
              
              // Save payment record to Firestore
              await setDoc(doc(db, 'subscriptionPaymentRecord', paymentRecord.id), paymentRecord);
              
              // Update user subscription data
              const userSubRef = doc(db, 'userSubscriptions', currentUser.id);
              const userSubSnap = await getDoc(userSubRef);
              
              // Use Razorpay response for subscription ID
              const subscriptionId = response.razorpay_subscription_id || '';
              
              // Calculate period end safely using direct date calculation
              const calculateSafePeriodEnd = (billingCycle: string) => {
                const days = billingCycle === 'yearly' ? 365 : 30;
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + days);
                return Timestamp.fromDate(endDate);
              };
              
              const periodEnd = calculateSafePeriodEnd(selectedPlan?.billingCycle || 'monthly');
              
              if (userSubSnap.exists()) {
                // Update existing subscription
                await updateDoc(userSubRef, {
                  razorpaySubscriptionId: subscriptionId,
                  planId: selectedPlan.id,
                  currentPeriodStart: Timestamp.now(),
                  currentPeriodEnd: periodEnd,
                  status: 'active'
                });
              } else {
                // Create new subscription document
                await setDoc(userSubRef, {
                  userId: currentUser.id,
                  razorpaySubscriptionId: subscriptionId,
                  planId: selectedPlan.id,
                  currentPeriodStart: Timestamp.now(),
                  currentPeriodEnd: periodEnd,
                  status: 'active',
                  paymentHistory: [paymentRecord]
                });
              }
              
              // Update local state using the same periodEnd value as Firestore update
              setUserSubscription({
                razorpaySubscriptionId: subscriptionId,
                planId: selectedPlan.id,
                currentPeriodStart: Timestamp.now(),
                currentPeriodEnd: periodEnd,
                status: 'active'
              });
              
              setCurrentPlan({
                ...selectedPlan,
                expires: formatDate(periodEnd),
                daysLeft: calculateDaysLeft(periodEnd)
              });
              
              // Add new payment to payment history with unique ID
              setPaymentHistory(prev => {
                const newPayment = {
                  id: `${response.razorpay_payment_id}_${Date.now()}`,
                  date: formatDate(new Date()),
                  amount: `₹${res.data.totalAmount / 100}`,
                  status: 'paid',
                  method: 'razorpay',
                  details: "Subscription Payment"
                };
                // Avoid duplicates by checking if payment already exists
                const exists = prev.some(p => p.id === newPayment.id);
                if (exists) {
                  return prev;
                }
                return [newPayment, ...prev];
              });
              
            } catch (error) {
              console.error('Error handling payment success:', error);
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to process payment"
              });
            }
          }
        };
        
        // @ts-ignore - Razorpay type definition might be missing
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
        console.error('Error setting up mandate:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to setup payment mandate"
        });
    } finally {
        setMandateLoading(false);
      }
    };

  // Pagination logic
  const indexOfLastItem = (pageNumber + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = paymentHistory.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Selection Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan: SubscriptionPlan) => (
                    <Card 
                      key={plan.id} 
                      className={`cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'border-primary ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          {plan.name}
                          {selectedPlan?.id === plan.id && (
                            <Badge variant="secondary">Selected</Badge>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold mb-2">₹{(plan.priceInPaise / 100).toFixed(2)}<span className="text-sm font-normal text-gray-500">/{plan.billingCycle}</span></p>
                        <ul className="space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <span className="mr-2">✓</span> {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button 
                    onClick={handleSetupMandate} 
                    disabled={!selectedPlan || mandateLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {mandateLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Setup Subscription
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
              </CardHeader>
              <CardContent>
                {currentPlan ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Plan Type:</span>
                      <span>{currentPlan.billingCycle}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status:</span>
                      <Badge>{subscriptionStatus}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Start Date:</span>
                      <span>{formatDate(userSubscription.currentPeriodStart)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">End Date:</span>
                      <span>{currentPlan.expires}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Days Left:</span>
                      <span>{currentPlan.daysLeft}</span>
                    </div>
                    {currentPlan.daysLeft > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Next Payment Date:</span>
                        <span>{currentPlan.expires}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Shops:</span>
                      <span>{shopCount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No active subscription</p>
                )}
              </CardContent>
            </Card>
            
            {/* Payment History */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentHistory.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.date}</TableCell>
                            <TableCell>{payment.amount}</TableCell>
                            <TableCell>
                              <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{payment.method}</TableCell>
                            <TableCell>{payment.details}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <ReactPaginate
                      previousLabel="Previous"
                      nextLabel="Next"
                      breakLabel="..."
                      pageCount={Math.ceil(paymentHistory.length / itemsPerPage)}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={(selectedItem) => setPageNumber(selectedItem.selected)}
                      containerClassName="flex justify-center mt-4 space-x-2"
                      pageClassName="px-3 py-1 border rounded"
                      activeClassName="bg-primary text-white"
                      previousClassName="px-3 py-1 border rounded"
                      nextClassName="px-3 py-1 border rounded"
                    />
                  </>
                ) : (
                  <p className="text-gray-500">No payment history available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Billings;
