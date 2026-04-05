import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface Paper {
  title: string;
  authors?: string[];
  journal_name?: string;
  publication_date?: string;
  doi?: string;
  paper_id?: string;
}

function toBibTeX(papers: Paper[]): string {
  return papers.map((p, i) => {
    const key = p.doi?.replace(/[^a-zA-Z0-9]/g, '') || `paper${i + 1}`;
    const author = p.authors?.join(' and ') || 'Unknown';
    const year = p.publication_date?.slice(0, 4) || 'n.d.';
    return `@article{${key},
  title = {${p.title}},
  author = {${author}},
  journal = {${p.journal_name || ''}},
  year = {${year}},
  doi = {${p.doi || ''}}
}`;
  }).join('\n\n');
}

function toRIS(papers: Paper[]): string {
  return papers.map(p => {
    const lines = ['TY  - JOUR', `TI  - ${p.title}`];
    p.authors?.forEach(a => lines.push(`AU  - ${a}`));
    if (p.journal_name) lines.push(`JO  - ${p.journal_name}`);
    if (p.publication_date) lines.push(`PY  - ${p.publication_date.slice(0, 4)}`);
    if (p.doi) lines.push(`DO  - ${p.doi}`);
    lines.push('ER  -');
    return lines.join('\n');
  }).join('\n\n');
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function CitationExportButtons({ papers }: { papers: Paper[] }) {
  if (!papers.length) return null;

  const handleBibTeX = () => {
    downloadFile(toBibTeX(papers), 'citations.bib', 'application/x-bibtex');
    toast.success(`Exported ${papers.length} citations as BibTeX`);
  };

  const handleRIS = () => {
    downloadFile(toRIS(papers), 'citations.ris', 'application/x-research-info-systems');
    toast.success(`Exported ${papers.length} citations as RIS`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleBibTeX}>
        <Download className="h-4 w-4 mr-1" />
        BibTeX
      </Button>
      <Button variant="outline" size="sm" onClick={handleRIS}>
        <Download className="h-4 w-4 mr-1" />
        RIS
      </Button>
    </div>
  );
}
