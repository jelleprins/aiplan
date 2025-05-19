const fs = require('fs');
const path = require('path');

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = null; // 'ol' or 'ul'
  for (let line of lines) {
    if (line.startsWith('### ')) {
      if (inList) { html += `</${inList}>\n`; inList = null; }
      html += `<h3>${line.slice(4)}</h3>\n`;
    } else if (line.startsWith('## ')) {
      if (inList) { html += `</${inList}>\n`; inList = null; }
      html += `<h2>${line.slice(3)}</h2>\n`;
    } else if (/^\d+\. /.test(line)) {
      if (inList !== 'ol') {
        if (inList) html += `</${inList}>\n`;
        html += '<ol>\n';
        inList = 'ol';
      }
      const item = line.replace(/^\d+\.\s*/, '');
      html += `<li>${item}</li>\n`;
    } else if (line.startsWith('- ')) {
      if (inList !== 'ul') {
        if (inList) html += `</${inList}>\n`;
        html += '<ul>\n';
        inList = 'ul';
      }
      html += `<li>${line.slice(2)}</li>\n`;
    } else if (line.trim() === '') {
      if (inList) { html += `</${inList}>\n`; inList = null; }
      html += '\n';
    } else {
      if (inList) { html += `</${inList}>\n`; inList = null; }
      line = line.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
      html += `<p>${line}</p>\n`;
    }
  }
  if (inList) html += `</${inList}>\n`;
  return html;
}

function buildFile(mdPath) {
  const md = fs.readFileSync(mdPath, 'utf8');
  const lines = md.split(/\r?\n/);
  const titleLine = lines[0] || '';
  const title = titleLine.replace(/^#\s*/, '').trim();
  const bodyMd = lines.slice(1).join('\n');
  const bodyHtml = mdToHtml(bodyMd);
  const html = [
    '<!DOCTYPE html>',
    '<html lang="nl">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${title}</title>`,
    '  <link rel="stylesheet" href="styles.css">',
    '</head>',
    '<body>',
    '  <div class="container">',
    '    <header>',
    `      <h1>${title}</h1>`,
    '    </header>',
    bodyHtml,
    '    <footer>',
    '      <p>Nederland klaarmaken voor komst Superintelligentie – Een Deltaplan voor de AI Transitie</p>',
    '      <div class="github-box">',
    '        Schrijf mee aan het AI Plan via <a href="https://github.com/jelleprins/aiplan" target="_blank">GitHub</a>.',
    '      </div>',
    '    </footer>',
    '  </div>',
    '</body>',
    '</html>'
  ].join('\n');

  const outName = path.basename(mdPath, '.md') + '.html';
  fs.writeFileSync(outName, html, 'utf8');
  console.log(`Generated ${outName}`);
}

function buildAll() {
  const contentDir = path.join(__dirname, 'content');
  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'));
  files.forEach(f => buildFile(path.join(contentDir, f)));
}

buildAll();
