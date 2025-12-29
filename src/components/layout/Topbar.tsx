'use client';

import { Bell, Search, Menu, UserCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const pathname = usePathname();

    const getPageTitle = (path: string) => {
        if (path === '/') return 'Dashboard Geral';
        if (path.startsWith('/pacientes')) return 'Gestão de Pacientes';
        if (path.startsWith('/prescricao')) return 'Nova Prescrição';
        if (path.startsWith('/cozinha')) return 'Cozinha / Produção';
        if (path.startsWith('/entrega')) return 'Entrega & Copa';
        if (path.startsWith('/mapa')) return 'Mapa de Produção';
        if (path.startsWith('/relatorios')) return 'Relatórios e KPIs';
        if (path.startsWith('/manual')) return 'Manual Técnico';
        return 'NutriFlow';
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--surface)]/80 backdrop-blur-md px-4 md:px-8 transition-all">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Trigger */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-[var(--text-secondary)] hover:bg-[var(--surface2)] rounded-lg"
                >
                    <Menu size={20} />
                </button>

                {/* Breadcrumb / Title */}
                <div className="flex flex-col">
                    <h1 className="text-xl font-[family-name:var(--font-space)] font-bold text-[var(--text-main)] tracking-tight">
                        {getPageTitle(pathname)}
                    </h1>
                    <span className="text-xs text-[var(--text-secondary)] font-medium hidden sm:block">
                        Ala Sul &bull; Unidade de Internação
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface2)] rounded-full border border-[var(--border-subtle)] focus-within:ring-2 focus-within:ring-[var(--primaryGlow)] transition-all">
                    <Search size={16} className="text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Buscar paciente..."
                        className="bg-transparent border-none outline-none text-sm w-48 text-[var(--text-main)] placeholder-[var(--text-muted)]"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-[var(--text-secondary)] hover:bg-[var(--surface2)] rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--danger)] rounded-full border border-[var(--surface)]"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2 border-l border-[var(--border-subtle)]">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-[var(--text-main)]">Dr. Ricardo A.</p>
                        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Nutricionista Chefe</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] ring-2 ring-[var(--surface)] shadow-sm">
                        <UserCircle size={24} className="text-[var(--text-secondary)]" />
                    </div>
                </div>
            </div>
        </header>
    );
}
