
'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    FileSpreadsheet,
    Layers,
    Scissors,
    Menu,
    X,
    FileEdit,
    Minimize2
} from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/tools/edit-page', label: 'Edit & Hapus Halaman', icon: FileEdit },
        { href: '/tools/compress-pdf', label: 'Compress PDF', icon: Minimize2 },
        { href: '/tools/merge-pdf', label: 'Merge PDF', icon: Layers },
        { href: '/tools/split-pdf', label: 'Split PDF', icon: Scissors },
        { href: '/tools/convert', label: 'Convert Delimiter', icon: FileSpreadsheet },
    ];

    const renderNavItems = (isMobile = false) => (
        navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                        if (isMobile) setMobileOpen(false);
                    }}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition ${isActive
                        ? 'bg-[#2E7D32] font-semibold text-white shadow-sm'
                        : 'hover:bg-[#2E7D32]/70 text-white/90'
                        }`}
                >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                </Link>
            );
        })
    );

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fdf8]">

            {/* Mobile Header */}
            <div className="md:hidden bg-[#1B5E20] text-white p-4 flex items-center justify-between shadow-md">
                <span className="text-xl font-bold tracking-tight">
                    FileTools
                </span>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-1.5 rounded-lg hover:bg-[#2E7D32] transition"
                    aria-label="Toggle Navigation"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen
                        ? <X className="w-6 h-6" />
                        : <Menu className="w-6 h-6" />
                    }
                </button>
            </div>

            {/* Mobile Navigation */}
            {mobileOpen && (
                <div className="md:hidden bg-[#1B5E20] text-white px-6 pb-6 pt-2 flex flex-col gap-2 shadow-xl border-t border-[#2E7D32]">
                    {renderNavItems(true)}
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-[#1B5E20] text-white p-6 flex-col gap-4 shadow-xl shrink-0">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        FileTools
                    </h2>
                </div>

                <nav className="flex flex-col gap-2">
                    {renderNavItems()}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
                {children}
            </main>

        </div>
    );
}
