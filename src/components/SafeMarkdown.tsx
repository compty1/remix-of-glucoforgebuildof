/**
 * Phase 13.5: Safe markdown renderer with XSS prevention via rehype-sanitize
 * Use this component wherever user-generated or AI-generated markdown is rendered.
 */
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

interface SafeMarkdownProps {
  children: string;
  className?: string;
}

export function SafeMarkdown({ children, className }: SafeMarkdownProps) {
  return (
    <div className={className || "prose prose-sm dark:prose-invert max-w-none"}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
