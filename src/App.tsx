import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useDocStore, useGoalStore } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Docs from './pages/Docs';
import DocSpace from './pages/DocSpace';
import DocEditor from './pages/DocEditor';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import GanttView from './pages/GanttView';
import ReviewHistory from './pages/ReviewHistory';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore(s => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage);
  const loadDocs = useDocStore(s => s.loadFromStorage);
  const loadGoals = useGoalStore(s => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
    loadDocs();
    loadGoals();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="settings" element={<Settings />} />
          <Route path="docs" element={<Docs />} />
          <Route path="docs/:spaceId" element={<DocSpace />} />
          <Route path="docs/:spaceId/:docId" element={<DocEditor />} />
          <Route path="goals" element={<Goals />} />
          <Route path="goals/gantt" element={<GanttView />} />
          <Route path="goals/review" element={<ReviewHistory />} />
          <Route path="goals/:goalId" element={<GoalDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
