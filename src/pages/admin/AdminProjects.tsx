import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  FileText, Clock, CheckCircle, XCircle, BookOpen, 
  Eye, Check, X, RefreshCw, ExternalLink, Send
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePageMeta } from '@/hooks/usePageMeta';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

interface ProjectSubmission {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  personal_experience: string | null;
  suggested_solutions: string | null;
  supporting_links: string[] | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export default function AdminProjects() {
  usePageMeta('Admin - Projects', 'GlucoForge admin panel.');
  const [submissions, setSubmissions] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<ProjectSubmission | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user } = useAuthStore();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      toast.error('Failed to fetch project submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getStatusCounts = () => {
    return {
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      published: submissions.filter(s => s.status === 'published').length,
    };
  };

  const counts = getStatusCounts();

  const filteredSubmissions = submissions.filter(s => s.status === activeTab);

  const handleOpenReview = (submission: ProjectSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.admin_notes || '');
    setReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission || !user) return;
    
    try {
      setActionLoading('approve');
      const { error } = await supabase
        .from('project_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;
      
      toast.success('Submission approved successfully');
      setReviewModalOpen(false);
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to approve submission');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !user) return;
    
    if (!adminNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading('reject');
      const { error } = await supabase
        .from('project_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;
      
      toast.success('Submission rejected');
      setReviewModalOpen(false);
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to reject submission');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async () => {
    if (!selectedSubmission || !user) return;

    try {
      setActionLoading('publish');
      
      // Create slug from title
      const slug = selectedSubmission.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Create new project from submission
      const { error: projectError } = await supabase
        .from('diabetic_health_projects')
        .insert({
          title: selectedSubmission.title,
          description: selectedSubmission.description,
          slug: slug,
          category: 'User Contributed',
          status: 'published',
          community_insights_summary: selectedSubmission.suggested_solutions,
          featured: false
        });

      if (projectError) throw projectError;

      // Update submission status
      const { error: updateError } = await supabase
        .from('project_submissions')
        .update({
          status: 'published',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: adminNotes
        })
        .eq('id', selectedSubmission.id);

      if (updateError) throw updateError;
      
      toast.success('Project published successfully!');
      setReviewModalOpen(false);
      fetchSubmissions();
    } catch (error) {
      toast.error('Failed to publish project');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'published':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30"><BookOpen className="h-3 w-3 mr-1" /> Published</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-heading font-bold text-foreground">
              Project Submissions Review
            </h1>
            <Button variant="outline" size="sm" onClick={fetchSubmissions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.approved}</p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{counts.published}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({counts.pending})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved ({counts.approved})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected ({counts.rejected})
              </TabsTrigger>
              <TabsTrigger value="published" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Published ({counts.published})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">{activeTab} Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No {activeTab} submissions found
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{submission.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {submission.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(submission.status)}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenReview(submission)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Review the project submission and take action
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                <p className="text-lg font-semibold">{selectedSubmission.title}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.description}</p>
              </div>

              {selectedSubmission.personal_experience && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Personal Experience</Label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.personal_experience}</p>
                </div>
              )}

              {selectedSubmission.suggested_solutions && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Suggested Solutions</Label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedSubmission.suggested_solutions}</p>
                </div>
              )}

              {selectedSubmission.supporting_links && selectedSubmission.supporting_links.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Supporting Links</Label>
                  <ul className="space-y-1">
                    {selectedSubmission.supporting_links.map((link, index) => (
                      <li key={index}>
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
              </div>

              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this submission (required for rejection)..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedSubmission?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'reject' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  variant="default"
                  onClick={handleApprove}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'approve' ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </>
            )}
            {selectedSubmission?.status === 'approved' && (
              <Button
                onClick={handlePublish}
                disabled={actionLoading !== null}
                className="bg-primary"
              >
                {actionLoading === 'publish' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Publish as Project
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
