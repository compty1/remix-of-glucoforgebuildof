import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import { generateBillingCodes, generateBillingCSV, type PatientMonitoringData } from '@/utils/rpmBillingReport';

const DEMO_PATIENTS: PatientMonitoringData[] = [
  { patientId: 'p1', patientName: 'Jane Doe', daysWithData: 22, providerReviewMinutes: 35, isInitialSetup: false, monthYear: '2026-02' },
  { patientId: 'p2', patientName: 'John Smith', daysWithData: 18, providerReviewMinutes: 15, isInitialSetup: false, monthYear: '2026-02' },
  { patientId: 'p3', patientName: 'Alice Johnson', daysWithData: 8, providerReviewMinutes: 25, isInitialSetup: true, monthYear: '2026-02' },
];

export default function RPMBillingExport() {
  const [month, setMonth] = useState('2026-02');

  const reports = DEMO_PATIENTS.map(generateBillingCodes);
  const totalBillable = reports.reduce((sum, r) => sum + r.totalBillableEvents, 0);

  const exportCSV = () => {
    const csv = generateBillingCSV(DEMO_PATIENTS);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpm-billing-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          RPM Billing Report
          <Badge variant="secondary">{totalBillable} billable codes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-end">
          <div>
            <label className="text-sm font-medium">Month</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="mt-1 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2026-02">Feb 2026</SelectItem>
                <SelectItem value="2026-01">Jan 2026</SelectItem>
                <SelectItem value="2025-12">Dec 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.patient.patientId} className="p-3 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{r.patient.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.patient.daysWithData} days transmitted • {r.patient.providerReviewMinutes} min reviewed
                  </p>
                </div>
                <div className="flex gap-1">
                  {r.cptCodes.filter(c => c.qualified).map(c => (
                    <Badge key={c.code} variant="outline" className="text-xs">{c.code}</Badge>
                  ))}
                  {r.totalBillableEvents === 0 && (
                    <Badge variant="secondary" className="text-xs">Not billable</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          CPT 99453: Initial setup • 99454: 16+ days/mo transmission • 99457: 20+ min provider review
        </p>
      </CardContent>
    </Card>
  );
}
