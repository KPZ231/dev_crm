/**
 * A very simple Markdown to HTML parser for local use
 * when dedicated libraries like 'marked' are not available or allowed.
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown) return "";

  let html = markdown;

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 2rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; color: black; border-bottom: 2px solid #a78bfa; padding-bottom: 0.5rem;">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>');
  html = html.replace(/__(.*)__/gm, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*)\*/gm, '<em>$1</em>');
  html = html.replace(/_(.*)_/gm, '<em>$1</em>');

  // Lists
  html = html.replace(/^\s*[\-\*]\s+(.*)$/gim, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>');
  
  // Wrap li in ul
  // This is a bit tricky with simple regex, but let's try a basic approach
  // We'll replace groups of <li> with <ul><li>...</li></ul>
  html = html.replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul>$1</ul>');

  // Paragraphs
  // Split by double newline, wrap in <p> if not already wrapped in a block element
  const blocks = html.split(/\n\n+/);
  html = blocks.map(block => {
    if (block.trim().startsWith('<h') || block.trim().startsWith('<ul') || block.trim().startsWith('<li')) {
      return block;
    }
    return `<p style="margin-bottom: 1rem; line-height: 1.6; color: #374151;">${block.replace(/\n/g, '<br />')}</p>`;
  }).join('\n');

  return html;
}
