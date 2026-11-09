'use client';

import { useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Section } from "@/components/ui/Section";
import { Copy, Check, Trash2 } from "lucide-react";

export default function ConvertPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [delimiter, setDelimiter] = useState(",");
    const [copied, setCopied] = useState(false);

    const convert = () => {
        const lines = input.split(/\r?\n/).filter((x) => x.trim() !== "");
        setOutput(lines.join(delimiter));
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Clipboard copy failed:", e);
        }
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
    };

    return (
        <Layout>
            <PageTitle title="Convert Delimiter" subtitle="Ubah daftar baris (dari Excel/Notepad) menjadi format koma atau titik koma" />
            <Card>
                <Section>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Input Data (Satu baris per entri):
                        </label>
                        {input && (
                            <button
                                onClick={handleClear}
                                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium transition"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Bersihkan
                            </button>
                        )}
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Contoh:&#10;Data 1&#10;Data 2&#10;Data 3&#10;&#10;Paste data dari Excel disini..."
                        className="w-full h-40 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2E7D32] focus:outline-none bg-white font-mono text-sm"
                    />
                    <div className="flex items-center gap-6 mt-4">
                        <span className="text-sm font-medium text-gray-700">Pilih Delimiter:</span>
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 text-sm">
                            <input
                                type="radio"
                                checked={delimiter === ","}
                                onChange={() => setDelimiter(",")}
                                className="text-[#2E7D32] focus:ring-[#2E7D32]"
                            />
                            Koma ( , )
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 text-sm">
                            <input
                                type="radio"
                                checked={delimiter === ";"}
                                onChange={() => setDelimiter(";")}
                                className="text-[#2E7D32] focus:ring-[#2E7D32]"
                            />
                            Titik Koma ( ; )
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800 text-sm">
                            <input
                                type="radio"
                                checked={delimiter === "|"}
                                onChange={() => setDelimiter("|")}
                                className="text-[#2E7D32] focus:ring-[#2E7D32]"
                            />
                            Pipa ( | )
                        </label>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <Button label="Convert" onClick={convert} />
                    </div>
                    {output && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Hasil Konversi:
                                </label>
                                <button
                                    onClick={handleCopy}
                                    className="px-3 py-1.5 rounded-lg bg-white border border-[#2E7D32] text-[#2E7D32] hover:bg-green-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-green-700" />
                                            <span>Tersalin!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Salin Hasil</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                readOnly
                                value={output}
                                className="w-full h-32 p-3 border border-gray-300 rounded-xl bg-[#F1F8F4] font-mono text-sm focus:outline-none"
                            />
                        </div>
                    )}
                </Section>
            </Card>
        </Layout>
    );
}
