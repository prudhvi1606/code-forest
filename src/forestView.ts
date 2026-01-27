import * as vscode from 'vscode';
import { Tree } from './forest';

export function openForestView(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'codeForest.forest',
    '🌲 Code Forest',
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  const trees =
    context.globalState.get<Tree[]>('codeForest.trees', []);

  panel.webview.html = getForestHtml(trees);
}

function getForestHtml(trees: Tree[]): string {
  if (trees.length === 0) {
    return `<h2 style="text-align:center">No trees yet 🌱</h2>`;
  }

  return `
    <html>
      <body style="font-family:sans-serif;text-align:center">
        <h2>🌲 Your Forest</h2>
        <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center">
          ${trees.map(tree => `
            <div style="border:1px solid #ccc;padding:10px;width:120px">
              <div style="font-size:32px">${emoji(tree.stage)}</div>
              <div>${tree.minutes} min</div>
              <div>${tree.date}</div>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;
}

function emoji(stage: string): string {
  switch (stage) {
    case 'sapling': return '🌱';
    case 'small': return '🌿';
    case 'medium': return '🌳';
    case 'big': return '🌲';
    default: return '🌱';
  }
}
