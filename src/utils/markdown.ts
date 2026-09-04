import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({ breaks: true, gfm: true });

/** Doc page content is markdown written by any workspace member — sanitize before rendering. */
export function renderMarkdown(source: string): string {
  const html = marked.parse(source || '', { async: false }) as string;
  return DOMPurify.sanitize(html);
}
