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

export interface AppState {
  tasks: Task[];
  exams: Exam[];
  schedule: ClassSession[];
  grades: CourseGrade[];
  flashcardSets: FlashcardSet[];
  settings: {
    notificationsEnabled: boolean;
    pomodoroAutoStart: boolean;
    theme: 'light' | 'dark';
  };
  notifications: { id: string; message: string; timestamp: string }[];
}
