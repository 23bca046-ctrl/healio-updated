import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Activity, Lock, ArrowRight } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { cn } from '../lib/utils';
import Logo from './Logo';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in window was closed. Please try again and complete the sign-in process. If this keeps happening, try opening the app in a new tab.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site or try opening the app in a new tab.");
      } else if (err.code === 'auth/cancelled-via-interactive-widget') {
        setError("Sign-in was cancelled. Please try again.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a18] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl flex flex-col items-center z-10"
      >
        {/* Logo Section */}
        <div className="mb-12 text-center">
          <Logo className="mb-4 scale-125 mx-auto" variant="dark" vertical={true} />
        </div>

        {/* Tagline */}
        <p className="text-slate-400 text-lg font-medium mb-12 text-center">
          Your AI-powered healthcare companion
        </p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className={cn(
            "w-full max-w-md py-5 px-8 bg-white text-slate-900 rounded-[24px] font-black flex items-center justify-center gap-4 hover:bg-slate-100 active:scale-95 transition-all shadow-2xl shadow-white/5 group mb-16",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              <span className="uppercase tracking-[0.15em] text-sm">Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="w-full flex items-center gap-4 mb-16 opacity-20">
          <div className="flex-1 h-[1px] bg-slate-400"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">Secure Access</span>
          <div className="flex-1 h-[1px] bg-slate-400"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-6 w-full mb-16">
          {[
            { icon: <Shield size={24} />, label: "Secure", color: "text-emerald-400" },
            { icon: <Activity size={24} />, label: "AI Analysis", color: "text-amber-400" },
            { icon: <Lock size={24} />, label: "Private", color: "text-indigo-400" }
          ].map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-900/50 border border-slate-800 rounded-[24px] flex items-center justify-center shadow-inner">
                <div className={feature.color}>
                  {feature.icon}
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-4 bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest rounded-xl text-center border border-rose-500/20 w-full"
          >
            {error}
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-slate-600 text-[11px] font-medium">
            By continuing, you agree to Healio's
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
            <button className="text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-4">Terms of Service</button>
            <span className="text-slate-700">and</span>
            <button className="text-slate-400 hover:text-emerald-400 transition-colors underline underline-offset-4">Privacy Policy</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
