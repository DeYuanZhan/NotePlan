import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface User {
  id: string;
  email: string;
  password: string;
  nickname: string;
  avatar: string;
}

export interface DocBlock {
  id: string;
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list' | 'task' | 'quote' | 'code' | 'image' | 'divider';
  content: string;
  checked?: boolean;
  language?: string;
}

export interface Document {
  id: string;
  spaceId: string;
  parentId: string | null;
  title: string;
  blocks: DocBlock[];
  isFolder: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  linkedGoalIds: string[];
}

export interface KnowledgeSpace {
  id: string;
  userId: string;
  name: string;
  description: string;
  cover: string;
  createdAt: string;
}

export type GoalLevel = 'big' | 'phase' | 'small' | 'daily' | 'hourly';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'archived';

export interface Goal {
  id: string;
  userId: string;
  level: GoalLevel;
  parentId: string | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: GoalStatus;
  priority?: number;
  weight?: number;
  completed: boolean;
  linkedDocIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyReview {
  id: string;
  userId: string;
  date: string;
  completionSummary: string;
  incompleteReason: string;
  optimization: string;
  tomorrowPlan: string;
  createdAt: string;
}

// Auth Store
interface AuthState {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, nickname: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  users: [],
  login: (email, password) => {
    const state = get();
    const user = state.users.find(u => u.email === email && u.password === password);
    if (user) {
      set({ currentUser: user });
      localStorage.setItem('np_currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  },
  register: (email, password, nickname) => {
    const state = get();
    if (state.users.find(u => u.email === email)) return false;
    const newUser: User = {
      id: uuidv4(),
      email,
      password,
      nickname,
      avatar: `https://api.dicebear.com/72/${encodeURIComponent(email)}.svg`
    };
    const users = [...state.users, newUser];
    set({ users, currentUser: newUser });
    localStorage.setItem('np_users', JSON.stringify(users));
    localStorage.setItem('np_currentUser', JSON.stringify(newUser));
    return true;
  },
  logout: () => {
    set({ currentUser: null });
    localStorage.removeItem('np_currentUser');
  },
  updateProfile: (data) => {
    const state = get();
    if (!state.currentUser) return;
    const updated = { ...state.currentUser, ...data };
    const users = state.users.map(u => u.id === updated.id ? updated : u);
    set({ currentUser: updated, users });
    localStorage.setItem('np_users', JSON.stringify(users));
    localStorage.setItem('np_currentUser', JSON.stringify(updated));
  },
  loadFromStorage: () => {
    const users = JSON.parse(localStorage.getItem('np_users') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('np_currentUser') || 'null');
    set({ users, currentUser });
  }
}));

// Document Store
interface DocState {
  spaces: KnowledgeSpace[];
  documents: Document[];
  createSpace: (name: string, description: string) => string;
  updateSpace: (id: string, data: Partial<KnowledgeSpace>) => void;
  deleteSpace: (id: string) => void;
  createDocument: (spaceId: string, parentId: string | null, isFolder: boolean, title: string) => string;
  updateDocument: (id: string, data: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  restoreDocument: (id: string) => void;
  permanentDelete: (id: string) => void;
  moveDocument: (id: string, newParentId: string | null, spaceId: string) => void;
  linkGoalToDoc: (docId: string, goalId: string) => void;
  unlinkGoalFromDoc: (docId: string, goalId: string) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useDocStore = create<DocState>((set, get) => ({
  spaces: [],
  documents: [],
  createSpace: (name, description) => {
    const id = uuidv4();
    const space: KnowledgeSpace = {
      id,
      userId: useAuthStore.getState().currentUser?.id || '',
      name,
      description,
      cover: '',
      createdAt: new Date().toISOString()
    };
    set(s => ({ spaces: [...s.spaces, space] }));
    get().saveToStorage();
    return id;
  },
  updateSpace: (id, data) => {
    set(s => ({ spaces: s.spaces.map(sp => sp.id === id ? { ...sp, ...data } : sp) }));
    get().saveToStorage();
  },
  deleteSpace: (id) => {
    set(s => ({
      spaces: s.spaces.filter(sp => sp.id !== id),
      documents: s.documents.filter(d => d.spaceId !== id)
    }));
    get().saveToStorage();
  },
  createDocument: (spaceId, parentId, isFolder, title) => {
    const id = uuidv4();
    const docs = get().documents.filter(d => d.spaceId === spaceId);
    const doc: Document = {
      id,
      spaceId,
      parentId,
      title,
      blocks: [{ id: uuidv4(), type: 'paragraph', content: '' }],
      isFolder,
      order: docs.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedGoalIds: []
    };
    set(s => ({ documents: [...s.documents, doc] }));
    get().saveToStorage();
    return id;
  },
  updateDocument: (id, data) => {
    set(s => ({
      documents: s.documents.map(d => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d)
    }));
    get().saveToStorage();
  },
  deleteDocument: (id) => {
    set(s => ({
      documents: s.documents.map(d => d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d)
    }));
    get().saveToStorage();
  },
  restoreDocument: (id) => {
    set(s => ({
      documents: s.documents.map(d => d.id === id ? { ...d, deletedAt: undefined } : d)
    }));
    get().saveToStorage();
  },
  permanentDelete: (id) => {
    set(s => ({ documents: s.documents.filter(d => d.id !== id) }));
    get().saveToStorage();
  },
  moveDocument: (id, newParentId, spaceId) => {
    set(s => ({
      documents: s.documents.map(d => d.id === id ? { ...d, parentId: newParentId, spaceId } : d)
    }));
    get().saveToStorage();
  },
  linkGoalToDoc: (docId, goalId) => {
    set(s => ({
      documents: s.documents.map(d => d.id === docId ? { ...d, linkedGoalIds: [...new Set([...d.linkedGoalIds, goalId])] } : d)
    }));
    get().saveToStorage();
  },
  unlinkGoalFromDoc: (docId, goalId) => {
    set(s => ({
      documents: s.documents.map(d => d.id === docId ? { ...d, linkedGoalIds: d.linkedGoalIds.filter(id => id !== goalId) } : d)
    }));
    get().saveToStorage();
  },
  loadFromStorage: () => {
    const spaces = JSON.parse(localStorage.getItem('np_spaces') || '[]');
    const documents = JSON.parse(localStorage.getItem('np_documents') || '[]');
    set({ spaces, documents });
  },
  saveToStorage: () => {
    const state = get();
    localStorage.setItem('np_spaces', JSON.stringify(state.spaces));
    localStorage.setItem('np_documents', JSON.stringify(state.documents));
  }
}));

// Goal Store
interface GoalState {
  goals: Goal[];
  reviews: DailyReview[];
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => string;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalComplete: (id: string) => void;
  getGoalProgress: (id: string) => number;
  linkDocToGoal: (goalId: string, docId: string) => void;
  unlinkDocFromGoal: (goalId: string, docId: string) => void;
  createReview: (review: Omit<DailyReview, 'id' | 'createdAt'>) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  reviews: [],
  createGoal: (goalData) => {
    const id = uuidv4();
    const goal: Goal = {
      ...goalData,
      id,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set(s => ({ goals: [...s.goals, goal] }));
    get().saveToStorage();
    return id;
  },
  updateGoal: (id, data) => {
    set(s => ({
      goals: s.goals.map(g => g.id === id ? { ...g, ...data, updatedAt: new Date().toISOString() } : g)
    }));
    get().saveToStorage();
  },
  deleteGoal: (id) => {
    set(s => ({ goals: s.goals.filter(g => g.id !== id) }));
    get().saveToStorage();
  },
  toggleGoalComplete: (id) => {
    const state = get();
    const goal = state.goals.find(g => g.id === id);
    if (!goal) return;
    const newCompleted = !goal.completed;
    set(s => ({
      goals: s.goals.map(g => g.id === id ? { ...g, completed: newCompleted, status: newCompleted ? 'completed' : 'in_progress' } : g)
    }));
    // Recalculate parent progress
    if (goal.parentId) {
      const siblings = state.goals.filter(g => g.parentId === goal.parentId);
      const completedCount = siblings.filter(g => g.id === id ? newCompleted : g.completed).length;
      const progress = (completedCount / siblings.length) * 100;
      const parent = state.goals.find(g => g.id === goal.parentId);
      if (parent) {
        get().updateGoal(parent.id, { completed: progress >= 100 });
      }
    }
    get().saveToStorage();
  },
  getGoalProgress: (id) => {
    const state = get();
    const children = state.goals.filter(g => g.parentId === id);
    if (children.length === 0) {
      const goal = state.goals.find(g => g.id === id);
      return goal?.completed ? 100 : 0;
    }
    const completedCount = children.filter(c => c.completed).length;
    return Math.round((completedCount / children.length) * 100);
  },
  linkDocToGoal: (goalId, docId) => {
    set(s => ({
      goals: s.goals.map(g => g.id === goalId ? { ...g, linkedDocIds: [...new Set([...g.linkedDocIds, docId])] } : g)
    }));
    get().saveToStorage();
  },
  unlinkDocFromGoal: (goalId, docId) => {
    set(s => ({
      goals: s.goals.map(g => g.id === goalId ? { ...g, linkedDocIds: g.linkedDocIds.filter(id => id !== docId) } : g)
    }));
    get().saveToStorage();
  },
  createReview: (reviewData) => {
    const review: DailyReview = {
      ...reviewData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    set(s => ({ reviews: [...s.reviews, review] }));
    get().saveToStorage();
  },
  loadFromStorage: () => {
    const goals = JSON.parse(localStorage.getItem('np_goals') || '[]');
    const reviews = JSON.parse(localStorage.getItem('np_reviews') || '[]');
    set({ goals, reviews });
  },
  saveToStorage: () => {
    const state = get();
    localStorage.setItem('np_goals', JSON.stringify(state.goals));
    localStorage.setItem('np_reviews', JSON.stringify(state.reviews));
  }
}));
