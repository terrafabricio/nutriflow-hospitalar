'use client';

import { useOrderStore, DietType } from '@/store/useOrderStore';
import { BarChart3, PieChart, Download, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
    const { orders, patients, isLoading } = useOrderStore();

    // CÁLCULO DE QUANTITATIVOS POR DIETA
    const dietCounts = orders.reduce((acc, order) => {
        acc[order.dietType] = (acc[order.dietType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const totalOrders = orders.length;

    // CÁLCULO DE DIETAS ESPECIAIS
    const specialDietsCount = orders.filter(o => o.modifier !== 'Nenhuma').length;
    const specialDietsPercentage = totalOrders > 0 ? Math.round((specialDietsCount / totalOrders) * 100) : 0;

    // CÁLCULO POR SETOR (WARD)
    const wardCounts = orders.reduce((acc, order) => {
        // Tenta encontrar o paciente pelo leito para descobrir o setor
        const patient = patients.find(p => p.bed === order.bed);
        const ward = patient?.ward || 'Outros / Não Identificado';
        acc[ward] = (acc[ward] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // CÁLCULO DE TEMPO MÉDIO DE ENTREGA
    const calculateAverageTime = () => {
        const deliveredOrders = orders.filter(o =>
            (o.status === 'Entregue' || o.status === 'Concluido') && o.deliveredAt
        );

        if (deliveredOrders.length === 0) return "0 min";

        const totalMinutes = deliveredOrders.reduce((acc, order) => {
            if (!order.deliveredAt) return acc;
            const diff = order.deliveredAt.getTime() - order.createdAt.getTime();
            return acc + Math.floor(diff / 60000); // Convert ms to minutes
        }, 0);

        const average = Math.round(totalMinutes / deliveredOrders.length);
        return `${average} min`;
    };

    const averageTime = calculateAverageTime();

    // CÁLCULO DE ACEITAÇÃO ALIMENTAR (RESTO-INGESTA)
    const calculateAcceptance = () => {
        const evaluatedOrders = orders.filter(o =>
            (o.status === 'Entregue' || o.status === 'Concluido') && o.acceptance
        );

        if (evaluatedOrders.length === 0) {
            return {
                total: 0,
                partial: 0,
                refused: 0,
                totalPercentage: 0,
                partialPercentage: 0,
                refusedPercentage: 0,
                hasData: false
            };
        }

        const total = evaluatedOrders.filter(o => o.acceptance === 'Aceitação Total').length;
        const partial = evaluatedOrders.filter(o => o.acceptance === 'Aceitação Parcial').length;
        const refused = evaluatedOrders.filter(o => o.acceptance === 'Recusa').length;

        return {
            total,
            partial,
            refused,
            totalPercentage: Math.round((total / evaluatedOrders.length) * 100),
            partialPercentage: Math.round((partial / evaluatedOrders.length) * 100),
            refusedPercentage: Math.round((refused / evaluatedOrders.length) * 100),
            hasData: true
        };
    };

    const acceptanceData = calculateAcceptance();

    const dietTypes: DietType[] = ['Livre', 'Branda', 'Pastosa', 'Cremosa', 'Líquida Completa', 'Líquida Restrita'];

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text('SND - Relatório de Produção Diária', 14, 22);

        // Data
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

        // Tabela 1: Quantitativo por Dieta
        const dietRows: (string | number)[][] = dietTypes.map(type => {
            const count = dietCounts[type] || 0;
            return [type, count];
        });
        // Adiciona Total
        dietRows.push(['TOTAL GERAL', totalOrders]);

        autoTable(doc, {
            head: [['Tipo de Dieta', 'Quantidade']],
            body: dietRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }, // Blue
            footStyles: { fillColor: [241, 196, 15] },
        });

        // Tabela 2: Quantitativo por Setor
        const wardRows = Object.entries(wardCounts);

        autoTable(doc, {
            head: [['Setor / Ala', 'Quantidade']],
            body: wardRows,
            startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15,
            theme: 'grid',
            headStyles: { fillColor: [39, 174, 96] }, // Green
        });

        // Tabela 3: Índice de Aceitação Alimentar
        if (acceptanceData.hasData) {
            const acceptanceRows = [
                ['Aceitação Total', `${acceptanceData.total} (${acceptanceData.totalPercentage}%)`],
                ['Aceitação Parcial', `${acceptanceData.partial} (${acceptanceData.partialPercentage}%)`],
                ['Recusa', `${acceptanceData.refused} (${acceptanceData.refusedPercentage}%)`]
            ];

            autoTable(doc, {
                head: [['Índice de Aceitação', 'Quantidade']],
                body: acceptanceRows,
                startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15,
                theme: 'grid',
                headStyles: { fillColor: [142, 68, 173] }, // Purple
            });
        }

        // Rodapé
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text('Documento gerado automaticamente pelo Sistema SND', 14, doc.internal.pageSize.height - 10);
        }

        // Download
        doc.save(`producao_snd_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight flex items-center gap-3">
                        <BarChart3 className="text-[var(--primary)]" size={32} />
                        Relatórios Gerenciais
                    </h1>
                    <p className="text-[var(--text-secondary)]">Indicadores de performance e mapa de produção diário</p>
                </div>
                <button
                    onClick={handleExportPDF}
                    className="btn btn-secondary border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-main)] text-sm shadow-sm hover:shadow-md"
                >
                    <Download size={18} />
                    Exportar PDF
                </button>
            </header>

            {/* KPIS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    title="Total de Refeições"
                    value={isLoading ? '-' : totalOrders.toString()}
                    icon={PieChart}
                    color="blue"
                    trend={!isLoading ? "Atualizado agora" : "..."}
                />
                <KpiCard
                    title="Tempo Médio de Entrega"
                    value={isLoading ? '-' : averageTime}
                    icon={Clock}
                    color="green"
                    trend="Meta: 45 min"
                />
                <KpiCard
                    title="Dietas Especiais"
                    value={isLoading ? '-' : `${specialDietsPercentage}%`}
                    icon={AlertCircle}
                    color="orange"
                    trend={!isLoading ? `${specialDietsCount} pedidos hoje` : "..."}
                />
            </div>

            {/* ÍNDICE DE ACEITAÇÃO ALIMENTAR */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)]">Índice de Aceitação Alimentar</h2>
                        <p className="text-sm text-[var(--text-secondary)]">Avaliação de Resto-Ingesta</p>
                    </div>
                </div>

                {acceptanceData.hasData ? (
                    <div className="space-y-4">
                        {/* Aceitação Total */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                    <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                                    Aceitação Total
                                </span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {acceptanceData.totalPercentage}% ({acceptanceData.total})
                                </span>
                            </div>
                            <div className="w-full bg-[var(--surface2)] rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${acceptanceData.totalPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Aceitação Parcial */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                    <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                                    Aceitação Parcial
                                </span>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    {acceptanceData.partialPercentage}% ({acceptanceData.partial})
                                </span>
                            </div>
                            <div className="w-full bg-[var(--surface2)] rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${acceptanceData.partialPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Recusa */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                    Recusa
                                </span>
                                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                    {acceptanceData.refusedPercentage}% ({acceptanceData.refused})
                                </span>
                            </div>
                            <div className="w-full bg-[var(--surface2)] rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${acceptanceData.refusedPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                            <p className="text-xs text-[var(--text-muted)] text-center">
                                Total de refeições avaliadas: <span className="font-bold text-[var(--text-main)]">{acceptanceData.total + acceptanceData.partial + acceptanceData.refused}</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                        <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="text-sm">Sem avaliações de aceitação hoje</p>
                        <p className="text-xs mt-1">As avaliações aparecem após a entrega das refeições</p>
                    </div>
                )}
            </div>

            {/* MAPA DE QUANTITATIVOS */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--surface)]">
                    <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 font-[family-name:var(--font-space)]">
                        <TrendingUp className="text-[var(--text-muted)]" />
                        Mapa de Produção (Quantitativos)
                    </h2>
                    <span className="text-sm text-[var(--text-muted)]">Atualizado em tempo real</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface2)] text-[var(--text-secondary)] uppercase text-xs font-bold tracking-wider border-b border-[var(--border-subtle)]">
                            <tr>
                                <th className="px-6 py-4">Tipo de Dieta</th>
                                <th className="px-6 py-4 text-center">Quantidade</th>
                                <th className="px-6 py-4 text-right">% do Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)]">
                            {dietTypes.map((type) => {
                                const count = dietCounts[type] || 0;
                                const percentage = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;

                                if (count === 0) return null;

                                return (
                                    <tr key={type} className="hover:bg-[var(--surface2)] transition-colors">
                                        <td className="px-6 py-4 font-medium text-[var(--text-main)]">{type}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 py-1 px-3 rounded-full font-bold text-sm">
                                                {count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-[var(--text-muted)]">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-24 h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--primary)] rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 font-medium">{percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* LINHA DE TOTAL */}
                            <tr className="bg-[var(--surface2)] font-bold text-[var(--text-main)]">
                                <td className="px-6 py-4">TOTAL GERAL</td>
                                <td className="px-6 py-4 text-center text-lg">{totalOrders}</td>
                                <td className="px-6 py-4 text-right">100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: 'blue' | 'green' | 'orange';
    trend?: string;
}

function KpiCard({ title, value, icon: Icon, color, trend }: KpiCardProps) {
    const colors: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900",
        green: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900",
        orange: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900",
    };

    return (
        <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${colors[color]} border`}>
                    <Icon size={24} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[color]}`}>
                    {trend}
                </span>
            </div>
            <h3 className="text-[var(--text-secondary)] text-sm font-medium mb-1">{title}</h3>
            <div className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)]">{value}</div>
        </div>
    );
}
