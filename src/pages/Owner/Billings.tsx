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
          // 4. Process payment history from Firestore snapshot
          if (Array.isArray(userData.paymentHistory)) {
            const formattedHistory = userData.paymentHistory.map(payment => ({
              id: payment.id || crypto.randomUUID(),
              date: formatDate(payment.createdAt),
              amount: `₹${(payment.amount || 0) / 100}`,
              status: payment.status || 'unknown',
              method: payment.method || 'razorpay',
              details: payment.details || "Subscription Payment",
              invoiceUrl: payment.invoiceUrl
            }));

            console.log('Formatted payment history (from userData):', formattedHistory);
            setPaymentHistory(formattedHistory);
          } else {
            setPaymentHistory([]); // Fallback
          }
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

        const allPayments = snapshot.docs.map(doc => {
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

        setPaymentHistory(allPayments);
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

      // 1. Ensure Razorpay customer exists
      // let razorpayCustomerId = currentUser?.razorpayCustomerId;
      // if (!razorpayCustomerId && currentUser?.id) {
      //   const customerRes = await axios.post('http://localhost:5000/api/payments/create-razorpay-customer', {
      //     userId: currentUser.id,
      //     name: currentUser.name,
      //     email: currentUser.email,
      //     phone: currentUser.phone
      //   });
      //   razorpayCustomerId = customerRes.data.customerId;
      // }

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
      if (res.data.success) {
        console.log('amount', res.data.totalAmount);
        const options = {
          key: res.data.razorpayKey,
          amount: res.data.totalAmount,
          currency: 'INR',
          name: 'Stackorq',
          image: '/favicon-32x32.png',
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

              const periodDays = selectedPlan.billingPeriod === 'yearly' ? 365 : 30;

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

              // Create subscription record
              const newSub = {
                userId: currentUser.id,
                planId: selectedPlan.id,
                shopNumbers: shopCount,
                status: 'active',
                currentPeriodStart: Timestamp.now(),
                currentPeriodEnd: Timestamp.fromDate(calculatePeriodEnd(periodDays)),
                daysLeft: calculateDaysLeft(calculatePeriodEnd(periodDays)),
              };

              // Save to DB
              const batch = writeBatch(db);
              batch.set(doc(db, 'userSubscriptions', currentUser.id), newSub);
              batch.set(doc(db, 'subscriptionPaymentRecord', response.razorpay_payment_id), paymentRecord);
              await batch.commit();

              toast({
                title: 'Success! Your subscription is active',
                description: `You have ${selectedPlan.billingPeriod} access to your plan`
              });

              window.location.reload();

            } catch (error) {
              console.error('Database update failed:', error);
              toast({
                variant: 'destructive',
                title: 'Database Error',
                description: 'Payment succeeded but record saving failed'
              });
            } finally {
              setMandateLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setMandateLoading(false);
              toast({ title: 'Cancelled', description: 'Payment window closed' });
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('Payment setup error:', error);
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: error.response?.data?.error || 'Payment initialization failed'
      });
      setMandateLoading(false);
    }
  };

  const handleRenew = async () => {
    try {
      setRenewalLoading(true);
      const res = await axios.post('http://localhost:5000/api/payments/renew-subscription', {
        subscriptionId,
      });

      if (res.data.success) {
        toast({
          title: "Renewal initiated",
          description: "You'll be notified when payment completes"
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.error || "Renewal failed"
      });
    } finally {
      setRenewalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (mandateLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Processing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="text-food-orange" /> Owner Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center flex-col md:flex-row gap-4">
              <div>
                <div className="text-lg font-semibold">
                  Current Plan: <span className="text-food-orange">{currentPlan?.name || 'No active plan'}</span>
                </div>
                {currentPlan && (
                  <>
                    <div className="text-sm">
                      Expires: {currentPlan.expires}{" "}
                      <Badge className="ml-1" variant="outline">
                        {currentPlan.daysLeft} days left
                      </Badge>
                    </div>
                    <div className="text-sm mt-1">Subscription ID: <span className='px-1.5 py-0.5 rounded bg-slate-200 font-semibold'>{subscriptionId}</span></div>
                  </>
                )}
                {!currentPlan && (
                  <div className="text-sm text-muted-foreground">No active subscription found</div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={`text-lg mx-auto shadow ${currentPlan ? 'bg-green-300 text-gray-700 hover:bg-green-300' : 'bg-gray-300 text-gray-700'}`}>
                  {currentPlan ? 'Active' : 'Inactive'}
                </Badge>
                {userSubscription && (
                  <Button
                    className="text-base bg-food-orange text-white hover:bg-food-orange/90 flex items-center justify-center"
                    onClick={handleRenew}
                    disabled={renewalLoading || loading}
                  >
                    {renewalLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Renewing...
                      </>
                    ) : (
                      'Renew'
                    )}
                  </Button>
                )}
                <Button
                  className="text-base bg-gray-700 text-white hover:bg-gray-800 flex items-center justify-center"
                  onClick={handleSetupMandate}
                  disabled={mandateLoading || loading || !selectedPlan}
                >
                  {mandateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    userSubscription ? 'Change Plan' : 'Start New Mandate'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="text-food-orange" /> Plans & Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap justify-center gap-4">
                {plans?.map(plan => (
                  <div
                    key={plan?.id || plan?.name}
                    onClick={() => setSelectedPlan(plan)}
                    className={`rounded shadow p-4 bg-white border cursor-pointer transition-all
                      ${plan?.recommended ? "border-food-orange ring-2 ring-food-orange" : ""}
                      ${selectedPlan?.id === plan?.id ? "border-food-orange ring-2 ring-food-orange" : ""}
                      ${currentPlan?.name === plan?.name ? "bg-gray-100" : ""}
                    `}
                  >
                    <div className="text-xl font-bold">{plan?.name}</div>
                    <div className="text-food-orange font-bold">{plan?.price}</div>
                    {shopCount > 0 && plan?.priceInPaise && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Total for {shopCount} shop{shopCount > 1 ? "s" : ""}: ₹{(plan.priceInPaise * shopCount) / 100}
                      </div>
                    )}
                    <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5">
                      {plan?.features?.map((f, idx) => <li key={idx}>{f}</li>)}
                    </ul>
                    {plan?.recommended && <Badge className="mt-2">Recommended</Badge>}
                    {currentPlan?.name === plan?.name && (
                      <Badge className="mt-2 ml-2 bg-blue-100 text-blue-800">Current</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="text-food-orange" /> Selected Plan Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Plan:</strong> {selectedPlan.name}
                </div>
                <div>
                  <strong>Price per Shop:</strong> {selectedPlan.price}
                </div>
                <div>
                  <strong>Number of Shops:</strong> {shopCount}
                </div>
                <div>
                  <strong>Total Amount:</strong>{' '}
                  {selectedPlan.priceInPaise
                    ? `₹${(selectedPlan.priceInPaise * shopCount) / 100}`
                    : selectedPlan.price}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="text-food-orange" /> Subscription Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentHistory.length > 0 ? (
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
                  {paymentHistory.map((row, i) => (
                    <TableRow key={row.id || i}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            row.status === 'paid'
                              ? "bg-green-100 text-green-800"
                              : row.status === 'failed'
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{row.method}</TableCell>
                      <TableCell>{row.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No payment history found</p>
                <p className="text-sm">Payments will appear here after your first transaction</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Billings;
