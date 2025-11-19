'use client';
import { MouseEventHandler } from 'react';


interface ButtonProps {
    label: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'outline';
    className?: string;
}


export default function Button({ label, onClick, variant = 'primary', className = '' }: ButtonProps) {
    const base = 'px-4 py-2 rounded-xl font-medium transition-all shadow-md hover:shadow-lg';
    const variants = {
        primary: 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]',
        outline: 'border border-[#2E7D32] text-[#2E7D32] hover:bg-[#2E7D3220]',
    };
    return (
        <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
            {label}
        </button>
    );
}