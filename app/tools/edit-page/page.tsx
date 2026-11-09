"use client";

import { useRef, useState } from "react";
import Layout from "@/components/Layout";
import { degrees, PDFDocument } from "pdf-lib";
import { loadPdfJsDocument, renderPageToThumbnail } from '@/utils/pdfRenderer';
import { saveAs } from 'file-saver';
import { PageTitle } from "@/components/ui/PageTitle";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { AlertCircle, CheckCircle, Download, Eye, FileCheck, Loader2, RefreshCw, RotateCw, Trash2, Undo2, Upload } from "lucide-react";


interface PageItem {
    id: string;
    originalIndex: number; // 0-based
    pageNumber: number; // 1-based display
    isDeleted: boolean;
    rotation: number; // 0, 90, 180, 270
    thumbnail: string;
}

export default function EditPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loadingFile, setLoadingFile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [previewZoom, setPreviewZoom] = useState<PageItem | null>(null);
    const [filterView, setFilterView] = useState<'all' | 'keep' | 'deleted'>('all');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pdfBufferRef = useRef<ArrayBuffer | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const selected = e.target.files[0];
        if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
            alert('Mohon pilih berkas dengan format PDF.');
            return;
        }

        setFile(selected);
        setStatusMessage(null);
        setLoadingFile(true);
        setPages([]);

        try {
            const buffer = await selected.arrayBuffer();
            pdfBufferRef.current = buffer.slice(0); // clone buffer

            // Load using pdf-lib to get page count & orientations
            const pdfDoc = await PDFDocument.load(buffer);
            const total = pdfDoc.getPageCount();

            // Initialize initial page states
            const initialPages: PageItem[] = [];
            for (let i = 0; i < total; i++) {
                const page = pdfDoc.getPage(i);
                const currentRotation = page.getRotation().angle || 0;
                initialPages.push({
                    id: `page-${i}`,
                    originalIndex: i,
                    pageNumber: i + 1,
                    isDeleted: false,
                    rotation: currentRotation,
                    thumbnail: '',
                });
            }
            setPages(initialPages);

            // Render thumbnails asynchronously using pdfjs-dist
            try {
                const pdfJsDoc = await loadPdfJsDocument(buffer);
                for (let i = 0; i < total; i++) {
                    renderPageToThumbnail(pdfJsDoc, i, 280).then((thumb) => {
                        if (thumb) {
                            setPages((prev) =>
                                prev.map((p) => (p.originalIndex === i ? { ...p, thumbnail: thumb } : p))
                            );
                        }
                    });
                }
            } catch (renderErr) {
                console.warn('Thumbnail rendering notice:', renderErr);
            }
        } catch (err: any) {
            console.error('Failed to load PDF:', err);
            setStatusMessage({
                type: 'error',
                text: 'Gagal memuat PDF: ' + (err?.message || 'File mungkin rusak atau dilindungi kata sandi.'),
            });
            setFile(null);
        } finally {
            setLoadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const toggleDeletePage = (id: string) => {
        setPages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isDeleted: !p.isDeleted } : p))
        );
        setStatusMessage(null);
    };

    const rotatePage = (id: string, delta: number = 90) => {
        setPages((prev) =>
            prev.map((p) => {
                if (p.id === id) {
                    const newRotation = (p.rotation + delta + 360) % 360;
                    return { ...p, rotation: newRotation };
                }
                return p;
            })
        );
    };

    const movePage = (fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= pages.length) return;
        setPages((prev) => {
            const copy = [...prev];
            const [moved] = copy.splice(fromIndex, 1);
            copy.splice(toIndex, 0, moved);
            return copy;
        });
    };

    const markAll = (deleted: boolean) => {
        setPages((prev) => prev.map((p) => ({ ...p, isDeleted: deleted })));
        setStatusMessage(null);
    };

    const resetAll = () => {
        setPages((prev) =>
            prev.map((p) => ({
                ...p,
                isDeleted: false,
                rotation: 0,
            }))
        );
        setStatusMessage(null);
    };

    // Kept pages (which will form the final PDF)
    const keptPages = pages.filter((p) => !p.isDeleted);
    const deletedCount = pages.length - keptPages.length;

    const handleSaveEditedPdf = async () => {
        if (!file || !pdfBufferRef.current) return;

        if (keptPages.length === 0) {
            setStatusMessage({
                type: 'error',
                text: 'Tidak ada halaman tersisa! Sisakan minimal 1 halaman untuk membuat file PDF baru.',
            });
            return;
        }

        setSaving(true);
        setStatusMessage(null);

        try {
            // Load source PDF again
            const srcDoc = await PDFDocument.load(pdfBufferRef.current);
            const newDoc = await PDFDocument.create();

            // Copy each non-deleted page in order
            for (const item of keptPages) {
                const [copiedPage] = await newDoc.copyPages(srcDoc, [item.originalIndex]);
                // Apply rotation
                copiedPage.setRotation(degrees(item.rotation));
                newDoc.addPage(copiedPage);
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const baseName = file.name.replace(/\.pdf$/i, '');
            const finalName = `${baseName}-edited.pdf`;

            saveAs(blob, finalName);

            setStatusMessage({
                type: 'success',
                text: `Berhasil! ${deletedCount} halaman dihapus dan ${keptPages.length} halaman tersisa berhasil disatukan ke file "${finalName}".`,
            });
        } catch (err: any) {
            console.error('Error saving edited PDF:', err);
            setStatusMessage({
                type: 'error',
                text: 'Gagal menyimpan PDF: ' + (err?.message || 'Terjadi kesalahan saat memproses.'),
            });
        } finally {
            setSaving(false);
        }
    };

    const filteredPages = pages.filter((p) => {
        if (filterView === 'keep') return !p.isDeleted;
        if (filterView === 'deleted') return p.isDeleted;
        return true;
    });

    return (
        <Layout>
            <PageTitle
                title="Edit & Hapus Halaman PDF"
                subtitle="Hapus halaman yang tidak diinginkan dari PDF Anda, atur rotasi, dan satukan kembali menjadi satu dokumen utuh."
            />

            <Card>
                <Section>
                    {/* Upload Area when no file selected */}
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
                                <Upload className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-800">
                                    Pilih atau Tarik Berkas PDF ke Sini
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Format .pdf didukung. Pemrosesan dilakukan 100% lokal di browser Anda.
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

                    {/* Loading Indicator */}
                    {loadingFile && (
                        <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" />
                            <p className="text-sm font-medium text-gray-700">Membaca halaman dokumen PDF...</p>
                        </div>
                    )}

                    {/* Editor Workspace */}
                    {file && !loadingFile && (
                        <div className="space-y-6">
                            {/* Document Header & Statistics */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-900 text-lg">{file.name}</span>
                                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-[#1B5E20]">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Total: <strong className="text-gray-800">{pages.length}</strong> halaman |
                                        Akan Disimpan: <strong className="text-green-700">{keptPages.length}</strong> halaman |
                                        Dihapus: <strong className="text-red-600">{deletedCount}</strong> halaman
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setFile(null);
                                            setPages([]);
                                            setStatusMessage(null);
                                        }}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Ganti File
                                    </button>
                                    <button
                                        onClick={resetAll}
                                        disabled={deletedCount === 0 && pages.every((p) => p.rotation === 0)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 rounded-lg border border-gray-200 transition flex items-center gap-1.5"
                                    >
                                        <Undo2 className="w-3.5 h-3.5" />
                                        Reset Perubahan
                                    </button>
                                </div>
                            </div>

                            {/* Status Message Notification */}
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

                            {/* Toolbar & Filter View */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 text-xs">
                                {/* Filter tabs */}
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 mr-2 font-medium">Filter Tampilan:</span>
                                    <button
                                        onClick={() => setFilterView('all')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${filterView === 'all'
                                            ? 'bg-[#2E7D32] text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Semua ({pages.length})
                                    </button>
                                    <button
                                        onClick={() => setFilterView('keep')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${filterView === 'keep'
                                            ? 'bg-green-700 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Disimpan ({keptPages.length})
                                    </button>
                                    <button
                                        onClick={() => setFilterView('deleted')}
                                        className={`px-3 py-1.5 rounded-lg font-medium transition ${filterView === 'deleted'
                                            ? 'bg-red-600 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        Dihapus ({deletedCount})
                                    </button>
                                </div>

                                {/* Batch actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => markAll(true)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition font-medium"
                                    >
                                        Tandai Hapus Semua
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={() => markAll(false)}
                                        className="text-green-700 hover:text-green-800 hover:bg-green-50 px-2.5 py-1.5 rounded-lg transition font-medium"
                                    >
                                        Batalkan Hapus Semua
                                    </button>
                                </div>
                            </div>

                            {/* Notice Banner */}
                            <div className="bg-[#E8F5E9] border border-[#C8E6C9] p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs text-[#1B5E20]">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="w-4 h-4 text-[#2E7D32] shrink-0" />
                                    <span>
                                        Klik tombol <strong>Hapus</strong> pada halaman yang ingin Anda buang. Halaman yang ditandai merah akan dibuang saat Anda menekan tombol <strong>Simpan & Satukan PDF Baru</strong>.
                                    </span>
                                </div>
                                <div className="font-semibold shrink-0">
                                    {keptPages.length} Halaman Siap Digabung
                                </div>
                            </div>

                            {/* Grid of Pages */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredPages.map((pageItem) => {
                                    const currentIndex = pages.findIndex((p) => p.id === pageItem.id);

                                    return (
                                        <div
                                            key={pageItem.id}
                                            className={`relative group rounded-xl border-2 transition-all flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-md ${pageItem.isDeleted
                                                ? 'border-red-400 bg-red-50/40 opacity-75'
                                                : 'border-gray-200 hover:border-green-400'
                                                }`}
                                        >
                                            {/* Top Header of Page Card */}
                                            <div className="p-2.5 flex items-center justify-between bg-gray-50 border-b border-gray-100 text-xs">
                                                <span
                                                    className={`font-bold px-2 py-0.5 rounded-full ${pageItem.isDeleted
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-green-100 text-[#1B5E20]'
                                                        }`}
                                                >
                                                    Hal {pageItem.pageNumber}
                                                </span>

                                                {/* Top quick actions */}
                                                <div className="flex items-center gap-1">
                                                    {/* Rotate Button */}
                                                    <button
                                                        type="button"
                                                        title="Putar 90 Derajat"
                                                        onClick={() => rotatePage(pageItem.id, 90)}
                                                        className="p-1 rounded text-gray-500 hover:text-green-700 hover:bg-white transition"
                                                    >
                                                        <RotateCw className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Delete / Restore toggle */}
                                                    <button
                                                        type="button"
                                                        title={pageItem.isDeleted ? 'Batalkan Penghapusan' : 'Tandai Hapus Halaman'}
                                                        onClick={() => toggleDeletePage(pageItem.id)}
                                                        className={`p-1 rounded transition ${pageItem.isDeleted
                                                            ? 'text-green-700 hover:bg-green-100'
                                                            : 'text-red-500 hover:bg-red-100 hover:text-red-700'
                                                            }`}
                                                    >
                                                        {pageItem.isDeleted ? (
                                                            <Undo2 className="w-3.5 h-3.5" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Thumbnail Container */}
                                            <div
                                                className="relative w-full h-52 bg-gray-100 flex items-center justify-center p-2 cursor-pointer select-none overflow-hidden"
                                                onClick={() => toggleDeletePage(pageItem.id)}
                                            >
                                                {pageItem.thumbnail ? (
                                                    <img
                                                        src={pageItem.thumbnail}
                                                        alt={`Halaman ${pageItem.pageNumber}`}
                                                        style={{
                                                            transform: `rotate(${pageItem.rotation}deg)`,
                                                            transition: 'transform 0.2s ease',
                                                        }}
                                                        className="max-h-full max-w-full object-contain shadow-sm bg-white"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-1 text-xs">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>Memuat...</span>
                                                    </div>
                                                )}

                                                {/* Zoom Preview Button on Hover */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewZoom(pageItem);
                                                    }}
                                                    className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition shadow hover:bg-black/80"
                                                    title="Perbesar Pratinjau"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Marked for deletion overlay */}
                                                {pageItem.isDeleted && (
                                                    <div className="absolute inset-0 bg-red-600/75 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-white text-center">
                                                        <Trash2 className="w-8 h-8 mb-1 animate-pulse" />
                                                        <span className="font-extrabold text-xs tracking-wider uppercase">
                                                            DITANDAI DIHAPUS
                                                        </span>
                                                        <span className="text-[10px] text-white/90 mt-1 bg-red-800/60 px-2 py-0.5 rounded-full">
                                                            Klik untuk pulihkan
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Footer with action button */}
                                            <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between text-xs">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeletePage(pageItem.id)}
                                                    className={`w-full py-1.5 px-2 rounded-lg font-semibold text-center transition flex items-center justify-center gap-1.5 ${pageItem.isDeleted
                                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                                        }`}
                                                >
                                                    {pageItem.isDeleted ? (
                                                        <>
                                                            <Undo2 className="w-3.5 h-3.5" />
                                                            <span>Pulihkan Halaman</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            <span>Hapus Halaman</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Bottom Sticky Action Bar */}
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 text-[#1B5E20] flex items-center justify-center shrink-0">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">
                                            {keptPages.length} Halaman Siap Disatukan
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {deletedCount > 0 ? (
                                                <span className="text-red-600 font-medium">
                                                    {deletedCount} halaman akan dibuang permanen dari PDF baru.
                                                </span>
                                            ) : (
                                                'Belum ada halaman yang ditandai untuk dihapus.'
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSaveEditedPdf}
                                        disabled={saving || keptPages.length === 0}
                                        className="w-full sm:w-auto px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-xl disabled:bg-gray-400 transition shadow-md flex items-center justify-center gap-2 text-sm"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Menyatukan Dokumen...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                <span>Simpan & Satukan PDF Baru</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </Section>
            </Card>

            {/* Modal Zoom Preview */}
            {previewZoom && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewZoom(null)}
                >
                    <div
                        className="bg-white rounded-2xl p-4 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <span className="font-bold text-gray-900">
                                Pratinjau Halaman {previewZoom.pageNumber}
                            </span>
                            <button
                                onClick={() => setPreviewZoom(null)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 font-bold"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
                            {previewZoom.thumbnail ? (
                                <img
                                    src={previewZoom.thumbnail}
                                    alt={`Halaman ${previewZoom.pageNumber}`}
                                    style={{
                                        transform: `rotate(${previewZoom.rotation}deg)`,
                                    }}
                                    className="max-h-[70vh] object-contain shadow-md rounded"
                                />
                            ) : (
                                <p className="text-gray-400 text-sm">Tidak ada pratinjau</p>
                            )}
                        </div>
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => rotatePage(previewZoom.id, 90)}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-1.5"
                                >
                                    <RotateCw className="w-3.5 h-3.5" />
                                    Putar 90°
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    toggleDeletePage(previewZoom.id);
                                    setPreviewZoom(null);
                                }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${previewZoom.isDeleted
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {previewZoom.isDeleted ? 'Pulihkan Halaman' : 'Hapus Halaman Ini'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}