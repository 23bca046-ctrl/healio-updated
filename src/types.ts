export type Message = {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  problemName?: string;
  severity?: 'mild' | 'moderate' | 'critical';
};

export type Appointment = {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
};

export type HealthTip = {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'mental-health' | 'preventive';
};
