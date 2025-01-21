declare module 'jspdf-autotable' {
    import jsPDF from 'jspdf';

    export interface Cell {
        raw: string | number | boolean | null;
        content: string;
        styles: { [key: string]: any };
    }

    export interface Row {
        raw: any;
        cells: { [key: string]: Cell };
        index: number;
        section: 'head' | 'body' | 'foot';
    }

    export interface HookData {
        cell: Cell;
        row: Row;
        column: any;
        section: 'head' | 'body' | 'foot';
        table: any;
        pageNumber: number;
        settings: any;
        doc: jsPDF;
    }

    export interface AutoTableOptions {
        startY?: number;
        head?: any[];
        body: any[][];
        foot?: any[];
        theme?: 'striped' | 'grid' | 'plain';
        styles?: { [key: string]: any };
        headStyles?: { [key: string]: any };
        bodyStyles?: { [key: string]: any };
        footStyles?: { [key: string]: any };
        alternateRowStyles?: { [key: string]: any };
        margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
        didDrawCell?: (HookData: HookData) => void;
        didDrawPage?: (data: { pageNumber: number; settings: any; table: any; doc: jsPDF }) => void;
    }

    declare module 'jspdf' {
        interface jsPDF {
            autoTable(options: AutoTableOptions): jsPDF;
        }
    }

    const autotable: (jsPDF: typeof jsPDF) => void;
    export default autotable;
}
