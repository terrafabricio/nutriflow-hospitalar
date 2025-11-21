'use client';
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import ManualSidebar from '@/components/manual/ManualSidebar';
import ContentDisplay from '@/components/manual/ContentDisplay';
import { manualData } from '@/data/manualData';

export default function ManualPage() {
    const [activeId, setActiveId] = useState(manualData[0].id);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const activeSection = manualData.find(s => s.id === activeId) || manualData[0];

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            <ManualSidebar sections={manualData} activeId={activeId} onSelect={setActiveId} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header className="lg:hidden bg-white border-b p-4 flex items-center gap-3 z-20">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-100 rounded text-slate-700"><Menu size={20} /></button>
                    <span className="font-bold text-slate-800">Manual HC-UFU</span>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
                    <ContentDisplay section={activeSection} />
                </div>
            </main>
        </div>
    );
}
