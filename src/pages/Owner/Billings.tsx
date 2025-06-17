import Navbar from '@/components/Layout/Navbar';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, History, Wallet } from "lucide-react";

const Billings = () => {

  // Sample data for demo
  const plans = [
    {
      name: "Free",
      price: "₹0/mo",
      features: [
        "1 Shop",
        "Max 10 menu items",
        "Basic order management",
        "Standard support"
      ],
    },
    {
      name: "Pro",
      price: "₹999/mo",
      features: [
        "Unlimited shops",
        "Unlimited menu items",
        "Advanced analytics",
        "Automated order printing",
        "Premium chat support"
      ],
      recommended: true,
    },
    {
      name: "Enterprise",
      price: "Contact Us",
      features: [
        "All Pro features",
        "Custom integrations",
        "Dedicated account manager",
        "Priority phone support"
      ]
    }
  ];

  // Simulated owner plan info
  const currentPlan = {
    name: "Pro",
    expires: "2025-07-01",
    daysLeft: 18,
  };
  const paymentHistory = [
    { date: "2024-07-01", amount: "₹999", status: "Paid", method: "Razorpay", details: "Pro Plan Renewal" },
    { date: "2024-06-01", amount: "₹999", status: "Paid", method: "Razorpay", details: "Pro Plan Renewal" },
    { date: "2024-05-01", amount: "₹999", status: "Paid", method: "Razorpay", details: "Pro Plan Renewal" },
  ];


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
                <div className="text-lg font-semibold">Current Plan: <span className="text-food-orange">{currentPlan.name}</span></div>
                <div className="text-sm">Expires: {currentPlan.expires} {" "}
                  <Badge className="ml-1" variant="outline">{currentPlan.daysLeft} days left</Badge>
                </div>
              </div>
              <div>
                <Badge className="text-lg bg-food-orange text-white">Active</Badge>
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
            <div className="grid gap-6">
              <div className="grid md:grid-cols-3 gap-4">
                {plans.map(plan => (
                  <div
                    key={plan.name}
                    className={`rounded shadow p-4 bg-white border
                      ${plan.recommended ? "border-food-orange ring-2 ring-food-orange" : ""}
                    `}
                  >
                    <div className="text-xl font-bold">{plan.name}</div>
                    <div className="text-food-orange font-bold">{plan.price}</div>
                    <ul className="mt-3 text-sm text-muted-foreground list-disc pl-5">
                      {plan.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                    {plan.recommended && <Badge className="mt-2">Recommended</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="text-food-orange" /> Subscription Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  <TableRow key={i}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-food-green">{row.status}</Badge>
                    </TableCell>
                    <TableCell>{row.method}</TableCell>
                    <TableCell>{row.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Billings