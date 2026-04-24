export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface UserResult {
  id: string;
  name: string;
  phone: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: number[];
  timestamp: number;
  telegramUsername?: string;
}