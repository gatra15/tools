'use client';
import { ReactNode } from 'react';
import Link from 'next/link';


interface LayoutProps {
    children: ReactNode;
}


export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex">
            <aside className="w-72 bg-[#1B5E20] text-white p-6 flex flex-col gap-4 shadow-xl">
                <h2 className="text-2xl font-bold mb-6">FileTools</h2>
                <nav className="flex flex-col gap-2">
                    <Link href="/" className="hover:bg-[#2E7D32] px-3 py-2 rounded-lg transition">Home</Link>
                    <Link href="/tools/convert" className="hover:bg-[#2E7D32] px-3 py-2 rounded-lg transition">Convert Delimiter</Link>
                    <Link href="/tools/merge-pdf" className="hover:bg-[#2E7D32] px-3 py-2 rounded-lg transition">Merge PDF</Link>
                    <Link href="/tools/split-pdf" className="hover:bg-[#2E7D32] px-3 py-2 rounded-lg transition">Split PDF</Link>
                </nav>
            </aside>


            <main className="flex-1 p-10">{children}</main>
        </div>
    );
}