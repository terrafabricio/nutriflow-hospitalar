'use client'

import React from 'react';
import { ManualSection } from '@/types/manual';
import { BookOpen, FileText, Activity, Baby, Stethoscope, X } from 'lucide-react';

interface SidebarProps { sections: ManualSection[]; activeId: string; onSelect: (id: string) => void; isOpen: boolean; onClose: () => void; }

export default function ManualSidebar({ sections, activeId, onSelect, isOpen, onClose }: SidebarProps) {
    const categories = Array.from(new Set(sections.map(s => s.category)));
    const getIcon = (cat: string) => {
        if (cat === 'Geral') return <BookOpen size={18} />;
        if (cat === 'Consistência') return <FileText size={18} />;
        if (cat === 'Terapêutica') return <Activity size={18} />;
        if (cat === 'Pediatria') return <Baby size={18} />;
        return <Stethoscope size={18} />;
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={onClose} />
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[var(--surface2)] border-r border-[var(--border-subtle)] transform transition-transform duration-300 lg:translate-x-0 lg:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface)]">
                    <span className="font-bold text-[var(--text-main)] font-[family-name:var(--font-space)]">Índice do Manual</span>
                    <button onClick={onClose} className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20} /></button>
                </div>
                <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-60px)] custom-scrollbar">
                    {categories.map(cat => (
                        <div key={cat}>
                            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 px-3 flex items-center gap-2">{getIcon(cat)} {cat}</h3>
                            <ul className="space-y-1">
                                {sections.filter(s => s.category === cat).map(s => (
                                    <li key={s.id}>
                                        <button onClick={() => { onSelect(s.id); onClose(); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium ${activeId === s.id ? 'bg-[var(--primary)] text-[var(--surface)] shadow-md' : 'text-[var(--text-secondary)] hover:bg-[var(--surface3)]'}`}>
                                            {s.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}
