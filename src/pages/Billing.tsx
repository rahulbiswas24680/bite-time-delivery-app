
import React from "react";
import Navbar from "../components/Layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Billing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Here you can manage your billing information, view your subscription status, and see your payment history.
                </p>
                <ul className="mt-4 list-disc pl-5 text-muted-foreground space-y-1">
                  <li>Subscription plan details</li>
                  <li>Current status: <span className="font-semibold text-food-orange">Inactive</span></li>
                  <li>Upgrade or manage your subscription from this page soon!</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Billing;
