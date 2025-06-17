import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { addNewOrder } from '../../data/orders';
import { getMenuItemById } from '../../data/menuItems';
import { updateUserAddress, createOrder } from '../../backend/order';
import Navbar from '../../components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Separator } from '@/components/ui/separator';
import { Check, CreditCard, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutFormValues {
    name: string;
    phone: string;
    address: string;
    paymentMethod: 'card' | 'cash';
    specialInstructions: string;
}

const Checkout: React.FC = () => {
    const { currentUser, currentShopId } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CheckoutFormValues>({
        defaultValues: {
            name: currentUser?.name || '',
            phone: currentUser?.phone || '',
            address: '',
            paymentMethod: 'card',
            specialInstructions: '',
        }
    });

    useEffect(() => {
        // Get cart items from location state or redirect back to menu
        if (location.state?.cartItems) {
            setCartItems(location.state.cartItems);
        } else {
            navigate('/customer/menu');
        }
    }, [location, navigate]);

    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.menuItem.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const deliveryFee = 2.99;
    const total = subtotal + tax + deliveryFee;

    const onSubmit = async (data: CheckoutFormValues) => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Update user address in Firestore
            await updateUserAddress(currentUser.id, data.address);

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
                paymentMethod: data.paymentMethod,
                specialInstructions: data.specialInstructions || '',
                items: orderItems,
                status: 'pending',
                totalAmount: total,
                paymentStatus: 'pending',
            });

            // 4. Clear cart from localStorage
            localStorage.removeItem('cart');
            setCartItems([]);

            // 5. Success toast and redirect
            toast.success('Order placed successfully!', {
                description: `Your order #${orderId} has been received.`,
            });

            // Navigate to order confirmation
            navigate(`/customer/orders`);
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
                                                                className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer ${field.value === 'card'
                                                                        ? 'border-food-orange bg-orange-50'
                                                                        : 'border-gray-200'
                                                                    }`}
                                                                onClick={() => form.setValue('paymentMethod', 'card')}
                                                            >
                                                                {field.value === 'card' && (
                                                                    <Check className="h-4 w-4 text-food-orange" />
                                                                )}
                                                                <span>Credit Card</span>
                                                            </div>
                                                            <div
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
                                                            </div>
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
