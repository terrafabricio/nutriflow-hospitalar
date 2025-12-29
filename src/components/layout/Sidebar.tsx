'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Menu, X, FilePlus, ChefHat, Truck, BarChart3, Users, BookOpen } from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Mapa de Produção', href: '/mapa', icon: ClipboardList },
  { name: 'Nova Prescrição', href: '/prescricao', icon: FilePlus },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Cozinha (Kanban)', href: '/cozinha', icon: ChefHat },
  { name: 'Entrega / Copa', href: '/entrega', icon: Truck },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Manual Técnico', href: '/manual', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - Left outside sidebar for mobile trigger if Topbar doesn't handle it, 
          but Topbar usually handles this now. Leaving as fallback/hidden. 
      */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--surface)] text-[var(--text-secondary)] rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'none' }} /* Managed by Topbar usually */
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[var(--surface)] border-r border-[var(--border-subtle)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 shadow-[var(--shadow-soft)]`}
      >
        <div className="flex flex-col h-full bg-[var(--surface)]">
          {/* Header */}
          <div className="p-6 border-b border-[var(--border-subtle)] flex flex-col justify-center h-24">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] animate-pulse"></div>
              <h1 className="text-xl font-bold text-[var(--text-main)] tracking-tight font-[family-name:var(--font-space)]">
                NutriFlow
              </h1>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] ml-5 tracking-widest uppercase opacity-70">Clinical Suite</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-[var(--surface2)] text-[var(--text-main)] font-semibold shadow-sm ring-1 ring-[var(--border-subtle)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface2)] hover:text-[var(--text-main)]'
                    }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--primary)] rounded-r-full shadow-[0_0_8px_var(--primaryGlow)]" />
                  )}
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${isActive ? "text-[var(--text-main)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                      }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--surface)]">
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-[var(--surface2)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Sistema Online</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">v2.4.0 (Stable)</p>
              </div>

              <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Powered by</span>
                <span className="text-[11px] font-bold text-[var(--text-main)]">Lume</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile is handled in Topbar or here if needed, keeping simple here */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
