'use client';

import { useState, useMemo, useEffect } from 'react';
import { useOrderStore, DietType, DietModifier } from '@/store/useOrderStore';
import { User, FileText, CheckCircle, AlertCircle, Search, Plus, Users, UserPlus, Clock } from 'lucide-react';

const dietTypes: DietType[] = ['Livre', 'Branda', 'Pastosa', 'Cremosa', 'Líquida Completa', 'Líquida Restrita'];
const modifiers: DietModifier[] = ['Nenhuma', 'Hipossódica', 'Hipolipídica', 'Diabetes (DM)', 'Renal', 'Neutropênica'];

export default function PrescriptionPage() {
    const { patients, orders, addOrder, addPatient, checkDuplicateOrder } = useOrderStore();

    // UI States
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingPatient, setIsAddingPatient] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Form States
    const [diet, setDiet] = useState<DietType>('Livre');
    const [modifier, setModifier] = useState<DietModifier>('Nenhuma');
    const [meal, setMeal] = useState<'Café da Manhã' | 'Almoço' | 'Lanche da Tarde' | 'Jantar' | 'Ceia'>('Café da Manhã');
    const [notes, setNotes] = useState('');
    const [hasCompanion, setHasCompanion] = useState(false);
    const [companionDiet, setCompanionDiet] = useState<'Padrão' | 'Personalizada'>('Padrão');
    const [isFasting, setIsFasting] = useState(false);
    const [fastingReason, setFastingReason] = useState('');

    // New Patient Form States
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientBed, setNewPatientBed] = useState('');
    const [newPatientWard, setNewPatientWard] = useState('');

    // Smart Meal Selection Logic
    const getSuggestedMeal = () => {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const time = hour * 60 + minute; // Time in minutes

        // Ranges in minutes
        // Café: 21:00 (prev) - 08:30 -> 1260 - 510 (handled by else/start of day)
        // Almoço: 08:31 - 12:30 -> 511 - 750
        // Lanche: 12:31 - 15:30 -> 751 - 930
        // Jantar: 15:31 - 18:30 -> 931 - 1110
        // Ceia: 18:31 - 21:00 -> 1111 - 1260

        if (time >= 511 && time <= 750) return 'Almoço';
        if (time >= 751 && time <= 930) return 'Lanche da Tarde';
        if (time >= 931 && time <= 1110) return 'Jantar';
        if (time >= 1111 && time <= 1260) return 'Ceia';
        return 'Café da Manhã'; // Default for night/early morning
    };

    // Auto-select meal on mount
    useEffect(() => {
        setMeal(getSuggestedMeal());
    }, []);

    // Derived State
    const filteredPatients = useMemo(() => {
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.bed.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [patients, searchTerm]);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    // Handlers
    const handlePatientSelect = (patientId: string) => {
        setSelectedPatientId(patientId);
        setIsAddingPatient(false);

        // Pre-fill logic
        setDiet('Livre');
        setModifier('Nenhuma');
        setMeal(getSuggestedMeal()); // Re-evaluate on new patient select
        setNotes('');
        setHasCompanion(false);
        setCompanionDiet('Padrão');
        setIsFasting(false);
        setFastingReason('');
        setSubmitStatus('idle');
    };

    const handleNewPatientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPatientName || !newPatientBed) return;

        addPatient({
            name: newPatientName,
            bed: newPatientBed,
            ward: newPatientWard || 'Geral'
        });

        setSuccessMessage('Paciente cadastrado com sucesso!');
        setNewPatientName('');
        setNewPatientBed('');
        setNewPatientWard('');
        setIsAddingPatient(false);

        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;

        // Verificar duplicidade
        const isDuplicate = checkDuplicateOrder(selectedPatient.id, meal);
        if (isDuplicate) {
            setSubmitStatus('error');
            alert(`❌ Erro: Já existe uma prescrição de ${meal} para este paciente hoje!\n\nPara evitar desperdício, não é permitido criar pedidos duplicados da mesma refeição no mesmo dia.`);
            setTimeout(() => setSubmitStatus('idle'), 3000);
            return;
        }

        setSubmitStatus('loading');

        try {
            await addOrder({
                patientId: selectedPatient.id,
                patientName: selectedPatient.name,
                bed: selectedPatient.bed,
                dietType: isFasting ? 'Livre' : diet,
                modifier: isFasting ? 'Nenhuma' : modifier,
                notes: notes,
                hasCompanion,
                companionDiet: hasCompanion ? companionDiet : undefined,
                isFasting,
                fastingReason,
                meal
            });

            setSubmitStatus('success');
            setSuccessMessage('Pedido enviado com sucesso para a cozinha!');

            setTimeout(() => {
                setSuccessMessage('');
                setSelectedPatientId(null);
                setDiet('Livre');
                setModifier('Nenhuma');
                setMeal(getSuggestedMeal());
                setNotes('');
                setHasCompanion(false);
                setIsFasting(false);
                setFastingReason('');
                setSubmitStatus('idle');
            }, 3000);
        } catch (error) {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
        }
    };

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-slate-800">Prescrição de Dietas</h1>
                <p className="text-slate-500">Gerencie pacientes e solicite refeições</p>
            </header>

            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 animate-fade-in shrink-0">
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* LEFT COLUMN: PATIENT LIST & SEARCH */}
                <div className="lg:col-span-4 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar paciente ou leito..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { setIsAddingPatient(true); setSelectedPatientId(null); }}
                            className="w-full py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                            <Plus size={16} /> Novo Paciente
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Nenhum paciente encontrado.
                            </div>
                        ) : (
                            filteredPatients.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => handlePatientSelect(patient.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all group ${selectedPatientId === patient.id
                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 z-10'
                                        : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className={`font-bold ${selectedPatientId === patient.id ? 'text-blue-800' : 'text-slate-700'}`}>
                                            {patient.name}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedPatientId === patient.id ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {patient.bed}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        {patient.ward}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: ACTION PANEL */}
                <div className="lg:col-span-8 flex flex-col">
                    {isAddingPatient ? (
                        /* MANUAL ADMISSION FORM */
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-full">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                                <UserPlus className="text-blue-600" />
                                Admissão Manual de Paciente
                            </h2>
                            <form onSubmit={handleNewPatientSubmit} className="max-w-lg space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newPatientName}
                                        onChange={(e) => setNewPatientName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Leito</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: 204B"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newPatientBed}
                                            onChange={(e) => setNewPatientBed(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Ala / Setor</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Clínica Médica"
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={newPatientWard}
                                            onChange={(e) => setNewPatientWard(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingPatient(false)}
                                        className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                                    >
                                        Salvar Paciente
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : selectedPatient ? (
                        /* PRESCRIPTION FORM */
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-full overflow-y-auto">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                        <FileText className="text-blue-600" />
                                        Nova Prescrição
                                    </h2>
                                    <p className="text-sm text-slate-500 mt-1">Defina a dieta para o turno atual</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-slate-800">{selectedPatient.name}</div>
                                    <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                                        Leito {selectedPatient.bed}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleOrderSubmit} className="space-y-8">

                                {/* FASTING TOGGLE */}
                                <div className={`p-4 rounded-xl border-2 transition-all ${isFasting ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isFasting ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${isFasting ? 'text-red-700' : 'text-slate-700'}`}>PACIENTE EM JEJUM / PRÉ-OP</h3>
                                                <p className="text-xs text-slate-500">Ative para suspender a alimentação</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isFasting}
                                                onChange={(e) => setIsFasting(e.target.checked)}
                                            />
                                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>

                                    {isFasting && (
                                        <div className="mt-4 animate-fade-in">
                                            <label className="block text-sm font-bold text-red-700 mb-2">Motivo / Horário da Cirurgia</label>
                                            <input
                                                type="text"
                                                required={isFasting}
                                                value={fastingReason}
                                                onChange={(e) => setFastingReason(e.target.value)}
                                                placeholder="Ex: Cirurgia às 14h - NPO Absoluto"
                                                className="w-full p-3 bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-red-800 placeholder-red-300"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* MEAL SELECTION (Smart) */}
                                <div className={`transition-opacity ${isFasting ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Refeição (Sugestão Automática)</label>
                                    <select
                                        value={meal}
                                        onChange={(e) => setMeal(e.target.value as any)}
                                        disabled={isFasting}
                                        className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-800 font-bold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        <option value="Café da Manhã">Café da Manhã</option>
                                        <option value="Almoço">Almoço</option>
                                        <option value="Lanche da Tarde">Lanche da Tarde</option>
                                        <option value="Jantar">Jantar</option>
                                        <option value="Ceia">Ceia</option>
                                    </select>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        Horário atual: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {/* DIET SELECTION (Disabled if Fasting) */}
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${isFasting ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Dieta Base</label>
                                        <select
                                            value={diet}
                                            onChange={(e) => setDiet(e.target.value as DietType)}
                                            disabled={isFasting}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            {dietTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Modificador</label>
                                        <select
                                            value={modifier}
                                            onChange={(e) => setModifier(e.target.value as DietModifier)}
                                            disabled={isFasting}
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        >
                                            {modifiers.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {modifier === 'Neutropênica' && !isFasting && (
                                    <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex gap-3">
                                        <AlertCircle className="text-red-600 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-red-800 text-sm">Protocolo de Segurança</h4>
                                            <p className="text-red-700 text-sm mt-1">Proibido alimentos crus. Higienização rigorosa obrigatória.</p>
                                        </div>
                                    </div>
                                )}

                                {/* COMPANION SECTION */}
                                <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="text-slate-500" size={20} />
                                        <label className="font-bold text-slate-700 flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={hasCompanion}
                                                onChange={(e) => setHasCompanion(e.target.checked)}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            Possui Acompanhante Autorizada?
                                        </label>
                                    </div>

                                    {hasCompanion && (
                                        <div className="ml-8 animate-fade-in">
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Refeição do Acompanhante</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="companionDiet"
                                                        value="Padrão"
                                                        checked={companionDiet === 'Padrão'}
                                                        onChange={() => setCompanionDiet('Padrão')}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Padrão (Geral)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="companionDiet"
                                                        value="Personalizada"
                                                        checked={companionDiet === 'Personalizada'}
                                                        onChange={() => setCompanionDiet('Personalizada')}
                                                        className="text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-slate-700">Personalizada (Gestante/Nutriz)</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ex: Alergias, preferências..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'loading' || submitStatus === 'success'}
                                        className={`w-full py-4 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-90 disabled:cursor-not-allowed ${submitStatus === 'success'
                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                : submitStatus === 'error'
                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                    : submitStatus === 'loading'
                                                        ? 'bg-slate-400 text-white cursor-wait'
                                                        : isFasting
                                                            ? 'bg-red-600 hover:bg-red-700 text-white'
                                                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white'
                                            }`}
                                    >
                                        {submitStatus === 'loading' ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Enviando...
                                            </>
                                        ) : submitStatus === 'success' ? (
                                            <>
                                                <CheckCircle size={20} />
                                                ✓ Prescrição Registrada com Sucesso!
                                            </>
                                        ) : submitStatus === 'error' ? (
                                            <>
                                                <AlertCircle size={20} />
                                                Erro ao Enviar
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={20} />
                                                {isFasting ? 'Confirmar JEJUM' : 'Enviar Pedido'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* EMPTY STATE */
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200 p-8">
                            <User className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-slate-600">Nenhum paciente selecionado</h3>
                            <p className="text-sm max-w-xs text-center mt-2">Selecione um paciente na lista ao lado ou cadastre uma nova admissão.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
