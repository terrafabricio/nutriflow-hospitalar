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
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <ChefHat className="text-orange-500" size={32} />
                        Cozinha - Produção
                    </h1>
                    <p className="text-slate-500">Gerenciamento de pedidos em tempo real</p>
                </div>
            </header>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {/* COLUNA 1: NOVOS */}
                <KanbanColumn
                    title="Novos Pedidos"
                    count={getOrdersByStatus('Novos').length}
                    color="blue"
                    icon={Clock}
                    headerAction={
                        <button
                            onClick={handlePrintAll}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1 transition-colors"
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

function KanbanColumn({ title, count, color, icon: Icon, children, headerAction }: any) {
    const bgColors: any = {
        blue: "bg-blue-50 border-blue-200",
        orange: "bg-orange-50 border-orange-200",
        green: "bg-green-50 border-green-200",
    };

    const textColors: any = {
        blue: "text-blue-800",
        orange: "text-orange-800",
        green: "text-green-800",
    };

    return (
        <div className={`flex flex-col h-full rounded-xl border-2 ${bgColors[color]} overflow-hidden`}>
            <div className={`p-4 border-b ${bgColors[color]} flex justify-between items-center`}>
                <div className="flex items-center gap-2 font-bold">
                    <Icon size={20} className={textColors[color]} />
                    <span className={textColors[color]}>{title}</span>
                </div>
                <div className="flex items-center gap-2">
                    {headerAction}
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                        {count}
                    </span>
                </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {children}
            </div>
        </div>
    );
}

function OrderCard({ order, onClick, onAction, actionLabel, actionColor, readOnly, onPrint, allergies }: { order: Order, onClick?: () => void, onAction?: (e: any) => void, actionLabel?: string, actionColor?: string, readOnly?: boolean, onPrint?: (e: any) => void, allergies?: string }) {
    const isCritical = order.modifier === 'Neutropênica' || order.modifier === 'Renal';
    const isFasting = order.isFasting;

    return (
        <div
            onClick={onClick}
            className={`bg-white p-4 rounded-lg shadow-sm border-l-4 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 ${isFasting ? 'border-l-red-600 bg-red-50 ring-2 ring-red-100' : isCritical ? 'border-l-red-500' : 'border-l-slate-300'}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-slate-800 text-lg">{order.bed}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrint}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                        title="Imprimir Etiqueta"
                    >
                        <Printer size={16} />
                    </button>
                    <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="mb-3">
                <div className="font-medium text-slate-700">{order.patientName}</div>

                {isFasting ? (
                    <div className="mt-2 animate-pulse">
                        <div className="text-lg font-black text-red-600 uppercase tracking-wider">JEJUM ABSOLUTO</div>
                        <div className="text-xs font-bold text-red-500 mt-1">Motivo: {order.fastingReason}</div>
                    </div>
                ) : (
                    <>
                        <div className="text-sm text-slate-600 mt-1">
                            <span className="font-semibold">Dieta:</span> {order.dietType}
                        </div>
                        {order.modifier !== 'Nenhuma' && (
                            <div className={`text-xs font-bold mt-1 px-2 py-1 rounded inline-block ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                {order.modifier}
                            </div>
                        )}
                    </>
                )}

                {allergies && (
                    <div className="mt-2 bg-red-50 border border-red-100 p-2 rounded text-xs text-red-700 font-bold animate-pulse">
                        ⚠️ ALERGIA: {allergies}
                    </div>
                )}
                {order.hasCompanion && !isFasting && (
                    <div className="mt-1">
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded inline-block">
                            + Acompanhante
                        </span>
                    </div>
                )}
            </div>

            {!readOnly && onAction && (
                <button
                    onClick={onAction}
                    className={`w-full py-2 rounded-md text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 ${actionColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-500 hover:bg-orange-600'
                        }`}
                >
                    {actionLabel} <ArrowRight size={16} />
                </button>
            )}

            {readOnly && (
                <div className="text-center py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md border border-green-100">
                    Aguardando Entrega
                </div>
            )}
        </div>
    );
}
