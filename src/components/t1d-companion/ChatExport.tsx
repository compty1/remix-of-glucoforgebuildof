import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Copy, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatExportProps {
  messages: ChatMessage[];
  contextTitle?: string;
}

export function ChatExport({ messages, contextTitle }: ChatExportProps) {
  // Phase 12.8: PHI warning on chat export
  const PHI_WARNING = `⚠️ IMPORTANT: This export may contain Protected Health Information (PHI).
Store securely and share only with your healthcare team. Do not post publicly.\n\n`;

  const formatForExport = () => {
    const header = PHI_WARNING + `T1D Companion Chat Export
${contextTitle ? `Topic: ${contextTitle}` : ''}
Date: ${new Date().toLocaleDateString()}
---

`;
    
    const content = messages.map(m => {
      const time = new Date(m.timestamp).toLocaleTimeString();
      const role = m.role === 'user' ? 'You' : 'T1D Companion';
      return `[${time}] ${role}:\n${m.content}\n`;
    }).join('\n');

    return header + content;
  };

  const formatAsMarkdown = () => {
    const header = `> ⚠️ **IMPORTANT:** This export may contain Protected Health Information (PHI). Store securely and share only with your healthcare team.

# T1D Companion Chat Export

${contextTitle ? `**Topic:** ${contextTitle}` : ''}
**Date:** ${new Date().toLocaleDateString()}

---

`;
    
    const content = messages.map(m => {
      const time = new Date(m.timestamp).toLocaleTimeString();
      const role = m.role === 'user' ? '**You**' : '**T1D Companion**';
      return `### ${role} (${time})\n\n${m.content}\n`;
    }).join('\n---\n\n');

    return header + content;
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatForExport());
      toast.success('Chat copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownloadText = () => {
    const content = formatForExport();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `t1d-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chat exported as text file');
  };

  const handleDownloadMarkdown = () => {
    const content = formatAsMarkdown();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `t1d-chat-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chat exported as markdown file');
  };

  const handlePrint = () => {
    const content = formatForExport();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>T1D Companion Chat</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (messages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          Copy to Clipboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadText}>
          <FileText className="h-4 w-4 mr-2" />
          Download as Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Download as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print / Share with Doctor
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
