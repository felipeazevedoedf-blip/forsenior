
import React, { useState, useEffect } from 'react';
import { User, UserRole, Medication, MedicationStatus } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import PatientList from './features/Patients';
import Schedule from './features/Schedule';
import Demands from './features/Demands';
import Reports from './features/Reports';
import FunctionalTests from './features/FunctionalTests';
import Admin from './features/Admin';
import CaregiverChecklist from './features/CaregiverChecklist';
import Wearables from './features/Wearables';
import Login from './features/Login';
import TeamChatBar from './components/TeamChatBar';
import FamilyForm from './features/FamilyForm';
import SafetyIntelligence from './features/SafetyIntelligence';
import MedicationModule from './features/MedicationModule';
import MedicationAlarm from './components/MedicationAlarm';
import EnvironmentalCheck from './features/EnvironmentalCheck';
import VitalRiskChecklist from './features/VitalRiskChecklist';
import FallPrediction from './features/FallPrediction';
import { store } from './services/store';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(store.getCurrentUser());
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('forsenior-theme') === 'dark');
  const [activeAlarm, setActiveAlarm] = useState<{ med: Medication, time: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const storedUser = store.getCurrentUser();
        setCurrentUser(storedUser || null);
      } else {
        const stored = store.getCurrentUser();
        setCurrentUser(stored?.id === 'demo-user-123' ? stored : null);
      }
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('forsenior-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('forsenior-theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleAlarmAction = (status: MedicationStatus) => {
    if (!activeAlarm) return;
    const now = new Date();
    store.addMedicationLog({
      id: `log-${Date.now()}`, medicationId: activeAlarm.med.id, patientId: activeAlarm.med.patientId,
      scheduledTime: activeAlarm.time, status, date: now.toISOString().split('T')[0],
      actualTime: status === 'taken' ? `${now.getHours()}:${now.getMinutes()}` : undefined
    });
    setActiveAlarm(null);
  };

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPath} user={currentUser!} />;
      case 'patients': return <PatientList user={currentUser!} onNavigate={setCurrentPath} />;
      case 'schedule': return <Schedule user={currentUser!} />;
      case 'tests': return <FunctionalTests user={currentUser!} />;
      case 'medications': return <MedicationModule user={currentUser!} />;
      case 'demands': return <Demands user={currentUser!} />;
      case 'macro_cycle': return <Demands user={currentUser!} />;
      case 'micro_cycle': return <Demands user={currentUser!} />;
      case 'safety': return <VitalRiskChecklist user={currentUser!} />;
      case 'env_check': return <EnvironmentalCheck user={currentUser!} />;
      case 'routine': return <CaregiverChecklist user={currentUser!} />;
      case 'reports': return <Reports user={currentUser!} onNavigate={setCurrentPath} />;
      case 'admin': return <Admin user={currentUser!} />;
      case 'lgpd': return <Admin user={currentUser!} />;
      case 'emergency': return <VitalRiskChecklist user={currentUser!} />; // Mapeado para tela de risco/emergência
      default: return <Dashboard onNavigate={setCurrentPath} user={currentUser!} />;
    }
  };

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950"><div className="w-10 h-10 border-4 border-deepBlue dark:border-sky-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <Login onLogin={setCurrentUser} />;

  return (
    <div className={`flex h-screen bg-backgroundGray dark:bg-darkBg overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {activeAlarm && <MedicationAlarm medication={activeAlarm.med} time={activeAlarm.time} onAction={handleAlarmAction} />}
      <Sidebar 
        user={currentUser} 
        onNavigate={setCurrentPath} 
        currentPath={currentPath} 
        onLogout={() => signOut(auth)} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP BAR MOBILE */}
        <div className="md:hidden p-4 bg-deepBlue text-white flex justify-between items-center">
           <button onClick={() => setIsSidebarOpen(true)} className="text-2xl">☰</button>
           <h1 className="font-bold poppins">ForSênior</h1>
           <div className="w-8"></div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <TeamChatBar user={currentUser} />
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
