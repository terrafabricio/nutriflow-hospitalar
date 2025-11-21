'use client';

import { useState } from 'react';
import { Users, Utensils, AlertTriangle, Clock, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
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
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">Dashboard Geral</h1>
                <p className="text-slate-500">Visão geral da unidade de alimentação</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Pacientes"
                    value={isLoading ? '-' : metrics.totalPatients}
                    icon={Users}
                    trend={!isLoading ? "Atualizado" : "..."}
                    color="blue"
                />
                <SummaryCard
                    title="Dietas Especiais"
                    value={isLoading ? '-' : metrics.specialDiets}
                    icon={AlertTriangle}
                    subtext={!isLoading ? `${metrics.totalOrders > 0 ? Math.round((metrics.specialDiets / metrics.totalOrders) * 100) : 0}% do total` : "..."}
                    color="orange"
                />
                <SummaryCard
                    title="Total Pedidos"
                    value={isLoading ? '-' : metrics.totalOrders}
                    icon={Utensils}
                    subtext="Produção do dia"
                    color="green"
                />
                <SummaryCard
                    title="Pedidos Pendentes"
                    value={isLoading ? '-' : metrics.pendingOrders}
                    icon={Clock}
                    subtext="Aguardando/Preparo"
                    color="slate"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-none">
                    <h2 className="text-lg font-semibold mb-4">Acesso Rápido</h2>
                    <div className="space-y-3">
                        <Link href="/mapa" className="block w-full p-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-center">
                            Ver Mapa de Produção
                        </Link>
                        <Link href="/pacientes" className="block w-full p-3 bg-slate-50 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors text-center">
                            Gerenciar Pacientes
                        </Link>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-none flex flex-col h-full">
                    <h2 className="text-lg font-semibold mb-4 text-slate-800">Avisos da Nutrição</h2>

                    <div className="h-64 overflow-y-auto pr-2 space-y-2 mb-4">
                        {notices.length === 0 && <p className="text-slate-400 text-sm italic text-center py-4">Nenhum aviso no momento.</p>}
                        {notices.map(notice => (
                            <div key={notice.id} className="flex items-start gap-3 group p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <button
                                    onClick={() => toggleNotice(notice.id, !notice.isCompleted)}
                                    className={`mt-0.5 ${notice.isCompleted ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
                                >
                                    {notice.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                                </button>
                                <p className={`text-sm flex-1 ${notice.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                    {notice.content}
                                </p>
                                <button
                                    onClick={() => deleteNotice(notice.id)}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddNotice} className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                        <input
                            type="text"
                            value={newNotice}
                            onChange={(e) => setNewNotice(e.target.value)}
                            placeholder="Novo aviso..."
                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={!newNotice.trim()}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function SummaryCard({ title, value, icon: Icon, trend, subtext, color }: any) {
    const colors: any = {
        blue: "bg-indigo-50 text-indigo-600",
        orange: "bg-orange-50 text-orange-600",
        green: "bg-emerald-50 text-emerald-600",
        slate: "bg-slate-100 text-slate-600",
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border-none transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
            <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
            {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
    );
}
