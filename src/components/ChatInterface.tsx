import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, CheckCheck, Trash2, PlusCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { healthcareBot } from '../services/gemini';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { Type } from '@google/genai';

const identifyProblemTool = {
  functionDeclarations: [
    {
      name: "identifyProblem",
      description: "Tag the conversation with the identified problem name and its severity.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          problemName: {
            type: Type.STRING,
            description: "The name of the health problem identified (e.g., 'Migraine', 'Flu').",
          },
          severity: {
            type: Type.STRING,
            description: "The severity of the problem.",
            enum: ["mild", "moderate", "critical"],
          },
        },
        required: ["problemName", "severity"],
      },
    },
  ],
};

const TypingIndicator = () => (
  <div className="flex gap-1 p-4 bg-white rounded-2xl rounded-tl-none w-20 items-center justify-center shadow-sm border border-slate-100">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
      className="w-2 h-2 bg-emerald-600 rounded-full"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
      className="w-2 h-2 bg-emerald-600 rounded-full"
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
      className="w-2 h-2 bg-emerald-600 rounded-full"
    />
  </div>
);

interface ChatInterfaceProps {
  onNavigate?: (tab: any) => void;
  symptoms: any[];
  chatHistory: Message[];
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  onAddSymptom: (symptom: any) => void;
  onInteraction: () => void;
}

export default function ChatInterface({ onNavigate, symptoms, chatHistory, setChatHistory, onAddSymptom, onInteraction }: ChatInterfaceProps) {
  const initialMessage: Message = {
    id: '1',
    role: 'bot',
    content: "Hello! I'm Healio, your AI healthcare assistant. How can I help you today? You can tell me about any symptoms you're experiencing or ask health-related questions.",
    timestamp: new Date(),
  };

  const messages = chatHistory.length > 0 ? chatHistory : [initialMessage];
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const clearChat = () => {
    setChatHistory([]);
    setShowConfirmClear(false);
  };

  const handleQuickAction = async (prompt: string) => {
    if (isLoading) return;
    setInput(prompt);
    await handleSend(prompt);
  };

  const handleSend = async (overrideInput?: string) => {
    const currentInput = overrideInput || input;
    if (!currentInput.trim() || isLoading) return;

    onInteraction(); // Trigger interaction update on send

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: new Date(),
      status: 'read'
    };

    setChatHistory((prev) => [...(prev.length === 0 ? [initialMessage] : prev), userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const botMessageId = (Date.now() + 1).toString();
      let botContent = '';
      
      // Pass symptoms as context to the bot
      const contextPrompt = symptoms.length > 0 
        ? `[Context: User has previously reported these symptoms: ${symptoms.map(s => s.name).join(', ')}] `
        : '';

      const stream = await healthcareBot({
        contents: [
          ...messages, 
          { ...userMessage, content: contextPrompt + userMessage.content }
        ].map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        tools: [identifyProblemTool],
      });

      setIsTyping(false);
      onInteraction(); // Trigger interaction update on bot response start

      setChatHistory((prev) => [
        ...prev,
        { id: botMessageId, role: 'bot', content: '', timestamp: new Date() },
      ]);

      let problemName = '';
      let severity: 'mild' | 'moderate' | 'critical' = 'mild';

      for await (const chunk of stream) {
        if (chunk.text) {
          botContent += chunk.text;
          setChatHistory((prev) =>
            prev.map((m) =>
              m.id === botMessageId ? { ...m, content: botContent } : m
            )
          );
        }
        
        if (chunk.functionCalls) {
          const call = chunk.functionCalls.find(f => f.name === 'identifyProblem');
          if (call) {
            problemName = (call.args as any).problemName;
            severity = (call.args as any).severity;
          }
        }
      }

      if (problemName) {
        setChatHistory(prev => prev.map(m => 
          m.id === botMessageId ? { ...m, problemName, severity } : m
        ));
      }
      onInteraction(); // Trigger interaction update on bot response end
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'bot',
          content: "I'm sorry, I encountered an error. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Start Symptom Check", icon: "🩺", prompt: "I'd like to start a symptom check." },
    { label: "General Health Question", icon: "❓", prompt: "I have a general health question." },
    { label: "Appointment Help", icon: "📅", prompt: "I need help with an appointment." },
  ];

  const [newSymptomName, setNewSymptomName] = useState('');
  const [newSymptomSeverity, setNewSymptomSeverity] = useState<'mild' | 'moderate' | 'critical'>('mild');
  const [showSymptomModal, setShowSymptomModal] = useState(false);

  const saveSymptom = () => {
    if (!newSymptomName.trim()) return;
    onAddSymptom({
      name: newSymptomName,
      date: new Date(),
      severity: newSymptomSeverity,
    });
    onInteraction(); // Trigger interaction update on symptom log
    setNewSymptomName('');
    setNewSymptomSeverity('mild');
    setShowSymptomModal(false);
    
    // Add a system message to the chat
    setChatHistory(prev => [...(prev.length === 0 ? [initialMessage] : prev), {
      id: Date.now().toString(),
      role: 'bot',
      content: `✅ I've logged **${newSymptomName}** to your health dashboard. You can track it there.`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="healio-card h-full flex flex-col p-0 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Healio AI Assistant</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">System Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => setShowSymptomModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-emerald-100 transition-all"
          >
            <PlusCircle size={14} />
            <span className="hidden xs:inline">Log Symptom</span>
            <span className="xs:hidden">Log</span>
          </button>
          {showConfirmClear ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
              <button
                onClick={clearChat}
                className="px-3 sm:px-4 py-2 bg-rose-500 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-rose-600 transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 sm:px-4 py-2 bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="p-2 sm:p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Clear Chat"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:y-8 scrollbar-hide bg-slate-50/30">
        <AnimatePresence initial={false}>
          {messages.length === 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="p-6 bg-white rounded-3xl text-left border border-slate-100 hover:border-emerald-200 transition-all group shadow-sm"
                >
                  <span className="text-3xl mb-4 block">{action.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-emerald-600 transition-colors block">{action.label}</span>
                </button>
              ))}
            </motion.div>
          )}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "flex gap-3 sm:gap-4 max-w-[95%] sm:max-w-[90%] md:max-w-[80%]",
                message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                message.role === 'user' ? "bg-slate-900 text-slate-400" : "bg-emerald-50 text-emerald-600"
              )}>
                {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "p-4 sm:p-6 rounded-3xl transition-all shadow-sm",
                message.role === 'user' 
                  ? "bg-emerald-600 text-white rounded-tr-none" 
                  : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
              )}>
                <div className={cn("prose prose-sm max-w-none font-medium leading-relaxed", message.role === 'user' ? "prose-invert" : "text-slate-900")}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-3 sm:mt-4 flex items-center gap-2 opacity-60",
                  message.role === 'user' ? "justify-end text-emerald-100" : "justify-start text-slate-400"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.role === 'user' && (
                    <CheckCheck size={14} className="text-emerald-300" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="flex gap-4 mr-auto"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={20} />
              </div>
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-8 bg-white border-t border-slate-100">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe symptoms..."
            className="healio-input w-full pr-14 sm:pr-16 py-3 sm:py-4"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="absolute right-1.5 sm:right-2 p-2.5 sm:p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-200"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-center text-slate-400 mt-4 sm:mt-6">
          Healio provides preliminary information and is not a substitute for professional medical advice.
        </p>
      </div>

      {/* Symptom Modal */}
      <AnimatePresence>
        {showSymptomModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-10 w-full max-w-md min-w-[320px] shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Activity size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 w-full max-w-[600px] whitespace-normal">Log New Symptom</h3>
              <p className="text-slate-500 text-sm mb-8 w-full max-w-[600px] whitespace-normal">This will be saved to your dashboard for tracking and AI analysis.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Symptom Name</label>
                  <input 
                    type="text" 
                    value={newSymptomName}
                    onChange={(e) => setNewSymptomName(e.target.value)}
                    placeholder="e.g. Mild Headache, Back Pain"
                    className="healio-input w-full"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Severity</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'mild', label: 'Mild', color: 'bg-emerald-500' },
                      { id: 'moderate', label: 'Moderate', color: 'bg-amber-500' },
                      { id: 'critical', label: 'Critical', color: 'bg-rose-500' }
                    ].map((sev) => (
                      <button
                        key={sev.id}
                        onClick={() => setNewSymptomSeverity(sev.id as any)}
                        className={cn(
                          "flex-1 py-3 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2",
                          newSymptomSeverity === sev.id 
                            ? `border-${sev.id === 'mild' ? 'emerald' : sev.id === 'moderate' ? 'amber' : 'rose'}-500 ${sev.color} text-white` 
                            : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={saveSymptom}
                    className="flex-1 btn-primary"
                  >
                    Save Symptom
                  </button>
                  <button 
                    onClick={() => setShowSymptomModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
