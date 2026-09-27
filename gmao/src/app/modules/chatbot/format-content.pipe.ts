// format-content.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'formatContent', standalone: true })
export class FormatContentPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    const html = this.renderMarkdown(value);
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private renderMarkdown(text: string): string {
    // 1. Échapper le HTML sauf les balises qu'on va générer
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 2. Tableaux markdown  |col|col|
    html = this.parseTable(html);

    // 3. Titres
    html = html
      .replace(/^### (.+)$/gm, '<h3 style="margin:6px 0 3px;font-size:12.5px;font-weight:600;color:#1e2a3a">$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2 style="margin:8px 0 4px;font-size:13px;font-weight:700;color:#ffa770">$1</h2>')
      .replace(/^# (.+)$/gm,   '<h2 style="margin:8px 0 4px;font-size:14px;font-weight:700;color:#ffa770">$1</h2>');

    // 4. Gras et italique
    html = html
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>');

    // 5. Code inline `code`
    html = html.replace(/`([^`]+)`/g,
      '<code style="background:#f0f1f3;border-radius:4px;padding:1px 5px;font-size:11.5px;font-family:\'DM Mono\',monospace;color:#95969e">$1</code>'
    );

    // 6. Listes
    html = this.parseLists(html);

    // 7. Sauts de ligne (après les blocs)
    html = html.replace(/\n/g, '<br>');

    // 8. Nettoyer les <br> redondants autour des blocs
    html = html
      .replace(/(<br>){2,}/g, '<br>')
      .replace(/<br>(<\/?(h[123]|table|ul|ol|li|tr|th|td)[^>]*>)/g, '$1')
      .replace(/(<\/?(h[123]|table|ul|ol|li|tr|th|td)[^>]*>)<br>/g, '$1');

    return html;
  }

  private parseTable(text: string): string {
    // Détecter les blocs de tableau markdown
    const lines = text.split('\n');
    const result: string[] = [];
    let inTable = false;
    let headerParsed = false;
    let tableRows: string[] = [];

    const renderRow = (line: string, isHeader: boolean): string => {
      const cells = line.split('|').filter((_, i, a) => i > 0 && i < a.length - 1);
      const tag   = isHeader ? 'th' : 'td';
      const style = isHeader
        ? 'style="background:#f0f1f3;font-weight:600;color:#95969e;padding:5px 9px;border:1px solid #e2e4ea;font-size:11.5px"'
        : 'style="padding:5px 9px;border:1px solid #e2e4ea;font-size:11.5px"';
      return '<tr>' + cells.map(c => `<${tag} ${style}>${c.trim()}</${tag}>`).join('') + '</tr>';
    };

    const isSeparator = (line: string): boolean =>
      /^\|[\s|:-]+\|$/.test(line.trim());

    const isTableLine = (line: string): boolean =>
      line.trim().startsWith('|') && line.trim().endsWith('|');

    for (const line of lines) {
      if (isTableLine(line)) {
        if (!inTable) {
          inTable       = true;
          headerParsed  = false;
          tableRows     = [];
        }
        if (isSeparator(line)) {
          headerParsed = true;
          continue;
        }
        tableRows.push(renderRow(line, !headerParsed));
      } else {
        if (inTable && tableRows.length > 0) {
          result.push(
            `<table style="width:100%;border-collapse:collapse;margin:6px 0">${tableRows.join('')}</table>`
          );
          tableRows = [];
          inTable   = false;
        }
        result.push(line);
      }
    }

    if (inTable && tableRows.length > 0) {
      result.push(
        `<table style="width:100%;border-collapse:collapse;margin:6px 0">${tableRows.join('')}</table>`
      );
    }

    return result.join('\n');
  }

  private parseLists(text: string): string {
    const lines  = text.split('\n');
    const result: string[] = [];
    let inList   = false;
    let listItems: string[] = [];

    for (const line of lines) {
      const match = line.match(/^(\*|-|\d+\.) (.+)$/);
      if (match) {
        if (!inList) { inList = true; listItems = []; }
        listItems.push(`<li style="margin-bottom:3px;font-size:13px">${match[2]}</li>`);
      } else {
        if (inList) {
          result.push(`<ul style="margin:4px 0;padding-left:18px">${listItems.join('')}</ul>`);
          inList    = false;
          listItems = [];
        }
        result.push(line);
      }
    }

    if (inList) {
      result.push(`<ul style="margin:4px 0;padding-left:18px">${listItems.join('')}</ul>`);
    }

    return result.join('\n');
  }
}