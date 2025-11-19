"use client";

import { useState } from 'react';
import FileCard from '@/components/FileCard';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import Button from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import Layout from '@/components/Layout';
import { PageTitle } from '@/components/ui/PageTitle';
import { Card } from '@/components/ui/Card';


export default function MergePDF() {
    const [files, setFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const mergePDF = async () => {
        if (!files.length) return;
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            const buffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(buffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(page => mergedPdf.addPage(page));
        }

        const output = await mergedPdf.save();
        const uint8 = new Uint8Array(output);
        saveAs(new Blob([uint8]), 'merged.pdf');
    };

    return (
        <Layout>
            <PageTitle title="Merge PDF" subtitle="Gabungkan beberapa file PDF" />
            <Card>
                <Section>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="border p-2 rounded"
                    />

                    <div className="flex gap-4 overflow-x-auto py-2">
                        {files.map((file, index) => (
                            <FileCard
                                key={index}
                                file={file}
                                onDelete={() => removeFile(index)}
                            />
                        ))}
                    </div>

                    {files.length > 0 && (
                        <Button label="Merge PDF" onClick={mergePDF} className="mt-4" />
                    )}
                </Section>
            </Card>
        </Layout>
    );
}