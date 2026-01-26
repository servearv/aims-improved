import React, { useState } from 'react';
import { Card, Button, Input } from '../../components/ui';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as api from '../../utils/api';

const UploadGrades: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [courseId, setCourseId] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !courseId) {
            setResult({ success: false, message: 'Please select a file and enter course ID' });
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            // For now, this is a placeholder - actual file upload would need FormData
            // and backend endpoint to handle CSV parsing
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
            setResult({ success: true, message: `Successfully processed ${file.name}` });
        } catch (err: any) {
            setResult({ success: false, message: err.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = 'entry_no,grade\n2023CSB1101,A\n2023CSB1102,B+\n';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grades_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-white">Upload Grades</h1>
                <p className="text-gray-400 text-sm">Bulk upload student grades via CSV file.</p>
            </div>

            <Card className="p-6 bg-[#18181b] border-white/10 max-w-2xl">
                <div className="space-y-6">
                    {/* Course ID */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Course ID</label>
                        <Input
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            placeholder="e.g., CS201"
                            className="max-w-xs"
                        />
                    </div>

                    {/* File Upload */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">CSV File</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors">
                                <FileSpreadsheet size={18} />
                                <span>{file ? file.name : 'Choose File'}</span>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            <Button variant="secondary" onClick={downloadTemplate}>
                                <Download size={16} className="mr-2" />
                                Download Template
                            </Button>
                        </div>
                    </div>

                    {/* Result Message */}
                    {result && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${result.success
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}>
                            {result.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {result.message}
                        </div>
                    )}

                    {/* Upload Button */}
                    <Button onClick={handleUpload} disabled={uploading || !file || !courseId}>
                        <Upload size={16} className="mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Grades'}
                    </Button>

                    {/* Instructions */}
                    <div className="text-xs text-gray-500 border-t border-white/5 pt-4">
                        <p className="font-medium mb-2">CSV Format Requirements:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>First row should be headers: entry_no, grade</li>
                            <li>Valid grades: A+, A, A-, B, B-, C, C-, D, F, S, X, I, W</li>
                            <li>Entry numbers should match enrolled students</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UploadGrades;
