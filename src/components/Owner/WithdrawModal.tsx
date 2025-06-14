
import React from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";

const mockWithdraws = [
  { date: "2025-05-01", amount: 120, status: "Completed" },
  { date: "2025-05-02", amount: 75, status: "Completed" },
];

const WithdrawModal: React.FC<{ cashToday: number }> = ({ cashToday }) => {
  const [withdrawing, setWithdrawing] = React.useState(false);
  const [hasWithdrawn, setHasWithdrawn] = React.useState(false);

  const handleWithdraw = () => {
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setHasWithdrawn(true);
    }, 1200);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-food-green hover:bg-green-600">Withdraw Cash</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Cash</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <strong>Amount available today:</strong>{" "}
          <span className="text-food-green font-bold text-lg">₹{cashToday}</span>
        </div>
        <div className="mb-2">Previous withdrawals:</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount (₹)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockWithdraws.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!hasWithdrawn ? (
          <DialogFooter>
            <Button onClick={handleWithdraw} disabled={withdrawing} className="w-full">
              {withdrawing ? "Processing..." : "Withdraw via Razorpay"}
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        ) : (
          <div className="mt-4 text-food-green font-bold text-center">Withdrawal Successful! (Demo only)</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawModal;
