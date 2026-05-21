import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePageMeta } from '@/hooks/usePageMeta';

interface OrderProduct {
  product_name: string;
  quantity: number;
  price_cents: number;
}

interface Order {
  id: string;
  status: string;
  total_cents: number;
  created_at: string;
  products: OrderProduct[];
}

const ShopSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const { data: orderData, error } = await supabase
          .from('shop_orders')
          .select('id, status, total_cents, created_at, products')
          .eq('stripe_session_id', sessionId)
          .maybeSingle();

        if (error) throw error;

        if (orderData) {
          const products = Array.isArray(orderData.products) 
            ? (orderData.products as unknown as OrderProduct[])
            : [];
          setOrder({
            id: orderData.id,
            status: orderData.status,
            total_cents: orderData.total_cents,
            created_at: orderData.created_at,
            products,
          });
        }
      } catch {
        // Order fetch failed — showing generic success message
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {loading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading order details...</p>
            </CardContent>
          </Card>
        ) : order ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {order.status === 'paid' ? 'Confirmed' : order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Order ID: {order.id.slice(0, 8)}...
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div className="space-y-3">
                {order.products.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(item.price_cents * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(order.total_cents)}
                </span>
              </div>

              {/* Shipping Notice */}
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">📦 Shipping Information</p>
                <p className="text-muted-foreground">
                  Your order will be shipped within 1-2 business days. 
                  You'll receive an email with tracking information once shipped.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Order details not found.</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button asChild>
            <Link to="/shop">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Support Notice */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Questions about your order? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
        </p>
      </div>
    </Layout>
  );
};

export default ShopSuccess;
