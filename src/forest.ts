export interface Tree {
  id: string;
  date: string;
  minutes: number;
  stage: 'sapling' | 'small' | 'medium' | 'big';
}
