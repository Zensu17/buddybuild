export type Priority = 'low' | 'medium' | 'high';
export type ItemType = 'task' | 'exam';

export interface ReminderItem {
  id: string;
  uid: string;
  type: ItemType;
  title: string;
  course: string;
  dueDate: string;
  reminderTime: number; // minutes before deadline
  priority: Priority;
  completed: boolean;
  notified?: boolean;
}

export interface Task extends ReminderItem {
  type: 'task';
}

export interface Exam extends ReminderItem {
  type: 'exam';
  location?: string;
}

export interface ClassSession {
  id: string;
  uid: string;
  name: string;
  room: string;
  day: number; // 0-6 (Sun-Sat)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  color: string;
}

export interface CourseGrade {
  id: string;
  uid: string;
  name: string;
  credits: number;
  grade: number; // 0.0 - 4.0
  semester?: number; // 1-8 optional semester tracking
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface FlashcardSet {
  id: string;
  uid: string;
  title: string;
  course: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface GardenPlant {
  id: string;
  uid: string;
  seedType: 'sunflower' | 'sakura' | 'lavender' | 'magic_fern';
  name: string;
  growthStage: number; // 0 to 4
  waterProgress: number; // 0 to 100% per stage
  createdAt: string;
  grownAt?: string;
}

export interface AuditLog {
  id: string;
  action: 'add' | 'edit' | 'delete' | 'toggle';
  targetName: string;
  targetType: 'jadwal' | 'tugas' | 'ujian';
  adminName: string;
  timestamp: string; // ISO String
}

export interface AppState {
  tasks: Task[];
  exams: Exam[];
  schedule: ClassSession[];
  grades: CourseGrade[];
  flashcardSets: FlashcardSet[];
  chatSessions: ChatSession[];
  gardenActivePlant: GardenPlant | null;
  gardenDroplets: number;
  gardenHarvested: Omit<GardenPlant, 'uid'>[];
  role?: 'admin' | 'user';
  completedTaskIds?: string[];
  completedExamIds?: string[];
  settings: {
    notificationsEnabled: boolean;
    pomodoroAutoStart: boolean;
    theme: 'light' | 'dark';
  };
  notifications: { id: string; message: string; timestamp: string }[];
  auditLogs?: AuditLog[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  promptTokens?: number;
  candidatesTokens?: number;
  totalTokens?: number;
}

export interface ChatSession {
  id: string;
  uid: string;
  title: string;
  createdAt: string;
  lastActive: string;
  messages: ChatMessage[];
  tokensUsed?: number;
}
