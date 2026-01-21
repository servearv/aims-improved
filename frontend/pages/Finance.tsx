import React, { useState } from 'react';
import { Card, Button, Input } from '../components/ui';
import { Save, Eraser, AlertCircle, Upload } from 'lucide-react';

const Finance: React.FC = () => {
  const [formData, setFormData] = useState({
    session: '2024-2025-II',
    amount: '0',
    bank: '',
    transNo: '',
    transDate: '',
  });

  const handleClear = () => {
    setFormData({
      session: '2024-2025-II',
      amount: '0',
      bank: '',
      transNo: '',
      transDate: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Student Registration Transaction Details</h1>
        <p className="text-gray-400 text-sm flex items-center gap-2">
          <AlertCircle size={14} className="text-yellow-500" />
          NOTE: Only one combination of &#123;academic session, transaction no., date, amount and bank&#125; can be saved per student.
        </p>
      </div>

      <Card className="p-6 bg-[#18181b] border-white/10">
        <div className="space-y-6">
          
          {/* Static Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-white/5">
            <div>
              <label className="text-xs font-bold text-white block mb-1">Category:</label>
              <span className="text-gray-400 text-sm">--</span>
            </div>
            <div>
              <label className="text-xs font-bold text-white block mb-1">Degree Type:</label>
              <span className="text-gray-400 text-sm">--</span>
            </div>
          </div>

          {/* Form Rows */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Row 1: Session & Amount */}
            <div className="md:col-span-6">
              <label className="text-xs text-gray-400 mb-1.5 block">Academic Session</label>
              <div className="flex gap-2 items-center">
                <select 
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500/50 outline-none"
                  value={formData.session}
                  onChange={(e) => handleChange('session', e.target.value)}
                >
                  <option value="2024-2025-II">2024-2025-II</option>
                  <option value="2024-2025-I">2024-2025-I</option>
                </select>
                <div className="flex items-center gap-1.5">
                  <input type="checkbox" id="other-session" className="rounded border-white/10 bg-black/20" />
                  <label htmlFor="other-session" className="text-xs text-gray-400 whitespace-nowrap">Other</label>
                </div>
              </div>
            </div>

            <div className="md:col-span-6">
              <label className="text-xs text-gray-400 mb-1.5 block">Amount (₹)</label>
              <Input 
                type="number" 
                value={formData.amount} 
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>

            {/* Row 2: Bank, Trans No, Date */}
            <div className="md:col-span-6">
              <label className="text-xs text-gray-400 mb-1.5 block">Bank</label>
              <Input 
                value={formData.bank} 
                onChange={(e) => handleChange('bank', e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-gray-400 mb-1.5 block">Trans. No.</label>
              <Input 
                value={formData.transNo} 
                onChange={(e) => handleChange('transNo', e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <label className="text-xs text-gray-400 mb-1.5 block">Trans. Date</label>
              <Input 
                type="date"
                value={formData.transDate} 
                onChange={(e) => handleChange('transDate', e.target.value)}
                className="calendar-invert"
              />
            </div>

            {/* Row 3: Proof Upload */}
            <div className="md:col-span-6 md:col-start-7">
              <label className="text-xs text-gray-400 mb-1.5 block">Transaction Proof (.jpg file)</label>
              <div className="flex items-center gap-0 bg-black/20 border border-white/10 rounded-lg overflow-hidden h-[38px]">
                <button className="bg-white/10 hover:bg-white/20 text-gray-300 text-xs px-3 h-full border-r border-white/10 transition-colors">
                  Choose File
                </button>
                <span className="px-3 text-xs text-gray-500 truncate">No file chosen</span>
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <Button 
              variant="primary" 
              className="bg-blue-600 hover:bg-blue-500 text-white border-none w-24"
            >
              Save
            </Button>
            <Button 
              onClick={handleClear}
              className="bg-transparent text-red-500 border border-red-500/50 hover:bg-red-500/10 w-24"
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Finance;