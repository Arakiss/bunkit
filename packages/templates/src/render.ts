import ejs from 'ejs';
import type { TemplateContext } from '@bunkit/core';

/**
 * Render EJS template with context
 */
export async function renderTemplate(
  template: string,
  context: TemplateContext
): Promise<string> {
  return ejs.render(template, context);
}
