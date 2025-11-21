import React from 'react';
import { ManualSection, SectionContent, TableData } from '@/types/manual';
import { AlertCircle } from 'lucide-react';

export default function ContentDisplay({ section }: { section: ManualSection }) {
    const renderContent = (item: SectionContent, idx: number) => {
        switch (item.type) {
            case 'header': return <h2 key={idx} className="text-2xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-200">{item.value as string}</h2>;
            case 'paragraph': return <p key={idx} className="text-slate-600 mb-4 leading-relaxed">{item.value as string}</p>;
            case 'list': return <ul key={idx} className="list-disc list-inside mb-6 space-y-2 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">{(item.value as string[]).map((li, i) => <li key={i}>{li}</li>)}</ul>;
            case 'alert': return <div key={idx} className="flex items-start gap-3 p-4 mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-amber-900"><AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" /><div>{item.value as string}</div></div>;
            case 'table':
                const table = item.value as TableData;
                return (
                    <div key={idx} className="my-8 overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 font-semibold text-slate-700">{table.title}</div>
                        <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-white text-slate-500 border-b"><tr>{table.headers.map((h, i) => <th key={i} className="px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{table.rows.map((row, r) => <tr key={r} className="hover:bg-slate-50/50">{table.headers.map((h, c) => <td key={c} className="px-4 py-3 text-slate-700">{row[h]}</td>)}</tr>)}</tbody></table></div>
                    </div>
                );
            default: return null;
        }
    };
    return (
        <div className="max-w-4xl mx-auto w-full pb-20">
            <div className="mb-8">
                <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">{section.category}</span>
                <h1 className="text-3xl font-bold text-slate-900 mt-4 mb-2">{section.title}</h1>
            </div>
            <div className="prose prose-slate max-w-none">{section.content.map((item, i) => renderContent(item, i))}</div>
        </div>
    );
}
