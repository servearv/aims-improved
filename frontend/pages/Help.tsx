import React from 'react';
import { Card, Button } from '../components/ui';
import { HelpCircle, Book, Mail, ExternalLink, FileQuestion } from 'lucide-react';

const Help: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto text-blue-500">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white">How can we help you?</h1>
        <p className="text-gray-400">Browse guides or contact support for AIMS portal issues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:border-blue-500/50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
              <Book className="text-white group-hover:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white">User Guide</h3>
              <p className="text-sm text-gray-500">Comprehensive documentation for students & faculty.</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full text-xs">Read Documentation <ExternalLink size={12} className="ml-2"/></Button>
        </Card>

        <Card className="p-6 hover:border-blue-500/50 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-lg group-hover:bg-blue-500/10 transition-colors">
              <Mail className="text-white group-hover:text-blue-400" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-white">Contact Support</h3>
              <p className="text-sm text-gray-500">Email us at aims_help@iitrpr.ac.in</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full text-xs">Send Email <ExternalLink size={12} className="ml-2"/></Button>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            "How do I reset my password?",
            "Why is my course registration rejected?",
            "How to download grade card?",
            "Who is my faculty advisor?"
          ].map((q, i) => (
             <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer">
               <span className="text-sm font-medium">{q}</span>
               <FileQuestion size={16} className="text-gray-500" />
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;