import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ShieldCheck, ChevronLeft, Lock, Sun, Moon, Settings, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { Toast, Modal, Input, Button } from '../components/ui';
import { requestOtpFromBackend, verifyOtpWithBackend } from '../utils/api';
import { sendOtpEmail, saveEmailConfig, getEmailConfig, clearEmailConfig } from '../utils/email';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, theme, toggleTheme } = useAppStore();
  
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  
  // Auth Protocol State (keeping for fallback, but using backend primarily)
  const [otpInput, setOtpInput] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);

  // Email Config Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [emailConfig, setEmailConfig] = useState({ serviceId: '', templateId: '', publicKey: '' });
  const [isConfigSaved, setIsConfigSaved] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }>({
    visible: false,
    message: '',
    type: 'info'
  });

  // Load existing config on mount
  useEffect(() => {
    const existing = getEmailConfig();
    if (existing) {
      setEmailConfig(existing);
      setIsConfigSaved(true);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Sync theme initially
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const handleSaveConfig = () => {
    if (!emailConfig.serviceId || !emailConfig.templateId || !emailConfig.publicKey) {
      setError('All fields are required.');
      return;
    }
    saveEmailConfig(emailConfig);
    setIsConfigSaved(true);
    setIsConfigModalOpen(false);
    showToast('Email service configured successfully!', 'success');
    setError('');
  };

  const handleClearConfig = () => {
    clearEmailConfig();
    setEmailConfig({ serviceId: '', templateId: '', publicKey: '' });
    setIsConfigSaved(false);
    showToast('Email configuration removed.', 'info');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setToast(prev => ({ ...prev, visible: false }));

    // Allow @gmail.com for testing purposes
    const domainRegex = /^[a-zA-Z0-9._%+-]+@(iitrpr\.ac\.in|gmail\.com)$/;
    
    if (!domainRegex.test(email)) {
      setError('Access restricted to @iitrpr.ac.in accounts (or @gmail.com for testing).');
      setIsLoading(false);
      return;
    }
    
    // --- REQUEST OTP FROM BACKEND ---
    try {
      await requestOtpFromBackend(email);
      
      // If backend successfully sent OTP
      showToast(`Verification code sent to ${email}`, 'success');
      setIsLoading(false);
      setStep('OTP');
      setTimer(30);
    } catch (err: any) {
      console.error('OTP request error:', err);
      const errorMessage = err.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      showToast(errorMessage, 'error');
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setOtpInput('');
    setError('');
    setIsLoading(true);
    
    try {
      await requestOtpFromBackend(email);
      showToast('New verification code sent to your email', 'success');
      setIsLoading(false);
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend code. Please try again.');
      setIsLoading(false);
      showToast(err.message || 'Failed to resend code', 'error');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verify OTP with backend
      const result = await verifyOtpWithBackend(email, otpInput);
      
      if (result.success && result.token && result.user) {
        showToast('Verification successful. Logging in...', 'success');
        
        // Convert backend user format to frontend User format
        const frontendUser = {
          id: result.user.id?.toString() || email,
          name: result.user.name || email.split('@')[0],
          email: result.user.email || email,
          role: result.user.role as any, // Backend role should match UserRole enum
          status: result.user.is_active ? 'Active' as const : 'Inactive' as const,
        };
        
        // Login with backend data
        login(email, frontendUser, result.token);
        
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const errorMessage = err.message || 'Invalid or expired code. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      <Toast 
        isVisible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, visible: false }))} 
      />

      {/* Config Modal */}
      <Modal 
        isOpen={isConfigModalOpen} 
        onClose={() => setIsConfigModalOpen(false)} 
        title="Configure Real Email Sending"
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            To make this app send real emails, create a free account at <a href="https://emailjs.com" target="_blank" className="text-blue-500 hover:underline">EmailJS.com</a>.
          </p>
          
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] text-blue-400 space-y-1">
            <p className="font-bold">REQUIRED DASHBOARD SETTINGS:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Template Body: use variable <code className="bg-black/20 px-1 rounded text-white">{'{{otp_code}}'}</code></li>
              <li>Settings &gt; <strong>To Email</strong>: must be <code className="bg-black/20 px-1 rounded text-white">{'{{to_email}}'}</code> (Dynamic Recipient)</li>
            </ul>
          </div>

          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Service ID (e.g., service_gmail)</label>
            <Input 
              value={emailConfig.serviceId} 
              onChange={(e) => setEmailConfig({...emailConfig, serviceId: e.target.value})} 
              placeholder="service_..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Template ID (e.g., template_otp)</label>
            <Input 
              value={emailConfig.templateId} 
              onChange={(e) => setEmailConfig({...emailConfig, templateId: e.target.value})} 
              placeholder="template_..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-secondary block mb-1">Public Key (User ID)</label>
            <Input 
              value={emailConfig.publicKey} 
              onChange={(e) => setEmailConfig({...emailConfig, publicKey: e.target.value})} 
              placeholder="user_..."
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="w-full" onClick={handleSaveConfig}>Save Configuration</Button>
            {isConfigSaved && (
              <Button variant="danger" onClick={handleClearConfig}>Clear</Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(120,120,120,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(120,120,120,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Top Controls */}
        <div className="absolute top-0 right-0 -mt-16 flex gap-3">
          <button 
             onClick={() => setIsConfigModalOpen(true)}
             className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-all ${isConfigSaved ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-surface border-border text-secondary hover:text-primary'}`}
          >
             {isConfigSaved ? <CheckCircle size={14} /> : <Settings size={14} />}
             {isConfigSaved ? 'Email Active' : 'Setup Email'}
          </button>
          <button 
             onClick={toggleTheme}
             className="p-1.5 text-secondary hover:text-primary transition-colors"
          >
             {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-primary text-background rounded-xl mx-auto flex items-center justify-center shadow-lg mb-4">
              <span className="font-bold text-2xl tracking-tighter">A</span>
           </div>
           <h1 className="text-2xl font-bold text-primary tracking-tight">AIMS Portal</h1>
           <p className="text-secondary text-sm mt-1">Academic Information Management System</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 'EMAIL' ? (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-primary">Sign In</h2>
                    <p className="text-sm text-secondary">Enter your institute email to continue</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">Institute Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-3 text-secondary group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@iitrpr.ac.in"
                        className="w-full bg-input border border-border rounded-xl py-2.5 pl-10 pr-4 text-primary placeholder-secondary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs flex items-center gap-1.5 bg-red-500/10 p-2 rounded-lg border border-red-500/10">
                      <ShieldCheck size={12} /> {error}
                    </motion.div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading || !email}
                    className="w-full bg-primary text-background font-medium py-2.5 rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Continue <ArrowRight size={18} /></>}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleOtpSubmit}
                  className="space-y-4"
                >
                  <button 
                    type="button" 
                    onClick={() => { setStep('EMAIL'); setError(''); setToast(prev => ({...prev, visible: false})); }} 
                    className="text-secondary hover:text-primary text-xs flex items-center gap-1 mb-4 transition-colors"
                  >
                    <ChevronLeft size={14} /> Back to Email
                  </button>

                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500">
                      <Lock size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-primary">Verify Identity</h2>
                    <p className="text-sm text-secondary">Enter the code sent to <span className="text-primary">{email}</span></p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-secondary uppercase tracking-wide">6-Digit Code</label>
                    <input 
                      type="text" 
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full bg-input border border-border rounded-xl py-3 text-center text-2xl tracking-[0.5em] font-mono text-primary placeholder-secondary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-xs flex items-center justify-center gap-1.5 bg-red-500/10 p-2 rounded-lg border border-red-500/10">
                      <ShieldCheck size={12} /> {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading || otpInput.length !== 6}
                    className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
                  </button>

                  <div className="text-center">
                    <button 
                      type="button"
                      disabled={timer > 0}
                      className="text-xs text-secondary hover:text-primary disabled:opacity-50 disabled:hover:text-secondary transition-colors"
                      onClick={handleResend}
                    >
                      {timer > 0 ? `Resend code in ${timer}s` : "Resend code"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          
          <div className="px-8 py-4 bg-glass border-t border-border flex justify-between items-center text-[10px] text-secondary">
            <span>IIT Ropar © 2024</span>
            <div className="flex gap-3">
              <span className="cursor-pointer hover:text-primary">Help</span>
              <span className="cursor-pointer hover:text-primary">Privacy</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;