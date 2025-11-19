"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Section } from "@/components/ui/Section";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import FileCard from "@/components/FileCard";
import JSZip from "jszip";


export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const handleDelete = () => {
    setFile(null);
  };

  const handleSplit = async () => {
    if (!file) return;

    setLoading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder(file.name.replace(".pdf", ""));

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
      saveAs(zipBlob, `compressed-split.zip`);
    } catch (err) {
      console.error("Split error:", err);
    }

    setLoading(false);
  };


  return (
    <Layout>
      <PageTitle title="Split PDF" subtitle="Pisahkan PDF halaman demi halaman" />
      <Card>
        <Section>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="border p-3 rounded-lg w-full"
          />

          {/* File Preview (hanya satu) */}
          {file && (
            <div className="flex gap-4 overflow-x-auto py-2">
              <FileCard file={file} onDelete={handleDelete} />
            </div>
          )}

          {/* Tombol */}
          <button
            onClick={handleSplit}
            disabled={loading || !file}
            className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-xl disabled:bg-gray-400 transition"
          >
            {loading ? "Splitting..." : "Split PDF"}
          </button>
        </Section>
      </Card>
    </Layout>
  );
}