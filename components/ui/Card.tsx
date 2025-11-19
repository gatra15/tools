'use client';
import { ReactNode } from 'react';


interface CardProps {
    children: ReactNode;
    className?: string;
}


export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-md border border-gray-200 ${className}`}>{children}</div>
    );
}