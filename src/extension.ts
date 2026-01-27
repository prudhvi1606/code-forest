import * as vscode from 'vscode';
import { CodeForestSidebarView } from './sidebarView';
import { getTreeStage, getProgressPercent } from './session';
import { Tree } from './forest';
import { openForestView } from './forestView';

let sessionStartTime: number | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let lastMinutes = 0;

export function activate(context: vscode.ExtensionContext) {
  console.log('🌲 Code Forest activated');

  // Register sidebar (Today’s Tree)
  const sidebarProvider = new CodeForestSidebarView(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CodeForestSidebarView.viewType,
      sidebarProvider
    )
  );

  // Register Forest (Home) view command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'codeForest.openForest',
      () => openForestView(context)
    )
  );

  // Start session automatically
  startSession(sidebarProvider);

  // Save tree when VS Code closes or extension deactivates
  context.subscriptions.push({
    dispose: () => endSession(context)
  });
}

function startSession(sidebar: CodeForestSidebarView) {
  sessionStartTime = Date.now();
  lastMinutes = 0;

  timer = setInterval(() => {
    if (!sessionStartTime) return;

    const minutes = Math.floor(
      (Date.now() - sessionStartTime) / 60000
    );

    if (minutes === lastMinutes) return;
    lastMinutes = minutes;

    const stage = getTreeStage(minutes);
const progress = getProgressPercent(minutes);

sidebar.update(minutes, stage, progress);

  }, 1000);
}

function endSession(context: vscode.ExtensionContext) {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }

  if (!sessionStartTime) return;

  const minutes = Math.floor(
    (Date.now() - sessionStartTime) / 60000
  );

  const stage = getTreeStage(minutes);

  saveTree(context, minutes, stage);

  sessionStartTime = null;
  lastMinutes = 0;

  console.log('🌲 Code Forest session ended & saved');
}

function saveTree(
  context: vscode.ExtensionContext,
  minutes: number,
  stage: string
) {
  const trees =
    context.globalState.get<Tree[]>('codeForest.trees', []);

  const newTree: Tree = {
    id: Date.now().toString(),
    date: new Date().toLocaleDateString(),
    minutes,
    stage: stage as Tree['stage']
  };

  trees.push(newTree);
  context.globalState.update('codeForest.trees', trees);
}

export function deactivate() {
  console.log('🌲 Code Forest deactivated');
}
