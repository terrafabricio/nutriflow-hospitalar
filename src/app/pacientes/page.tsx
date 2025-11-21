'use client';

import { useState } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { Users, Plus, Trash2, Search, UserPlus } from 'lucide-react';

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
        <div className="max-w-6xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        Gerenciar Pacientes
                    </h1>
                    <p className="text-slate-500">Admissão, alta e controle de ocupação</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                    <UserPlus size={18} />
                    Admitir Paciente
                </button>
            </header>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou leito..."
                    className="flex-1 outline-none text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Patients List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Paciente</th>
                            <th className="px-6 py-4">Leito / Setor</th>
                            <th className="px-6 py-4">Dieta Atual</th>
                            <th className="px-6 py-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{patient.name}</td>
                                    <td className="px-6 py-4 text-slate-600">
                                        <span className="font-bold text-slate-800">{patient.bed}</span>
                                        <span className="text-slate-400 mx-2">|</span>
                                        {patient.ward}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPatientDiet(patient.bed) === 'Sem prescrição ativa'
                                            ? 'bg-slate-100 text-slate-500'
                                            : 'bg-green-100 text-green-700'
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
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Dar Alta (Remover)"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                    Nenhum paciente encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Admission Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <UserPlus className="text-blue-600" />
                            Admitir Novo Paciente
                        </h2>
                        <form onSubmit={handleAddPatient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={newPatient.name}
                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Leito</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ex: 101A"
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newPatient.bed}
                                        onChange={e => setNewPatient({ ...newPatient, bed: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Setor/Ala</label>
                                    <select
                                        required
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Alergias (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Camarão, Lactose..."
                                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-red-600 placeholder:text-slate-400"
                                        value={newPatient.allergies || ''}
                                        onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
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
