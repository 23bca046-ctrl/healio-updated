import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  LogOut, 
  ChevronRight, 
  Camera,
  Mail,
  Lock,
  Smartphone,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { auth, logout } from '../firebase';

interface SettingsProps {
  user: any;
}

export default function Settings({ user }: SettingsProps) {
  const [activeSection, setActiveSection] = useState('account');
  const [isEditing, setIsEditing] = useState(false);

  const sections = [
    { id: 'account', label: 'Account Settings', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your account and app preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-4 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                if (section.id !== 'account') setIsEditing(false);
              }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm group",
                activeSection === section.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <section.icon size={20} />
                <span>{section.label}</span>
              </div>
              <ChevronRight 
                size={16} 
                className={cn(
                  "transition-transform",
                  activeSection === section.id ? "rotate-90" : "group-hover:translate-x-1"
                )} 
              />
            </button>
          ))}
          
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-rose-600 font-bold text-sm bg-white border border-slate-100 hover:bg-rose-50 hover:border-rose-100 transition-all mt-8"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="healio-card min-h-[500px]"
          >
            {activeSection === 'account' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-sm">
                        <img 
                          src={user?.photoURL || "https://picsum.photos/seed/user/200/200"} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {isEditing && (
                        <button className="absolute -bottom-2 -right-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all">
                          <Camera size={16} />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{user?.displayName || 'User'}</h3>
                      <p className="text-slate-500 font-medium">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                        Premium Member
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={cn(
                      "px-6 py-2 rounded-xl font-bold text-sm transition-all",
                      isEditing 
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    )}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-emerald-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Personal Information</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.displayName || ''} 
                        className={cn(
                          "healio-input w-full text-sm",
                          !isEditing && "bg-slate-50/50 cursor-not-allowed border-transparent"
                        )}
                        placeholder="Enter full name"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email || ''} 
                        className="healio-input w-full text-sm bg-slate-50/50 cursor-not-allowed border-transparent"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                      <input 
                        type="tel" 
                        className={cn(
                          "healio-input w-full text-sm",
                          !isEditing && "bg-slate-50/50 cursor-not-allowed border-transparent"
                        )}
                        placeholder="+1 (555) 000-0000"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Profile Section */}
                <div className="space-y-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Activity size={18} className="text-emerald-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Medical Profile</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label>
                      <select 
                        className={cn(
                          "healio-input w-full text-sm appearance-none bg-slate-50",
                          !isEditing && "cursor-not-allowed border-transparent"
                        )}
                        disabled={!isEditing}
                      >
                        <option value="">Select Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allergies & Sensitivities</label>
                      <input 
                        type="text" 
                        className={cn(
                          "healio-input w-full text-sm",
                          !isEditing && "bg-slate-50/50 cursor-not-allowed border-transparent"
                        )}
                        placeholder="e.g. Peanuts, Penicillin"
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronic Diseases</label>
                      <input 
                        type="text" 
                        className={cn(
                          "healio-input w-full text-sm",
                          !isEditing && "bg-slate-50/50 cursor-not-allowed border-transparent"
                        )}
                        placeholder="e.g. Diabetes, Asthma"
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-6 border-t border-slate-100">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="btn-primary w-full sm:w-auto px-12"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Notification Preferences</h3>
                
                {[
                  { id: 'push', label: 'Push Notifications', desc: 'Get real-time alerts on your device', icon: Smartphone },
                  { id: 'email', label: 'Email Reports', desc: 'Weekly health summaries and insights', icon: Mail },
                  { id: 'reminders', label: 'Appointment Reminders', desc: 'Never miss a check-up', icon: Bell },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Security & Privacy</h3>
                
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-sm">
                        <Lock size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Change Password</p>
                        <p className="text-xs text-slate-500">Update your account password</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-sm">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                        <p className="text-xs text-slate-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg">Disabled</div>
                  </button>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-rose-600 mb-4 uppercase tracking-wider">Danger Zone</h4>
                  <button className="px-6 py-3 rounded-xl border border-rose-200 text-rose-600 font-bold text-sm hover:bg-rose-50 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">App Preferences</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-slate-900">
                      <Moon size={20} />
                      <span className="font-bold">Theme</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 rounded-xl bg-white border-2 border-emerald-500 text-emerald-600 font-bold text-xs shadow-sm">Light</button>
                      <button className="flex-1 py-2 rounded-xl bg-white border border-slate-200 text-slate-400 font-bold text-xs hover:bg-slate-50">Dark</button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-slate-900">
                      <Globe size={20} />
                      <span className="font-bold">Language</span>
                    </div>
                    <select className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
