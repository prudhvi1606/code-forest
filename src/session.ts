export type TreeStage =
  | 'sapling'
  | 'small'
  | 'medium'
  | 'big';

export function getTreeStage(minutes: number): TreeStage {
  if (minutes >= 90) return 'big';
  if (minutes >= 30) return 'medium';
  if (minutes >= 15) return 'small';
  return 'sapling';
}
export function getProgressPercent(minutes: number): number {
  if (minutes < 15) {
    return (minutes / 15) * 100;
  }
  if (minutes < 30) {
    return ((minutes - 15) / 15) * 100;
  }
  if (minutes < 90) {
    return ((minutes - 30) / 60) * 100;
  }
  return 100;
}
