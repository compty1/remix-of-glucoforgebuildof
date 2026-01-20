import React, { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { MedicationCard } from '@/components/medicine/MedicationCard';
import { MedicationCompareBar } from '@/components/medicine/MedicationCompareBar';
import { MedicationFilters } from '@/components/medicine/MedicationFilters';
import { MedicationDetailModal } from '@/components/medicine/MedicationDetailModal';
import { InsulinTimingChart } from '@/components/medicine/InsulinTimingChart';
import { useMedications } from '@/hooks/useMedications';
import { useMedicationComparison } from '@/hooks/useMedicationComparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Pill, Syringe, PillBottle, Activity } from 'lucide-react';

const INSULIN_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedMedicationId, setSelectedMedicationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const { medications, isLoading, subcategories } = useMedications({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    subcategory: selectedSubcategory === 'all' ? undefined : selectedSubcategory,
    search: searchQuery,
    sortBy,
  });

  const { 
    selectedMedications, 
    toggleMedication, 
    removeMedication, 
    clearAll 
  } = useMedicationComparison();

  // Filter medications based on active tab
  const filteredMedications = useMemo(() => {
    if (!medications) return [];
    
    switch (activeTab) {
      case 'insulins':
        return medications.filter(m => m.category === 'Insulin');
      case 'oral':
        return medications.filter(m => m.category === 'Oral');
      case 'injectables':
        return medications.filter(m => m.category === 'Injectable');
      default:
        return medications;
    }
  }, [medications, activeTab]);

  // Get insulin data for the chart
  const insulinChartData = useMemo(() => {
    if (!medications) return [];
    
    const insulins = medications.filter(m => 
      m.category === 'Insulin' && 
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
      insulins: medications.filter(m => m.category === 'Insulin').length,
      oral: medications.filter(m => m.category === 'Oral').length,
      injectables: medications.filter(m => m.category === 'Injectable').length,
    };
  }, [medications]);

  const handleToggleCompare = (id: string) => {
    const medication = medications?.find(m => m.id === id);
    if (medication) {
      toggleMedication({ id: medication.id, name: medication.name });
    }
  };

  const handleViewDetails = (medication: any) => {
    setSelectedMedicationId(medication.id);
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
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Syringe className="h-5 w-5 text-blue-500" />
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
                <div className="p-2 rounded-lg bg-green-500/10">
                  <PillBottle className="h-5 w-5 text-green-500" />
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
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Activity className="h-5 w-5 text-purple-500" />
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
            onCategoryChange={setSelectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            subcategories={subcategories}
          />
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredMedications.length} medications
          </span>
          {selectedMedications.length > 0 && (
            <Badge variant="secondary">
              {selectedMedications.length} selected for comparison
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
                isSelected={selectedMedications.some(m => m.id === medication.id)}
                onToggleCompare={handleToggleCompare}
                onViewDetails={handleViewDetails}
                compareDisabled={selectedMedications.length >= 4}
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
          selectedMedications={selectedMedications}
          onRemove={removeMedication}
          onClearAll={clearAll}
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
