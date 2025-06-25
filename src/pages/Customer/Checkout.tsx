import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { Check, CreditCard, MapPin } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { createOrder, savePaymentToFirestore } from '../../backend/order';
import Navbar from '../../components/Layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';

interface CheckoutFormValues {
    name: string;
    phone: string;
    address: string;
    paymentMethod: 'Pay Online' | 'Cash On Delivery';
    specialInstructions: string;
}

const Checkout: React.FC = () => {
    const { currentUser, currentShopId, currentShopSlug } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CheckoutFormValues>({
        defaultValues: {
            name: currentUser?.name || '',
            phone: currentUser?.phone || '',
            address: '',
            paymentMethod: 'Pay Online',
            specialInstructions: '',
        }
    });

    useEffect(() => {
        // Get cart items from location state or redirect back to menu
        if (location.state?.cartItems) {
            setCartItems(location.state.cartItems);
        } else {
            navigate(`/customer/${currentShopSlug}/menu`);
        }
    }, [location, navigate]);

    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.menuItem.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = 2.99;
    const total = subtotal + tax + deliveryFee;



    const handlePayment = async ({
        name,
        phone,
        email = "customer@example.com", // fallback email
        amount,
    }: {
        name: string;
        phone: string;
        email?: string;
        amount: number;
    }): Promise<{ success: boolean; paymentId?: string; paymentDocId?: string }> => {
        try {
            // Create order on your server
            const { data } = await axios.post('https://stackorq-backend.onrender.com/api/payments/create-order', {
                amount,
                currency: 'INR',
                receipt: `receipt-${Date.now()}`
            });

            return new Promise((resolve) => {
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'Stackorq',
                    description: 'Order Payment',
                    order_id: data.id,
                    image: 'https://play-lh.googleusercontent.com/G4i17GWZ1Oj7c9A1d_hUCJD2YTIjFuclxnopouHJOv9lKrS88QJ6zbrucK3nJ76gj6A',
                    handler: async function (response: any) {
                        try {
                            const verifyResponse = await axios.post('https://stackorq-backend.onrender.com/api/payments/verify', {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            });

                            if (verifyResponse.data.success) {
                                const paymentData = {
                                    razorpayOrderId: response.razorpay_order_id,
                                    razorpayPaymentId: response.razorpay_payment_id,
                                    amount,
                                    userId: currentUser?.id || 'anonymous',
                                    shopId: currentShopId,
                                };
                                const savedPayment = await savePaymentToFirestore(paymentData);
                                console.log('Payment saved to Firestore:', savedPayment);
                                resolve({
                                    success: true,
                                    paymentId: response.razorpay_payment_id,
                                    paymentDocId: savedPayment.id,
                                });
                                
                            } else {
                                toast.error('Payment verification failed.');
                                resolve({ success: false });
                            }
                        } catch (error) {
                            console.error('Verification failed:', error);
                            resolve({ success: false });
                        }
                    },
                    prefill: {
                        name,
                        email,
                        contact: phone,
                    },
                    theme: {
                        color: '#3399cc',
                    },
                    method: {
                        upi: true,
                        card: true,
                        netbanking: false,
                        wallet: false,
                        emi: false,
                        paylater: false,
                        cod: false,
                    },
                    modal: {
                        ondismiss: () => {
                            toast.info('Payment window closed');
                            resolve({ success: false });
                        }
                    }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            });
        } catch (error) {
            console.error('Payment error:', error);
            return { success: false };
        }
    };


    const onSubmit = async (data: CheckoutFormValues) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. get the payment done
            const { success, paymentId, paymentDocId } = await handlePayment({
                name: data.name,
                phone: data.phone,
                email: currentUser.email,
                amount: total, // Razorpay uses paise
            });


            if (!success || !paymentId) {
                toast.error('Payment failed. Please try again.');
                return;
            }

            // 2. Prepare items
            const orderItems = cartItems.map(item => ({
                menuItemId: item.menuItem.id,
                quantity: item.quantity,
                specialInstructions: item.specialInstructions || '', // ✅ prevent undefined
            }));

            // 3. Create order in Firestore
            const orderId = await createOrder({
                customerId: currentUser.id,
                shopId: currentShopId,
                name: data.name,
                phone: data.phone,
                address: data.address,
                paymentCollectionId: paymentDocId,
                paymentMethod: data.paymentMethod,
                specialInstructions: data.specialInstructions || '',
                items: orderItems,
                status: 'pending',
                totalAmount: total,
                paymentStatus: 'paid',
            });

            // 4. Clear cart from localStorage
            const cartKey = `cart_${currentUser?.id || 'guest'}_${currentShopId}`;
            localStorage.removeItem(cartKey);
            setCartItems([]);

            // 5. Success toast and redirect
            toast.success('Order placed successfully!', {
                description: `Your order #${orderId} has been received.`,
            });

            navigate(`/customer/${currentShopSlug}/menu`);
        } catch (error) {
            console.log(error);
            toast.error('Failed to place order', {
                description: 'Please try again later.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-6">Checkout</h1>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Order Summary */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    {cartItems.length === 0 ? (
                                        <p className="text-center py-6 text-muted-foreground">Your cart is empty</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Order items */}
                                            <div className="space-y-3">
                                                {cartItems.map((item, index) => (
                                                    <div key={index} className="flex justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{item.menuItem.name}</h4>
                                                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                                            {item.specialInstructions && (
                                                                <p className="text-xs text-muted-foreground italic">
                                                                    Note: {item.specialInstructions}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator />

                                            {/* Price summary */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Subtotal</span>
                                                    <span>${subtotal.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Tax (8%)</span>
                                                    <span>${tax.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Delivery Fee</span>
                                                    <span>${deliveryFee.toFixed(2)}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg text-food-orange">
                                                    <span>Total</span>
                                                    <span>${total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Details */}
                        <div className="md:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Customer Details
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your name" {...field} />
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
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your phone number" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Delivery Address</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Your delivery address" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="specialInstructions"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Special Instructions</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Any special instructions" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="paymentMethod"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Payment Method</FormLabel>
                                                        <div className="flex gap-4 pt-2">
                                                            <div
                                                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer ${field.value === 'Pay Online'
                                                                    ? 'border-food-orange bg-orange-50'
                                                                    : 'border-gray-200'
                                                                    }`}
                                                                onClick={() => form.setValue('paymentMethod', 'Pay Online')}
                                                            >
                                                                {field.value === 'Pay Online' && (
                                                                    <Check className="h-4 w-4 text-food-orange" />
                                                                )}
                                                                <span>Pay Online</span>
                                                            </div>
                                                            {/* <div
                                                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer ${field.value === 'cash'
                                                                        ? 'border-food-orange bg-orange-50'
                                                                        : 'border-gray-200'
                                                                    }`}
                                                                onClick={() => form.setValue('paymentMethod', 'cash')}
                                                            >
                                                                {field.value === 'cash' && (
                                                                    <Check className="h-4 w-4 text-food-orange" />
                                                                )}
                                                                <span>Cash on Delivery</span>
                                                            </div> */}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                className="w-full bg-food-orange hover:bg-orange-600 mt-4"
                                                disabled={isSubmitting || cartItems.length === 0}
                                            >
                                                {isSubmitting ? 'Processing...' : 'Place Order'}
                                            </Button>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
