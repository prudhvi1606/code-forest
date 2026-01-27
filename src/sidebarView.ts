import * as vscode from 'vscode';
import { getTimeOfDay } from './time';

export class CodeForestSidebarView
  implements vscode.WebviewViewProvider {

  public static readonly viewType = 'codeForest.sidebar';
  private view?: vscode.WebviewView;

  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView) {
    this.view = view;

    view.webview.options = {
      enableScripts: true
    };

    view.webview.onDidReceiveMessage(message => {
      if (message.command === 'openForest') {
        vscode.commands.executeCommand('codeForest.openForest');
      }
    });

    this.update(0, 'sapling', 0);
  }

  update(minutes: number, stage: string, progress: number) {
    if (!this.view) return;

    const timeOfDay = getTimeOfDay();
    const isNight = timeOfDay === 'night';
    const isRain = minutes >= 30 && !isNight;
    const isSnow = isNight;

    const background =
      isNight
        ? 'linear-gradient(#020617, #020617)'
        : 'linear-gradient(#e8f5e9, #c8e6c9)';

    const textColor = isNight ? '#e5e7eb' : '#1b5e20';
    const circumference = 2 * Math.PI * 52;

    this.view.webview.html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
  body {
    margin:0;
    padding:10px;
    font-family:sans-serif;
    background:${background};
    color:${textColor};
    transition: background 1s ease;
    overflow:hidden;
  }

  .header {
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:8px;
  }

  .header h3 {
    margin:0;
    font-weight:600;
  }

  button {
    background:none;
    border:none;
    cursor:pointer;
    font-size:18px;
  }

  .ring {
    position:relative;
    width:120px;
    height:120px;
    margin:14px auto;
  }

  .emoji {
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%, -50%);
    font-size:42px;
    animation: wind 4s ease-in-out infinite;
  }

  @keyframes wind {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    50% { transform: translate(-50%, -50%) rotate(1deg); }
    100% { transform: translate(-50%, -50%) rotate(0deg); }
  }

  .rain, .snow {
    position:absolute;
    top:0;
    left:0;
    width:100%;
    height:100%;
    pointer-events:none;
  }

  .drop {
    position:absolute;
    width:2px;
    height:12px;
    background:#60a5fa;
    opacity:0.6;
    animation: rain 1s linear infinite;
  }

  @keyframes rain {
    to { transform: translateY(120px); }
  }

  .flake {
    position:absolute;
    font-size:10px;
    opacity:0.7;
    animation: snow 4s linear infinite;
  }

  @keyframes snow {
    to { transform: translateY(120px); }
  }

</style>
</head>

<body>

  <div class="header">
    <h3>🌲 Code Forest</h3>
    <button id="home" title="Open Forest">🏠</button>
  </div>

  <div class="ring">
    <svg width="120" height="120">
      <circle cx="60" cy="60" r="52"
        stroke="#cbd5e1" stroke-width="8" fill="none" />
      <circle cx="60" cy="60" r="52"
        stroke="#22c55e" stroke-width="8" fill="none"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${circumference - (progress / 100) * circumference}"
        stroke-linecap="round"
        transform="rotate(-90 60 60)" />
    </svg>

    <div class="emoji">${this.getEmoji(stage)}</div>
  </div>

  <p style="margin:6px 0">${minutes} minutes</p>
  <p style="opacity:0.7">${stage}</p>

  ${isRain ? this.renderRain() : ''}
  ${isSnow ? this.renderSnow() : ''}

<script>
  const vscode = acquireVsCodeApi();
  document.getElementById('home').onclick = () => {
    vscode.postMessage({ command: 'openForest' });
  };
</script>

</body>
</html>
`;
  }

  private renderRain(): string {
    return `
<div class="rain">
  ${Array.from({ length: 20 }).map(() =>
    `<div class="drop"
      style="
        left:${Math.random() * 100}%;
        animation-delay:${Math.random()}s;
      "></div>`
  ).join('')}
</div>`;
  }

  private renderSnow(): string {
    return `
<div class="snow">
  ${Array.from({ length: 15 }).map(() =>
    `<div class="flake"
      style="
        left:${Math.random() * 100}%;
        animation-delay:${Math.random() * 3}s;
      ">❄</div>`
  ).join('')}
</div>`;
  }

  private getEmoji(stage: string): string {
    switch (stage) {
      case 'sapling': return '🌱';
      case 'small': return '🌿';
      case 'medium': return '🌳';
      case 'big': return '🌲';
      default: return '🌱';
    }
  }
}
