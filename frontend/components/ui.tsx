
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger', size?: 'sm' | 'md' | 'lg', isLoading?: boolean }> = ({ 
  children, variant = 'primary', size = 'md', className = '', isLoading, ...props 
}) => {
  const baseStyle = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-primary text-background hover:opacity-90 border border-transparent shadow-sm",
    secondary: "bg-surface border border-border text-secondary hover:text-primary hover:border-glassBorder",
    ghost: "bg-transparent text-secondary hover:text-primary hover:bg-glass",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
  };

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-surface border border-border rounded-xl shadow-sm transition-colors duration-300 ${className}`} {...props}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode, color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    gray: "bg-glass text-secondary border-border"
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[color]} inline-block`}>
      {children}
    </span>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary placeholder-secondary focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors ${className}`}
    {...props}
  />
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative bg-surface border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden text-primary"
          >
            <div className="px-6 py-4 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} className="text-secondary hover:text-primary">&times;</button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Toast: React.FC<{ message: string; type?: 'success' | 'error' | 'info' | 'warning'; isVisible: boolean; onClose: () => void }> = ({ message, type = 'info', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl bg-surface border border-border text-primary min-w-[300px] backdrop-blur-xl"
        >
          <div className={`w-2 h-2 rounded-full ${colors[type]} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
          <span className="text-sm font-medium">{message}</span>
          <button onClick={onClose} className="ml-auto text-secondary hover:text-primary transition-colors">
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
