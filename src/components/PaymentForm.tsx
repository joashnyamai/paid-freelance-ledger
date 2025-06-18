
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { Invoice } from "@/pages/Index";

interface PaymentFormProps {
  invoice: Invoice;
  onAddPayment: (invoiceId: string, amount: number) => void;
}

export const PaymentForm = ({ invoice, onAddPayment }: PaymentFormProps) => {
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    
    if (amount > 0 && amount <= (invoice.balance || invoice.total)) {
      onAddPayment(invoice.id, amount);
      setPaymentAmount('');
    }
  };

  const balance = invoice.balance || invoice.total;
  const maxPayment = balance;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Add Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <div className="font-medium">KSH {invoice.total.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Amount Paid:</span>
              <div className="font-medium text-green-600">KSH {(invoice.amountPaid || 0).toFixed(2)}</div>
            </div>
            <div>
              <span className="text-gray-600">Balance Due:</span>
              <div className="font-medium text-red-600">KSH {balance.toFixed(2)}</div>
            </div>
          </div>
          
          {balance > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="payment-amount">Payment Amount (KSH)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Max: ${maxPayment.toFixed(2)}`}
                  min="0.01"
                  max={maxPayment}
                  step="0.01"
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentAmount(balance.toString())}
                >
                  Pay Full Balance
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Payment
                </Button>
              </div>
            </form>
          )}
          
          {balance <= 0 && (
            <div className="text-green-600 font-medium text-center py-4">
              This invoice has been fully paid!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
