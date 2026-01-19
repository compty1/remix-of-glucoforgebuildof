import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Send } from 'lucide-react';
import { useProjectSubmission } from '@/hooks/useProjects';

interface ProjectSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectSubmissionModal: React.FC<ProjectSubmissionModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { submitProject } = useProjectSubmission();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    personal_experience: '',
    suggested_solutions: '',
  });
  const [supportingLinks, setSupportingLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAddLink = () => {
    if (newLink.trim() && !supportingLinks.includes(newLink.trim())) {
      setSupportingLinks([...supportingLinks, newLink.trim()]);
      setNewLink('');
    }
  };

  const handleRemoveLink = (link: string) => {
    setSupportingLinks(supportingLinks.filter(l => l !== link));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;

    await submitProject.mutateAsync({
      ...formData,
      supporting_links: supportingLinks,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      personal_experience: '',
      suggested_solutions: '',
    });
    setSupportingLinks([]);
    setTermsAccepted(false);
    onOpenChange(false);
  };

  const isValid = formData.title.trim() && formData.description.trim() && termsAccepted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit a Research Project</DialogTitle>
          <DialogDescription>
            Have you discovered an issue that affects diabetics but doctors don't have answers for? 
            Submit it here for review and potential publication on our platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Nausea in Type 1 Diabetes"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Issue Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. What symptoms do people experience? When does it occur? How common is it?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_experience">Your Personal Experience</Label>
            <Textarea
              id="personal_experience"
              placeholder="Share your own experience with this issue (optional but helpful)"
              value={formData.personal_experience}
              onChange={(e) => setFormData({ ...formData, personal_experience: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggested_solutions">Solutions You've Found</Label>
            <Textarea
              id="suggested_solutions"
              placeholder="Have you found any solutions that work for you? Share them here (optional)"
              value={formData.suggested_solutions}
              onChange={(e) => setFormData({ ...formData, suggested_solutions: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Supporting Links & References</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLink())}
              />
              <Button type="button" variant="outline" onClick={handleAddLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {supportingLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {supportingLinks.map((link, index) => (
                  <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                    <span className="truncate max-w-[200px]">{link}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I understand that my submission will be reviewed by our team before publication. 
              I confirm that the information provided is accurate to the best of my knowledge 
              and does not constitute medical advice.
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isValid || submitProject.isPending}
            >
              {submitProject.isPending ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Review
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSubmissionModal;
