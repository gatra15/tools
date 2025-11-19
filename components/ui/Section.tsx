'use client';
import { ReactNode } from 'react';


interface SectionProps {
    children: ReactNode;
}


export function Section({ children }: SectionProps) {
    return <div className="my-4 p-4 bg-[#F1F8F4] space-y-4 rounded-2xl border border-[#2E7D3210]">{children}</div>;
}