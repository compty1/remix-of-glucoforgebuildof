import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { MedicationCard } from '@/components/medicine/MedicationCard';
import { MedicationCompareBar } from '@/components/medicine/MedicationCompareBar';
import { MedicationFilters } from '@/components/medicine/MedicationFilters';
import { MedicationDetailModal } from '@/components/medicine/MedicationDetailModal';
import { InsulinTimingChart } from '@/components/medicine/InsulinTimingChart';
import { useMedications, useMedicationCategories, MedicationCategory, SortOption } from '@/hooks/useMedications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill, Syringe, PillBottle, Activity } from 'lucide-react';

const INSULIN_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];

// Helper to parse timing strings like "15-30 min" to minutes
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

export default function MedicineHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MedicationCategory>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedForCompare, setSelectedForCompare] = useState<Array<{ id: string; name: string }>>([]);

  const { data: medications, isLoading } = useMedications({
    category: selectedCategory,
    search: searchQuery,
    sort: sortBy,
  });

  const { data: categories } = useMedicationCategories();

  // Get subcategories from current medications
  const subcategories = useMemo(() => {
    if (!medications) return [];
    return [...new Set(medications.map(m => m.subcategory).filter(Boolean) as string[])];
  }, [medications]);

  // Filter medications based on active tab
  const filteredMedications = useMemo(() => {
    if (!medications) return [];
    
    let filtered = medications;
    
    // Apply subcategory filter
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(m => m.subcategory === selectedSubcategory);
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'insulins':
        return filtered.filter(m => m.category?.toLowerCase().includes('insulin'));
      case 'oral':
        return filtered.filter(m => 
          m.category === 'Biguanide' || 
          m.category === 'Sulfonylurea' || 
          m.category?.includes('DPP-4') ||
          m.category?.includes('SGLT2')
        );
      case 'injectables':
        return filtered.filter(m => 
          m.category?.includes('GLP-1') || 
          m.category?.includes('GIP') ||
          m.category === 'Amylin Analog'
        );
      default:
        return filtered;
    }
  }, [medications, activeTab, selectedSubcategory]);

  // Get insulin data for the chart
  const insulinChartData = useMemo(() => {
    if (!medications) return [];
    
    const insulins = medications.filter(m => 
      m.category?.toLowerCase().includes('insulin') && 
      (m.onset_time || m.peak_time || m.duration)
    );

    return insulins.slice(0, 6).map((insulin, index) => ({
      name: insulin.name,
      onset: parseTimeToMinutes(insulin.onset_time),
      peak: parseTimeToMinutes(insulin.peak_time),
      duration: parseTimeToMinutes(insulin.duration),
      color: INSULIN_COLORS[index % INSULIN_COLORS.length],
    }));
  }, [medications]);

  // Get stats
  const stats = useMemo(() => {
    if (!medications) return { total: 0, insulins: 0, oral: 0, injectables: 0 };
    
    return {
      total: medications.length,
      insulins: medications.filter(m => m.category?.toLowerCase().includes('insulin')).length,
      oral: medications.filter(m => 
        m.category === 'Biguanide' || 
        m.category === 'Sulfonylurea' || 
        m.category?.includes('DPP-4') ||
        m.category?.includes('SGLT2')
      ).length,
      injectables: medications.filter(m => 
        m.category?.includes('GLP-1') || 
        m.category?.includes('GIP') ||
        m.category === 'Amylin Analog'
      ).length,
    };
  }, [medications]);

  const handleToggleCompare = (id: string) => {
    const medication = medications?.find(m => m.id === id);
    if (!medication) return;
    
    setSelectedForCompare(prev => {
      const exists = prev.find(m => m.id === id);
      if (exists) {
        return prev.filter(m => m.id !== id);
      }
      if (prev.length >= 4) return prev;
      return [...prev, { id: medication.id, name: medication.name }];
    });
  };

  const handleViewDetails = (medication: any) => {
    setSelectedMedicationId(medication.id);
  };

  const handleSortChange = (value: string) => {
    // Map filter sort values to hook sort values
    switch (value) {
      case 'rating':
        setSortBy('rating');
        break;
      case 'price_low':
      case 'price_high':
        setSortBy('price');
        break;
      case 'popularity':
        setSortBy('popularity');
        break;
      default:
        setSortBy('name');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Pill className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Medicine Hub</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive directory of diabetes medications including insulins, oral medications, 
            and non-insulin injectables. Compare options, view clinical data, and read community reviews.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Medications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent">
                  <Syringe className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.insulins}</p>
                  <p className="text-xs text-muted-foreground">Insulins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <PillBottle className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.oral}</p>
                  <p className="text-xs text-muted-foreground">Oral Meds</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.injectables}</p>
                  <p className="text-xs text-muted-foreground">Injectables</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="insulins">Insulins</TabsTrigger>
            <TabsTrigger value="oral">Oral</TabsTrigger>
            <TabsTrigger value="injectables">Injectables</TabsTrigger>
          </TabsList>

          {/* Insulin Timing Chart - Only show on insulins tab */}
          <TabsContent value="insulins" className="mt-6">
            {insulinChartData.length > 0 && (
              <div className="mb-6">
                <InsulinTimingChart insulins={insulinChartData} />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Filters */}
        <div className="mb-6">
          <MedicationFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={(val) => setSelectedCategory(val as MedicationCategory)}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            subcategories={subcategories}
          />
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredMedications.length} medications
          </span>
          {selectedForCompare.length > 0 && (
            <Badge variant="secondary">
              {selectedForCompare.length} selected for comparison
            </Badge>
          )}
        </div>

        {/* Medication Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMedications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                isSelected={selectedForCompare.some(m => m.id === medication.id)}
                onToggleCompare={handleToggleCompare}
                onViewDetails={handleViewDetails}
                compareDisabled={selectedForCompare.length >= 4}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No medications found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        )}

        {/* Compare Bar */}
        <MedicationCompareBar
          selectedMedications={selectedForCompare}
          onRemove={(id) => setSelectedForCompare(prev => prev.filter(m => m.id !== id))}
          onClearAll={() => setSelectedForCompare([])}
        />

        {/* Detail Modal */}
        <MedicationDetailModal
          medicationId={selectedMedicationId}
          onClose={() => setSelectedMedicationId(null)}
        />
      </div>
    </Layout>
  );
}