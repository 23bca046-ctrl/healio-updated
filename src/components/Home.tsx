import React from 'react';
import { motion } from 'motion/react';
import { format, isAfter, startOfToday } from 'date-fns';
import { 
  ChevronRight, 
  HeartPulse, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Activity,
  Plus,
  User,
  Sparkles,
  ArrowRight,
  Heart,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeProps {
  onNavigate: (tab: string) => void;
  appointments: any[];
  symptoms: any[];
  chatHistory: any[];
  lastBotInteraction: Date | null;
  setSymptoms: React.Dispatch<React.SetStateAction<any[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0
  }
};

export default function Home({ onNavigate, appointments, symptoms, chatHistory, lastBotInteraction, setSymptoms, setAppointments, setChatHistory }: HomeProps) {
  const nextAppointment = appointments.length > 0 
    ? [...appointments].sort((a, b) => a.date.getTime() - b.date.getTime()).find(a => isAfter(a.date, startOfToday()))
    : null;

  // Combine symptoms, appointments, and chat interactions for a unified activity feed
  // We'll treat each user message as an interaction point
  const chatInteractions = chatHistory
    .filter(m => m.role === 'bot' && (m.problemName || m.content.length > 0))
    .map(m => ({ 
      name: m.problemName || 'AI Consultation', 
      date: m.timestamp, 
      type: 'chat', 
      id: m.id,
      severity: m.severity
    }));

  const activityFeed = [
    ...symptoms.map(s => ({ ...s, type: 'symptom' })),
    ...appointments.map(a => ({ ...a, type: 'appointment', name: `Appointment with ${a.doctor.name}` })),
    ...chatInteractions
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const stats = [
    { 
      value: `${100 - (symptoms.length * 2)}/100`, 
      label: 'Health Score',
      icon: <Heart className="text-rose-500" size={20} />
    },
    { 
      value: symptoms.length.toString(), 
      label: 'Symptoms Logged',
      icon: <Activity className="text-emerald-500" size={20} />
    },
    { 
      value: symptoms.length > 0 ? (symptoms[0].severity?.charAt(0).toUpperCase() + symptoms[0].severity?.slice(1) || 'Unknown') : 'None', 
      label: 'Last Check',
      icon: <Activity className={cn(
        symptoms.length > 0 && symptoms[0].severity === 'critical' ? "text-rose-500" :
        symptoms.length > 0 && symptoms[0].severity === 'moderate' ? "text-amber-500" : "text-emerald-500"
      )} size={20} />
    },
    { 
      value: symptoms.length > 0 ? format(symptoms[0].date, 'MMM dd') : 'None', 
      label: 'Last Log',
      icon: <Clock className="text-amber-500" size={20} />
    },
  ];

  const features = [
    {
      title: 'AI Symptom Analysis',
      description: 'Advanced NLP interprets your symptoms in natural language and maps them to potential conditions.',
      icon: <HeartPulse className="text-emerald-600" size={24} />,
    },
    {
      title: 'Smart Chat Interface',
      description: 'Conversational AI that asks the right follow-up questions, guiding you through a comprehensive assessment.',
      icon: <MessageSquare className="text-emerald-600" size={24} />,
    },
    {
      title: 'Appointment Booking',
      description: 'Seamlessly schedule consultations with healthcare providers based on your symptom analysis results.',
      icon: <Calendar className="text-emerald-600" size={24} />,
    },
  ];

  const handleRemoveActivity = (item: any) => {
    if (item.type === 'symptom') {
      setSymptoms(prev => prev.filter(s => s.name !== item.name || s.date !== item.date));
    } else if (item.type === 'appointment') {
      setAppointments(prev => prev.filter(a => a.id !== item.id));
    } else if (item.type === 'chat') {
      // Remove the specific message and its following bot response if possible
      setChatHistory(prev => {
        const index = prev.findIndex(m => m.id === item.id);
        if (index === -1) return prev;
        const newHistory = [...prev];
        // Remove the user message
        newHistory.splice(index, 1);
        // If the next message is a bot response, remove it too
        if (newHistory[index] && newHistory[index].role === 'bot') {
          newHistory.splice(index, 1);
        }
        return newHistory;
      });
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto grid grid-cols-12 gap-6 lg:gap-8"
    >
      {/* Hero Section */}
      <motion.div 
        variants={itemVariants}
        className="col-span-12 healio-card bg-emerald-600 border-none p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
      >
        <div className="max-w-2xl space-y-6 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/30 backdrop-blur-md rounded-full text-emerald-50 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles size={14} />
            AI-Powered Healthcare
          </div>
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-black leading-tight">Your health, <br className="hidden sm:block" /><span className="text-emerald-200">perfectly synchronized.</span></h1>
          <p className="text-emerald-50 text-base sm:text-lg leading-relaxed">
            {symptoms.length > 0 
              ? `We've updated your dashboard with ${symptoms.length} recent symptoms. Start a new analysis to get personalized insights.`
              : "Experience the future of personal medicine. Healio connects your symptoms, appointments, and AI insights in one place."}
          </p>
          <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
            <button 
              onClick={() => onNavigate('chat')}
              className="w-full sm:w-auto bg-white text-emerald-600 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-lg shadow-emerald-900/20"
            >
              Start AI Analysis <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto bg-emerald-700/50 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all border border-emerald-400/30"
            >
              View Dashboard
            </button>
          </div>
        </div>
        <div className="hidden md:block w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl absolute -right-20 -top-20" />
      </motion.div>

      {/* Features Section */}
      <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className={cn(
              "healio-card group hover:border-emerald-200 transition-all",
              idx === 2 && "sm:col-span-2 lg:col-span-1"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h2 className="text-xl mb-3 font-bold">{feature.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Activity & Appointments */}
      <motion.div 
        variants={itemVariants}
        className="col-span-12 lg:col-span-8 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
          <button onClick={() => onNavigate('dashboard')} className="text-sm font-bold text-emerald-600 hover:underline">View History</button>
        </div>
        <div className="healio-card min-h-[300px] flex flex-col p-6 sm:p-8">
          {activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100 relative overflow-hidden">
                  {item.severity && (
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5",
                      item.severity === 'critical' ? "bg-rose-500" :
                      item.severity === 'moderate' ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                  )}
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0",
                    item.severity === 'critical' ? "bg-rose-50 text-rose-600" :
                    item.severity === 'moderate' ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {item.type === 'symptom' ? <Activity size={18} /> : 
                     item.type === 'chat' ? <MessageSquare size={18} /> : <Calendar size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                      {item.type === 'symptom' ? 'Symptom Logged' : 
                       item.type === 'chat' ? 'AI Consultation' : 'Upcoming Appointment'} • {format(item.date, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveActivity(item);
                      }}
                      className="p-1.5 sm:p-2 text-slate-300 hover:text-red-500 transition-colors"
                      title="Remove activity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 w-full py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock size={32} className="text-slate-400" />
              </div>
              <p className="font-bold text-slate-900 w-full max-w-[600px] whitespace-normal">No recent activity</p>
              <p className="text-sm text-slate-500 w-full max-w-[600px] whitespace-normal">Your health updates will appear here.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upcoming & Insights */}
      <motion.div 
        variants={itemVariants}
        className="col-span-12 lg:col-span-4 space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming</h2>
          <button onClick={() => onNavigate('appointments')} className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors">
            <Plus size={20} />
          </button>
        </div>
        <div className="healio-card min-h-[300px] flex flex-col p-6 sm:p-8 bg-slate-900 border-none text-white overflow-hidden relative">
          {nextAppointment ? (
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Calendar size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Next Visit</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold mb-2">{nextAppointment.doctor.name}</p>
              <p className="text-emerald-400/80 text-xs sm:text-sm font-medium mb-8">{nextAppointment.doctor.specialty}</p>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Date</p>
                  <p className="font-bold text-sm sm:text-base">{format(nextAppointment.date, 'MMM dd')}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Time</p>
                  <p className="font-bold text-sm sm:text-base">{nextAppointment.time}</p>
                </div>
              </div>
              
              <button 
                onClick={() => onNavigate('appointments')}
                className="mt-8 w-full py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all"
              >
                Manage Appointments
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center w-full py-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20 mb-4 mx-auto">
                <Calendar size={32} />
              </div>
              <p className="font-bold text-white mb-1 w-full max-w-[600px] whitespace-normal">No data available</p>
              <p className="text-sm text-white/40 mb-6 w-full max-w-[600px] whitespace-normal">You have no upcoming appointments scheduled.</p>
              <button 
                onClick={() => onNavigate('appointments')}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-500 transition-all"
              >
                Schedule Now
              </button>
            </div>
          )}
          {/* Background Glow */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
        </div>
      </motion.div>
    </motion.div>
  );
}
