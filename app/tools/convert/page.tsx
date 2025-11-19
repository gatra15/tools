"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { Section } from "@/components/ui/Section";


export default function ConvertPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [delimiter, setDelimiter] = useState(",");


    const convert = () => {
        const lines = input.split(/\r?\n/).filter((x) => x.trim() !== "");
        setOutput(lines.join(delimiter));
    };


    return (
        <Layout>
            <PageTitle title="Convert Delimiter" subtitle="Ubah daftar menjadi format koma atau titik koma" />


            <Card>
                <Section>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste data dari Excel disini..."
                        className="w-full h-40 p-3 border rounded-xl"
                    />


                    <div className="flex gap-4 mt-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={delimiter === ","}
                                onChange={() => setDelimiter(",")}
                            />
                            Comma (,)
                        </label>


                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                checked={delimiter === ";"}
                                onChange={() => setDelimiter(";")}
                            />
                            Semicolon (;)
                        </label>
                    </div>


                    <Button label="Convert" onClick={convert} className="mt-4" />


                    {output && (
                        <textarea
                            readOnly
                            value={output}
                            className="w-full h-32 p-3 border rounded-xl mt-4 bg-[#F1F8F4]"
                        />
                    )}
                </Section>
            </Card>
        </Layout>
    );
}