import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { NotesView } from './components/NotesView';
import { QuizView } from './components/QuizView';
import { PlannerView } from './components/PlannerView';
import { TutorView } from './components/TutorView';
import { ProgressView } from './components/ProgressView';
import { AdminPortalView } from './components/AdminPortalView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { User, StudyMaterial, StudyTask, QuizAttempt } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-student-1',
    name: 'Alex Rivers',
    email: 'student@epilot.ai',
    role: 'student',
    status: 'active',
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedNoteForAction, setSelectedNoteForAction] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  const loadInitialData = async () => {
    try {
      const headers = { Authorization: `Bearer ${currentUser.id}` };

      const [matRes, taskRes, attRes] = await Promise.all([
        fetch('/api/materials', { headers }),
        fetch('/api/study-tasks', { headers }),
        fetch('/api/quiz-attempts', { headers }),
      ]);

      if (matRes.ok) setMaterials(await matRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (attRes.ok) setAttempts(await attRes.json());
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  // Switch between Student and Admin for immediate live preview verification
  const handleToggleRole = () => {
    if (currentUser.role === 'student') {
      const adminUser: User = {
        id: 'user-admin-1',
        name: 'EPilot Super Admin',
        email: 'admin@epilot.ai',
        role: 'admin',
        status: 'active',
      };
      setCurrentUser(adminUser);
      setCurrentTab('admin');
    } else {
      const studentUser: User = {
        id: 'user-student-1',
        name: 'Alex Rivers',
        email: 'student@epilot.ai',
        role: 'student',
        status: 'active',
      };
      setCurrentUser(studentUser);
      setCurrentTab('dashboard');
    }
  };

  // Materials Handlers
  const handleUploadMaterial = async (data: {
    title: string;
    fileName: string;
    extractedText: string;
    fileSize: number;
  }) => {
    const res = await fetch('/api/materials/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.id}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload material');
    }

    const saved = await res.json();
    setMaterials((prev) => [saved, ...prev]);
  };

  const handleDeleteMaterial = async (id: string) => {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${currentUser.id}` },
    });

    if (res.ok) {
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handleGenerateSummary = async (id: string) => {
    const res = await fetch(`/api/materials/${id}/summary`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${currentUser.id}` },
    });

    if (res.ok) {
      const data = await res.json();
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, summary: data.summary, keyPoints: data.keyPoints } : m
        )
      );
    }
  };

  // Tasks Handlers
  const handleAddTask = async (taskData: {
    subject: string;
    topic: string;
    dueDate: string;
    durationMinutes: number;
    priority: 'Low' | 'Medium' | 'High';
  }) => {
    const res = await fetch('/api/study-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.id}`,
      },
      body: JSON.stringify(taskData),
    });

    if (res.ok) {
      const newTask = await res.json();
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleToggleTask = async (id: string) => {
    const res = await fetch(`/api/study-tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${currentUser.id}` },
    });

    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  };

  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/study-tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${currentUser.id}` },
    });

    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleGenerateStudyPlan = async (availableHours: number) => {
    const res = await fetch('/api/study-plans/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser.id}`,
      },
      body: JSON.stringify({ availableHours }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.tasks) {
        setTasks((prev) => [...data.tasks, ...prev]);
      }
    }
  };

  // Cross-Navigation Shortcuts
  const handleStartQuizFromNote = (materialId: string) => {
    setSelectedNoteForAction(materialId);
    setCurrentTab('quiz');
  };

  const handleOpenTutorWithNote = (materialId: string) => {
    setSelectedNoteForAction(materialId);
    setCurrentTab('tutor');
  };

  return (
    <div className="flex h-screen bg-[#0a0e17] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
        onLogout={handleToggleRole}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          onSwitchRole={handleToggleRole}
          onOpenQuickQuiz={() => setCurrentTab('quiz')}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              currentUser={currentUser}
              materials={materials}
              tasks={tasks}
              attempts={attempts}
              onNavigate={setCurrentTab}
              onOpenMaterial={(mat) => {
                setSelectedNoteForAction(mat.id);
                setCurrentTab('notes');
              }}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentTab === 'notes' && (
            <NotesView
              materials={materials}
              onUpload={handleUploadMaterial}
              onDelete={handleDeleteMaterial}
              onGenerateSummary={handleGenerateSummary}
              onStartQuizFromNote={handleStartQuizFromNote}
              onOpenTutorWithNote={handleOpenTutorWithNote}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizView
              materials={materials}
              preselectedMaterialId={selectedNoteForAction}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'planner' && (
            <PlannerView
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onGeneratePlan={handleGenerateStudyPlan}
            />
          )}

          {currentTab === 'tutor' && (
            <TutorView
              materials={materials}
              preselectedMaterialId={selectedNoteForAction}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              materials={materials}
              tasks={tasks}
              attempts={attempts}
            />
          )}

          {currentTab === 'admin' && (
            <AdminPortalView
              onLogoutAdmin={() => {
                const studentUser: User = {
                  id: 'user-student-1',
                  name: 'Alex Rivers',
                  email: 'student@epilot.ai',
                  role: 'student',
                  status: 'active',
                };
                setCurrentUser(studentUser);
                setCurrentTab('dashboard');
              }}
            />
          )}
        </main>
      </div>

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={(adminUser) => {
          setCurrentUser(adminUser);
          setCurrentTab('admin');
        }}
      />
    </div>
  );
}
