import { createOrder } from '@/backend/order';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getAllMenuItems } from '@/data/menuItems';
import { useToast } from '@/hooks/use-toast';
import { Order, OrderStatus, PaymentStatus } from '@/utils/types';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  specialInstructions?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  // estimatedPickupTime?: string;
}

interface CreateOrderModalProps {
  shopId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: () => void;
}

export function CreateOrderModal({
  shopId,
  open,
  onOpenChange,
  onOrderCreated
}: CreateOrderModalProps) {
  const { currentUser, currentShopId } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<Order>({
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      paymentMethod: 'cash',
      specialInstructions: '',
      status: 'pending', // Default status
      paymentStatus: 'pending', // Default payment status
      // estimatedPickupTime: ''
    }
  });

  // Fetch menu items
  useEffect(() => {
    if (open) {
      const loadMenuItems = async () => {
        try {
          const items = await getAllMenuItems(currentShopId);
          setMenuItems(items);
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load menu items',
            variant: 'destructive',
          });
        }
      };
      loadMenuItems();
    }
  }, [open, currentShopId, toast]);

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) {
      setSelectedItems(prev => prev.filter(item => item.id !== id));
    } else {
      setSelectedItems(prev =>
        prev.map(item => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const onSubmit = async (formData: Order) => {
    if (selectedItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      shopId,
      customerId: currentUser?.id || '', // Add customerId if available
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      paymentMethod: formData.paymentMethod,
      items: selectedItems.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      totalAmount: calculateTotal(),
      // createdAt: new Date().toISOString(),
      specialInstructions: formData.specialInstructions,
      // estimatedPickupTime: formData.estimatedPickupTime,
    };

    try {
      console.log('order data:::', orderData);
      await createOrder(orderData);
      toast({
        title: 'Success',
        description: 'Order created successfully',
      });
      resetForm();
      onOpenChange(false);
      onOrderCreated?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedItems([]);
    form.reset();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-lg p-6 focus:outline-none">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">
              {step === 1 && 'Select Menu Items'}
              {step === 2 && 'Customer Information'}
              {step === 3 && 'Review Order'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Step 1: Select Items */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-md">
                {filteredItems.length > 0 ? (
                  <ul className="divide-y">
                    {filteredItems.map(item => (
                      <li key={item.id} className="p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddItem(item)}
                            className="bg-secondary border hover:border-secondary-foreground/20 hover:shadow
             hover:bg-secondary/80 text-secondary-foreground"
                          >
                            Add
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-center text-gray-500">No items found</p>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="font-medium mb-2">Selected Items</h3>
                  <ul className="space-y-3">
                    {selectedItems.map(item => (
                      <li key={item.id} className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="w-10 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customer Info */}
          {step === 2 && (
            <div className="md:col-span-1">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select order status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Status *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method *</FormLabel>
                        <div className="flex gap-4 pt-2">
                          {['cash', 'card', 'online'].map((method) => (
                            <div
                              key={method}
                              className={`flex items-center gap-2 border rounded-md p-2 cursor-pointer ${field.value === method
                                ? 'border-primary bg-primary/10'
                                : 'border-gray-200'
                                }`}
                              onClick={() => field.onChange(method)}
                            >
                              {field.value === method && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                              <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                            </div>
                          ))}
                        </div>
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
                          <Textarea
                            placeholder="Any special instructions"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Customer Details</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p><strong>Name:</strong> {form.watch('name')}</p>
                  <p><strong>Phone:</strong> {form.watch('phone')}</p>
                  <p><strong>Address:</strong> {form.watch('address')}</p>
                  <p><strong>Payment Method:</strong> {form.watch('paymentMethod')}</p>
                  {form.watch('specialInstructions') && (
                    <p><strong>Instructions:</strong> {form.watch('specialInstructions')}</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <ul className="border rounded-lg divide-y">
                  {selectedItems.map(item => (
                    <li key={item.id} className="p-3 flex justify-between">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-right font-bold text-lg">
                Total: ₹{calculateTotal().toFixed(2)}
              </div>

            </div>
          )}

          <div className="mt-6 flex justify-between">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 1 && selectedItems.length === 0) {
                    toast({
                      title: 'Validation Error',
                      description: 'Please add at least one item',
                      variant: 'destructive',
                    });
                    return;
                  }
                  if (step === 2) {
                    const { name, phone, address } = form.getValues();
                    if (!name || !phone || !address) {
                      toast({
                        title: 'Validation Error',
                        description: 'Please fill all required fields',
                        variant: 'destructive',
                      });
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-food-orange hover:bg-orange-600"
              >
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
