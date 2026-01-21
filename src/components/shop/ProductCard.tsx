import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { ShopProduct } from '@/hooks/useShopProducts';

interface ProductCardProps {
  product: ShopProduct;
  onAddToCart: (product: ShopProduct) => void;
}

const categoryLabels: Record<string, string> = {
  id_bracelet: 'ID Bracelet',
  id_necklace: 'ID Necklace',
  id_card: 'ID Card',
  supplement: 'Supplement',
  accessory: 'Accessory',
  case: 'Case',
  other: 'Other',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const hasCustomization = product.customization_options && 
    Object.keys(product.customization_options as object).length > 0;

  const imageUrl = product.images?.[0];

  return (
    <Card className="command-center-widget group overflow-hidden">
      <div className="aspect-square relative overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {hasCustomization && (
          <Badge className="absolute top-2 right-2 bg-primary/90">
            <Sparkles className="h-3 w-3 mr-1" />
            Customizable
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <Badge variant="outline" className="mb-2 text-xs">
          {categoryLabels[product.category] || product.category}
        </Badge>
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price_cents)}
          </span>
          <Button size="sm" onClick={() => onAddToCart(product)}>
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
