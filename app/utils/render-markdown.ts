/**
 * Strip markdown symbols for plain-text output (PDF, etc.)
 */
export function stripMarkdown(content: string): string {
  if (!content) return ''
  return content
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^- /gm, '• ')
    .trim()
}

/**
 * Simple markdown to HTML converter for CV content.
 * Handles headers, bold, italic, links, bullet points, and line breaks.
 */
export function renderMarkdown(content: string): string {
  if (!content) return ''

  return content
    // Headers (convert to bold)
    .replace(/^### (.+)$/gm, '<strong>$1</strong>')
    .replace(/^## (.+)$/gm, '<strong class="text-sm uppercase tracking-wide">$1</strong>')
    .replace(/^# (.+)$/gm, '<strong class="text-base">$1</strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
    // Bullet points
    .replace(/^- (.+)$/gm, '• $1')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, '<br>')
}
