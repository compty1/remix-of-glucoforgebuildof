import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingBag, ArrowLeft, HelpCircle } from 'lucide-react';

const ShopCancel = () => {
  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Canceled</h1>
          <p className="text-muted-foreground">
            Your order was not completed. Don't worry - your cart items are still saved.
          </p>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold mb-2">Your items are waiting</h3>
                <p className="text-muted-foreground text-sm">
                  No payment was processed. You can return to the shop and complete your purchase whenever you're ready.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reasons & Help */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Having trouble checking out?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Make sure your payment card is valid and has sufficient funds</li>
              <li>• Try a different payment method if available</li>
              <li>• Check that your billing address matches your card details</li>
              <li>• Contact your bank if the issue persists</li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button asChild>
            <Link to="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Shop
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">
              <HelpCircle className="h-4 w-4 mr-2" />
              Get Help
            </Link>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Need assistance? Our support team is here to help at{' '}
          <Link to="/contact" className="text-primary hover:underline">
            support@glucoforge.com
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default ShopCancel;
