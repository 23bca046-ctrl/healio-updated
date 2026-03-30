import React from 'react';
import { Calendar, Heart, Thermometer, Activity, MessageSquare, TrendingUp, Sparkles, ArrowRight, Clock, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate?: (tab: 'home' | 'dashboard' | 'chat' | 'appointments' | 'settings') => void;
  symptoms: any[];
  appointments: any[];
  chatHistory: any[];
  lastBotInteraction: Date | null;
  setSymptoms: React.Dispatch<React.SetStateAction<any[]>>;
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
}

const ICON_SIZE = 24;
const ICON_STROKE = 2;

export default function Dashboard({ onNavigate, symptoms, appointments, chatHistory, lastBotInteraction, setSymptoms, setChatHistory }: DashboardProps) {
  const healthScore = 100 - (symptoms.length * 2);
  
  const chatInteractions = chatHistory
    .filter(m => m.role === 'bot' && (m.problemName || m.content.length > 0))
    .map(m => ({ 
      name: m.problemName || 'AI Consultation', 
      date: m.timestamp, 
      type: 'chat', 
      id: m.id,
      severity: m.severity
    }));

  const stats = [
    {
      label: 'Symptom Checks',
      value: symptoms.length.toString(),
      trend: symptoms.length > 0 ? '+12%' : null,
      icon: <Activity size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
    },
    {
      label: 'Health Score',
      value: `${healthScore}/100`,
      trend: healthScore > 90 ? '+3' : '-2',
      icon: <Heart size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
    },
    {
      label: 'Last Check',
      value: symptoms.length > 0 ? (symptoms[0].severity?.charAt(0).toUpperCase() + symptoms[0].severity?.slice(1) || 'Unknown') : 'None',
      trend: symptoms.length > 0 ? (symptoms[0].severity === 'critical' ? 'Alert' : 'Stable') : null,
      icon: <Activity size={ICON_SIZE} strokeWidth={ICON_STROKE} className={cn(
        symptoms.length > 0 && symptoms[0].severity === 'critical' ? "text-rose-500" :
        symptoms.length > 0 && symptoms[0].severity === 'moderate' ? "text-amber-500" : "text-emerald-500"
      )} />,
    },
    {
      label: 'Upcoming',
      value: appointments.length > 0 ? appointments.length.toString() : 'None',
      icon: <Calendar size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
    },
  ];

  const healthTips = [
    { id: 1, text: 'Stay hydrated — aim for 8 glasses of water daily.' },
    { id: 2, text: 'Get 7–9 hours of sleep for optimal recovery.' },
    { id: 3, text: 'Take short walking breaks every hour if sedentary.' },
    { id: 4, text: 'Practice deep breathing for 5 minutes to reduce stress.' },
  ];

  const handleRemoveActivity = (item: any) => {
    if (item.type === 'symptom') {
      setSymptoms(prev => prev.filter(s => s.name !== item.name || s.date !== item.date));
    } else if (item.type === 'chat') {
      setChatHistory(prev => {
        const index = prev.findIndex(m => m.id === item.id);
        if (index === -1) return prev;
        const newHistory = [...prev];
        newHistory.splice(index, 1);
        if (newHistory[index] && newHistory[index].role === 'bot') {
          newHistory.splice(index, 1);
        }
        return newHistory;
      });
    }
  };

  const activityFeed = [
    ...symptoms.map(s => ({ ...s, type: 'symptom' })),
    ...chatInteractions
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="grid grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="col-span-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Health Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">Track your wellness journey and symptom history.</p>
        </div>
        <button 
          onClick={() => onNavigate?.('chat')}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <MessageSquare size={18} />
          Consult Healio AI
        </button>
      </div>

      {/* Stats Grid */}
      <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="healio-card flex flex-col justify-between min-h-[180px] group hover:border-emerald-200 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                {stat.icon}
              </div>
              {stat.trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  <TrendingUp size={12} />
                  {stat.trend}
                </div>
              )}
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="col-span-12 lg:col-span-7 healio-card flex flex-col min-h-[400px]"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Recent History</h2>
          {activityFeed.length > 0 && (
            <button onClick={() => onNavigate?.('chat')} className="text-xs font-bold text-emerald-600 hover:underline">New Analysis</button>
          )}
        </div>
        
        <div className="flex-1">
          {activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between group hover:bg-slate-100 transition-all relative overflow-hidden">
                  {item.severity && (
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5",
                      item.severity === 'critical' ? "bg-rose-500" :
                      item.severity === 'moderate' ? "bg-amber-500" : "bg-emerald-500"
                    )} />
                  )}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0",
                      item.severity === 'critical' ? "text-rose-500" :
                      item.severity === 'moderate' ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {item.type === 'symptom' ? <Activity size={18} /> : <MessageSquare size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                        {item.type === 'symptom' ? 'Symptom Logged' : 'AI Consultation'} • {format(item.date, 'MMM dd, yyyy')}
                      </p>
                    </div>
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
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => onNavigate?.('chat')}
                      className="p-1.5 sm:p-2 text-slate-300 hover:text-emerald-600 transition-colors"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 h-full opacity-50 w-full py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-slate-300 mx-auto">
                <Clock size={32} />
              </div>
              <p className="font-bold text-slate-900 mb-1 w-full max-w-[600px] whitespace-normal">No activity yet</p>
              <p className="text-sm w-full max-w-[600px] mb-6 whitespace-normal">Your recent health activities and symptom reports will appear here once you start using Healio AI.</p>
              <button 
                onClick={() => onNavigate?.('chat')}
                className="btn-secondary text-sm"
              >
                Start a check
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-12 lg:col-span-5 healio-card"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Health Tips</h2>
        <div className="space-y-4">
          {healthTips.map((tip) => (
            <div key={tip.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                {tip.id}
              </div>
              <p className="text-sm font-medium text-slate-700">{tip.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12 healio-card bg-slate-900 border-none p-10 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
          <Sparkles size={160} className="text-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Sparkles size={20} />
            </div>
            <h2 className="text-white text-2xl font-bold">Healio Insights</h2>
          </div>
          <div className="max-w-3xl">
            <div className="text-2xl text-white font-bold leading-tight mb-8 space-y-4">
              {symptoms.length > 0 ? (
                <>
                  <p>
                    "We've analyzed your recent logs: <span className="text-emerald-400">{symptoms.map(s => s.name).join(', ')}</span>. 
                    It's important to monitor these patterns over the next few days."
                  </p>
                  <p className="text-sm font-medium text-slate-400 border-l-2 border-emerald-500 pl-4 py-1 italic">
                    Advice: Ensure you're getting adequate rest and staying hydrated. If symptoms persist or worsen, please consult with a healthcare professional.
                  </p>
                </>
              ) : (
                <p>"Based on your recent activity, your health score remains optimal. No new symptoms have been reported in the last 24 hours."</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate?.('chat')}
                className="px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                Consult AI Assistant
                <ArrowRight size={20} />
              </button>
              <div className="px-6 py-4 rounded-2xl bg-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center">
                System: Stable
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
