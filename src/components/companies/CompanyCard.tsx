import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, MapPin, DollarSign, Calendar, Users, GitCompare, ImageIcon } from 'lucide-react';
import { T1DCompany } from '@/hooks/useT1DCompanies';
import { VerifiedLink } from '@/components/ui/verified-link';

// Product images for major T1D companies
const companyProductImages: Record<string, string> = {
  'Dexcom': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=200&fit=crop',
  'Abbott': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=200&fit=crop',
  'Medtronic': 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=400&h=200&fit=crop',
  'Insulet': 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&h=200&fit=crop',
  'Tandem': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=200&fit=crop',
  'Beta Bionics': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
};

interface CompanyCardProps {
  company: T1DCompany;
  isSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  showCompareCheckbox?: boolean;
}

export function CompanyCard({ 
  company, 
  isSelected = false, 
  onToggleCompare, 
  showCompareCheckbox = false 
}: CompanyCardProps) {
  const formatFunding = (amount: number | null) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000000) return `$${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  const getCompanyTypeColor = (type: string | null) => {
    switch (type) {
      case 'public': return 'bg-success/10 text-success border-success/20';
      case 'startup': return 'bg-primary/10 text-primary border-primary/20';
      case 'acquired': return 'bg-warning/10 text-warning border-warning/20';
      case 'non-profit': return 'bg-highlight/10 text-highlight border-highlight/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {showCompareCheckbox && onToggleCompare && (
            <div 
              className="flex items-center justify-center pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleCompare(company.id)}
                aria-label={`Add ${company.name} to comparison`}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link 
              to={`/companies/${company.id}`}
              className="hover:underline"
            >
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                {company.name}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground">
              {company.headquarters && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.headquarters}
                </span>
              )}
              {company.founded_year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {company.founded_year}
                </span>
              )}
            </div>
          </div>
          <Badge variant="outline" className={getCompanyTypeColor(company.company_type)}>
            {company.company_type || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {company.description || 'No description available'}
        </p>

        {/* Focus Areas */}
        {company.focus_areas && company.focus_areas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {company.focus_areas.slice(0, 4).map((area, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {area}
              </Badge>
            ))}
            {company.focus_areas.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{company.focus_areas.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
              <DollarSign className="h-3.5 w-3.5 text-success" />
              {formatFunding(company.total_funding_usd)}
            </div>
            <div className="text-xs text-muted-foreground">Funding</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-foreground">
              {company.funding_stage || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Stage</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium text-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              {company.employee_count || 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">Employees</div>
          </div>
        </div>

        {/* Clinical Stage & Website */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {company.clinical_stage && (
            <Badge variant="outline" className="text-xs">
              {company.clinical_stage}
            </Badge>
          )}
          {company.website_url && (
            <VerifiedLink 
              href={company.website_url}
              isVerified={company.link_verified}
              className="text-xs"
            >
              Website
            </VerifiedLink>
          )}
        </div>

        {/* Acquired Badge */}
        {company.acquired_by && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            Acquired by <span className="font-medium">{company.acquired_by}</span>
            {company.acquisition_date && ` (${new Date(company.acquisition_date).getFullYear()})`}
          </div>
        )}

        {/* Product Image */}
        {companyProductImages[company.name] ? (
          <div className="mt-3 pt-3 border-t border-border/50">
            <img 
              src={companyProductImages[company.name]} 
              alt={`${company.name} product`}
              className="w-full h-24 object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="w-full h-24 bg-muted/30 rounded-md flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
