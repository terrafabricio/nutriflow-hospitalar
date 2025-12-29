'use client';

import { useState } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { Users, Plus, Trash2, Search, UserPlus, X } from 'lucide-react';

export default function PatientsPage() {
    const { patients, addPatient, removePatient, orders } = useOrderStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPatient, setNewPatient] = useState<{ name: string, bed: string, ward: string, allergies?: string }>({ name: '', bed: '', ward: '', allergies: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddPatient = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPatient.name && newPatient.bed && newPatient.ward) {
            addPatient(newPatient);
            setNewPatient({ name: '', bed: '', ward: '', allergies: '' });
            setIsModalOpen(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.bed.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to find current diet
    const getPatientDiet = (bed: string) => {
        const order = orders.find(o => o.bed === bed && o.status !== 'Entregue');
        return order ? `${order.dietType} ${order.modifier !== 'Nenhuma' ? `(${order.modifier})` : ''}` : 'Sem prescrição ativa';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] tracking-tight flex items-center gap-3">
                        Gerenciar Pacientes
                    </h1>
                    <p className="text-[var(--text-secondary)]">Admissão, alta e controle de ocupação</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary"
                >
                    <UserPlus size={18} />
                    Admitir Paciente
                </button>
            </header>

            {/* Search Bar */}
            <div className="card px-4 py-3 flex items-center gap-3 bg-[var(--surface)]">
                <Search className="text-[var(--text-muted)]" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou leito..."
                    className="flex-1 bg-transparent border-none outline-none text-[var(--text-main)] placeholder-[var(--text-muted)]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patients List */}
            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[var(--surface2)] text-[var(--text-secondary)] uppercase text-xs font-bold tracking-wider border-b border-[var(--border-subtle)]">
                        <tr>
                            <th className="px-6 py-4">Paciente</th>
                            <th className="px-6 py-4">Leito / Setor</th>
                            <th className="px-6 py-4">Dieta Atual</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-[var(--surface2)] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[var(--text-main)]">{patient.name}</td>
                                    <td className="px-6 py-4 text-[var(--text-secondary)]">
                                        <span className="font-bold text-[var(--text-main)]">{patient.bed}</span>
                                        <span className="text-[var(--border)] mx-2">|</span>
                                        {patient.ward}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${getPatientDiet(patient.bed) === 'Sem prescrição ativa'
                                            ? 'bg-[var(--surface2)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                            }`}>
                                            {getPatientDiet(patient.bed)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                if (confirm(`Confirma a alta para ${patient.name}?`)) {
                                                    removePatient(patient.id);
                                                }
                                            }}
                                            className="p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--surface2)] rounded-lg transition-colors"
                                            title="Dar Alta (Remover)"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)] italic">
                                    Nenhum paciente encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Admission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                    <div className="card w-full max-w-md p-6 shadow-2xl scale-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[var(--text-main)] font-[family-name:var(--font-space)] flex items-center gap-2">
                                <UserPlus className="text-[var(--primary)]" />
                                Admitir Novo Paciente
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddPatient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="input"
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Leito</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: 101A"
                                        className="input"
                                        value={newPatient.bed}
                                        onChange={e => setNewPatient({ ...newPatient, bed: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Setor/Ala</label>
                                    <div className="relative">
                                        <select
                                            required
                                            className="input appearance-none"
                                            value={newPatient.ward}
                                            onChange={e => setNewPatient({ ...newPatient, ward: e.target.value })}
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Clínica Médica">Clínica Médica</option>
                                            <option value="Cirúrgica">Cirúrgica</option>
                                            <option value="UTI">UTI</option>
                                            <option value="Pediatria">Pediatria</option>
                                            <option value="Maternidade">Maternidade</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Alergias (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Camarão..."
                                        className="input border-red-200 focus:border-[var(--danger)] focus:ring-red-100 placeholder:text-red-200 text-[var(--danger)]"
                                        value={newPatient.allergies || ''}
                                        onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-[var(--border-subtle)]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-ghost"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Confirmar Admissão
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
