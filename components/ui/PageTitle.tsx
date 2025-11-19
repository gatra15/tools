'use client';


interface PageTitleProps {
    title: string;
    subtitle?: string;
}


export function PageTitle({ title, subtitle }: PageTitleProps) {
    return (
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1B5E20]">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
        </div>
    );
}