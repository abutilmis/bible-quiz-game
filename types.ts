export interface Question {
  id: number;
  book: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserResult {
  id: string;
  name: string;
  phone: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: number[];
  timestamp: number;
  telegramUsername?: string;
  duration: number;
  telegramId?: string;
}