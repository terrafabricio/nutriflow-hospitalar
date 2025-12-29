'use client';

import { Plus, Bot, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalWidgets() {
    const router = useRouter();

    return (
        <>
            {/* Floating Action Button (FAB) Area */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
                {/* Main FAB */}
                <button
                    onClick={() => router.push('/prescricao')}
                    className="group flex items-center justify-center w-14 h-14 bg-[var(--primary)] text-[var(--text-main)] rounded-full shadow-[var(--shadow-glow)] hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-[var(--primaryGlow)]"
                    title="Nova Prescrição"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>
            </div>

            {/* AI Assistant Bubble (Visual Only) */}
            <div className="fixed bottom-6 left-6 z-50">
                <button
                    className="flex items-center gap-2 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-full shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-glow)] hover:border-[var(--primary)] transition-all group"
                >
                    <div className="w-8 h-8 rounded-full bg-[var(--surface2)] flex items-center justify-center text-[var(--accent)] group-hover:scale-110 transition-transform">
                        <Bot size={20} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-bold text-[var(--text-main)]">Lume AI</span>
                        <span className="text-[10px] text-[var(--text-secondary)]">Posso ajudar?</span>
                    </div>
                </button>
            </div>

            {/* Toast Placeholder Setup (Can be expanded later) */}
            <div id="toast-container" className="fixed top-20 right-6 z-50 flex flex-col gap-2 pointer-events-none">
                {/* Toasts will be injected here if needed */}
            </div>
        </>
    );
}
