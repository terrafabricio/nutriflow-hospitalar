'use client';

import { useState, useMemo, useEffect } from 'react';
import { useOrderStore, DietType, DietModifier } from '@/store/useOrderStore';
import { User, FileText, CheckCircle, AlertCircle, Search, Plus, Users, UserPlus, Clock } from 'lucide-react';

const dietTypes: DietType[] = ['Livre', 'Branda', 'Pastosa', 'Cremosa', 'Líquida Completa', 'Líquida Restrita'];
const modifiers: DietModifier[] = ['Nenhuma', 'Hipossódica', 'Hipolipídica', 'Diabetes (DM)', 'Renal', 'Neutropênica'];

export default function PrescriptionPage() {
    const { patients, addOrder, addPatient, checkDuplicateOrder } = useOrderStore();

    // UI States
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddingPatient, setIsAddingPatient] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

    // Form States
    const [diet, setDiet] = useState<DietType>('Livre');
    const [modifier, setModifier] = useState<DietModifier>('Nenhuma');
    const [meal, setMeal] = useState<'Café da Manhã' | 'Almoço' | 'Lanche da Tarde' | 'Jantar' | 'Ceia'>(() => getSuggestedMeal());
    const [notes, setNotes] = useState('');
    const [hasCompanion, setHasCompanion] = useState(false);
    const [companionDiet, setCompanionDiet] = useState<'Padrão' | 'Personalizada'>('Padrão');
    const [isFasting, setIsFasting] = useState(false);
    const [fastingReason, setFastingReason] = useState('');

    // New Patient Form States
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientBed, setNewPatientBed] = useState('');
    const [newPatientWard, setNewPatientWard] = useState('');

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
        } catch {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus('idle'), 3000);
        }
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <header className="shrink-0 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight">Prescrição</h1>
                    <p className="text-[var(--text-secondary)]">Gerencie pacientes e solicite refeições</p>
                </div>
            </header>

            {successMessage && (
                <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2 animate-fade-in shrink-0">
                    <CheckCircle size={20} />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                {/* LEFT COLUMN: PATIENT LIST & SEARCH */}
                <div className="lg:col-span-4 flex flex-col card overflow-hidden">
                    <div className="p-4 border-b border-[var(--border-subtle)] space-y-3 bg-[var(--surface)]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar paciente ou leito..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-lg focus:ring-2 focus:ring-[var(--primaryGlow)] focus:border-[var(--primary)] outline-none text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => { setIsAddingPatient(true); setSelectedPatientId(null); }}
                            className="btn btn-ghost w-full justify-center border border-dashed border-[var(--border-subtle)] hover:border-[var(--primary)] text-[var(--primary)]"
                        >
                            <Plus size={16} /> Novo Paciente
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredPatients.length === 0 ? (
                            <div className="text-center py-8 text-[var(--text-muted)] text-sm italic">
                                Nenhum paciente encontrado.
                            </div>
                        ) : (
                            filteredPatients.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => handlePatientSelect(patient.id)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all group ${selectedPatientId === patient.id
                                        ? 'bg-[var(--surface2)] border-[var(--primary)] shadow-sm'
                                        : 'bg-transparent border-transparent hover:bg-[var(--surface2)] hover:border-[var(--border-subtle)]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className={`font-bold ${selectedPatientId === patient.id ? 'text-[var(--text-main)]' : 'text-[var(--text-secondary)]'}`}>
                                            {patient.name}
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${selectedPatientId === patient.id ? 'bg-[var(--primary)] text-[var(--text-main)] border-transparent' : 'bg-[var(--surface2)] text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>
                                            {patient.bed}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)] mt-1">
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
                        <div className="card p-8 h-full bg-[var(--surface)]">
                            <h2 className="text-xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] flex items-center gap-2 mb-6">
                                <UserPlus className="text-[var(--primary)]" />
                                Admissão Manual de Paciente
                            </h2>
                            <form onSubmit={handleNewPatientSubmit} className="max-w-lg space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nome Completo</label>
                                    <input
                                        type="text"
                                        required
                                        className="input"
                                        value={newPatientName}
                                        onChange={(e) => setNewPatientName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Leito</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: 204B"
                                            className="input"
                                            value={newPatientBed}
                                            onChange={(e) => setNewPatientBed(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Ala / Setor</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Clínica Médica"
                                            className="input"
                                            value={newPatientWard}
                                            onChange={(e) => setNewPatientWard(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingPatient(false)}
                                        className="btn btn-ghost"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary shadow-md"
                                    >
                                        Salvar Paciente
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : selectedPatient ? (
                        /* PRESCRIPTION FORM */
                        <div className="card p-6 h-full overflow-y-auto bg-[var(--surface)]">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-[var(--border-subtle)]">
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] flex items-center gap-2">
                                        <FileText className="text-[var(--primary)]" />
                                        Nova Prescrição
                                    </h2>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Defina a dieta para o turno atual</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)]">{selectedPatient.name}</div>
                                    <div className="text-sm font-medium text-[var(--text-main)] bg-[var(--primary)] px-3 py-1 rounded-full inline-block shadow-[var(--shadow-glow)]">
                                        Leito {selectedPatient.bed}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleOrderSubmit} className="space-y-8">

                                {/* FASTING TOGGLE */}
                                <div className={`p-4 rounded-xl border transition-all ${isFasting ? 'bg-red-50 border-red-500 dark:bg-red-900/10 dark:border-red-900' : 'bg-[var(--surface2)] border-[var(--border-subtle)]'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isFasting ? 'bg-red-100 text-red-600' : 'bg-[var(--surface)] text-[var(--text-muted)]'}`}>
                                                <AlertCircle size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${isFasting ? 'text-red-700' : 'text-[var(--text-main)]'}`}>PACIENTE EM JEJUM / PRÉ-OP</h3>
                                                <p className="text-xs text-[var(--text-secondary)]">Ative para suspender a alimentação</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isFasting}
                                                onChange={(e) => setIsFasting(e.target.checked)}
                                            />
                                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primaryGlow)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--danger)]"></div>
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
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Refeição (Sugestão Automática)</label>
                                    <select
                                        value={meal}
                                        onChange={(e) => setMeal(e.target.value as 'Café da Manhã' | 'Almoço' | 'Lanche da Tarde' | 'Jantar' | 'Ceia')}
                                        disabled={isFasting}
                                        className="input font-bold text-[var(--text-main)]"
                                    >
                                        <option value="Café da Manhã">Café da Manhã</option>
                                        <option value="Almoço">Almoço</option>
                                        <option value="Lanche da Tarde">Lanche da Tarde</option>
                                        <option value="Jantar">Jantar</option>
                                        <option value="Ceia">Ceia</option>
                                    </select>
                                    <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        Horário atual: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                {/* DIET SELECTION (Disabled if Fasting) */}
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${isFasting ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Dieta Base</label>
                                        <select
                                            value={diet}
                                            onChange={(e) => setDiet(e.target.value as DietType)}
                                            disabled={isFasting}
                                            className="input"
                                        >
                                            {dietTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Modificador</label>
                                        <select
                                            value={modifier}
                                            onChange={(e) => setModifier(e.target.value as DietModifier)}
                                            disabled={isFasting}
                                            className="input"
                                        >
                                            {modifiers.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {modifier === 'Neutropênica' && !isFasting && (
                                    <div className="p-4 bg-[var(--warning)]/10 border-l-4 border-[var(--warning)] rounded-r-lg flex gap-3">
                                        <AlertCircle className="text-[var(--warning)] shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-[var(--warning)] text-sm">Protocolo de Segurança</h4>
                                            <p className="text-[var(--text-secondary)] text-sm mt-1">Proibido alimentos crus. Higienização rigorosa obrigatória.</p>
                                        </div>
                                    </div>
                                )}

                                {/* COMPANION SECTION */}
                                <div className="p-5 border border-[var(--border-subtle)] rounded-xl bg-[var(--surface2)]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="text-[var(--text-muted)]" size={20} />
                                        <label className="font-bold text-[var(--text-main)] flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={hasCompanion}
                                                onChange={(e) => setHasCompanion(e.target.checked)}
                                                className="w-5 h-5 text-[var(--primary)] rounded focus:ring-[var(--primaryGlow)]"
                                            />
                                            Possui Acompanhante Autorizada?
                                        </label>
                                    </div>

                                    {hasCompanion && (
                                        <div className="ml-8 animate-fade-in">
                                            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Tipo de Refeição do Acompanhante</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="companionDiet"
                                                        value="Padrão"
                                                        checked={companionDiet === 'Padrão'}
                                                        onChange={() => setCompanionDiet('Padrão')}
                                                        className="text-[var(--primary)] focus:ring-[var(--primaryGlow)]"
                                                    />
                                                    <span className="text-sm text-[var(--text-main)]">Padrão (Geral)</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="companionDiet"
                                                        value="Personalizada"
                                                        checked={companionDiet === 'Personalizada'}
                                                        onChange={() => setCompanionDiet('Personalizada')}
                                                        className="text-[var(--primary)] focus:ring-[var(--primaryGlow)]"
                                                    />
                                                    <span className="text-sm text-[var(--text-main)]">Personalizada (Gestante/Nutriz)</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Observações</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="input resize-none"
                                        placeholder="Ex: Alergias, preferências..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-[var(--border-subtle)]">
                                    <button
                                        type="submit"
                                        disabled={submitStatus === 'loading' || submitStatus === 'success'}
                                        className={`btn w-full justify-center h-12 text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.99] disabled:opacity-90 disabled:cursor-not-allowed ${submitStatus === 'success'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                            : submitStatus === 'error'
                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                : submitStatus === 'loading'
                                                    ? 'bg-[var(--text-muted)] text-[var(--surface)] cursor-wait'
                                                    : isFasting
                                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                                        : 'btn-primary'
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
                        <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] bg-[var(--surface2)] rounded-xl border-2 border-dashed border-[var(--border-subtle)] p-8">
                            <User className="w-16 h-16 mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-[var(--text-main)]">Nenhum paciente selecionado</h3>
                            <p className="text-sm max-w-xs text-center mt-2">Selecione um paciente na lista ao lado ou cadastre uma nova admissão.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
