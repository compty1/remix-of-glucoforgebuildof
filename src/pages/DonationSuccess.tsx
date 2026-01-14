import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Heart, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DonationSuccess = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const donation = searchParams.get('donation');

  useEffect(() => {
    if (donation === 'success') {
      toast({
        title: "Thank you for your donation! 🎉",
        description: "Your support helps advance diabetes research and patient care.",
        duration: 5000,
      });
    } else if (donation === 'cancelled') {
      toast({
        title: "Donation cancelled",
        description: "Your donation was cancelled. No charges were made.",
        variant: "destructive",
      });
    }
  }, [donation, toast]);

  if (donation === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-green-600">Thank You!</CardTitle>
            <CardDescription>
              Your donation was successful and greatly appreciated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" />
              <span>Supporting diabetes research & innovation</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your contribution helps us:
              </p>
              <ul className="text-sm text-left space-y-1 text-muted-foreground">
                <li>• Advance cutting-edge research</li>
                <li>• Develop better patient care solutions</li>
                <li>• Build innovative diabetes management tools</li>
              </ul>
            </div>

            <Button asChild className="w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (donation === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">Donation Cancelled</CardTitle>
            <CardDescription>
              No worries! Your donation was cancelled and no charges were made.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If you'd like to support GlucoForge in the future, you can always try again from the main dashboard.
            </p>

            <Button asChild className="w-full">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-6">
          <Button asChild className="w-full">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};