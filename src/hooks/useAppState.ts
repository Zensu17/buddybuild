import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocFromServer,
  FirestoreError
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { AppState, Task, ClassSession, CourseGrade, Exam } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const INITIAL_STATE: AppState = {
  tasks: [],
  exams: [],
  schedule: [],
  grades: [],
  notifications: [],
};

export function useAppState() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthReady(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Connection Test
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Real-time Sync
  useEffect(() => {
    if (!isAuthReady || !auth.currentUser) {
      setState(INITIAL_STATE);
      return;
    }

    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);

    const unsubTasks = onSnapshot(collection(userRef, 'tasks'), (snapshot) => {
      const tasks = snapshot.docs.map(doc => doc.data() as Task);
      setState(prev => ({ ...prev, tasks }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/tasks`));

    const unsubExams = onSnapshot(collection(userRef, 'exams'), (snapshot) => {
      const exams = snapshot.docs.map(doc => doc.data() as Exam);
      setState(prev => ({ ...prev, exams }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/exams`));

    const unsubSchedule = onSnapshot(collection(userRef, 'schedule'), (snapshot) => {
      const schedule = snapshot.docs.map(doc => doc.data() as ClassSession);
      setState(prev => ({ ...prev, schedule }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/schedule`));

    const unsubGrades = onSnapshot(collection(userRef, 'grades'), (snapshot) => {
      const grades = snapshot.docs.map(doc => doc.data() as CourseGrade);
      setState(prev => ({ ...prev, grades }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/grades`));

    return () => {
      unsubTasks();
      unsubExams();
      unsubSchedule();
      unsubGrades();
    };
  }, [isAuthReady]);

  // Notification Checker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newNotifications: { id: string; message: string; timestamp: string }[] = [];
      
      const checkItems = (items: (Task | Exam)[], type: 'tasks' | 'exams') => {
        items.forEach(async item => {
          if (item.completed || item.notified) return;
          
          const deadline = new Date(item.dueDate).getTime();
          const reminderMs = item.reminderTime * 60 * 1000;
          
          if (now >= (deadline - reminderMs)) {
            newNotifications.push({
              id: crypto.randomUUID(),
              message: `Reminder: ${item.type === 'exam' ? 'Exam' : 'Task'} "${item.title}" for ${item.course} is due soon!`,
              timestamp: new Date().toISOString()
            });

            // Update notified status in Firestore
            if (auth.currentUser) {
              const uid = auth.currentUser.uid;
              const itemRef = doc(db, 'users', uid, type, item.id);
              try {
                await setDoc(itemRef, { ...item, notified: true }, { merge: true });
              } catch (error) {
                console.error("Error updating notification status:", error);
              }
            }
          }
        });
      };

      checkItems(state.tasks, 'tasks');
      checkItems(state.exams, 'exams');

      if (newNotifications.length > 0) {
        setState(prev => ({
          ...prev,
          notifications: [...newNotifications, ...prev.notifications].slice(0, 10)
        }));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [state.tasks, state.exams, isAuthReady]);

  const addTask = async (task: Omit<Task, 'id' | 'completed' | 'type' | 'uid'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newTask: Task = { ...task, id, uid, completed: false, type: 'task' };
    const path = `users/${uid}/tasks/${id}`;
    try {
      await setDoc(doc(db, path), newTask);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addExam = async (exam: Omit<Exam, 'id' | 'completed' | 'type' | 'uid'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newExam: Exam = { ...exam, id, uid, completed: false, type: 'exam' };
    const path = `users/${uid}/exams/${id}`;
    try {
      await setDoc(doc(db, path), newExam);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const toggleTask = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    const path = `users/${uid}/tasks/${id}`;
    try {
      await setDoc(doc(db, path), { ...task, completed: !task.completed }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const toggleExam = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const exam = state.exams.find(e => e.id === id);
    if (!exam) return;
    const path = `users/${uid}/exams/${id}`;
    try {
      await setDoc(doc(db, path), { ...exam, completed: !exam.completed }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteTask = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/tasks/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const deleteExam = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/exams/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const clearNotification = (id: string) => {
    setState(prev => ({ ...prev, notifications: prev.notifications.filter(n => n.id !== id) }));
  };

  const addClass = async (session: Omit<ClassSession, 'id' | 'uid'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newSession: ClassSession = { ...session, id, uid };
    const path = `users/${uid}/schedule/${id}`;
    try {
      await setDoc(doc(db, path), newSession);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteClass = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/schedule/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addGrade = async (grade: Omit<CourseGrade, 'id' | 'uid'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newGrade: CourseGrade = { ...grade, id, uid };
    const path = `users/${uid}/grades/${id}`;
    try {
      await setDoc(doc(db, path), newGrade);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteGrade = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/grades/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return {
    state,
    addTask,
    toggleTask,
    deleteTask,
    addExam,
    toggleExam,
    deleteExam,
    clearNotification,
    addClass,
    deleteClass,
    addGrade,
    deleteGrade,
    isAuthReady
  };
}
