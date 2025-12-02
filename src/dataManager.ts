import { Checklist, ResponseRow, AuditLogEntry, User, ActionType } from './types.js';

/**
 * DataManager handles all file I/O operations using File System Access API
 */
export class DataManager {
    private workingFolder: FileSystemDirectoryHandle | null = null;

    public async selectFolder(): Promise<FileSystemDirectoryHandle | null> {
        try {
            // @ts-ignore - File System Access API
            if ('showDirectoryPicker' in window) {
                // @ts-ignore
                this.workingFolder = await window.showDirectoryPicker({
                    mode: 'readwrite'
                });
                return this.workingFolder;
            } else {
                alert('File System Access API is not supported in this browser. Please use Chrome, Edge, or a compatible browser.');
                return null;
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Error selecting folder:', err);
            }
            return null;
        }
    }

    public getWorkingFolder(): FileSystemDirectoryHandle | null {
        return this.workingFolder;
    }

    public async listChecklists(): Promise<string[]> {
        if (!this.workingFolder) {
            return [];
        }

        const checklistIds: string[] = [];
        try {
            // @ts-ignore
            for await (const entry of this.workingFolder.values()) {
                if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                    const checklistId = entry.name.replace('.json', '');
                    // Skip audit_log and other system files
                    if (checklistId !== 'audit_log' && checklistId !== 'users') {
                        checklistIds.push(checklistId);
                    }
                }
            }
        } catch (err) {
            console.error('Error listing checklists:', err);
        }

        return checklistIds;
    }

    public async loadChecklist(checklistId: string): Promise<Checklist | null> {
        if (!this.workingFolder) {
            return null;
        }

        try {
            const fileHandle = await this.workingFolder.getFileHandle(`${checklistId}.json`);
            const file = await fileHandle.getFile();
            const content = await file.text();
            return JSON.parse(content) as Checklist;
        } catch (err) {
            console.error(`Error loading checklist ${checklistId}:`, err);
            return null;
        }
    }

    public async saveChecklist(checklist: Checklist): Promise<boolean> {
        if (!this.workingFolder) {
            return false;
        }

        try {
            const fileHandle = await this.workingFolder.getFileHandle(`${checklist.id}.json`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(checklist, null, 2));
            await writable.close();
            return true;
        } catch (err) {
            console.error(`Error saving checklist ${checklist.id}:`, err);
            return false;
        }
    }

    public async deleteChecklist(checklistId: string): Promise<boolean> {
        if (!this.workingFolder) {
            return false;
        }

        try {
            await this.workingFolder.removeEntry(`${checklistId}.json`);
            return true;
        } catch (err) {
            console.error(`Error deleting checklist ${checklistId}:`, err);
            return false;
        }
    }

    public async loadResponses(checklistId: string): Promise<ResponseRow[]> {
        if (!this.workingFolder) {
            return [];
        }

        try {
            const fileHandle = await this.workingFolder.getFileHandle(`${checklistId}_data.csv`);
            const file = await fileHandle.getFile();
            const content = await file.text();
            return this.parseCSV(content);
        } catch (err) {
            // File doesn't exist yet, return empty array
            return [];
        }
    }

    public async saveResponses(checklistId: string, responses: ResponseRow[]): Promise<boolean> {
        if (!this.workingFolder) {
            return false;
        }

        try {
            const csv = this.toCSV(responses);
            const fileHandle = await this.workingFolder.getFileHandle(`${checklistId}_data.csv`, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(csv);
            await writable.close();
            return true;
        } catch (err) {
            console.error(`Error saving responses for ${checklistId}:`, err);
            return false;
        }
    }

    public async appendResponse(checklistId: string, response: ResponseRow): Promise<boolean> {
        const responses = await this.loadResponses(checklistId);
        responses.push(response);
        return await this.saveResponses(checklistId, responses);
    }

    public async logAudit(entry: AuditLogEntry): Promise<boolean> {
        if (!this.workingFolder) {
            return false;
        }

        try {
            let existingLog: AuditLogEntry[] = [];
            
            try {
                const fileHandle = await this.workingFolder.getFileHandle('audit_log.csv');
                const file = await fileHandle.getFile();
                const content = await file.text();
                existingLog = this.parseAuditLog(content);
            } catch {
                // File doesn't exist yet
            }

            existingLog.push(entry);
            const csv = this.auditLogToCSV(existingLog);
            
            const fileHandle = await this.workingFolder.getFileHandle('audit_log.csv', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(csv);
            await writable.close();
            
            return true;
        } catch (err) {
            console.error('Error logging audit entry:', err);
            return false;
        }
    }

    public async loadUsers(): Promise<User[]> {
        try {
            const saved = localStorage.getItem('users');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (err) {
            console.error('Error loading users:', err);
        }
        
        // Default users
        return [
            { id: 'user1', name: 'Operator 1' },
            { id: 'user2', name: 'Operator 2' }
        ];
    }

    public async saveUsers(users: User[]): Promise<boolean> {
        try {
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        } catch (err) {
            console.error('Error saving users:', err);
            return false;
        }
    }

    public async checkCSVExists(checklistId: string): Promise<{ exists: boolean; rowCount: number }> {
        if (!this.workingFolder) {
            return { exists: false, rowCount: 0 };
        }

        try {
            const fileHandle = await this.workingFolder.getFileHandle(`${checklistId}_data.csv`);
            const file = await fileHandle.getFile();
            const content = await file.text();
            const lines = content.trim().split('\n');
            return { exists: true, rowCount: Math.max(0, lines.length - 1) }; // -1 for header
        } catch {
            return { exists: false, rowCount: 0 };
        }
    }

    private parseCSV(content: string): ResponseRow[] {
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
            return [];
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const rows: ResponseRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) {
                continue; // Skip malformed rows
            }

            const row: ResponseRow = {
                timestamp: '',
                reportDateTime: '',
                inspectedParts: '',
                generatedBy: '',
                ioParts: 0,
                nioParts: 0,
                answers: {}
            };

            headers.forEach((header, index) => {
                const value = values[index];
                
                if (header === 'timestamp') {
                    row.timestamp = value;
                } else if (header === 'reportDateTime') {
                    row.reportDateTime = value;
                } else if (header === 'inspectedParts') {
                    row.inspectedParts = value;
                } else if (header === 'generatedBy') {
                    row.generatedBy = value;
                } else if (header === 'ioParts') {
                    row.ioParts = parseInt(value) || 0;
                } else if (header === 'nioParts') {
                    row.nioParts = parseInt(value) || 0;
                } else if (header === 'includeInReport') {
                    row.includeInReport = value === 'true';
                } else if (header.startsWith('q_')) {
                    row.answers[header.substring(2)] = value;
                }
            });

            rows.push(row);
        }

        return rows;
    }

    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    private toCSV(responses: ResponseRow[]): string {
        if (responses.length === 0) {
            return '';
        }

        // Collect all unique question IDs
        const questionIds = new Set<string>();
        responses.forEach(row => {
            Object.keys(row.answers).forEach(qId => questionIds.add(qId));
        });

        // Build header
        const headers = [
            'timestamp',
            'reportDateTime',
            'inspectedParts',
            'generatedBy',
            'ioParts',
            'nioParts',
            'includeInReport',
            ...Array.from(questionIds).sort().map(id => `q_${id}`)
        ];

        // Build rows
        const lines = [headers.join(',')];
        
        responses.forEach(row => {
            const values = [
                row.timestamp,
                row.reportDateTime,
                this.escapeCSV(row.inspectedParts),
                this.escapeCSV(row.generatedBy),
                row.ioParts.toString(),
                row.nioParts.toString(),
                (row.includeInReport ?? false).toString(),
                ...Array.from(questionIds).sort().map(id => this.escapeCSV(row.answers[id] || ''))
            ];
            lines.push(values.join(','));
        });

        return lines.join('\n');
    }

    private escapeCSV(value: string): string {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }

    private parseAuditLog(content: string): AuditLogEntry[] {
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
            return [];
        }

        const entries: AuditLogEntry[] = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length >= 8) {
                entries.push({
                    timestamp: values[0],
                    userName: values[1],
                    checklistId: values[2],
                    recordId: values[3],
                    fieldName: values[4],
                    oldValue: values[5],
                    newValue: values[6],
                    actionType: values[7] as ActionType
                });
            }
        }

        return entries;
    }

    private auditLogToCSV(entries: AuditLogEntry[]): string {
        const headers = ['timestamp', 'userName', 'checklistId', 'recordId', 'fieldName', 'oldValue', 'newValue', 'actionType'];
        const lines = [headers.join(',')];

        entries.forEach(entry => {
            const values = [
                entry.timestamp,
                this.escapeCSV(entry.userName),
                entry.checklistId,
                entry.recordId,
                entry.fieldName,
                this.escapeCSV(entry.oldValue),
                this.escapeCSV(entry.newValue),
                entry.actionType
            ];
            lines.push(values.join(','));
        });

        return lines.join('\n');
    }
}
