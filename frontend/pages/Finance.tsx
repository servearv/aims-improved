import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components/ui';
import { Save, Eraser, AlertCircle, History, CheckCircle, Clock } from 'lucide-react';
import { submitPayment, getPaymentHistory } from '../utils/api';

const Finance: React.FC = () => {
  const [formData, setFormData] = useState({
    session: '2024-2025-II',
    amount: '0',
    bank: '',
    transNo: '',
    transDate: '',
    proofUrl: '' // Mock proof upload
  });

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getPaymentHistory();
      setHistory(data);
    } catch (err) {
      console.error("Failed to load payment history");
    }
  }

  const handleClear = () => {
    setFormData({
      session: '2024-2025-II',
      amount: '0',
      bank: '',
      transNo: '',
      transDate: '',
      proofUrl: ''
    });
    setMessage(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.bank || !formData.transNo || !formData.transDate) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setSubmitting(true);
    try {
      await submitPayment({
        sessionId: formData.session,
        amount: parseFloat(formData.amount),
        bank: formData.bank,
        transactionNo: formData.transNo,
        transactionDate: formData.transDate,
        proofUrl: 'https://example.com/proof.jpg' // Mock proof URL
      });
      setMessage({ type: 'success', text: 'Payment details submitted successfully' });
      handleClear();
      loadHistory();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to submit payment' });
    } finally {
      setSubmitting(false);
    }
  }

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

          {message && (
            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {message.text}
            </div>
          )}

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

            <div className="md:col-span-6">
              <label className="text-xs text-gray-400 mb-1.5 block">Proof of Payment</label>
              <div className="text-xs text-gray-500">File upload simulation (auto-filled on submit).</div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
            <Button
              variant="primary"
              className="bg-blue-600 hover:bg-blue-500 text-white border-none w-24"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={handleClear}
              className="bg-transparent text-red-500 border border-red-500/50 hover:bg-red-500/10 w-24"
              disabled={submitting}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* History Section */}
      <div className="flex flex-col gap-1 mt-8">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <History size={20} /> Payment History
        </h2>
      </div>
      <Card className="p-0 bg-[#18181b] border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Transaction No.</th>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payment records found.</td>
                </tr>
              ) : (
                history.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white">
                      {new Date(pay.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{pay.session_id}</td>
                    <td className="px-4 py-3 text-gray-300 font-mono">{pay.transaction_no}</td>
                    <td className="px-4 py-3 text-gray-300">{pay.bank}</td>
                    <td className="px-4 py-3 text-right text-white font-medium">₹{pay.amount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${pay.status === 'Verified' ? 'bg-green-500/10 text-green-400' :
                          pay.status === 'Rejected' ? 'bg-red-500/10 text-red-400' :
                            'bg-yellow-500/10 text-yellow-400'
                        }`}>
                        {pay.status === 'Verified' ? <CheckCircle size={10} /> : <Clock size={10} />}
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Finance;