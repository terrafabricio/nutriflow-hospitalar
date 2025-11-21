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
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md border-r border-slate-100 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col items-center justify-center h-24">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight text-center">
              NutriFlow <span className="text-indigo-600">Hospitalar</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Icon size={20} className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Desenvolvido por</span>
            <div className="flex items-center gap-1.5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
              <img src="/logo_lume_icon.png" alt="Lume Digital" className="w-4 h-auto" />
              <span className="text-[11px] font-bold text-slate-600">Lume Digital</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
