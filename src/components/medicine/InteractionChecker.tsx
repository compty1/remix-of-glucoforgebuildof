import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedicationInteractions } from "@/hooks/useMedicationInteractions";
import { 
  Search, 
  AlertTriangle, 
  AlertCircle,
  Info,
  Shield,
  XCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const severityConfig = {
  contraindicated: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/20",
    label: "Contraindicated",
  },
  major: {
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10 border-destructive/20",
    label: "Major",
  },
  moderate: {
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10 border-warning/20",
    label: "Moderate",
  },
  minor: {
    icon: Info,
    color: "text-info",
    bgColor: "bg-info/10 border-info/20",
    label: "Minor",
  },
};

export function InteractionChecker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const { interactions, isLoading, searchInteractions } = useMedicationInteractions();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchInteractions(searchQuery.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Medication Interaction Checker
          </CardTitle>
          <CardDescription>
            Search for potential drug interactions with diabetes medications. 
            Enter the name of any medication to check for interactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter medication name (e.g., Metformin, Lisinopril, Warfarin...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>
              Check Interactions
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Common searches:</span>
            {["Metformin", "Insulin", "Jardiance", "Ozempic", "Warfarin", "Lisinopril"].map((drug) => (
              <Badge 
                key={drug}
                variant="outline" 
                className="cursor-pointer hover:bg-muted"
                onClick={() => {
                  setSearchQuery(drug);
                  searchInteractions(drug);
                }}
              >
                {drug}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : interactions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {interactions.length} Interaction{interactions.length !== 1 ? 's' : ''} Found
            </h3>
            <div className="flex gap-2">
              {Object.entries(severityConfig).map(([key, config]) => {
                const count = interactions.filter(i => i.severity === key).length;
                if (count === 0) return null;
                return (
                  <Badge key={key} variant="outline" className={config.bgColor}>
                    {count} {config.label}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {interactions
              .sort((a, b) => {
                const order = ['contraindicated', 'major', 'moderate', 'minor'];
                return order.indexOf(a.severity) - order.indexOf(b.severity);
              })
              .map((interaction) => {
                const config = severityConfig[interaction.severity as keyof typeof severityConfig];
                const Icon = config?.icon || Info;
                const isExpanded = expandedId === interaction.id;

                return (
                  <Card 
                    key={interaction.id} 
                    className={`border ${config?.bgColor || ''} transition-all`}
                  >
                    <CardContent className="p-4">
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : interaction.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 mt-0.5 ${config?.color}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {interaction.interacting_drug_name}
                              </h4>
                              <Badge variant="outline" className={config?.bgColor}>
                                {config?.label}
                              </Badge>
                              {interaction.interacting_drug_category && (
                                <Badge variant="secondary" className="text-xs">
                                  {interaction.interacting_drug_category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {interaction.description}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {interaction.clinical_effects && (
                            <div>
                              <p className="text-sm font-medium mb-1">Clinical Effects</p>
                              <p className="text-sm text-muted-foreground">
                                {interaction.clinical_effects}
                              </p>
                            </div>
                          )}
                          {interaction.management_recommendation && (
                            <div>
                              <p className="text-sm font-medium mb-1">Management</p>
                              <p className="text-sm text-muted-foreground">
                                {interaction.management_recommendation}
                              </p>
                            </div>
                          )}
                          {interaction.source && (
                            <p className="text-xs text-muted-foreground">
                              Source: {interaction.source}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ) : searchQuery && !isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-success mb-4" />
            <h3 className="text-lg font-medium mb-2">No Interactions Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No known interactions were found for "{searchQuery}" with common diabetes medications. 
              Always consult your healthcare provider for personalized advice.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Important Disclaimer</p>
              <p>
                This tool is for informational purposes only and does not replace professional medical advice. 
                Drug interactions can vary based on individual factors. Always consult your healthcare provider 
                or pharmacist before starting, stopping, or changing any medication.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
