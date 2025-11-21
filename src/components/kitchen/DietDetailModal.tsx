'use client';

import { Order, DietType, DietModifier } from '@/store/useOrderStore';
import { X, Printer, ArrowRight, AlertTriangle, CheckSquare, Info } from 'lucide-react';

interface DietDetailModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onMove: () => void;
}

export default function DietDetailModal({ order, isOpen, onClose, onMove }: DietDetailModalProps) {
    if (!isOpen) return null;

    const getDietInstructions = (type: DietType, modifier: DietModifier) => {
        const instructions = [];

        // REGRAS DE CONSISTÊNCIA (BASE)
        switch (type) {
            case 'Livre':
                instructions.push('Prato Padrão: Arroz, Feijão, Proteína, Guarnição, Salada, Sobremesa.');
                break;
            case 'Branda':
                instructions.push('✅ Textura Macia (Corta com garfo).');
                instructions.push('✅ Feijão apenas batido ou amassado.');
                instructions.push('🚫 PROIBIDO: Vegetais crus, frituras, cascas grossas.');
                instructions.push('✅ Fibras abrandadas por cocção.');
                break;
            case 'Pastosa':
                instructions.push('✅ Textura Moída, Desfiada ou Amassada.');
                instructions.push('✅ Preparações úmidas (com molho).');
                instructions.push('🚫 PROIBIDO: Alimentos secos (farofa), crocantes, sementes.');
                instructions.push('✅ Carnes: Moídas ou desfiadas (< 4mm).');
                break;
            case 'Cremosa':
                instructions.push('✅ Textura Homogênea (Ponto de Mel/Pudim).');
                instructions.push('✅ Tudo liquidificado/espessado.');
                instructions.push('🚫 PROIBIDO: Líquidos ralos soltos (risco de broncoaspiração).');
                break;
            case 'Líquida Completa':
                instructions.push('✅ Totalmente líquida e homogênea.');
                instructions.push('✅ Sem grumos ou resíduos.');
                instructions.push('✅ Sopas batidas, vitaminas, mingaus.');
                break;
            case 'Líquida Restrita':
                instructions.push('✅ Apenas líquidos CLAROS.');
                instructions.push('🚫 PROIBIDO: Leite e derivados.');
                instructions.push('✅ Chás claros, sucos coados, água de coco, gelatina.');
                break;
        }

        // REGRAS DE MODIFICADORES (TERAPÊUTICAS)
        switch (modifier) {
            case 'Renal':
                instructions.push('⚠️ CONTROLE RIGOROSO: Potássio, Sódio, Fósforo.');
                instructions.push('✅ Feijão: Técnica de remolho obrigatória (8-12h).');
                instructions.push('🚫 PROIBIDO: Carambola, frutas ricas em K (banana nanica).');
                instructions.push('✅ Sal controlado (1-2g).');
                break;
            case 'Diabetes (DM)':
                instructions.push('🚫 PROIBIDO: Açúcar de adição.');
                instructions.push('✅ Sobremesa: Fruta ou Diet.');
                instructions.push('✅ Pão/Bolacha Integral (se houver).');
                break;
            case 'Hipossódica':
                instructions.push('🚫 PROIBIDO: Sal de adição.');
                instructions.push('✅ Pão sem sal.');
                break;
            case 'Hipolipídica':
                instructions.push('✅ Gordura < 20%.');
                instructions.push('🚫 PROIBIDO: Frituras.');
                instructions.push('✅ Laticínios desnatados.');
                break;
            case 'Neutropênica':
                instructions.push('🛑 ALERTA CRÍTICO: Risco de Infecção.');
                instructions.push('🚫 PROIBIDO: Alimentos CRUS (Saladas, Frutas com casca fina).');
                instructions.push('✅ Apenas cozidos ou frutas de casca grossa higienizadas.');
                instructions.push('✅ Utensílios e embalagens estéreis.');
                break;
        }

        return instructions;
    };

    const instructions = getDietInstructions(order.dietType, order.modifier);
    const isCritical = order.modifier === 'Neutropênica' || order.modifier === 'Renal';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className={`p-6 ${isCritical ? 'bg-red-50 border-b border-red-100' : 'bg-slate-50 border-b border-slate-100'} flex justify-between items-start`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-slate-800">{order.patientName}</h2>
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-bold shadow-sm border border-slate-200">
                                Leito {order.bed}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <span className="font-semibold text-blue-700">{order.dietType}</span>
                            {order.modifier !== 'Nenhuma' && (
                                <>
                                    <span>+</span>
                                    <span className={`font-semibold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                                        {order.modifier}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* BODY */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* ALERTA DE ACOMPANHANTE */}
                    {order.hasCompanion && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                            <Info className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-blue-800">Acompanhante Autorizada</h3>
                                <p className="text-blue-700 text-sm">
                                    Tipo de Refeição: <strong>{order.companionDiet || 'Padrão'}</strong>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* CHECKLIST DA COZINHA */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <CheckSquare className="text-green-600" />
                                Composição & Regras
                            </h3>
                            <ul className="space-y-3">
                                {instructions.map((inst, idx) => (
                                    <li key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${inst.includes('🚫') || inst.includes('🛑') || inst.includes('⚠️') ? 'bg-red-500' : 'bg-green-500'}`} />
                                        <span className="text-slate-700 font-medium">{inst}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {order.notes && (
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                <h4 className="font-bold text-amber-800 text-sm mb-1 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Observações do Prescritor
                                </h4>
                                <p className="text-amber-900 italic">"{order.notes}"</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-4">
                    <button className="px-4 py-2 text-slate-600 font-medium hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 transition-all flex items-center gap-2">
                        <Printer size={20} />
                        Imprimir Etiqueta
                    </button>

                    {order.status !== 'Pronto' && (
                        <button
                            onClick={() => { onMove(); onClose(); }}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            Mover para Próxima Etapa <ArrowRight size={20} />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
