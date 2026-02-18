import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe with publishable key from environment
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DonationModal = ({ open, onOpenChange }: DonationModalProps) => {
  const [amount, setAmount] = useState("25");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [5, 25, 50, 100];

  const handleDonation = async () => {
    const donationAmount = parseFloat(amount);
    
    if (!donationAmount || donationAmount < 5) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid donation amount of at least $5.",
      });
      return;
    }

    if (donationAmount > 100000) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Maximum donation amount is $100,000.",
      });
      return;
    }

    setLoading(true);

    try {
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error("Stripe failed to initialize");
      }

      // Call our edge function to create the donation session
      const { data, error } = await supabase.functions.invoke('create-donation', {
        body: { amount: donationAmount }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.open(data.url, '_blank');
        onOpenChange(false);
        toast({
          title: "Redirecting to Stripe Checkout",
          description: "Thank you for supporting GlucoForge! You'll be redirected to complete your donation.",
        });
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error('Stripe error:', error);
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "There was an error initiating the payment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Support GlucoForge
          </DialogTitle>
          <DialogDescription>
            Your donation helps us continue developing cutting-edge solutions for diabetes research and patient care.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Predefined amounts */}
          <div className="space-y-3">
            <Label>Quick select amount:</Label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedAmounts.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  variant={amount === presetAmount.toString() ? "default" : "outline"}
                  onClick={() => setAmount(presetAmount.toString())}
                  disabled={loading}
                >
                  ${presetAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Custom amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25.00"
                className="pl-8"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDonation} 
              disabled={loading || !amount}
              className="min-w-[140px]"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Donate ${amount}
            </Button>
          </div>
        </div>

        {/* Real Stripe Integration Notice */}
        <div className="bg-primary/10 rounded-md p-3 text-xs text-foreground space-y-1">
          <p className="font-medium">💳 Live Stripe Integration</p>
          <p>• Secure payment processing via Stripe Checkout</p>
          <p>• Support GlucoForge's T1D research mission</p>
          <p>• Tax-deductible donations (501c3 pending)</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};