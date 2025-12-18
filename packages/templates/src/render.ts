import type { TemplateContext } from '@bunkit/core';
import ejs from 'ejs';

/**
 * Render EJS template with context
 */
export async function renderTemplate(template: string, context: TemplateContext): Promise<string> {
  return ejs.render(template, context);
}
