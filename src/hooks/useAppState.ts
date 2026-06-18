import { useState, useEffect, useCallback } from 'react';
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
import { AppState, Task, ClassSession, CourseGrade, Exam, FlashcardSet, GardenPlant, ChatSession, AuditLog } from '../types';
import confetti from 'canvas-confetti';

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

const ADMIN_EMAILS = [
  'sitorusalbert27@gmail.com',
  'admin@buddybuild.fun',
  'admin@buddybuild.ac.id'
];

const INITIAL_STATE: AppState = {
  tasks: [],
  exams: [],
  schedule: [],
  grades: [],
  flashcardSets: [],
  chatSessions: [],
  gardenActivePlant: null,
  gardenDroplets: 25,
  gardenHarvested: [],
  role: 'user',
  completedTaskIds: [],
  completedExamIds: [],
  settings: {
    notificationsEnabled: true,
    pomodoroAutoStart: false,
    theme: 'light',
  },
  notifications: [],
  auditLogs: [],
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
      if (isAuthReady && !auth.currentUser) {
        setState(INITIAL_STATE);
      }
      return;
    }

    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);

    // Sync User Stats & Settings
    const unsubUser = onSnapshot(userRef, (doc) => {
      const currentUser = auth.currentUser;
      const email = currentUser?.email || '';
      const defaultRole = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

      if (doc.exists()) {
        const data = doc.data();
        const completedTaskIds = data.completedTaskIds || [];
        const completedExamIds = data.completedExamIds || [];
        
        if (!data.role && currentUser) {
          setDoc(userRef, { 
            uid,
            email: data.email || email, 
            role: defaultRole 
          }, { merge: true }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
          });
        }

        setState(prev => {
          const mappedTasks = (prev.tasks || []).map(t => ({
            ...t,
            completed: completedTaskIds.includes(t.id)
          }));
          const mappedExams = (prev.exams || []).map(e => ({
            ...e,
            completed: completedExamIds.includes(e.id)
          }));
          return {
            ...prev,
            settings: data.settings || INITIAL_STATE.settings,
            gardenActivePlant: data.gardenActivePlant !== undefined ? data.gardenActivePlant : INITIAL_STATE.gardenActivePlant,
            gardenDroplets: data.gardenDroplets !== undefined ? data.gardenDroplets : INITIAL_STATE.gardenDroplets,
            gardenHarvested: data.gardenHarvested !== undefined ? data.gardenHarvested : INITIAL_STATE.gardenHarvested,
            role: data.role || defaultRole,
            completedTaskIds,
            completedExamIds,
            tasks: mappedTasks,
            exams: mappedExams,
          };
        });
      } else {
        // Initialize user doc if it doesn't exist
        if (currentUser) {
          setDoc(userRef, {
            uid,
            email,
            displayName: currentUser.displayName || '',
            settings: INITIAL_STATE.settings,
            gardenActivePlant: INITIAL_STATE.gardenActivePlant,
            gardenDroplets: INITIAL_STATE.gardenDroplets,
            gardenHarvested: INITIAL_STATE.gardenHarvested,
            role: defaultRole,
            completedTaskIds: [],
            completedExamIds: []
          }, { merge: true }).catch(err => {
             handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
          });
        }
      }
    });

    const unsubTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const dbTasks = snapshot.docs.map(doc => doc.data() as Task);
      setState(prev => {
        const completedIds = prev.completedTaskIds || [];
        const mapped = dbTasks.map(t => ({
          ...t,
          completed: completedIds.includes(t.id)
        }));
        return { ...prev, tasks: mapped };
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    const unsubExams = onSnapshot(collection(db, 'exams'), (snapshot) => {
      const dbExams = snapshot.docs.map(doc => doc.data() as Exam);
      setState(prev => {
        const completedIds = prev.completedExamIds || [];
        const mapped = dbExams.map(e => ({
          ...e,
          completed: completedIds.includes(e.id)
        }));
        return { ...prev, exams: mapped };
      });
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'exams'));

    const unsubSchedule = onSnapshot(collection(db, 'schedule'), (snapshot) => {
      const schedule = snapshot.docs.map(doc => doc.data() as ClassSession);
      setState(prev => ({ ...prev, schedule }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'schedule'));

    const unsubGrades = onSnapshot(collection(userRef, 'grades'), (snapshot) => {
      const grades = snapshot.docs.map(doc => doc.data() as CourseGrade);
      setState(prev => ({ ...prev, grades }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/grades`));

    const unsubFlashcards = onSnapshot(collection(userRef, 'flashcardSets'), (snapshot) => {
      const flashcardSets = snapshot.docs.map(doc => doc.data() as FlashcardSet);
      setState(prev => ({ ...prev, flashcardSets }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/flashcardSets`));

    const unsubChatSessions = onSnapshot(collection(userRef, 'chatSessions'), (snapshot) => {
      const chatSessions = snapshot.docs.map(doc => doc.data() as ChatSession);
      setState(prev => ({ ...prev, chatSessions }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${uid}/chatSessions`));

    const unsubAuditLogs = onSnapshot(collection(db, 'auditLogs'), (snapshot) => {
      const auditLogs = snapshot.docs.map(doc => doc.data() as AuditLog);
      auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setState(prev => ({ ...prev, auditLogs }));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'auditLogs'));

    return () => {
      unsubUser();
      unsubTasks();
      unsubExams();
      unsubSchedule();
      unsubGrades();
      unsubFlashcards();
      unsubChatSessions();
      unsubAuditLogs();
    };
  }, [isAuthReady]);

  // Notification Checker
  useEffect(() => {
    if (!state.settings.notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const newNotifications: { id: string; message: string; timestamp: string }[] = [];
      
      const checkItems = (items: (Task | Exam)[], type: 'tasks' | 'exams') => {
        items.forEach(async item => {
          if (item.completed || item.notified) return;
          
          const deadline = new Date(item.dueDate).getTime();
          const reminderMs = (item.reminderTime || 0) * 60 * 1000;
          
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
  }, [state.tasks, state.exams, isAuthReady, state.settings.notificationsEnabled]);

  const updateSettings = async (settings: Partial<AppState['settings']>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(userRef, { settings: { ...state.settings, ...settings } }, { merge: true });
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'completed' | 'type' | 'uid'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newTask: Task = { ...task, id, uid, completed: false, type: 'task' };
    const path = `tasks/${id}`;
    try {
      await setDoc(doc(db, path), newTask);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!auth.currentUser) return;
    const path = `tasks/${id}`;
    try {
      await setDoc(doc(db, path), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addExam = async (exam: Omit<Exam, 'id' | 'completed' | 'type' | 'uid'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newExam: Exam = { ...exam, id, uid, completed: false, type: 'exam' };
    const path = `exams/${id}`;
    try {
      await setDoc(doc(db, path), newExam);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    if (!auth.currentUser) return;
    const path = `exams/${id}`;
    try {
      await setDoc(doc(db, path), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const toggleTask = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const completedIds = state.completedTaskIds || [];
    const isCompleted = completedIds.includes(id);
    
    let newCompletedIds;
    if (isCompleted) {
      newCompletedIds = completedIds.filter(x => x !== id);
    } else {
      newCompletedIds = [...completedIds, id];
    }
    
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(userRef, { completedTaskIds: newCompletedIds }, { merge: true });
      if (!isCompleted) {
        await setDoc(userRef, { gardenDroplets: (state.gardenDroplets || 0) + 10 }, { merge: true });
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  };

  const toggleExam = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const completedIds = state.completedExamIds || [];
    const isCompleted = completedIds.includes(id);
    
    let newCompletedIds;
    if (isCompleted) {
      newCompletedIds = completedIds.filter(x => x !== id);
    } else {
      newCompletedIds = [...completedIds, id];
    }
    
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(userRef, { completedExamIds: newCompletedIds }, { merge: true });
      if (!isCompleted) {
        await setDoc(userRef, { gardenDroplets: (state.gardenDroplets || 0) + 15 }, { merge: true });
        confetti({ particleCount: 50, spread: 60 });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }
  };

  const deleteTask = async (id: string) => {
    if (!auth.currentUser) return;
    const path = `tasks/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const deleteExam = async (id: string) => {
    if (!auth.currentUser) return;
    const path = `exams/${id}`;
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
    const path = `schedule/${id}`;
    try {
      await setDoc(doc(db, path), newSession);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateClass = async (id: string, updates: Partial<ClassSession>) => {
    if (!auth.currentUser) return;
    const path = `schedule/${id}`;
    try {
      await setDoc(doc(db, path), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteClass = async (id: string) => {
    if (!auth.currentUser) return;
    const path = `schedule/${id}`;
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

  const updateGrade = async (id: string, updates: Partial<CourseGrade>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/grades/${id}`;
    try {
      await setDoc(doc(db, path), updates, { merge: true });
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

  const addFlashcardSet = async (set: Omit<FlashcardSet, 'id' | 'uid' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const id = crypto.randomUUID();
    const newSet: FlashcardSet = { 
      ...set, 
      id, 
      uid, 
      createdAt: new Date().toISOString() 
    };
    const path = `users/${uid}/flashcardSets/${id}`;
    try {
      await setDoc(doc(db, path), newSet);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateFlashcardSet = async (id: string, set: Partial<FlashcardSet>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/flashcardSets/${id}`;
    try {
      await setDoc(doc(db, path), set, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteFlashcardSet = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/flashcardSets/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // ===============================================================
  // Study Garden Actions
  // ===============================================================
  const plantSeed = async (seedType: 'sunflower' | 'sakura' | 'lavender' | 'magic_fern', name: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    const newPlant: GardenPlant = {
      id: crypto.randomUUID(),
      uid,
      seedType,
      name,
      growthStage: 0,
      waterProgress: 0,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(userRef, { gardenActivePlant: newPlant }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const waterPlant = async (dropletsToUse: number) => {
    if (!auth.currentUser || !state.gardenActivePlant) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    
    if (state.gardenDroplets < dropletsToUse) return;
    
    let nextProgress = state.gardenActivePlant.waterProgress + dropletsToUse * 10; // 10% progress per droplet water
    let nextStage = state.gardenActivePlant.growthStage;
    let grownAt = state.gardenActivePlant.grownAt;

    while (nextProgress >= 100) {
      if (nextStage < 4) {
        nextStage += 1;
        nextProgress -= 100;
        if (nextStage === 4) {
          grownAt = new Date().toISOString();
        }
      } else {
        nextProgress = 100;
        break;
      }
    }

    const updatedPlant: GardenPlant = {
      ...state.gardenActivePlant,
      growthStage: nextStage,
      waterProgress: nextProgress,
      grownAt
    };

    try {
      await setDoc(userRef, {
        gardenActivePlant: updatedPlant,
        gardenDroplets: state.gardenDroplets - dropletsToUse
      }, { merge: true });
      
      if (nextStage === 4 && state.gardenActivePlant.growthStage < 4) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const harvestActivePlant = async () => {
    if (!auth.currentUser || !state.gardenActivePlant) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    
    const harvestedPlant = {
      id: state.gardenActivePlant.id,
      seedType: state.gardenActivePlant.seedType,
      name: state.gardenActivePlant.name,
      growthStage: 4,
      waterProgress: 100,
      createdAt: state.gardenActivePlant.createdAt,
      grownAt: state.gardenActivePlant.grownAt || new Date().toISOString()
    };

    try {
      const currentHarvested = Array.isArray(state.gardenHarvested) ? state.gardenHarvested : [];
      await setDoc(userRef, {
        gardenActivePlant: null,
        gardenHarvested: [...currentHarvested, harvestedPlant]
      }, { merge: true });
      confetti({ particleCount: 200, spread: 100 });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const addDroplets = async (amount: number) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const userRef = doc(db, 'users', uid);
    try {
      await setDoc(userRef, {
        gardenDroplets: (state.gardenDroplets || 0) + amount
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const addChatSession = async (session: ChatSession) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/chatSessions/${session.id}`;
    try {
      await setDoc(doc(db, path), session);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateChatSession = async (id: string, updates: Partial<ChatSession>) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/chatSessions/${id}`;
    try {
      await setDoc(doc(db, path), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteChatSession = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const path = `users/${uid}/chatSessions/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addAuditLog = async (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
    if (!auth.currentUser) return;
    const id = crypto.randomUUID();
    const newLog: AuditLog = {
      ...log,
      id,
      timestamp: new Date().toISOString()
    };
    const path = `auditLogs/${id}`;
    try {
      await setDoc(doc(db, path), newLog);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return {
    state,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addExam,
    updateExam,
    toggleExam,
    deleteExam,
    clearNotification,
    addClass,
    updateClass,
    deleteClass,
    addGrade,
    updateGrade,
    deleteGrade,
    addFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    updateSettings,
    plantSeed,
    waterPlant,
    harvestActivePlant,
    addDroplets,
    isAuthReady,
    addChatSession,
    updateChatSession,
    deleteChatSession,
    addAuditLog
  };
}
