import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoRail } from '@/components/InfoRail';
import Layout from '@/components/Layout';
import AnalysisResultsModal from '@/components/data-upload/AnalysisResultsModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Smartphone, 
  Cloud,
  TrendingUp,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Zap,
  Calendar,
  Activity,
  FileImage,
  FileSpreadsheet,
  Database,
  FileCode
} from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'cgm' | 'pump' | 'logbook' | 'lab';
  size: string;
  uploadDate: string;
  status: 'processing' | 'complete' | 'error';
  insights: string[];
  readingsCount: number;
  detailedAnalysis?: {
    readingsCount?: number;
    avgGlucose?: number;
    medianGlucose?: number;
    stdDev?: number;
    cv?: number;
    gmi?: number;
    timeInRange?: number;
    timeInTightRange?: number;
    timeAbove180?: number;
    timeAbove250?: number;
    timeBelow70?: number;
    timeBelow54?: number;
    mage?: number;
    gvi?: number;
    lowEvents?: number;
    severeLowEvents?: number;
    highEvents?: number;
    severeHighEvents?: number;
    dataStart?: string;
    dataEnd?: string;
    daysOfData?: number;
  };
  hourlyData?: Array<{ hour: number; avg: number; min: number; max: number; p10: number; p25: number; p50: number; p75: number; p90: number; count: number }>;
  dailyData?: Array<{ date: string; avg: number; min: number; max: number; tir: number; readings: number; lowEvents: number; highEvents: number }>;
  agpData?: Array<{ time: string; p5: number; p25: number; p50: number; p75: number; p95: number }>;
  patterns?: Array<{ type: string; severity: 'info' | 'warning' | 'critical'; title: string; description: string; timeOfDay?: string; avgImpact?: number }>;
  recommendations?: string[];
  aiInsights?: {
    patterns?: Array<{ pattern: string; description: string; impact: string }>;
    recommendations?: Array<{ recommendation: string; priority: string; rationale: string }>;
    concerns?: string[];
    summary?: string;
  };
  // Enhanced analysis fields
  confidenceScore?: number;
  confidenceBand?: 'high' | 'moderate' | 'low' | 'unreliable' | 'unknown';
  validationFlags?: any[];
  dataQuality?: any;
  novelSignals?: any;
  executiveSummary?: any;
  dayNightAnalysis?: any;
}

const DataUpload = () => {
  const { user } = useAuthStore();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  // Fetch user's previous uploads
  useEffect(() => {
    const fetchUploads = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(10);
        
      if (data) {
        setUploadedFiles(data.map(upload => ({
          id: upload.id,
          name: upload.file_name,
          type: upload.file_type?.includes('csv') ? 'cgm' : 'pump',
          size: upload.file_size ? `${(upload.file_size / 1024 / 1024).toFixed(1)} MB` : '0 MB',
          uploadDate: new Date(upload.uploaded_at).toISOString().split('T')[0],
          status: (upload.status === 'completed' ? 'complete' : upload.status) as 'complete' | 'processing' | 'error',
          insights: upload.insights || [],
          readingsCount: upload.readings_count || 0,
          detailedAnalysis: upload.detailed_analysis as UploadedFile['detailedAnalysis'],
          hourlyData: upload.hourly_data as UploadedFile['hourlyData'],
          dailyData: upload.daily_data as UploadedFile['dailyData'],
          agpData: upload.agp_data as UploadedFile['agpData'],
          patterns: upload.patterns as UploadedFile['patterns'],
          recommendations: upload.recommendations || [],
          aiInsights: upload.ai_insights as UploadedFile['aiInsights'],
          // Enhanced analysis fields
          confidenceScore: upload.confidence_score ?? undefined,
          confidenceBand: (upload.confidence_band || 'unknown') as UploadedFile['confidenceBand'],
          validationFlags: upload.validation_flags as UploadedFile['validationFlags'],
          dataQuality: upload.data_quality as UploadedFile['dataQuality'],
          novelSignals: upload.novel_signals as UploadedFile['novelSignals'],
          executiveSummary: (upload.ai_insights as any)?.executiveSummary as UploadedFile['executiveSummary'],
          dayNightAnalysis: upload.day_night_analysis as UploadedFile['dayNightAnalysis']
        })));
      }
    };
    
    fetchUploads();
  }, [user]);
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await processFile(file);
    }
  }, [user]);

  const processFile = async (file: File) => {
    if (!user) return;

    const tempId = Date.now().toString();
    const newFile: UploadedFile = {
      id: tempId,
      name: file.name,
      type: file.name.includes('.csv') ? 'cgm' : 'pump',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'processing',
      insights: [],
      readingsCount: 0
    };
    
    setUploadedFiles(prev => [newFile, ...prev]);

    try {
      // Determine if file is binary (needs base64 encoding)
      const fileContent = await (async () => {
        const lowerName = file.name.toLowerCase();
        const isBinary = file.type === 'application/pdf' || 
                         lowerName.endsWith('.pdf') ||
                         lowerName.endsWith('.xlsx') ||
                         lowerName.endsWith('.xls') ||
                         lowerName.match(/\.(png|jpg|jpeg|webp)$/);
        
        if (!isBinary) return await file.text();

        // PDFs, Excel files, and images must be sent as base64
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        return btoa(binary);
      })();

      // Create upload record
      const { data: uploadRecord, error: insertError } = await supabase
        .from('uploads')
        .insert({
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          user_id: user.id,
          status: 'processing'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Call analyze-glucose Edge Function
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-glucose', {
        body: {
          filename: file.name,
          fileContent,
          uploadId: uploadRecord.id
        }
      });

      if (analysisError) throw analysisError;

      const insights = analysisResult?.insights || [];
      const readingsCount = analysisResult?.readingsCount || 0;

      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId
          ? { 
              ...f, 
              id: uploadRecord.id,
              status: 'complete' as const, 
              insights,
              readingsCount,
              detailedAnalysis: analysisResult?.detailedAnalysis,
              hourlyData: analysisResult?.hourlyData,
              dailyData: analysisResult?.dailyData,
              agpData: analysisResult?.agpData,
              patterns: analysisResult?.patterns,
              recommendations: analysisResult?.recommendations,
              aiInsights: analysisResult?.aiInsights,
              // Enhanced analysis fields
              confidenceScore: analysisResult?.confidenceScore,
              confidenceBand: analysisResult?.confidenceBand || 'unknown',
              validationFlags: analysisResult?.validationFlags,
              dataQuality: analysisResult?.dataQuality,
              novelSignals: analysisResult?.novelSignals,
              executiveSummary: analysisResult?.executiveSummary,
              dayNightAnalysis: analysisResult?.dayNightAnalysis
            }
          : f
      ));

      toast.success(`${file.name} analyzed - ${readingsCount} readings processed`);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === tempId ? { ...f, status: 'error' as const } : f
      ));
      
      // Extract meaningful error message from the response
      const errorMessage = error?.message || error?.error || 'Analysis failed';
      const suggestion = error?.suggestion || '';
      
      if (errorMessage.includes('does not appear to contain') || errorMessage.includes('CGM glucose data')) {
        toast.error('This PDF doesn\'t appear to be a CGM report. Please upload a report from Dexcom Clarity, LibreView, or your pump app.', {
          duration: 6000
        });
      } else if (errorMessage.includes('Insufficient data')) {
        toast.error('Not enough glucose readings found. Please check the file format.', {
          duration: 5000
        });
      } else {
        toast.error(`Failed to analyze ${file.name}${suggestion ? ': ' + suggestion : ''}`);
      }
    }
  };
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'cgm': return <Activity className="h-5 w-5 text-primary" />;
      case 'pump': return <Zap className="h-5 w-5 text-primary" />;
      case 'logbook': return <FileText className="h-5 w-5 text-primary" />;
      case 'lab': return <BarChart3 className="h-5 w-5 text-primary" />;
      default: return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing': return <Upload className="h-4 w-4 text-warning animate-pulse" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Data Upload & Analysis Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Upload your CGM data, pump logs, or manual entries to unlock AI-powered insights and personalized recommendations
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drag & Drop Upload */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 mx-auto mb-4 forge-gradient rounded-full flex items-center justify-center">
                    <Cloud className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-2">
                    Drag & drop files here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Support for CGM exports (CSV, XLSX, JSON), Nightscout exports, PDF reports, and screenshots
                  </p>
                  <Button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.csv,.json,.pdf,.xlsx,.xls,.xml,.png,.jpg,.jpeg';
                      input.multiple = true;
                      input.onchange = async (e) => {
                        const files = Array.from((e.target as HTMLInputElement).files || []);
                        for (const file of files) {
                          await processFile(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    Choose Files
                  </Button>
                </div>

                {/* Supported Formats */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">CGM Data</p>
                    <p className="text-xs text-muted-foreground">CSV, JSON, XLSX</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <FileImage className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Reports</p>
                    <p className="text-xs text-muted-foreground">PDF, PNG, JPG</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">Nightscout</p>
                    <p className="text-xs text-muted-foreground">JSON Export</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <FileCode className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">XML Data</p>
                    <p className="text-xs text-muted-foreground">CGM XML Exports</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.size} • {file.uploadDate}
                        </p>
                        
                        {file.status === 'processing' && (
                          <div className="mt-2">
                            <Progress value={65} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">Processing...</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {file.status === 'complete' && (
                          <Badge variant="outline" className="text-xs">
                            {file.insights} insights
                          </Badge>
                        )}
                        {getStatusIcon(file.status)}
                      </div>
                      
                      {file.status === 'complete' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedFile(file);
                              setShowAnalysis(true);
                            }}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            View Analysis
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="text-lg">Your Data Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Files</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Data Points</span>
                  <span className="font-semibold">47,382</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Insights Found</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Upload</span>
                  <span className="font-semibold">2 days ago</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Connect CGM App
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Auto-Upload
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Doctor
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analysis
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="command-center-widget">
              <CardHeader>
                <CardTitle className="text-lg">Upload Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Upload at least 2 weeks of data for meaningful insights</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Include meal logs for better pattern recognition</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span>Regular uploads improve AI accuracy over time</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Rail */}
        <section className="mt-12">
          <InfoRail
            whatThisShows="The data upload hub processes your diabetes management data to identify patterns, trends, and opportunities for optimization. All data is encrypted and processed securely."
            whyItMatters="Comprehensive data analysis can reveal hidden patterns in your glucose management, helping you and your healthcare team make more informed decisions about treatment adjustments."
            nextSteps="Start by uploading your most recent CGM data or pump logs. The AI will automatically identify patterns and provide personalized recommendations within minutes."
          />
        </section>
      </div>

      {/* Analysis Modal */}
      {selectedFile && (
        <AnalysisResultsModal
          open={showAnalysis}
          onOpenChange={setShowAnalysis}
          fileName={selectedFile.name}
          insights={selectedFile.insights}
          readingsCount={selectedFile.readingsCount}
          detailedAnalysis={selectedFile.detailedAnalysis}
          hourlyData={selectedFile.hourlyData}
          dailyData={selectedFile.dailyData}
          agpData={selectedFile.agpData}
          patterns={selectedFile.patterns}
          recommendations={selectedFile.recommendations}
          aiInsights={selectedFile.aiInsights}
          // Enhanced analysis props
          confidenceScore={selectedFile.confidenceScore}
          confidenceBand={selectedFile.confidenceBand}
          validationFlags={selectedFile.validationFlags}
          dataQuality={selectedFile.dataQuality}
          novelSignals={selectedFile.novelSignals}
          executiveSummary={selectedFile.executiveSummary}
          dayNightAnalysis={selectedFile.dayNightAnalysis}
        />
      )}
    </Layout>
  );
};

export default DataUpload;