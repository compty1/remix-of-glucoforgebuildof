import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShoppingBag, 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Eye,
  EyeOff,
  Save,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { BackButton } from '@/components/ui/back-button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  images: string[];
  stock_status: string;
  is_active: boolean;
  created_at: string;
}

interface OrderProduct {
  product_name: string;
  quantity: number;
  price_cents: number;
}

interface Order {
  id: string;
  user_id: string | null;
  status: string;
  total_cents: number;
  products: OrderProduct[];
  shipping_info: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const AdminShop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'bracelets',
    stock_status: 'in_stock',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('shop_products').select('*').order('created_at', { ascending: false }),
        supabase.from('shop_orders').select('id, user_id, status, total_cents, products, shipping_info, created_at, updated_at').order('created_at', { ascending: false }).limit(50),
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (ordersRes.data) {
        const typedOrders = ordersRes.data.map(o => ({
          ...o,
          products: Array.isArray(o.products) ? (o.products as unknown as OrderProduct[]) : [],
        })) as Order[];
        setOrders(typedOrders);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load shop data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    const priceInCents = Math.round(parseFloat(productForm.price) * 100);
    
    if (!productForm.name || isNaN(priceInCents)) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      if (editingProduct) {
        await supabase
          .from('shop_products')
          .update({
            name: productForm.name,
            description: productForm.description || null,
            price_cents: priceInCents,
            category: productForm.category,
            stock_status: productForm.stock_status,
            is_active: productForm.is_active,
          })
          .eq('id', editingProduct.id);
        
        toast.success('Product updated successfully');
      } else {
        await supabase
          .from('shop_products')
          .insert({
            name: productForm.name,
            description: productForm.description || null,
            price_cents: priceInCents,
            category: productForm.category,
            stock_status: productForm.stock_status,
            is_active: productForm.is_active,
            images: [],
          });
        
        toast.success('Product created successfully');
      }

      setEditingProduct(null);
      setIsAddingProduct(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await supabase.from('shop_products').delete().eq('id', id);
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await supabase
        .from('shop_products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      
      toast.success(product.is_active ? 'Product hidden' : 'Product visible');
      fetchData();
    } catch (err) {
      console.error('Error toggling product:', err);
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'bracelets',
      stock_status: 'in_stock',
      is_active: true,
    });
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: (product.price_cents / 100).toFixed(2),
      category: product.category,
      stock_status: product.stock_status,
      is_active: product.is_active,
    });
    setIsAddingProduct(true);
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
      case 'expired':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + o.total_cents, 0);

  const paidOrders = orders.filter(o => o.status === 'paid').length;

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <BackButton className="mb-4" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-primary" />
              Shop Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage products and view orders
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{products.filter(p => p.is_active).length}</p>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{paidOrders}</p>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your shop inventory</CardDescription>
                  </div>
                  <Dialog open={isAddingProduct} onOpenChange={(open) => {
                    setIsAddingProduct(open);
                    if (!open) {
                      setEditingProduct(null);
                      resetForm();
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div>
                          <Label>Product Name *</Label>
                          <Input
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            placeholder="T1D Awareness Bracelet"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="High-quality silicone bracelet..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Price (USD) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              placeholder="9.99"
                            />
                          </div>
                          <div>
                            <Label>Category</Label>
                            <Select
                              value={productForm.category}
                              onValueChange={(val) => setProductForm({ ...productForm, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bracelets">Bracelets</SelectItem>
                                <SelectItem value="necklaces">Necklaces</SelectItem>
                                <SelectItem value="cards">ID Cards</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Stock Status</Label>
                            <Select
                              value={productForm.stock_status}
                              onValueChange={(val) => setProductForm({ ...productForm, stock_status: val })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in_stock">In Stock</SelectItem>
                                <SelectItem value="low_stock">Low Stock</SelectItem>
                                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-3 pt-6">
                            <Switch
                              checked={productForm.is_active}
                              onCheckedChange={(checked) => setProductForm({ ...productForm, is_active: checked })}
                            />
                            <Label>Active (visible in shop)</Label>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button onClick={handleSaveProduct} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            {editingProduct ? 'Update' : 'Create'} Product
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{product.name}</h4>
                            {!product.is_active && (
                              <Badge variant="outline" className="text-xs">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Hidden
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • {product.stock_status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-primary">
                          {formatPrice(product.price_cents)}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(product)}
                          >
                            {product.is_active ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {products.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No products yet. Add your first product to get started.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>View and manage customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {formatPrice(order.total_cents)}
                        </p>
                        {order.status === 'paid' && (
                          <p className="text-xs text-muted-foreground">
                            Updated {format(new Date(order.updated_at), 'MMM d')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminShop;
