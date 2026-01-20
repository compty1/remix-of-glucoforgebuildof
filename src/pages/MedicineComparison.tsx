import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowLeft, Star, Clock, DollarSign, Share2, CheckCircle2, XCircle } from 'lucide-react';
import { InsulinTimingChart } from '@/components/medicine/InsulinTimingChart';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CHART_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b'];

const parseTimeToMinutes = (timeStr: string | null): number => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (timeStr.includes('hour') || timeStr.includes('hr')) {
      return num * 60;
    }
    return num;
  }
  return 0;
};

export default function MedicineComparison() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications-compare', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .in('id', ids);
      
      if (error) throw error;
      return data || [];
    },
    enabled: ids.length > 0,
  });

  const insulinChartData = useMemo(() => {
    if (!medications) return [];
    
    return medications
      .filter(m => m.category === 'Insulin' && (m.onset_time || m.peak_time || m.duration))
      .map((med, index) => ({
        name: med.name,
        onset: parseTimeToMinutes(med.onset_time),
        peak: parseTimeToMinutes(med.peak_time),
        duration: parseTimeToMinutes(med.duration),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [medications]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Comparison link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Share this comparison',
        description: url,
      });
    }
  };

  if (ids.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">No Medications Selected</h2>
              <p className="text-muted-foreground mb-4">
                Select at least 2 medications to compare
              </p>
              <Button asChild>
                <Link to="/medicines">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Medicine Hub
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/medicines">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Compare Medications</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : medications && medications.length > 0 ? (
          <div className="space-y-6">
            {/* Insulin Timing Chart */}
            {insulinChartData.length > 0 && (
              <InsulinTimingChart insulins={insulinChartData} />
            )}

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Attribute</TableHead>
                      {medications.map(med => (
                        <TableHead key={med.id} className="min-w-[200px]">
                          <div>
                            <p className="font-semibold">{med.name}</p>
                            {med.generic_name && (
                              <p className="text-xs text-muted-foreground font-normal">
                                {med.generic_name}
                              </p>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Category */}
                    <TableRow>
                      <TableCell className="font-medium">Category</TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          <div className="flex flex-wrap gap-1">
                            <Badge>{med.category}</Badge>
                            {med.subcategory && (
                              <Badge variant="outline">{med.subcategory}</Badge>
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Rating */}
                    <TableRow>
                      <TableCell className="font-medium">Rating</TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.rating_avg ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{med.rating_avg.toFixed(1)}</span>
                              <span className="text-muted-foreground text-sm">
                                ({med.review_count || 0})
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No ratings</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Timing (for insulins) */}
                    {medications.some(m => m.onset_time || m.peak_time || m.duration) && (
                      <>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Onset
                            </div>
                          </TableCell>
                          {medications.map(med => (
                            <TableCell key={med.id}>
                              {med.onset_time || '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Peak</TableCell>
                          {medications.map(med => (
                            <TableCell key={med.id}>
                              {med.peak_time || '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Duration</TableCell>
                          {medications.map(med => (
                            <TableCell key={med.id}>
                              {med.duration || '—'}
                            </TableCell>
                          ))}
                        </TableRow>
                      </>
                    )}

                    {/* Pricing */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Retail Price
                        </div>
                      </TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.avg_price ? `$${med.avg_price}` : '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Medicare Price</TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.medicare_price ? (
                            <span className="text-blue-600 font-medium">
                              ${med.medicare_price}
                            </span>
                          ) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Manufacturer */}
                    <TableRow>
                      <TableCell className="font-medium">Manufacturer</TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.manufacturer || '—'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* FDA Status */}
                    <TableRow>
                      <TableCell className="font-medium">FDA Status</TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.fda_status ? (
                            <Badge variant="secondary">{med.fda_status}</Badge>
                          ) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Pros */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Pros
                        </div>
                      </TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.pros && med.pros.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {(med.pros as string[]).slice(0, 3).map((pro, i) => (
                                <li key={i} className="text-green-700 dark:text-green-400">
                                  • {pro}
                                </li>
                              ))}
                            </ul>
                          ) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Cons */}
                    <TableRow>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Cons
                        </div>
                      </TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.cons && med.cons.length > 0 ? (
                            <ul className="text-sm space-y-1">
                              {(med.cons as string[]).slice(0, 3).map((con, i) => (
                                <li key={i} className="text-red-700 dark:text-red-400">
                                  • {con}
                                </li>
                              ))}
                            </ul>
                          ) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Side Effects */}
                    <TableRow>
                      <TableCell className="font-medium">Common Side Effects</TableCell>
                      {medications.map(med => (
                        <TableCell key={med.id}>
                          {med.common_side_effects && (med.common_side_effects as string[]).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(med.common_side_effects as string[]).slice(0, 3).map((effect, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          ) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">Medications Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The selected medications could not be loaded
              </p>
              <Button asChild>
                <Link to="/medicines">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Medicine Hub
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
