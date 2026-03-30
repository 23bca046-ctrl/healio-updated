import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Calendar, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Home as HomeIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, logout } from './firebase';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import AppointmentScheduler from './components/AppointmentScheduler';
import Home from './components/Home';
import Login from './components/Login';
import Logo from './components/Logo';
import SettingsComponent from './components/Settings';
import { cn } from './lib/utils';
import { startOfToday, addDays } from 'date-fns';

type Tab = 'home' | 'dashboard' | 'chat' | 'appointments' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [lastBotInteraction, setLastBotInteraction] = useState<Date | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('healio_chat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      } catch (e) {
        console.error('Error parsing chat history', e);
      }
    }
    return [];
  });

  // Shared State for App Connectivity with Persistence
  const [appointments, setAppointments] = useState<any[]>(() => {
    const saved = localStorage.getItem('healio_appointments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((a: any) => ({ ...a, date: new Date(a.date) }));
      } catch (e) {
        console.error('Error parsing appointments', e);
      }
    }
    return [
      { 
        id: 'app-1', 
        doctor: { name: 'Dr. Sarah Johnson', specialty: 'General Physician' }, 
        date: addDays(startOfToday(), 2), 
        time: '10:00 AM' 
      }
    ];
  });
  
  const [symptoms, setSymptoms] = useState<any[]>(() => {
    const saved = localStorage.getItem('healio_symptoms');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({ 
          ...s, 
          date: new Date(s.date),
          severity: s.severity || 'mild'
        }));
      } catch (e) {
        console.error('Error parsing symptoms', e);
      }
    }
    return [
      { name: 'Mild Fatigue', date: addDays(startOfToday(), -1), severity: 'mild' },
      { name: 'Seasonal Allergies', date: addDays(startOfToday(), -3), severity: 'moderate' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('healio_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('healio_symptoms', JSON.stringify(symptoms));
  }, [symptoms]);

  useEffect(() => {
    localStorage.setItem('healio_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-12 h-12 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Healio AI', icon: MessageSquare },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "h-full flex-shrink-0 border-r border-slate-200 bg-white hidden lg:flex flex-col shadow-sm z-20 transition-all duration-300 ease-in-out relative",
          isSidebarCollapsed ? "w-24" : "w-72"
        )}
      >
        <div className={cn(
          "p-8 border-b border-slate-100 flex items-center",
          isSidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          <Logo showText={!isSidebarCollapsed} variant="light" />
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm z-30"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm relative group",
                activeTab === item.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600",
                isSidebarCollapsed && "justify-center px-0"
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              {!isSidebarCollapsed && <span>{item.label}</span>}
              {activeTab === item.id && !isSidebarCollapsed && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40"
                />
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={() => logout()}
            className={cn(
              "w-full flex items-center gap-3 px-5 py-3.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm group",
              isSidebarCollapsed && "justify-center px-0"
            )}
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut size={20} strokeWidth={2} className={cn(!isSidebarCollapsed && "group-hover:-translate-x-1 transition-transform")} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <Logo showText={true} variant="light" />
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-base",
                      activeTab === item.id 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" 
                        : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
                    )}
                  >
                    <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-6 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                    <img 
                      src={user.photoURL || "https://picsum.photos/seed/user/100/100"} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-emerald-600 font-medium">Premium Member</p>
                  </div>
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-5 py-4 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all font-bold text-base"
                >
                  <LogOut size={22} strokeWidth={2} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="lg:hidden">
              <Logo showText={false} variant="light" />
            </div>
            <h1 className="text-xl font-black text-slate-900 capitalize hidden lg:block tracking-tight">
              {activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="relative hidden xl:flex items-center">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search health records..." 
                className="w-64 xl:w-80 h-11 pl-12 pr-6 rounded-full bg-slate-50 border border-slate-100/50 text-sm font-medium text-slate-600 placeholder:text-slate-400/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
              />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
                <Search size={20} />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "p-2.5 rounded-xl transition-all relative",
                    showNotifications ? "bg-emerald-50 text-emerald-600" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Bell size={22} />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 healio-card p-5 shadow-2xl z-[100] border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        <button className="text-xs text-emerald-600 font-bold hover:underline">Mark all as read</button>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                          <p className="text-xs font-black text-emerald-700 mb-1.5 uppercase tracking-wider">Health Update</p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">Your health score has improved by 3 points since yesterday.</p>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                          <p className="text-xs font-black text-slate-500 mb-1.5 uppercase tracking-wider">Appointment Reminder</p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">Visit with Dr. Sarah Johnson in 2 days.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.displayName || 'User'}</p>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Premium</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                <img 
                  src={user.photoURL || "https://picsum.photos/seed/user/100/100"} 
                  alt="Profile" 
                  referrerPolicy="no-referrer" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] scroll-smooth">
          <div className="max-w-7xl mx-auto p-4 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'home' && (
                  <Home 
                    onNavigate={(tab: any) => setActiveTab(tab)} 
                    appointments={appointments}
                    symptoms={symptoms}
                    chatHistory={chatHistory}
                    lastBotInteraction={lastBotInteraction}
                    setSymptoms={setSymptoms}
                    setAppointments={setAppointments}
                    setChatHistory={setChatHistory}
                  />
                )}
                {activeTab === 'dashboard' && (
                  <Dashboard 
                    onNavigate={(tab: any) => setActiveTab(tab)} 
                    symptoms={symptoms}
                    appointments={appointments}
                    chatHistory={chatHistory}
                    lastBotInteraction={lastBotInteraction}
                    setSymptoms={setSymptoms}
                    setChatHistory={setChatHistory}
                  />
                )}
                {activeTab === 'chat' && (
                  <ChatInterface 
                    onNavigate={(tab: any) => setActiveTab(tab)}
                    symptoms={symptoms}
                    chatHistory={chatHistory}
                    setChatHistory={setChatHistory}
                    onAddSymptom={(symptom: any) => setSymptoms(prev => [symptom, ...prev])}
                    onInteraction={() => setLastBotInteraction(new Date())}
                  />
                )}
                {activeTab === 'appointments' && (
                  <AppointmentScheduler 
                    appointments={appointments}
                    setAppointments={setAppointments}
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsComponent user={user} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
