import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, Sparkles, Loader2, Bot, User, AlertCircle, Key, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from './ui';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface GeminiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AIMS academic assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      // 1. Check AI Studio Environment
      const aiStudio = (window as any).aistudio;
      if (aiStudio && aiStudio.hasSelectedApiKey) {
        try {
          const hasSelected = await aiStudio.hasSelectedApiKey();
          if (hasSelected) {
            setHasKey(true);
            return;
          }
        } catch (e) {
          console.error("Error checking aistudio key:", e);
        }
      } 
      
      // 2. Check Standard Environment Variable
      if (process.env.API_KEY) {
        setHasKey(true);
      }
    };
    
    if (isOpen) {
      checkKey();
    }
  }, [isOpen]);

  const handleSelectKey = async () => {
    const aiStudio = (window as any).aistudio;
    if (aiStudio && aiStudio.openSelectKey) {
      try {
        await aiStudio.openSelectKey();
        // Assume success after dialog interaction as per constraints
        setHasKey(true);
        setIsDemoMode(false);
      } catch (e) {
        console.error("Failed to open select key dialog:", e);
        enableDemoMode();
      }
    } else {
      // Fallback: If not in the specific Google environment, enable Demo Mode
      console.warn("AI Studio environment not found. Enabling Demo Mode.");
      enableDemoMode();
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setHasKey(true);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'model',
      text: "Environment not detected. Switched to Simulation Mode. I will respond with mock data."
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiStudio = (window as any).aistudio;
    // --- DEMO MODE MOCK RESPONSE ---
    if (isDemoMode || (!process.env.API_KEY && !aiStudio)) {
      setTimeout(() => {
        const mockResponses = [
           "To register for courses, navigate to the Academics > Registration section.",
           "Your current CGPA is 8.62, which places you in the top 15% of your batch.",
           "The deadline for adding/dropping courses is January 19th, 2026.",
           "You can pay your semester fees in the Finance section using Net Banking or UPI.",
           "This is a simulated response. In a production environment with a valid Gemini API Key, I would provide a generated answer."
        ];
        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
        
        const modelMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'model', 
          text: randomResponse
        };
        setMessages(prev => [...prev, modelMsg]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    // --- REAL GEMINI API CALL ---
    try {
      // The key is injected via process.env.API_KEY automatically after selection
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [{ text: input }]
          }
        ],
        config: {
          systemInstruction: "You are a helpful academic assistant for IIT Ropar. Be concise, professional, and helpful.",
        }
      });

      const modelMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: response.text || "I'm sorry, I couldn't generate a response." 
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      let errorMessage = "I encountered an error connecting to the AI service.";
      const errString = error.toString();
      const errJson = JSON.stringify(error);

      // Handle "Requested entity was not found" (404) by resetting key state
      if (errString.includes("Requested entity was not found") || errString.includes("404") || errJson.includes("NOT_FOUND")) {
          errorMessage = "The selected API Key is invalid or does not have access to the model. Please select a key again.";
          setHasKey(false);
      } else if (errString.includes("API key") || errString.includes("403")) {
         errorMessage = "Invalid API Key. Please select a valid key to continue.";
         setHasKey(false);
      } else if (error.message) {
         errorMessage = `Error: ${error.message}`;
      }

      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: errorMessage
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background/50 backdrop-blur-md">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={18} className="text-blue-500" />
                <h2 className="font-semibold">Gemini Assistant</h2>
                {isDemoMode && <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">DEMO</span>}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-glass rounded-full text-secondary hover:text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {!hasKey ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6 animate-in fade-in zoom-in duration-300">
                   <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 mb-2 shadow-lg shadow-blue-500/20">
                     <Key size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-primary">Activate AI Assistant</h3>
                   <p className="text-sm text-secondary leading-relaxed">
                     To use the Gemini Assistant, you need to select a valid Google Cloud API Key.
                   </p>
                   
                   <div className="w-full space-y-3 pt-2">
                     <Button onClick={handleSelectKey} className="w-full py-6 text-base shadow-xl shadow-blue-500/10">
                       Select API Key
                     </Button>
                     <p className="text-[10px] text-secondary">
                       If the selection dialog does not appear, the assistant will switch to <strong>Simulation Mode</strong>.
                     </p>
                   </div>

                   <div className="pt-6 border-t border-border w-full">
                     <p className="text-[10px] text-secondary">
                       <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 hover:text-primary transition-colors">
                         <ShieldAlert size={10} /> Billing Information
                       </a>
                     </p>
                   </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-glass border border-border text-primary rounded-tl-none'
                      }`}
                    >
                      {msg.role === 'model' && (
                        <div className="flex items-center gap-2 mb-1.5 opacity-50 text-xs font-medium uppercase tracking-wider">
                          <Bot size={12} /> Gemini
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-glass border border-border rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-500" />
                    <span className="text-xs text-secondary">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-surface">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={hasKey ? "Ask anything..." : "Activation required..."}
                  disabled={!hasKey || isLoading}
                  className="w-full bg-input border border-border rounded-xl pl-4 pr-12 py-3 text-sm text-primary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || !hasKey || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-0 disabled:pointer-events-none transition-all shadow-md"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="flex justify-between items-center mt-3 px-1">
                 <p className="text-[10px] text-secondary flex items-center gap-1">
                   <Sparkles size={10} /> Powered by Gemini 3 Flash
                 </p>
                 {isDemoMode && (
                   <span className="text-[9px] text-yellow-500 font-mono border border-yellow-500/20 px-1 rounded">SIMULATION MODE</span>
                 )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GeminiAssistant;