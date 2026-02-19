import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, BarChart3, CheckCircle, AlertCircle, Clock, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  uploadedAt: Date;
  insights?: string[];
}

export default function GlucoseUpload() {
  const { user } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !user) {
      toast.error('Please log in to upload files');
      return;
    }

    setIsUploading(true);
    const acceptedFiles = Array.from(files);

    for (const file of acceptedFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date()
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      try {
        // Read file content
        const fileContent = await file.text();

        // Create upload record
        const { data: uploadRecord, error: insertError } = await supabase
          .from('uploads')
          .insert({
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            user_id: user.id
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update UI to processing
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId
            ? { ...f, status: 'processing', progress: 50 }
            : f
        ));

        // Call analyze-glucose Edge Function
        const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('analyze-glucose', {
          body: {
            filename: file.name,
            fileContent,
            uploadId: uploadRecord.id
          }
        });

        if (analysisError) throw analysisError;

        const insights = analysisResult?.insights || ['Analysis completed'];
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId
            ? { 
                ...f, 
                status: 'completed', 
                progress: 100,
                insights 
              }
            : f
        ));

        toast.success(`${file.name} analyzed successfully - ${analysisResult?.readingsCount || 0} readings processed`);
      } catch (err) {
        
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId
            ? { ...f, status: 'error', progress: 100 }
            : f
        ));
        
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze file';
        toast.error(`${file.name}: ${errorMessage}`);
      }
    }

    setIsUploading(false);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'processing':
        return <BarChart3 className="h-5 w-5 text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      case 'processing':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-foreground mb-6">
            Glucose Data Upload
          </h1>
          <p className="text-muted-foreground mb-8">
            Upload your CGM data, pump logs, or glucose meter readings for personalized analysis and insights.
          </p>

          {/* Upload Area */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">
                  Upload your glucose data files
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports CSV, JSON, PDF, and TXT files up to 50MB each
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".csv,.json,.pdf,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Choose Files'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Supported Data Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Dexcom CGM</p>
                    <p className="text-sm text-muted-foreground">CSV exports from Clarity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">FreeStyle Libre</p>
                    <p className="text-sm text-muted-foreground">CSV from LibreView</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Insulin Pumps</p>
                    <p className="text-sm text-muted-foreground">Medtronic, Omnipod logs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Glucose Meters</p>
                    <p className="text-sm text-muted-foreground">Manual logs, CSV exports</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Uploads */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(file.status)}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(file.status)}>
                            {file.status}
                          </Badge>
                          {file.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Export Report
                            </Button>
                          )}
                        </div>
                      </div>

                      {file.status === 'uploading' && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Uploading...</span>
                            <span>{file.progress}%</span>
                          </div>
                          <Progress value={file.progress} className="h-2" />
                        </div>
                      )}

                      {file.status === 'completed' && file.insights && (
                        <div className="mt-3 p-3 bg-success/5 rounded-lg border border-success/20">
                          <h4 className="font-medium text-success mb-2">Analysis Complete</h4>
                          <ul className="space-y-1">
                            {file.insights.map((insight, index) => (
                              <li key={index} className="text-sm text-success/80 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {file.status === 'error' && (
                        <div className="mt-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <p className="text-sm text-destructive">
                            Upload failed. Please check the file format and try again.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <strong>Privacy:</strong> All uploaded data is encrypted and only visible to you. 
                  We use de-identified, aggregated data for research purposes only.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>File Issues:</strong> If your upload fails, ensure the file is in a supported format 
                  and under 50MB. Contact support if you continue having issues.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Data Retention:</strong> Uploaded files are stored securely for 365 days. 
                  You can delete your data at any time from your account settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}