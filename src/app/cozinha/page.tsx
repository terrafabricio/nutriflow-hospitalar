'use client';

import { useState } from 'react';
import { useOrderStore, Order, OrderStatus } from '@/store/useOrderStore';
import { Clock, ChefHat, CheckCircle, ArrowRight, Printer } from 'lucide-react';
import DietDetailModal from '@/components/kitchen/DietDetailModal';
import jsPDF from 'jspdf';

// Helper para remover acentos
const removeAcentos = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function KitchenPage() {
    const { orders, moveOrder, patients } = useOrderStore();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const getOrdersByStatus = (status: OrderStatus) =>
        orders.filter(order => order.status === status);

    const handleMoveOrder = (id: string, currentStatus: OrderStatus) => {
        const nextStatus: Record<string, OrderStatus> = {
            'Novos': 'Em Preparo',
            'Em Preparo': 'Pronto',
        };
        if (nextStatus[currentStatus]) {
            moveOrder(id, nextStatus[currentStatus]);
        }
    };

    const generateLabel = (order: Order) => {
        try {
            // 100mm x 25mm
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [100, 25]
            });

            const patient = patients.find(p => p.bed === order.bed);
            const nome = removeAcentos(order.patientName || 'Paciente');
            const leito = removeAcentos(order.bed || 'S/L');
            const dieta = removeAcentos(order.dietType || 'Livre');
            const alergias = patient?.allergies ? removeAcentos(patient.allergies) : '';

            // Design
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(nome.substring(0, 25), 3, 8); // Nome (limite caracteres)

            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Leito: ${leito}`, 3, 13); // Leito

            // Destaque da Dieta (Direita)
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(dieta, 95, 10, { align: 'right' });

            // Alerta de Alergia
            if (alergias) {
                doc.setTextColor(220, 0, 0); // Vermelho
                doc.setFontSize(7);
                doc.text(`ALERTA: ${alergias}`, 3, 22);
            } else {
                // Se não tiver alergia, mostra data discreta
                doc.setTextColor(100); // Cinza
                doc.setFontSize(6);
                doc.text(new Date().toLocaleTimeString(), 3, 22);
            }

            doc.save(`etiqueta_${leito}.pdf`);
        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar a etiqueta PDF. Verifique o console para mais detalhes.");
        }
    };

    const handlePrintAll = () => {
        const newOrders = getOrdersByStatus('Novos');
        if (newOrders.length === 0) return alert('Nenhum pedido novo para imprimir.');

        newOrders.forEach(order => generateLabel(order));
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <header className="shrink-0 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight flex items-center gap-3">
                        <ChefHat className="text-[var(--warning)]" size={32} />
                        Cozinha <span className="text-[var(--text-muted)] font-light text-2xl">| Produção</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
                {/* COLUNA 1: NOVOS */}
                <KanbanColumn
                    title="Novos Pedidos"
                    count={getOrdersByStatus('Novos').length}
                    color="blue"
                    icon={Clock}
                    headerAction={
                        <button
                            onClick={handlePrintAll}
                            className="btn btn-ghost text-xs px-2 py-1 h-auto min-h-0 flex items-center gap-1"
                            title="Imprimir todas as etiquetas"
                        >
                            <Printer size={14} />
                            Imprimir Turno
                        </button>
                    }
                >
                    {getOrdersByStatus('Novos').map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onClick={() => setSelectedOrder(order)}
                            onAction={(e) => { e.stopPropagation(); handleMoveOrder(order.id, 'Novos'); }}
                            actionLabel="Iniciar Preparo"
                            actionColor="blue"
                            onPrint={(e) => { e.stopPropagation(); generateLabel(order); }}
                            allergies={patients.find(p => p.bed === order.bed)?.allergies}
                        />
                    ))}
                </KanbanColumn>

                {/* COLUNA 2: EM PREPARO */}
                <KanbanColumn
                    title="Em Preparo"
                    count={getOrdersByStatus('Em Preparo').length}
                    color="orange"
                    icon={ChefHat}
                >
                    {getOrdersByStatus('Em Preparo').map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onClick={() => setSelectedOrder(order)}
                            onAction={(e) => { e.stopPropagation(); handleMoveOrder(order.id, 'Em Preparo'); }}
                            actionLabel="Marcar Pronto"
                            actionColor="orange"
                            onPrint={(e) => { e.stopPropagation(); generateLabel(order); }}
                            allergies={patients.find(p => p.bed === order.bed)?.allergies}
                        />
                    ))}
                </KanbanColumn>

                {/* COLUNA 3: PRONTO */}
                <KanbanColumn
                    title="Pronto para Entrega"
                    count={getOrdersByStatus('Pronto').length}
                    color="green"
                    icon={CheckCircle}
                >
                    {getOrdersByStatus('Pronto').map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onClick={() => setSelectedOrder(order)}
                            readOnly
                            onPrint={(e) => { e.stopPropagation(); generateLabel(order); }}
                            allergies={patients.find(p => p.bed === order.bed)?.allergies}
                        />
                    ))}
                </KanbanColumn>
            </div>

            {/* MODAL DE DETALHES */}
            {selectedOrder && (
                <DietDetailModal
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onMove={() => handleMoveOrder(selectedOrder.id, selectedOrder.status)}
                />
            )}
        </div>
    );
}

interface KanbanColumnProps {
    title: string;
    count: number;
    color: 'blue' | 'orange' | 'green';
    icon: React.ElementType;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
}

function KanbanColumn({ title, count, color, icon: Icon, children, headerAction }: KanbanColumnProps) {
    const bgColors: Record<string, string> = {
        blue: "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900",
        orange: "bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900",
        green: "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900",
    };

    const textColors: Record<string, string> = {
        blue: "text-blue-700 dark:text-blue-400",
        orange: "text-orange-700 dark:text-orange-400",
        green: "text-emerald-700 dark:text-emerald-400",
    };

    const headerColors: Record<string, string> = {
        blue: "bg-blue-50/80 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
        orange: "bg-orange-50/80 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800",
        green: "bg-emerald-50/80 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
    };

    return (
        <div className={`flex flex-col h-full rounded-xl border ${bgColors[color]} overflow-hidden backdrop-blur-sm`}>
            <div className={`p-3 border-b ${headerColors[color]} flex justify-between items-center`}>
                <div className="flex items-center gap-2 font-bold">
                    <Icon size={18} className={textColors[color]} />
                    <span className={`text-sm tracking-tight ${textColors[color]}`}>{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {headerAction}
                    <span className="bg-[var(--surface)] px-2 py-0.5 rounded-md text-xs font-bold shadow-sm border border-[var(--border-subtle)]">
                        {count}
                    </span>
                </div>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
                {children}
            </div>
        </div>
    );
}

function OrderCard({ order, onClick, onAction, actionLabel, actionColor, readOnly, onPrint, allergies }: { order: Order, onClick?: () => void, onAction?: (e: React.MouseEvent) => void, actionLabel?: string, actionColor?: string, readOnly?: boolean, onPrint?: (e: React.MouseEvent) => void, allergies?: string }) {
    const isCritical = order.modifier === 'Neutropênica' || order.modifier === 'Renal';
    const isFasting = order.isFasting;

    return (
        <div
            onClick={onClick}
            className={`card p-4 hover:shadow-md cursor-pointer transform hover:-translate-y-1 border-l-4 transition-all ${isFasting
                ? 'border-l-[var(--danger)] bg-red-50/50 dark:bg-red-900/10'
                : isCritical
                    ? 'border-l-[var(--warning)]'
                    : 'border-l-[var(--border-subtle)] hover:border-l-[var(--primary)]'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-[var(--text-main)] text-lg font-[family-name:var(--font-space)]">{order.bed}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrint}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--surface2)] rounded transition-colors"
                        title="Imprimir Etiqueta"
                    >
                        <Printer size={16} />
                    </button>
                    <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--surface2)] px-1.5 py-0.5 rounded">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className="mb-3">
                <div className="font-medium text-[var(--text-secondary)] text-sm mb-1">{order.patientName}</div>

                {isFasting ? (
                    <div className="mt-2 animate-pulse p-2 bg-red-100/50 rounded-lg border border-red-200">
                        <div className="text-sm font-black text-red-600 uppercase tracking-wider flex items-center gap-1">JEJUM ABSOLUTO</div>
                        <div className="text-xs font-bold text-red-500 mt-0.5">Motivo: {order.fastingReason}</div>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-[var(--text-main)] mt-1 flex items-baseline gap-1">
                            <span className="font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider">Dieta:</span>
                            <span className="font-medium">{order.dietType}</span>
                        </div>
                        {order.modifier !== 'Nenhuma' && (
                            <div className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded inline-block uppercase tracking-wide ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                {order.modifier}
                            </div>
                        )}
                    </>
                )}

                {allergies && (
                    <div className="mt-2 bg-red-50 border border-red-100 p-2 rounded text-xs text-red-700 font-bold animate-pulse flex items-center gap-1">
                        ⚠️ ALERGIA: {allergies}
                    </div>
                )}
                {order.hasCompanion && !isFasting && (
                    <div className="mt-1">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded inline-block">
                            + Acompanhante
                        </span>
                    </div>
                )}
            </div>

            {!readOnly && onAction && (
                <button
                    onClick={onAction}
                    className={`btn btn-sm w-full gap-2 ${actionColor === 'blue'
                        ? 'btn-primary'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                        }`}
                >
                    {actionLabel} <ArrowRight size={14} />
                </button>
            )}

            {readOnly && (
                <div className="text-center py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-md border border-emerald-100 uppercase tracking-wide">
                    Aguardando Entrega
                </div>
            )}
        </div>
    );
}
