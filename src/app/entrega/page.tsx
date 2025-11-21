'use client';

import { useOrderStore } from '@/store/useOrderStore';
import { Truck, CheckCircle, MapPin, Clock } from 'lucide-react';

export default function DeliveryPage() {
    const { orders, completeOrder } = useOrderStore();

    const readyOrders = orders.filter(order => order.status === 'Pronto');

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <Truck className="text-green-600" size={32} />
                    Copa & Entrega
                </h1>
                <p className="text-slate-500">Confirmação de entrega de dietas nos leitos</p>
            </header>

            {readyOrders.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <CheckCircle size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-medium text-slate-600">Tudo entregue!</h3>
                    <p className="text-slate-400">Não há dietas aguardando entrega no momento.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {readyOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">

                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="bg-green-100 p-4 rounded-full text-green-700 font-bold text-xl w-16 h-16 flex items-center justify-center shrink-0">
                                    {order.bed}
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{order.patientName}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-sm rounded-md font-medium border border-blue-100">
                                            {order.dietType}
                                        </span>
                                        {order.modifier !== 'Nenhuma' && (
                                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-sm rounded-md font-medium border border-amber-100">
                                                {order.modifier}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            Pronto às: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-1">Registrar Aceitação</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => completeOrder(order.id, 'Aceitação Total')}
                                        className="flex-1 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-1 text-sm"
                                        title="Comeu tudo"
                                    >
                                        <CheckCircle size={16} /> Total
                                    </button>
                                    <button
                                        onClick={() => completeOrder(order.id, 'Aceitação Parcial')}
                                        className="flex-1 px-4 py-2 bg-yellow-100 text-yellow-700 font-bold rounded-lg hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1 text-sm"
                                        title="Comeu metade"
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-yellow-600 border-t-transparent transform -rotate-45"></div> Parcial
                                    </button>
                                    <button
                                        onClick={() => completeOrder(order.id, 'Recusa')}
                                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 text-sm"
                                        title="Não comeu"
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-red-600 flex items-center justify-center">
                                            <div className="w-3 h-0.5 bg-red-600 transform rotate-45"></div>
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
