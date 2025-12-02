/**
 * Type definitions for the Checklist Offline App
 */

export type QuestionType = 
    | 'bool_ok_nok_na'
    | 'single_choice'
    | 'scale'
    | 'short_text'
    | 'long_text'
    | 'header';

export type Language = 'de' | 'en';

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface Question {
    id: string;
    textDe: string;
    textEn: string;
    type: QuestionType;
    vdaCode?: string;
    weight?: number;
    maxPoints?: number;
    includeInIoNio: boolean;
    options?: string[]; // For single_choice
    scaleMin?: number; // For scale
    scaleMax?: number; // For scale
    order: number;
}

export interface Checklist {
    id: string;
    name: string;
    description: string;
    questions: Question[];
    reportSettings?: {
        title?: string;
        customFields?: Record<string, string>;
    };
}

export interface ResponseRow {
    timestamp: string;
    reportDateTime: string;
    inspectedParts: string;
    generatedBy: string;
    ioParts: number;
    nioParts: number;
    includeInReport?: boolean;
    answers: Record<string, string>; // questionId -> answer
    vdaScores?: Record<string, number>; // questionId -> score
}

export interface AuditLogEntry {
    timestamp: string;
    userName: string;
    checklistId: string;
    recordId: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
    actionType: ActionType;
}

export interface User {
    id: string;
    name: string;
}

export interface TranslationDictionary {
    [key: string]: {
        de: string;
        en: string;
    };
}

export interface AppState {
    currentLanguage: Language;
    currentUser: User | null;
    users: User[];
    workingFolder: FileSystemDirectoryHandle | null;
    currentChecklist: Checklist | null;
    checklists: Checklist[];
    responses: ResponseRow[];
    translations: TranslationDictionary;
}

export interface ReportData {
    title: string;
    generatedOn: string;
    selectedRange: string;
    inspectedParts: number;
    generatedBy: string;
    ioParts: number;
    nioParts: number;
    checkingSteps: ReportCheckingStep[];
}

export interface ReportCheckingStep {
    questionText: string;
    okParts: number;
    nokParts: number;
    naParts: number;
    percentNok: number;
    weight?: number;
    maxPoints?: number;
    score?: number;
}
