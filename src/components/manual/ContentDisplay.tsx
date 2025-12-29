import React from 'react';
import { ManualSection, SectionContent, TableData } from '@/types/manual';
import { AlertCircle } from 'lucide-react';

export default function ContentDisplay({ section }: { section: ManualSection }) {
    const renderContent = (item: SectionContent, idx: number) => {
        switch (item.type) {
            case 'header':
                return <h2 key={idx} className="text-2xl font-bold text-[var(--text-main)] mt-8 mb-4 pb-2 border-b border-[var(--border-subtle)] font-[family-name:var(--font-space)] tracking-tight">{item.value as string}</h2>;
            case 'paragraph':
                return <p key={idx} className="text-[var(--text-secondary)] mb-4 leading-relaxed">{item.value as string}</p>;
            case 'list':
                return <ul key={idx} className="list-disc list-inside mb-6 space-y-2 text-[var(--text-secondary)] bg-[var(--surface2)] p-6 rounded-xl border border-[var(--border-subtle)]">{(item.value as string[]).map((li, i) => <li key={i}>{li}</li>)}</ul>;
            case 'alert':
                return <div key={idx} className="flex items-start gap-3 p-4 mb-6 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg text-amber-900 dark:text-amber-300"><AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><div>{item.value as string}</div></div>;
            case 'table':
                const table = item.value as TableData;
                return (
                    <div key={idx} className="my-8 overflow-hidden rounded-xl border border-[var(--border-subtle)] shadow-sm">
                        <div className="bg-[var(--surface2)] px-4 py-3 border-b border-[var(--border-subtle)] font-bold text-[var(--text-main)] font-[family-name:var(--font-space)]">{table.title}</div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[var(--surface)] text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
                                    <tr>{table.headers.map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap font-bold uppercase text-xs tracking-wider">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--surface)]">
                                    {table.rows.map((row, r) => <tr key={r} className="hover:bg-[var(--surface2)]/50 transition-colors">{table.headers.map((h, c) => <td key={c} className="px-4 py-3 text-[var(--text-secondary)]">{row[h]}</td>)}</tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    return (
        <div className="max-w-4xl mx-auto w-full pb-20 fade-in-up">
            <div className="mb-8">
                <span className="text-xs font-bold tracking-widest text-[var(--primary)] uppercase bg-[var(--surface2)] border border-[var(--primary)]/20 px-3 py-1 rounded-full shadow-sm">{section.category}</span>
                <h1 className="text-4xl font-bold text-[var(--text-main)] mt-4 mb-2 font-[family-name:var(--font-space)] tracking-tight">{section.title}</h1>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">{section.content.map((item, i) => renderContent(item, i))}</div>
        </div>
    );
}
