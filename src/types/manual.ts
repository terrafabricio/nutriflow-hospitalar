export interface TableRow { [key: string]: string; }
export interface TableData { title: string; headers: string[]; rows: TableRow[]; }
export interface SectionContent { type: 'paragraph' | 'list' | 'table' | 'header' | 'alert'; value: string | string[] | TableData; }
export interface ManualSection { id: string; title: string; category: string; content: SectionContent[]; }
