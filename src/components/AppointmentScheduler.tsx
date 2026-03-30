import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Check, ChevronLeft, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';

const doctors = [
  { id: '1', name: 'Dr. Sarah Johnson', specialty: 'General Physician', rating: 4.9, reviews: 124 },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'Dermatologist', rating: 4.8, reviews: 89 },
  { id: '3', name: 'Dr. Emily Williams', specialty: 'Pediatrician', rating: 5.0, reviews: 210 },
  { id: '4', name: 'Dr. David Miller', specialty: 'Cardiologist', rating: 4.7, reviews: 56 },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', 
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const ICON_SIZE = 24;
const ICON_STROKE = 2;

interface AppointmentSchedulerProps {
  appointments: any[];
  setAppointments: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function AppointmentScheduler({ appointments, setAppointments }: AppointmentSchedulerProps) {
  const [view, setView] = useState<'book' | 'upcoming'>(appointments.length > 0 ? 'upcoming' : 'book');
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [selectedTime, setSelectedTime] = useState('');
  const [isBooked, setIsBooked] = useState(false);

  const nextDays = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  const handleBook = () => {
    const newAppointment = {
      id: `app-${Date.now()}`,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
    };
    setAppointments([...appointments, newAppointment]);
    setIsBooked(true);
  };

  if (isBooked) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="healio-card flex flex-col items-center justify-center h-full text-center p-12 w-full"
      >
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-8 mx-auto">
          <Check size={48} strokeWidth={3} />
        </div>
        <h1 className="w-full max-w-[600px] whitespace-normal">Appointment Confirmed!</h1>
        <p className="mt-4 mb-10 w-full max-w-[600px] whitespace-normal">
          Your appointment with <span className="font-bold text-slate-900">{selectedDoctor.name}</span> is scheduled for <span className="text-emerald-600 font-bold">{format(selectedDate, 'MMM dd')}</span> at <span className="text-emerald-600 font-bold">{selectedTime}</span>.
        </p>
        <button 
          onClick={() => { setIsBooked(false); setStep(1); setSelectedDoctor(null); setView('upcoming'); }}
          className="btn-primary"
        >
          View My Appointments
        </button>
      </motion.div>
    );
  }

  return (
    <div className="healio-card h-full flex flex-col overflow-hidden p-0">
      {/* Header Section */}
      <div className="p-4 sm:p-8 bg-slate-50 border-b border-slate-100 flex flex-col gap-4 sm:gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Appointments</h2>
          {view === 'book' && (
            <div className="flex gap-1.5 sm:gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300", step >= i ? "bg-emerald-600 w-4 sm:w-6" : "bg-slate-200")} />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex p-1 bg-white rounded-full border border-slate-200">
          <button 
            onClick={() => setView('book')}
            className={cn(
              "flex-1 py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all",
              view === 'book' ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Plus size={14} />
            <span className="hidden xs:inline">Schedule New</span>
            <span className="xs:hidden">New</span>
          </button>
          <button 
            onClick={() => setView('upcoming')}
            className={cn(
              "flex-1 py-2.5 sm:py-3 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all",
              view === 'upcoming' ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <CalendarIcon size={14} />
            <span className="hidden xs:inline">Upcoming ({appointments.length})</span>
            <span className="xs:hidden">Visits ({appointments.length})</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">
        <AnimatePresence mode="wait">
          {view === 'upcoming' ? (
            <motion.div
              key="upcoming"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Your Scheduled Visits</div>
              {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((app) => (
                      <div 
                        key={app.id}
                        className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 flex items-center gap-4 sm:gap-6 group hover:border-emerald-200 transition-all shadow-sm"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <CalendarIcon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">{app.doctor.name}</h4>
                          <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">{app.doctor.specialty}</p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-2 sm:mt-3">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-emerald-600">
                              <CalendarIcon size={12} />
                              {format(app.date, 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-slate-400">
                              <Clock size={12} />
                              {app.time}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => cancelAppointment(app.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors sm:opacity-0 group-hover:opacity-100"
                          title="Cancel Appointment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                    <CalendarIcon size={32} />
                  </div>
                  <p className="font-bold text-slate-900">No upcoming appointments</p>
                  <button 
                    onClick={() => setView('book')}
                    className="mt-4 btn-secondary text-sm"
                  >
                    Schedule one now
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Select a Specialist</div>
                  <div className="space-y-4">
                    {doctors.map((doc) => (
                      <div 
                        key={doc.id}
                        onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                        className="p-4 sm:p-6 rounded-2xl bg-white border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer flex items-center gap-4 sm:gap-6 group shadow-sm"
                      >
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0 flex items-center justify-center">
                          <User size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate">{doc.name}</h4>
                          <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">{doc.specialty}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs sm:text-sm font-black text-emerald-600">★ {doc.rating}</div>
                          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400">{doc.reviews} revs</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">
                    <ChevronLeft size={16} /> Back to specialists
                  </button>
                  
                  <section>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Select Date</div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {nextDays.map((date) => (
                        <button
                          key={date.toString()}
                          onClick={() => setSelectedDate(date)}
                          className={cn(
                            "flex flex-col items-center justify-center min-w-[70px] p-4 rounded-2xl transition-all",
                            isSameDay(selectedDate, date) 
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                              : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest mb-1">{format(date, 'EEE')}</span>
                          <span className="text-xl font-black">{format(date, 'dd')}</span>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Select Time</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "p-4 text-sm font-bold rounded-xl transition-all",
                            selectedTime === time 
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </section>

                  <button 
                    disabled={!selectedTime}
                    onClick={() => setStep(3)}
                    className="w-full btn-primary"
                  >
                    Continue to Summary
                  </button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">
                    <ChevronLeft size={16} /> Back to time selection
                  </button>

                  <div className="p-8 bg-slate-50 rounded-3xl space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-4">Booking Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Specialist</span>
                        <span className="font-bold text-slate-900">{selectedDoctor.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Specialty</span>
                        <span className="font-bold text-emerald-600">{selectedDoctor.specialty}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</span>
                        <span className="font-bold text-slate-900">{format(selectedDate, 'MMMM dd, yyyy')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Time</span>
                        <span className="font-bold text-slate-900">{selectedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-2xl flex gap-4">
                    <div className="text-emerald-600 shrink-0"><Clock size={20} /></div>
                    <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                      A confirmation email will be sent to your registered address. Please arrive 10 minutes before your scheduled time for check-in.
                    </p>
                  </div>

                  <button 
                    onClick={handleBook}
                    className="w-full btn-primary"
                  >
                    Confirm Appointment
                  </button>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
