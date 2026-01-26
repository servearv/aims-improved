import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, GraduationCap, CalendarDays, CreditCard, FileText, MessageSquare, HelpCircle, ArrowRight } from 'lucide-react';
import { useAppStore } from '../store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { label: 'Course Registration', icon: BookOpen, path: '/academics/registration', category: 'Academics' },
    { label: 'Grades & Performance', icon: GraduationCap, path: '/academics/grades', category: 'Academics' },
    { label: 'Courses Offered', icon: Search, path: '/academics/courses-offered', category: 'Academics' },
    { label: 'Timetable', icon: CalendarDays, path: '/academics/timetable', category: 'Academics' },

    { label: 'Course Feedback', icon: MessageSquare, path: '/course-feedback', category: 'Academics' },
    { label: 'Finance & Fees', icon: CreditCard, path: '/finance', category: 'Finance' },
    { label: 'Help & Support', icon: HelpCircle, path: '/help', category: 'Support' },
  ];

  const filteredItems = navItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keyboard navigation within the palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[activeIndex]) {
          navigate(filteredItems[activeIndex].path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredItems, navigate, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="relative w-full max-w-xl bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={18} className="text-secondary" />
              <input
                autoFocus
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-primary placeholder-secondary text-sm h-6"
              />
              <span className="text-[10px] text-secondary bg-glass border border-glassBorder px-1.5 py-0.5 rounded">ESC</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-secondary">
                  No results found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item, index) => (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); onClose(); }}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${index === activeIndex
                          ? 'bg-primary text-background'
                          : 'text-secondary hover:text-primary hover:bg-glass'
                        }`}
                    >
                      <item.icon size={16} />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {index === activeIndex && <ArrowRight size={14} className="opacity-50" />}
                      <span className={`text-[10px] opacity-50 ${index === activeIndex ? 'text-background' : 'text-secondary'}`}>
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;