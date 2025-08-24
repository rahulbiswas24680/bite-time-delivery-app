// pages/TestUpload.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { initializePlans } from '@/utils/helper';
import { toast } from '@/components/ui/use-toast';

const TestUpload = () => {
  const uploadSubscription = async () => {
    try {
      await initializePlans();
      toast({ title: "Plan uploaded", description: "Pro plan was added to Firestore." });
    } catch (err) {
      console.error("Upload failed", err);
      toast({ variant: "destructive", title: "Upload failed" });
    }
  };

  const uploadUserSubscription = async () => {
    try {
      await initializePlans();
      toast({ title: "Plan uploaded", description: "Pro plan was added to Firestore." });
    } catch (err) {
      console.error("Upload failed", err);
      toast({ variant: "destructive", title: "Upload failed" });
    }
  };

  return (
    <div className="p-4">
      <Button onClick={uploadSubscription}>Upload Pro Plan to Firestore</Button>
      {/* <Button onClick={uploadUserSubscription}>Upload Pro Plan to Firestore</Button> */}
    </div>
  );
};

export default TestUpload;