'use client';

import { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/Card';
import { PageTitle } from '@/components/ui/PageTitle';
import { Section } from '@/components/ui/Section';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { loadPdfJsDocument, renderPageToJpegBlob } from '@/utils/pdfRenderer';
import {
    Upload,
    Minimize2,
    Download,
    AlertCircle,
    Loader2,
    CheckCircle,
    Zap,
    Sparkles,
    Sliders,
    FileCheck,
    ArrowRight,
    RefreshCw
} from 'lucide-react';

type CompressionPreset = 'recommended' | 'extreme' | 'low' | 'custom';

export default function CompressPDFPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [preset, setPreset] = useState<CompressionPreset>('recommended');
    const [customQuality, setCustomQuality] = useState<number>(65); // 30 - 90
    const [customScale, setCustomScale] = useState<number>(1.2); // 0.8 - 2.0

    const [compressing, setCompressing] = useState(false);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    const [compressedResult, setCompressedResult] = useState<{
        blob: Blob;
        originalSize: number;
        compressedSize: number;
        fileName: string;
    } | null>(null);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfBufferRef = useRef<ArrayBuffer | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const selected = e.target.files[0];
        if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
            alert('Mohon pilih file berformat PDF.');
            return;
        }

        setFile(selected);
        setCompressedResult(null);
        setStatusMessage(null);
        setProgress(null);

        try {
            const buffer = await selected.arrayBuffer();
            pdfBufferRef.current = buffer.slice(0);

            const pdfDoc = await PDFDocument.load(buffer);
            setPageCount(pdfDoc.getPageCount());
        } catch (err: any) {
            console.error('Error reading PDF:', err);
            setStatusMessage({
                type: 'error',
                text: 'Gagal memuat file PDF: ' + (err?.message || 'File mungkin terenkripsi atau rusak.'),
            });
            setFile(null);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getCompressionSettings = () => {
        switch (preset) {
            case 'extreme':
                return { quality: 0.45, scale: 1.0 };
            case 'low':
                return { quality: 0.82, scale: 1.5 };
            case 'custom':
                return { quality: customQuality / 100, scale: customScale };
            case 'recommended':
            default:
                return { quality: 0.65, scale: 1.25 };
        }
    };

    const handleCompress = async () => {
        if (!file || !pdfBufferRef.current) return;

        setCompressing(true);
        setStatusMessage(null);
        setCompressedResult(null);

        const { quality, scale } = getCompressionSettings();

        try {
            const pdfJsDoc = await loadPdfJsDocument(pdfBufferRef.current);
            const totalPages = pdfJsDoc.numPages;
            setProgress({ current: 0, total: totalPages });

            const newPdfDoc = await PDFDocument.create();

            for (let i = 0; i < totalPages; i++) {
                setProgress({ current: i + 1, total: totalPages });

                // Render page to JPEG with the configured scale & quality
                const { blob, width, height } = await renderPageToJpegBlob(pdfJsDoc, i, scale, quality);
                const imageBytes = await blob.arrayBuffer();
                const embeddedImage = await newPdfDoc.embedJpg(imageBytes);

                // Add page with original aspect ratio matching dimensions
                const newPage = newPdfDoc.addPage([width, height]);
                newPage.drawImage(embeddedImage, {
                    x: 0,
                    y: 0,
                    width,
                    height,
                });
            }

            const compressedBytes = await newPdfDoc.save();
            const compressedBlob = new Blob([compressedBytes as any], { type: 'application/pdf' });

            const baseName = file.name.replace(/\.pdf$/i, '');
            const finalFileName = `${baseName}-compressed.pdf`;

            setCompressedResult({
                blob: compressedBlob,
                originalSize: file.size,
                compressedSize: compressedBlob.size,
                fileName: finalFileName,
            });

            setStatusMessage({
                type: 'success',
                text: 'Kompresi PDF selesai dengan sukses!',
            });
        } catch (err: any) {
            console.error('Compression error:', err);
            setStatusMessage({
                type: 'error',
                text: 'Gagal mengompres PDF: ' + (err?.message || 'Terjadi kesalahan teknis saat memproses halaman.'),
            });
        } finally {
            setCompressing(false);
            setProgress(null);
        }
    };

    const handleDownload = () => {
        if (!compressedResult) return;
        saveAs(compressedResult.blob, compressedResult.fileName);
    };

    const formatSize = (bytes: number) => {
        if (bytes >= 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
        return (bytes / 1024).toFixed(1) + ' KB';
    };

    const savingsPercentage = compressedResult
        ? Math.max(
            0,
            Math.round(
                ((compressedResult.originalSize - compressedResult.compressedSize) /
                    compressedResult.originalSize) *
                100
            )
        )
        : 0;

    return (
        <Layout>
            <PageTitle
                title="Compress PDF"
                subtitle="Perkecil ukuran dokumen PDF tanpa mengurangi keterbacaan teks dan gambar, langsung di browser Anda."
            />

            <Card>
                <Section>
                    {/* File Upload Box */}
                    {!file && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-green-300 hover:border-green-500 bg-white/70 hover:bg-green-50/40 p-10 rounded-2xl cursor-pointer text-center transition flex flex-col items-center justify-center gap-3"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                            <div className="w-14 h-14 rounded-2xl bg-green-100 text-[#1B5E20] flex items-center justify-center shadow-inner">
                                <Minimize2 className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-800">
                                    Pilih atau Tarik Berkas PDF yang Ingin Dikompres
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Mendukung semua berkas PDF. Dokumen tidak diunggah ke server luar demi privasi penuh.
                                </p>
                            </div>
                            <button
                                type="button"
                                className="mt-2 px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold rounded-xl transition shadow"
                            >
                                Pilih File PDF
                            </button>
                        </div>
                    )}

                    {/* Active File & Settings */}
                    {file && (
                        <div className="space-y-6">
                            {/* File Info Header */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 text-[#1B5E20] flex items-center justify-center shrink-0">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base">{file.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Ukuran Asli: <strong className="text-gray-800">{formatSize(file.size)}</strong>
                                            {pageCount !== null && (
                                                <span> • Total: <strong className="text-gray-800">{pageCount} Halaman</strong></span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setFile(null);
                                        setCompressedResult(null);
                                        setStatusMessage(null);
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition flex items-center gap-1.5 self-start sm:self-auto"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Ganti File
                                </button>
                            </div>

                            {/* Status Message */}
                            {statusMessage && (
                                <div
                                    className={`p-4 rounded-xl flex items-center gap-3 text-sm ${statusMessage.type === 'success'
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}
                                >
                                    {statusMessage.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5 shrink-0 text-green-700" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 shrink-0 text-red-700" />
                                    )}
                                    <span className="font-medium">{statusMessage.text}</span>
                                </div>
                            )}

                            {/* Compression Preset Selection */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">Pilih Tingkat Kompresi:</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Sesuaikan keseimbangan antara ketajaman gambar dan ukuran file yang dihasilkan.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Preset 1: Recommended */}
                                    <div
                                        onClick={() => setPreset('recommended')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${preset === 'recommended'
                                            ? 'border-[#2E7D32] bg-green-50/50 shadow-xs'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-200 text-green-900 flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" /> Rekomendasi
                                                </span>
                                                <input
                                                    type="radio"
                                                    checked={preset === 'recommended'}
                                                    onChange={() => setPreset('recommended')}
                                                    className="text-[#2E7D32]"
                                                />
                                            </div>
                                            <h5 className="font-bold text-gray-900 text-sm">Kompresi Optimal</h5>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Keseimbangan ideal antara kualitas tajam dan pengurangan ukuran file hingga 50-70%.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Preset 2: Extreme */}
                                    <div
                                        onClick={() => setPreset('extreme')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${preset === 'extreme'
                                            ? 'border-[#2E7D32] bg-green-50/50 shadow-xs'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 flex items-center gap-1">
                                                    <Zap className="w-3 h-3" /> Sangat Kecil
                                                </span>
                                                <input
                                                    type="radio"
                                                    checked={preset === 'extreme'}
                                                    onChange={() => setPreset('extreme')}
                                                    className="text-[#2E7D32]"
                                                />
                                            </div>
                                            <h5 className="font-bold text-gray-900 text-sm">Kompresi Maksimal</h5>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Ukuran file diperkecil secara agresif untuk batas email atau portal pendaftaran online.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Preset 3: Low */}
                                    <div
                                        onClick={() => setPreset('low')}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${preset === 'low'
                                            ? 'border-[#2E7D32] bg-green-50/50 shadow-xs'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                                    Kualitas Tinggi
                                                </span>
                                                <input
                                                    type="radio"
                                                    checked={preset === 'low'}
                                                    onChange={() => setPreset('low')}
                                                    className="text-[#2E7D32]"
                                                />
                                            </div>
                                            <h5 className="font-bold text-gray-900 text-sm">Kompresi Ringan</h5>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Mempertahankan ketajaman visual grafis & gambar bernilai tinggi dengan kompresi lembut.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Custom toggle */}
                                <div className="pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => setPreset(preset === 'custom' ? 'recommended' : 'custom')}
                                        className="text-xs font-semibold text-[#2E7D32] hover:underline flex items-center gap-1.5"
                                    >
                                        <Sliders className="w-3.5 h-3.5" />
                                        {preset === 'custom' ? 'Tutup Pengaturan Kustom' : 'Buka Pengaturan Kustom Lanjutan'}
                                    </button>

                                    {preset === 'custom' && (
                                        <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex justify-between text-xs font-medium mb-1">
                                                    <span>Kualitas Kompresi:</span>
                                                    <span className="font-bold text-green-800">{customQuality}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="30"
                                                    max="90"
                                                    step="5"
                                                    value={customQuality}
                                                    onChange={(e) => setCustomQuality(Number(e.target.value))}
                                                    className="w-full accent-[#2E7D32]"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-medium mb-1">
                                                    <span>Skala Resolusi:</span>
                                                    <span className="font-bold text-green-800">{customScale}x</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.8"
                                                    max="1.8"
                                                    step="0.1"
                                                    value={customScale}
                                                    onChange={(e) => setCustomScale(Number(e.target.value))}
                                                    className="w-full accent-[#2E7D32]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Compress Action Button */}
                            {!compressedResult && (
                                <div className="pt-2">
                                    <button
                                        onClick={handleCompress}
                                        disabled={compressing}
                                        className="px-6 py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl disabled:bg-gray-400 transition shadow-md flex items-center gap-2 text-sm"
                                    >
                                        {compressing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>
                                                    {progress
                                                        ? `Mengompres Halaman ${progress.current} dari ${progress.total}...`
                                                        : 'Memulai Proses Kompresi...'}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Minimize2 className="w-5 h-5" />
                                                <span>Mulai Kompres PDF</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Compression Result Card */}
                            {compressedResult && (
                                <div className="bg-white p-6 rounded-2xl border-2 border-green-400 shadow-md space-y-5 animate-in fade-in duration-300">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-base">Dokumen Selesai Dikompres!</h4>
                                                <p className="text-xs text-gray-500">File siap diunduh ke perangkat Anda</p>
                                            </div>
                                        </div>
                                        {savingsPercentage > 0 && (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-extrabold rounded-full">
                                                Hemat {savingsPercentage}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Size Comparison */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <span className="text-xs text-gray-500 block mb-1">Ukuran Awal</span>
                                            <span className="text-lg font-bold text-gray-700">
                                                {formatSize(compressedResult.originalSize)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                            <span className="text-xs text-green-700 block mb-1">Ukuran Baru</span>
                                            <span className="text-lg font-extrabold text-[#1B5E20]">
                                                {formatSize(compressedResult.compressedSize)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Download Button */}
                                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full sm:w-auto px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Unduh PDF Terkompresi ({formatSize(compressedResult.compressedSize)})</span>
                                        </button>
                                        <button
                                            onClick={() => setCompressedResult(null)}
                                            className="w-full sm:w-auto px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition text-sm text-center"
                                        >
                                            Kompres Ulang dengan Tingkat Berbeda
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Section>
            </Card>
        </Layout>
    );
}
