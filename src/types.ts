export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'deactivated';
}

export interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  extractedText?: string;
  summary?: string;
  keyPoints?: string[];
  textLength?: number;
  createdAt: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
}

export interface Quiz {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  materialId?: string;
  questionCount: number;
  questions?: Question[];
  createdAt: string;
}

export interface ReviewItem {
  id: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizResult {
  attemptId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  reviewBreakdown: ReviewItem[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  quizTitle: string;
  userAnswers: Record<string, string>;
  score: number;
  totalQuestions: number;
  correctCount: number;
  completedAt: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  dueDate: string;
  durationMinutes: number;
  priority: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'completed';
  isAiSuggested: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'model';
  content: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'deactivated';
  createdAt: string;
  materialsCount: number;
  quizzesCount: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetEntity?: string;
  details?: string;
  createdAt: string;
}

export interface AdminOverview {
  totalStudents: number;
  activeUsers: number;
  totalMaterials: number;
  totalQuizzesTaken: number;
  geminiModel: string;
  systemUptimeHours: string;
  databaseHealth: string;
}
