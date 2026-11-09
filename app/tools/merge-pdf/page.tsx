'use client';

import { useState, useRef } from 'react';
import FileCard from '@/components/FileCard';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import Button from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import Layout from '@/components/Layout';
import { PageTitle } from '@/components/ui/PageTitle';
import { Card } from '@/components/ui/Card';
import { Upload, Loader2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

export default function MergePDF() {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files).filter(
            (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
        );
        if (selectedFiles.length === 0) {
            alert('Mohon pilih file berformat PDF.');
            return;
        }
        setFiles(prev => [...prev, ...selectedFiles]);
        setStatusMessage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setStatusMessage(null);
    };

    const mergePDF = async () => {
        if (!files.length) return;
        setLoading(true);
        setStatusMessage(null);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const buffer = await file.arrayBuffer();
                const pdf = await PDFDocument.load(buffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
            }

            const output = await mergedPdf.save();
            const uint8 = new Uint8Array(output);
            const blob = new Blob([uint8], { type: 'application/pdf' });
            saveAs(blob, 'merged.pdf');
            setStatusMessage('PDF berhasil digabungkan dan diunduh!');
        } catch (err: any) {
            console.error('Error merging PDF:', err);
            setStatusMessage('Gagal menggabungkan PDF: ' + (err?.message || 'File mungkin terenkripsi atau rusak'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <PageTitle title="Merge PDF" subtitle="Gabungkan beberapa file PDF menjadi satu file secara mudah dan cepat" />
            <Card>
                <Section>
                    <div className="space-y-4">
                        {/* Upload trigger area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-green-300 hover:border-green-500 bg-white/70 hover:bg-green-50/40 p-8 rounded-2xl cursor-pointer text-center transition flex flex-col items-center justify-center gap-3"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <div className="w-12 h-12 rounded-full bg-green-100 text-[#1B5E20] flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">
                                    Klik di sini untuk memilih file PDF
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Dapat memilih beberapa file sekaligus (format .pdf)
                                </p>
                            </div>
                        </div>

                        {/* File preview carousel */}
                        {files.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                        Daftar File ({files.length} dokumen):
                                    </span>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1 transition"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Tambah File Lagi
                                    </button>
                                </div>
                                <div className="flex gap-4 overflow-x-auto py-2 px-1">
                                    {files.map((file, index) => (
                                        <FileCard
                                            key={`${file.name}-${index}`}
                                            file={file}
                                            onDelete={() => removeFile(index)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status alert */}
                        {statusMessage && (
                            <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${statusMessage.includes('berhasil')
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                {statusMessage.includes('berhasil') ? (
                                    <CheckCircle className="w-4 h-4 shrink-0 text-green-700" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                                )}
                                <span>{statusMessage}</span>
                            </div>
                        )}

                        {/* Action buttons */}
                        {files.length > 0 && (
                            <div className="pt-2 flex items-center gap-3">
                                <Button
                                    label={loading ? 'Menggabungkan...' : 'Merge PDF'}
                                    onClick={mergePDF}
                                />
                                {loading && (
                                    <Loader2 className="w-5 h-5 text-green-700 animate-spin" />
                                )}
                            </div>
                        )}
                    </div>
                </Section>
            </Card>
        </Layout>
    );
}
