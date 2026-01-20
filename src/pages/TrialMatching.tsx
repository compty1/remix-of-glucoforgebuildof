import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrialMatching } from "@/hooks/useTrialMatching";
import { TrialCard } from "@/components/trials/TrialCard";
import { TrialDetailModal } from "@/components/trials/TrialDetailModal";
import { 
  Search, 
  MapPin, 
  Filter, 
  Stethoscope,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function TrialMatching() {
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState("100");
  const [phase, setPhase] = useState("all");
  const [status, setStatus] = useState("recruiting");
  const [selectedTrialId, setSelectedTrialId] = useState<string | null>(null);

  const { trials, isLoading, error, refetch, totalCount } = useTrialMatching({
    zipCode,
    radius: parseInt(radius),
    phase: phase === "all" ? undefined : phase,
    status: status === "all" ? undefined : status,
  });

  const handleSearch = () => {
    refetch();
  };

  const selectedTrial = trials.find(t => t.nct_id === selectedTrialId);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 px-4 bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Stethoscope className="h-8 w-8 text-primary" />
              <Badge variant="secondary">Clinical Trials</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Find Clinical Trials Near You
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover actively recruiting Type 1 Diabetes clinical trials in your area. 
              Connect directly with research teams and contribute to advancing T1D treatments.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="py-8 px-4 border-b">
          <div className="container mx-auto max-w-5xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Trials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">Location (ZIP Code)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter ZIP code..."
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Radius</label>
                    <Select value={radius} onValueChange={setRadius}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                        <SelectItem value="250">250 miles</SelectItem>
                        <SelectItem value="500">Nationwide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Phase</label>
                    <Select value={phase} onValueChange={setPhase}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Phases</SelectItem>
                        <SelectItem value="Phase 1">Phase 1</SelectItem>
                        <SelectItem value="Phase 2">Phase 2</SelectItem>
                        <SelectItem value="Phase 3">Phase 3</SelectItem>
                        <SelectItem value="Phase 4">Phase 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="recruiting">Recruiting</SelectItem>
                        <SelectItem value="enrolling">Enrolling by Invitation</SelectItem>
                        <SelectItem value="active">Active, Not Recruiting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button onClick={handleSearch} className="gap-2">
                    <Filter className="h-4 w-4" />
                    Search Trials
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {isLoading ? "Searching..." : `${totalCount} Trials Found`}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Actively recruiting T1D clinical trials
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            {error && (
              <Card className="border-destructive/50 bg-destructive/5 mb-6">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <p className="text-sm text-destructive">
                    Error loading trials. Please try again later.
                  </p>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : trials.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Trials Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Try expanding your search radius or changing your filters to find more clinical trials.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {trials.map((trial) => (
                  <TrialCard 
                    key={trial.nct_id} 
                    trial={trial} 
                    onViewDetails={() => setSelectedTrialId(trial.nct_id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Trial Detail Modal */}
        <TrialDetailModal
          trial={selectedTrial || null}
          isOpen={!!selectedTrialId}
          onClose={() => setSelectedTrialId(null)}
        />
      </div>
    </Layout>
  );
}
