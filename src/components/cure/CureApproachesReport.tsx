import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cureApproachesReport } from '@/data/cureReportContent';
import {
  FileText,
  BookOpen,
  Clock,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  List,
  X,
  ArrowUp
} from 'lucide-react';

interface CureApproachesReportProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CureApproachesReport: React.FC<CureApproachesReportProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('executive-summary');
  const [readProgress, setReadProgress] = useState(0);
  const [showTOC, setShowTOC] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setReadProgress(Math.min(100, Math.max(0, scrollPercentage)));

    // Update active section based on scroll position
    const sections = cureApproachesReport.sections;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionElement = document.getElementById(`section-${sections[i].id}`);
      if (sectionElement) {
        const rect = sectionElement.getBoundingClientRect();
        if (rect.top <= 200) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatContent = (content: string) => {
    // Convert markdown-like formatting to JSX
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        // Bold heading
        return (
          <h4 key={idx} className="text-lg font-semibold text-foreground mt-6 mb-3">
            {paragraph.replace(/\*\*/g, '')}
          </h4>
        );
      }
      if (paragraph.startsWith('**')) {
        // Paragraph starting with bold
        const parts = paragraph.split('**');
        return (
          <p key={idx} className="text-muted-foreground mb-4 leading-relaxed">
            {parts.map((part, i) => 
              i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      }
      if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
        // List items
        const items = paragraph.split('\n').filter(Boolean);
        const isOrdered = paragraph.startsWith('1.');
        const ListTag = isOrdered ? 'ol' : 'ul';
        return (
          <ListTag key={idx} className={`mb-4 space-y-2 ${isOrdered ? 'list-decimal' : 'list-disc'} list-inside`}>
            {items.map((item, i) => (
              <li key={i} className="text-muted-foreground">
                {item.replace(/^[-\d.]\s*/, '')}
              </li>
            ))}
          </ListTag>
        );
      }
      return (
        <p key={idx} className="text-muted-foreground mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-50">
          <Progress value={readProgress} className="h-1 rounded-none" />
        </div>

        <div className="flex h-full pt-1">
          {/* Table of Contents Sidebar */}
          {showTOC && (
            <div className="w-72 border-r border-border bg-muted/30 flex flex-col">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Contents
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowTOC(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{cureApproachesReport.readingTime}</span>
                  <span>•</span>
                  <span>{cureApproachesReport.wordCount.toLocaleString()} words</span>
                </div>
              </div>
              <ScrollArea className="flex-1 p-2">
                <nav className="space-y-1">
                  {cureApproachesReport.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-xs opacity-60">{index + 1}.</span>
                        <span className="line-clamp-1">{section.title}</span>
                      </span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
              <div className="p-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">
                  Reading Progress: {Math.round(readProgress)}%
                </div>
                <Progress value={readProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <DialogHeader className="p-6 border-b border-border flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-primary/10 text-primary">Comprehensive Report</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated {cureApproachesReport.lastUpdated}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-bold mb-1">
                    {cureApproachesReport.title}
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    {cureApproachesReport.subtitle}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!showTOC && (
                    <Button variant="outline" size="sm" onClick={() => setShowTOC(true)}>
                      <List className="h-4 w-4 mr-2" />
                      TOC
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Scrollable Content */}
            <ScrollArea 
              ref={contentRef}
              className="flex-1" 
              onScroll={handleScroll}
            >
              <div className="p-6 max-w-4xl mx-auto">
                {cureApproachesReport.sections.map((section, index) => (
                  <section
                    key={section.id}
                    id={`section-${section.id}`}
                    className="mb-12 scroll-mt-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {section.title}
                      </h2>
                    </div>
                    <div className="pl-11">
                      {formatContent(section.content)}
                    </div>
                  </section>
                ))}

                {/* References Section */}
                <section className="mb-12 pt-8 border-t border-border">
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Scientific References
                  </h2>
                  <div className="space-y-4">
                    {cureApproachesReport.references.map((ref, index) => (
                      <Card key={ref.key} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-sm text-muted-foreground font-mono">
                              [{index + 1}]
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground mb-1">
                                {ref.authors}
                              </p>
                              <p className="text-sm text-foreground mb-1">
                                "{ref.title}"
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <em>{ref.journal}</em>, {ref.year}
                              </p>
                              {(ref.doi || ref.url) && (
                                <div className="mt-2 flex items-center gap-3 flex-wrap">
                                  {ref.doi && (
                                    <a
                                      href={`https://doi.org/${ref.doi}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      DOI: {ref.doi}
                                    </a>
                                  )}
                                  {ref.pmid && (
                                    <a
                                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      PubMed: {ref.pmid}
                                    </a>
                                  )}
                                  {ref.url && !ref.doi && (
                                    <a
                                      href={ref.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View Source
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <div className="text-center text-sm text-muted-foreground py-8 border-t border-border">
                  <p className="mb-2">
                    This report is for informational purposes only and does not constitute medical advice.
                  </p>
                  <p>
                    Always consult with healthcare professionals regarding treatment decisions.
                  </p>
                </div>
              </div>
            </ScrollArea>

            {/* Scroll to Top Button */}
            {readProgress > 20 && (
              <Button
                size="icon"
                className="absolute bottom-6 right-6 rounded-full shadow-lg"
                onClick={scrollToTop}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
