'use client';

import { useState } from 'react';
import { Users, Utensils, AlertTriangle, Clock, Plus, Trash2, CheckSquare, Square, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useOrderStore } from '@/store/useOrderStore';

export default function Home() {
    const { getDashboardMetrics, notices, addNotice, toggleNotice, deleteNotice, isLoading } = useOrderStore();
    const metrics = getDashboardMetrics();
    const [newNotice, setNewNotice] = useState('');

    const handleAddNotice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNotice.trim()) return;
        await addNotice(newNotice);
        setNewNotice('');
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight">
                    Visão Geral
                </h1>
                <p className="text-[var(--text-secondary)]">Acompanhamento em tempo real da unidade de alimentação.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Pacientes"
                    value={isLoading ? '-' : metrics.totalPatients}
                    icon={Users}
                    trend={!isLoading ? "Atualizado agora" : "..."}
                    color="info"
                />
                <SummaryCard
                    title="Dietas Especiais"
                    value={isLoading ? '-' : metrics.specialDiets}
                    icon={AlertTriangle}
                    subtext={!isLoading ? `${metrics.totalOrders > 0 ? Math.round((metrics.specialDiets / metrics.totalOrders) * 100) : 0}% do total` : "..."}
                    color="warning"
                />
                <SummaryCard
                    title="Total Pedidos"
                    value={isLoading ? '-' : metrics.totalOrders}
                    icon={Utensils}
                    subtext="Produção do dia"
                    color="success"
                />
                <SummaryCard
                    title="Pedidos Pendentes"
                    value={isLoading ? '-' : metrics.pendingOrders}
                    icon={Clock}
                    subtext="Em preparação"
                    color="default"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Actions Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-6">
                        <h2 className="card-title mb-4">Acesso Rápido</h2>
                        <div className="space-y-3">
                            <Link href="/mapa" className="btn btn-ghost w-full justify-between group border border-[var(--border-subtle)] hover:border-[var(--primary)] bg-[var(--surface2)]">
                                <span>Mapa de Produção</span>
                                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--primary)]" />
                            </Link>
                            <Link href="/pacientes" className="btn btn-ghost w-full justify-between group border border-[var(--border-subtle)] hover:border-[var(--primary)] bg-[var(--surface2)]">
                                <span>Gerenciar Pacientes</span>
                                <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--primary)]" />
                            </Link>
                            <Link href="/prescricao" className="btn btn-primary w-full justify-center mt-2">
                                <Plus size={18} />
                                Nova Prescrição
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Notices Column */}
                <div className="lg:col-span-2">
                    <div className="card h-full flex flex-col">
                        <div className="card-header">
                            <h2 className="card-title">Avisos da Nutrição</h2>
                            <span className="badge badge-warning">{notices.length} Ativos</span>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[200px] max-h-[300px]">
                                {notices.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] italic">
                                        <p>Nenhum aviso no momento.</p>
                                    </div>
                                )}
                                {notices.map(notice => (
                                    <div key={notice.id} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--surface2)] border border-transparent hover:border-[var(--border-subtle)] transition-all">
                                        <button
                                            onClick={() => toggleNotice(notice.id, !notice.isCompleted)}
                                            className={`mt-0.5 transition-colors ${notice.isCompleted ? 'text-[var(--success)]' : 'text-[var(--text-muted)] hover:text-[var(--primary)]'}`}
                                        >
                                            {notice.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </button>
                                        <p className={`text-sm flex-1 leading-relaxed ${notice.isCompleted ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-main)]'}`}>
                                            {notice.content}
                                        </p>
                                        <button
                                            onClick={() => deleteNotice(notice.id)}
                                            className="text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-all p-1"
                                            title="Remover aviso"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddNotice} className="flex gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                                <input
                                    type="text"
                                    value={newNotice}
                                    onChange={(e) => setNewNotice(e.target.value)}
                                    placeholder="Adicionar novo aviso para a equipe..."
                                    className="input bg-[var(--surface2)]"
                                />
                                <button
                                    type="submit"
                                    disabled={!newNotice.trim()}
                                    className="btn btn-primary px-3 aspect-square flex items-center justify-center"
                                >
                                    <Plus size={20} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SummaryCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    subtext?: string;
    color: 'info' | 'warning' | 'success' | 'default';
}

function SummaryCard({ title, value, icon: Icon, trend, subtext, color }: SummaryCardProps) {
    const colorStyles: Record<string, string> = {
        info: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        warning: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
        success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
        default: "bg-[var(--surface2)] text-[var(--text-secondary)]",
    };

    return (
        <div className="kpi-card group">
            <div className="flex justify-between items-start mb-2">
                <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 duration-300 ${colorStyles[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--surface2)] px-2 py-1 rounded-full border border-[var(--border-subtle)]">{trend}</span>}
            </div>
            <h3 className="text-[var(--text-secondary)] text-sm font-medium">{title}</h3>
            <div className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight mt-1">{value}</div>
            {subtext && <p className="text-xs text-[var(--text-muted)] mt-1">{subtext}</p>}
        </div>
    );
}
