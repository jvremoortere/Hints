export interface GameCard {
  id: string;
  concepts: string[];
}

export enum InputMode {
  MANUAL = 'MANUAL',
  AI_EXTRACT = 'AI_EXTRACT'
}

export interface GenerationConfig {
  numCards: number;
  conceptsPerCard: number;
}