import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, Send, Droplet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface Statement {
  id: string;
  statement: string;
  created_at: string;
  is_anonymous: boolean;
}

export function StatementJar() {
  const [statements, setStatements] = useState<Statement[]>([]);
  const [newStatement, setNewStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStatements();
  }, []);

  const fetchStatements = async () => {
    const { data, error } = await supabase
      .from('community_statements')
      .select('id, statement, created_at, is_anonymous')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setStatements(data);
    }
  };

  const handleSubmit = async () => {
    if (!newStatement.trim()) {
      toast.error('Please enter your statement');
      return;
    }

    if (newStatement.length > 280) {
      toast.error('Statement must be under 280 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_statements')
        .insert({
          statement: newStatement.trim(),
          user_id: user?.id || null,
          is_anonymous: !user,
          is_approved: true // Auto-approve for now
        });

      if (error) throw error;

      toast.success('Your feeling has been added to the jar!');
      setNewStatement('');
      fetchStatements();
    } catch (error) {
      console.error('Error submitting statement:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
            How Are You Feeling Today?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share how T1D is affecting you today. Your words join others in our community jar—a collection of real feelings from real warriors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Submit Form */}
          <Card className="command-center-widget">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Share Your Feeling
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Today, my T1D makes me feel..."
                value={newStatement}
                onChange={(e) => setNewStatement(e.target.value)}
                maxLength={280}
                className="min-h-[100px] resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {newStatement.length}/280 characters
                </span>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !newStatement.trim()}
                  className="accent-gradient"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Adding...' : 'Drop into Jar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* The Jar */}
          <div className="relative">
            <div className="bg-gradient-to-b from-primary/5 to-primary/20 rounded-3xl border-4 border-primary/30 p-6 min-h-[350px] relative overflow-hidden">
              {/* Jar neck */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-primary/20 rounded-t-xl border-x-4 border-t-4 border-primary/30"></div>
              
              {/* Blood drops / statements */}
              <div className="flex flex-wrap gap-3 justify-center pt-4">
                {statements.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Droplet className="h-12 w-12 mx-auto mb-4 text-primary/40" />
                    <p>Be the first to share how you're feeling today</p>
                  </div>
                ) : (
                  statements.map((statement, index) => (
                    <button
                      key={statement.id}
                      onClick={() => setSelectedStatement(statement)}
                      className="group relative"
                      style={{
                        animation: `float ${3 + (index % 3)}s ease-in-out infinite`,
                        animationDelay: `${index * 0.2}s`
                      }}
                    >
                      <div className="w-12 h-14 relative cursor-pointer transition-transform hover:scale-110">
                        {/* Blood drop shape */}
                        <svg viewBox="0 0 40 50" className="w-full h-full">
                          <defs>
                            <linearGradient id={`dropGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M20 0 C20 0 0 25 0 35 C0 45 9 50 20 50 C31 50 40 45 40 35 C40 25 20 0 20 0"
                            fill={`url(#dropGradient-${index})`}
                            className="drop-shadow-lg"
                          />
                          {/* Shine effect */}
                          <ellipse cx="12" cy="30" rx="4" ry="6" fill="white" opacity="0.3" />
                        </svg>
                        
                        {/* Hover tooltip preview */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded-lg p-2 shadow-lg w-48 z-10 pointer-events-none">
                          <p className="text-xs line-clamp-3">{statement.statement}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Liquid effect at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-primary/30 to-transparent rounded-b-2xl"></div>
            </div>

            {/* Label */}
            <div className="text-center mt-4">
              <Badge variant="secondary" className="text-sm">
                {statements.length} feelings shared
              </Badge>
            </div>
          </div>
        </div>

        {/* Statement Detail Modal */}
        <Dialog open={!!selectedStatement} onOpenChange={() => setSelectedStatement(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Droplet className="h-5 w-5 text-primary" />
                A Warrior's Feeling
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-lg leading-relaxed">{selectedStatement?.statement}</p>
              <p className="text-sm text-muted-foreground mt-4">
                Shared {selectedStatement?.created_at && new Date(selectedStatement.created_at).toLocaleDateString()}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
      `}</style>
    </section>
  );
}
