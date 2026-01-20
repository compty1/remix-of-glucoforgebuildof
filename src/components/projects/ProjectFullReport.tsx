import React, { useState, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getProjectReport, ProjectReport, ProjectReportSection } from '@/data/projectReportsContent';
import {
  FileText,
  Clock,
  Calendar,
  Printer,
  ChevronRight,
  ExternalLink,
  List,
  ArrowUp,
  BookOpen,
  AlertCircle
} from 'lucide-react';

interface ProjectFullReportProps {
  projectSlug: string;
  projectTitle: string;
}

export const ProjectFullReport: React.FC<ProjectFullReportProps> = ({
  projectSlug,
  projectTitle
}) => {
  const [activeSection, setActiveSection] = useState<string>('executive-summary');
  const [readProgress, setReadProgress] = useState(0);
  const [showTOC, setShowTOC] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const report = getProjectReport(projectSlug);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollPercentage = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100;
    setReadProgress(Math.min(100, Math.max(0, scrollPercentage)));

    if (report) {
      for (let i = report.sections.length - 1; i >= 0; i--) {
        const sectionElement = document.getElementById(`project-section-${report.sections[i].id}`);
        if (sectionElement) {
          const rect = sectionElement.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(report.sections[i].id);
            break;
          }
        }
      }
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`project-section-${sectionId}`);
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
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h4 key={idx} className="text-lg font-semibold text-foreground mt-6 mb-3">
            {paragraph.replace(/\*\*/g, '')}
          </h4>
        );
      }
      if (paragraph.startsWith('**')) {
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

  if (!report) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Report Coming Soon</h3>
        <p className="text-muted-foreground">
          A comprehensive analysis report for "{projectTitle}" is currently being prepared.
          Check back soon for in-depth research and community insights.
        </p>
      </Card>
    );
  }

  const readingTime = Math.ceil(report.wordCount / 200);

  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="sticky top-0 z-10 bg-background">
        <Progress value={readProgress} className="h-1 rounded-none" />
      </div>

      <div className="flex gap-6 mt-4">
        {/* Table of Contents Sidebar */}
        {showTOC && (
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <Card className="sticky top-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <List className="h-4 w-4" />
                    Contents
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                  <span>•</span>
                  <span>{report.wordCount.toLocaleString()} words</span>
                </div>
                <nav className="space-y-1">
                  {report.sections.map((section, index) => (
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
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">
                    Progress: {Math.round(readProgress)}%
                  </div>
                  <Progress value={readProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-primary/10 text-primary">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Full Analysis Report
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated {report.lastUpdated}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">{projectTitle}</h2>
                  <p className="text-muted-foreground">
                    Comprehensive scientific analysis with community insights
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowTOC(!showTOC)}
                    className="lg:hidden"
                  >
                    <List className="h-4 w-4 mr-2" />
                    {showTOC ? 'Hide' : 'Show'} TOC
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Content */}
          <ScrollArea 
            ref={contentRef}
            className="pr-4" 
            onScroll={handleScroll}
          >
            <div className="space-y-8">
              {report.sections.map((section, index) => (
                <Card
                  key={section.id}
                  id={`project-section-${section.id}`}
                  className="scroll-mt-6"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-foreground">
                        {section.title}
                      </h3>
                    </div>
                    <div className="pl-11">
                      {formatContent(section.content)}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* References Section */}
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Scientific References
                  </h3>
                  <div className="space-y-3">
                    {report.references.map((ref, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <span className="text-sm text-muted-foreground font-mono flex-shrink-0">
                          [{index + 1}]
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground">
                            {ref.citation}
                          </p>
                          {ref.url && (
                            <a
                              href={ref.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Source
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="text-center text-sm text-muted-foreground py-6 px-4 bg-muted/30 rounded-lg">
                <p className="mb-2">
                  <strong>Medical Disclaimer:</strong> This report is for informational purposes only and does not constitute medical advice.
                </p>
                <p>
                  Always consult with qualified healthcare professionals regarding diagnosis and treatment decisions.
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {readProgress > 20 && (
        <Button
          size="icon"
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
