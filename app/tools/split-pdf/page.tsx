'use client';

import { useState, useRef } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Section } from "@/components/ui/Section";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import FileCard from "@/components/FileCard";
import JSZip from "jszip";
import { Upload, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selected = e.target.files[0];
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      alert('Mohon unggah file PDF.');
      return;
    }

    setFile(selected);
    setStatusMessage(null);

    try {
      const bytes = await selected.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      setPageCount(pdfDoc.getPageCount());
    } catch (err) {
      console.warn("Could not read page count beforehand:", err);
      setPageCount(null);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = () => {
    setFile(null);
    setPageCount(null);
    setStatusMessage(null);
  };

  const handleSplit = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const zip = new JSZip();
      const folderName = file.name.replace(/\.pdf$/i, "");
      const folder = zip.folder(folderName);
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const totalPages = pdfDoc.getPageCount();

      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const pdfBytes = await newPdf.save();
        folder?.file(`page-${i + 1}.pdf`, pdfBytes);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${folderName}-split.zip`);
      setStatusMessage(`Berhasil memisahkan ${totalPages} halaman menjadi ZIP!`);
    } catch (err: any) {
      console.error("Split error:", err);
      setStatusMessage("Gagal memisahkan PDF: " + (err?.message || "File mungkin diproteksi password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageTitle title="Split PDF" subtitle="Pisahkan setiap halaman PDF menjadi berkas tersendiri dan unduh dalam format ZIP" />
      <Card>
        <Section>
          <div className="space-y-4">
            {/* Upload Area */}
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-green-300 hover:border-green-500 bg-white/70 hover:bg-green-50/40 p-8 rounded-2xl cursor-pointer text-center transition flex flex-col items-center justify-center gap-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
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
                    File akan dipecah per halaman menjadi file PDF terpisah
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <FileCard file={file} onDelete={handleDelete} />
                  {pageCount !== null && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 text-[#1B5E20] flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Jumlah Halaman Terdeteksi</div>
                        <div className="text-lg font-bold text-gray-800">{pageCount} Halaman</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Alert */}
            {statusMessage && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-sm ${statusMessage.includes("Berhasil")
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
                  }`}
              >
                {statusMessage.includes("Berhasil") ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-green-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                )}
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Split Button */}
            {file && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleSplit}
                  disabled={loading}
                  className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-semibold rounded-xl disabled:bg-gray-400 transition shadow-md flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? "Memisahkan Halaman..." : "Split PDF"}</span>
                </button>
              </div>
            )}
          </div>
        </Section>
      </Card>
    </Layout>
  );
}
