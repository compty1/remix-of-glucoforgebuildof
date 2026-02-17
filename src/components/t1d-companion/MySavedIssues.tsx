import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/authStore';
import { useSavedIssues, SavedIssue } from '@/hooks/useSavedIssues';
import { 
  Bookmark, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MySavedIssuesProps {
  onChatWithIssue: (issue: SavedIssue) => void;
}

export function MySavedIssues({ onChatWithIssue }: MySavedIssuesProps) {
  const { user } = useAuthStore();
  const { issues, isLoading, updateIssue, deleteIssue } = useSavedIssues();
  const [selectedIssue, setSelectedIssue] = useState<SavedIssue | null>(null);
  const [deleteConfirmIssue, setDeleteConfirmIssue] = useState<SavedIssue | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'ongoing':
        return <RefreshCw className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      ongoing: 'secondary',
      resolved: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    await updateIssue.mutateAsync({
      id: issueId,
      data: { status: newStatus as 'active' | 'resolved' | 'ongoing' },
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirmIssue) return;
    await deleteIssue.mutateAsync(deleteConfirmIssue.id);
    setDeleteConfirmIssue(null);
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-medium mb-2">Sign In Required</h3>
        <p className="text-sm text-muted-foreground">
          Please sign in to save and track your diabetes challenges.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-medium mb-2">No Saved Issues</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start a chat and save issues you want to track and find solutions for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">My Saved Issues</h2>
          <p className="text-sm text-muted-foreground">
            Track your diabetes challenges and solutions
          </p>
        </div>
        <Badge variant="secondary">{issues.length} issues</Badge>
      </div>

      <div className="space-y-4">
        {issues.map(issue => (
          <Card key={issue.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(issue.status)}
                  <CardTitle className="text-base">{issue.title}</CardTitle>
                </div>
                {getStatusBadge(issue.status)}
              </div>
              {issue.description && (
                <CardDescription className="line-clamp-2">
                  {issue.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {issue.ai_summary && (
                <div className="bg-muted/50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">📋 AI Summary:</strong>{' '}
                    {issue.ai_summary}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {issue.category && (
                    <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                  )}
                  <span>Updated {format(new Date(issue.updated_at), 'MMM d, yyyy')}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onChatWithIssue(issue)}
                    className="gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Continue Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issue Detail Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedIssue && getStatusIcon(selectedIssue.status)}
              {selectedIssue?.title}
            </DialogTitle>
            <DialogDescription>
              Created {selectedIssue && format(new Date(selectedIssue.created_at), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4 py-4">
              {selectedIssue.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedIssue.description}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedIssue.status}
                  onValueChange={(value) => handleStatusChange(selectedIssue.id, value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedIssue.ai_summary && (
                <div>
                  <label className="text-sm font-medium">AI Summary</label>
                  <div className="bg-muted/50 rounded-lg p-3 mt-1">
                    <p className="text-sm">{selectedIssue.ai_summary}</p>
                  </div>
                </div>
              )}

              {selectedIssue.solutions_found && selectedIssue.solutions_found.length > 0 && (
                <div>
                  <label className="text-sm font-medium">
                    Solutions Found ({selectedIssue.solutions_found.length})
                  </label>
                  <div className="space-y-2 mt-2">
                    {selectedIssue.solutions_found.map((solution: any, i: number) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-3 text-sm">
                        {typeof solution === 'string' ? solution : JSON.stringify(solution)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setDeleteConfirmIssue(selectedIssue);
                setSelectedIssue(null);
              }}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              onClick={() => {
                if (selectedIssue) {
                  onChatWithIssue(selectedIssue);
                  setSelectedIssue(null);
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Continue Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmIssue} onOpenChange={() => setDeleteConfirmIssue(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmIssue?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
