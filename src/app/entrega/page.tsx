'use client';

import { useOrderStore } from '@/store/useOrderStore';
import { Truck, CheckCircle, MapPin, Clock } from 'lucide-react';

export default function DeliveryPage() {
    const { orders, completeOrder } = useOrderStore();

    const readyOrders = orders.filter(order => order.status === 'Pronto');

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight flex items-center gap-3">
                    <Truck className="text-[var(--primary)]" size={32} />
                    Copa & Entrega
                </h1>
            </header>

            {readyOrders.length === 0 ? (
                <div className="card p-16 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-[var(--surface2)] rounded-full mb-6">
                        <CheckCircle size={48} className="text-[var(--primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-main)] mb-2 font-[family-name:var(--font-space)]">Tudo entregue!</h3>
                    <p className="text-[var(--text-secondary)]">Não há dietas aguardando entrega no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {readyOrders.map(order => (
                        <div key={order.id} className="card p-5 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-[var(--shadow-glow)] transition-all border border-[var(--border-subtle)] hover:border-[var(--primary)]">

                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-emerald-700 dark:text-emerald-400 font-bold text-2xl w-20 h-20 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800">
                                    {order.bed}
                                </div>

                                <div>
                                    <h3 className="font-bold text-xl text-[var(--text-main)] font-[family-name:var(--font-space)]">{order.patientName}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2.5 py-0.5 bg-[var(--surface2)] text-[var(--text-secondary)] text-sm rounded-md font-medium border border-[var(--border-subtle)]">
                                            {order.dietType}
                                        </span>
                                        {order.modifier !== 'Nenhuma' && (
                                            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-sm rounded-md font-bold border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                                                {order.modifier}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)] font-medium">
                                        <span className="flex items-center gap-1.5 bg-[var(--surface2)] px-2 py-1 rounded">
                                            <Clock size={12} />
                                            Pronto às: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-auto min-w-[300px]">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center mb-1">Registrar Aceitação</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => completeOrder(order.id, 'Aceitação Total')}
                                        className="flex-1 btn bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-transparent dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                                    >
                                        <CheckCircle size={16} /> Total
                                    </button>
                                    <button
                                        onClick={() => completeOrder(order.id, 'Aceitação Parcial')}
                                        className="flex-1 btn bg-amber-100 hover:bg-amber-200 text-amber-800 border-transparent dark:bg-amber-900/40 dark:text-amber-300 dark:hover:bg-amber-900/60"
                                    >
                                        <div className="w-3 h-3 rounded-full border-2 border-current border-t-transparent transform -rotate-45"></div> Parcial
                                    </button>
                                    <button
                                        onClick={() => completeOrder(order.id, 'Recusa')}
                                        className="flex-1 btn bg-red-100 hover:bg-red-200 text-red-800 border-transparent dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60"
                                    >
                                        <div className="w-3 h-3 rounded-full border-2 border-current flex items-center justify-center">
                                            <div className="w-2 h-0.5 bg-current transform rotate-45"></div>
                                        </div> Recusa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
