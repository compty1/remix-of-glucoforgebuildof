import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { BackButton } from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Filter, Loader2 } from 'lucide-react';
import { useShopProducts, useProductCategories, ShopProduct } from '@/hooks/useShopProducts';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShoppingCart, CartItem } from '@/components/shop/ShoppingCart';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const categoryLabels: Record<string, string> = {
  all: 'All Products',
  id_bracelet: 'ID Bracelets',
  id_necklace: 'ID Necklaces',
  id_card: 'ID Cards',
  supplement: 'Supplements',
  accessory: 'Accessories',
  case: 'Cases & Pouches',
  other: 'Other',
};

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const { data: products = [], isLoading } = useShopProducts(activeCategory);
  const { data: categories = [] } = useProductCategories();

  const handleAddToCart = (product: ShopProduct) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    toast.success('Item removed from cart');
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const items = cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const { data, error } = await supabase.functions.invoke('create-shop-checkout', {
        body: { 
          items,
          successUrl: `${window.location.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/shop/cancel`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-heading font-bold">Shop</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Medical ID products, T1D accessories, and community-recommended supplies.
            </p>
          </div>
          <ShoppingCart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
          >
            All Products
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {categoryLabels[cat] || cat}
            </Button>
          ))}
        </div>

        {/* Product count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground mb-4">
              No products available in this category yet.
            </p>
            <Button onClick={() => setActiveCategory('all')}>
              View All Products
            </Button>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Why Medical ID?</h3>
          <p className="text-muted-foreground">
            Medical ID jewelry and cards can be life-saving in emergencies. First responders are trained 
            to look for medical identification, which provides critical information about your T1D status, 
            insulin requirements, and emergency contacts when you may not be able to communicate.
          </p>
        </div>
      </div>
    </Layout>
  );
}
