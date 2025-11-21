'use client';

import {
    Info,
    Utensils,
    Soup,
    Activity,
    ShieldAlert,
    Droplet,
    Ban,
    ChefHat
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';

export default function ProductionMap() {
    const { orders, isLoading } = useOrderStore();

    // Helper to count diets
    const countDiets = (type: string, modifier: string = 'Nenhuma') => {
        return orders.filter(o => o.dietType === type && o.modifier === modifier).length;
    };

    // Helper to count by modifier only (e.g. DM, Renal)
    const countByModifier = (modifier: string) => {
        return orders.filter(o => o.modifier === modifier).length;
    };

    return (
        <div className="space-y-10 pb-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mapa de Produção</h1>
                <p className="text-slate-500 mt-1">Quantitativo de dietas para o próximo turno</p>
            </header>

            {/* SEÇÃO 1: PRODUÇÃO DE ROTINA */}
            <section>
                <SectionHeader title="Produção de Rotina" color="emerald" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DietCard
                        title="Livre (Geral)"
                        count={isLoading ? 0 : countDiets('Livre')}
                        icon={Utensils}
                        borderColor="emerald"
                        textColor="slate"
                    />
                    <DietCard
                        title="Branda"
                        count={isLoading ? 0 : countDiets('Branda')}
                        icon={ChefHat}
                        borderColor="emerald"
                        textColor="slate"
                        subtitle="Cozida / Macia"
                    />
                </div>
            </section>

            {/* SEÇÃO 2: CONSISTÊNCIAS ESPECIAIS */}
            <section>
                <SectionHeader title="Consistências Especiais" color="blue" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DietCard
                        title="Pastosa"
                        count={isLoading ? 0 : countDiets('Pastosa')}
                        icon={Soup}
                        borderColor="blue"
                        textColor="slate"
                        subtitle="Moída / Úmida"
                    />
                    <DietCard
                        title="Cremosa"
                        count={isLoading ? 0 : countDiets('Cremosa')}
                        icon={Soup}
                        borderColor="blue"
                        textColor="slate"
                        subtitle="Liquidificada / Espessada"
                    />
                    <DietCard
                        title="Líquida Completa"
                        count={isLoading ? 0 : countDiets('Líquida Completa')}
                        icon={Droplet}
                        borderColor="blue"
                        textColor="slate"
                        subtitle="Sem resíduos"
                    />
                    <DietCard
                        title="Líquida Restrita"
                        count={isLoading ? 0 : countDiets('Líquida Restrita')}
                        icon={Droplet}
                        borderColor="amber"
                        textColor="amber"
                        subtitle="Apenas claros / Chá"
                        alert
                    />
                </div>
            </section>

            {/* SEÇÃO 3: DIETAS TERAPÊUTICAS & RESTRIÇÕES */}
            <section>
                <SectionHeader title="Dietas Terapêuticas & Críticas" color="purple" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DietCard
                        title="Renal / Dialítica"
                        count={isLoading ? 0 : countByModifier('Renal')}
                        icon={Activity}
                        borderColor="amber"
                        textColor="slate"
                        subtitle="Controlar K/Na/P"
                    />
                    <DietCard
                        title="Diabetes (DM)"
                        count={isLoading ? 0 : countByModifier('Diabetes (DM)')}
                        icon={Ban}
                        borderColor="amber"
                        textColor="slate"
                        subtitle="Isento de Açúcar"
                    />

                    {/* CARD NEUTROPÊNICA (CUSTOMIZADO) */}
                    <div className="relative group bg-white p-6 rounded-xl shadow-sm border-t-4 border-red-400 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="text-red-500" size={20} />
                                <h3 className="font-bold text-slate-800 text-lg">Neutropênica</h3>
                            </div>
                            <Info size={18} className="text-slate-300 group-hover:text-red-400 transition-colors cursor-help" />
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-slate-800">
                                {isLoading ? 0 : countByModifier('Neutropênica')}
                            </span>
                            <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                Crítico
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">Risco de Infecção</p>

                        {/* TOOLTIP */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-72 p-4 bg-slate-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="flex items-center gap-2 mb-2 text-yellow-400 font-bold uppercase text-xs tracking-wider">
                                <ShieldAlert size={14} />
                                Regra Crítica
                            </div>
                            <p className="leading-relaxed">
                                Proibido alimentos <strong className="text-white">CRUS</strong>.
                                Higienização rigorosa de utensílios e embalagens individuais.
                            </p>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Componente de Cabeçalho de Seção
function SectionHeader({ title, color }: { title: string, color: string }) {
    const colorClasses: any = {
        emerald: "bg-emerald-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
    };

    return (
        <div className="flex items-center gap-3 mb-6">
            <div className={`w-1.5 h-6 rounded-full ${colorClasses[color]}`}></div>
            <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wide text-xs">
                {title}
            </h2>
            <div className="h-px bg-slate-200 flex-1"></div>
        </div>
    );
}

// Componente de Card Reutilizável
interface DietCardProps {
    title: string;
    count: number;
    icon: any;
    borderColor: "emerald" | "blue" | "amber" | "red";
    textColor: "slate" | "amber";
    subtitle?: string;
    alert?: boolean;
}

function DietCard({ title, count, icon: Icon, borderColor, textColor, subtitle, alert }: DietCardProps) {
    const borderColors = {
        emerald: "border-t-emerald-500",
        blue: "border-t-blue-500",
        amber: "border-t-amber-500",
        red: "border-t-red-400",
    };

    const textColors = {
        slate: "text-slate-800",
        amber: "text-amber-700",
    };

    return (
        <div className={`bg-white p-6 rounded-xl shadow-sm border-t-4 ${borderColors[borderColor]} hover:shadow-md transition-all duration-200 group`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Icon className={`text-slate-400 group-hover:text-slate-600 transition-colors`} size={20} />
                    <h3 className={`font-bold text-lg ${textColors[textColor]}`}>{title}</h3>
                </div>
                {alert && <Info size={16} className="text-amber-400" />}
            </div>

            <div className="text-5xl font-bold text-slate-800 tracking-tight mb-2">
                {count}
            </div>

            {subtitle && (
                <p className="text-sm text-slate-400 font-medium border-t border-slate-50 pt-2 mt-2">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
