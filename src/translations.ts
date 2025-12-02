import { Language, TranslationDictionary } from './types.js';

export class TranslationManager {
    private translations: TranslationDictionary = {
        // Header
        'app-title': { de: 'Checklist Manager', en: 'Checklist Manager' },
        'user-label': { de: 'Benutzer:', en: 'User:' },
        'folder-btn-text': { de: 'Ordner wählen', en: 'Select Folder' },
        
        // Tabs
        'tab-list': { de: 'Checklisten', en: 'Checklists' },
        'tab-editor': { de: 'Editor', en: 'Editor' },
        'tab-fill': { de: 'Ausfüllen', en: 'Fill' },
        'tab-grid': { de: 'Antworten', en: 'Responses' },
        'tab-report': { de: 'Bericht', en: 'Report' },
        'tab-translations': { de: 'Übersetzungen', en: 'Translations' },
        
        // Checklist List View
        'list-title': { de: 'Meine Checklisten', en: 'My Checklists' },
        'create-checklist-text': { de: '+ Neue Checkliste', en: '+ New Checklist' },
        'folder-path-text': { de: 'Arbeitsordner:', en: 'Working Folder:' },
        'empty-state-text': { de: 'Bitte wählen Sie einen Arbeitsordner aus.', en: 'Please select a working folder.' },
        'open-editor': { de: 'Bearbeiten', en: 'Edit' },
        'open-fill': { de: 'Ausfüllen', en: 'Fill' },
        'csv-exists': { de: 'CSV:', en: 'CSV:' },
        'rows': { de: 'Zeilen', en: 'rows' },
        
        // Editor View
        'back-text-editor': { de: 'Zurück', en: 'Back' },
        'editor-title': { de: 'Checkliste bearbeiten', en: 'Edit Checklist' },
        'save-checklist-text': { de: '💾 Speichern', en: '💾 Save' },
        'checklist-name-label': { de: 'Name:', en: 'Name:' },
        'checklist-desc-label': { de: 'Beschreibung:', en: 'Description:' },
        'questions-title': { de: 'Fragen', en: 'Questions' },
        'add-question-text': { de: '+ Frage hinzufügen', en: '+ Add Question' },
        
        // Question Editor
        'question-text-de': { de: 'Frage (DE):', en: 'Question (DE):' },
        'question-text-en': { de: 'Frage (EN):', en: 'Question (EN):' },
        'question-type': { de: 'Typ:', en: 'Type:' },
        'vda-code': { de: 'VDA Code:', en: 'VDA Code:' },
        'weight': { de: 'Gewicht:', en: 'Weight:' },
        'max-points': { de: 'Max. Punkte:', en: 'Max Points:' },
        'include-in-io-nio': { de: 'In IO/NIO zählen', en: 'Include in IO/NIO' },
        'move-up': { de: '↑', en: '↑' },
        'move-down': { de: '↓', en: '↓' },
        'duplicate': { de: 'Duplizieren', en: 'Duplicate' },
        'delete': { de: 'Löschen', en: 'Delete' },
        'question-image': { de: 'Bild hinzufügen', en: 'Add Image' },
        'remove-image': { de: 'Entfernen', en: 'Remove' },
        
        // Question Types
        'type-bool_ok_nok_na': { de: 'OK/NOK/N/A', en: 'OK/NOK/N/A' },
        'type-single_choice': { de: 'Einfachauswahl', en: 'Single Choice' },
        'type-scale': { de: 'Skala', en: 'Scale' },
        'type-short_text': { de: 'Kurzer Text', en: 'Short Text' },
        'type-long_text': { de: 'Langer Text', en: 'Long Text' },
        'type-header': { de: 'Überschrift/Sektion', en: 'Header/Section' },
        
        // Fill View
        'back-text-fill': { de: 'Zurück', en: 'Back' },
        'fill-title': { de: 'Checkliste ausfüllen', en: 'Fill Checklist' },
        'submit-checklist-text': { de: '💾 Speichern', en: '💾 Save' },
        'fill-meta-title': { de: 'Informationen', en: 'Information' },
        'fill-datetime-label': { de: 'Datum/Zeit:', en: 'Date/Time:' },
        'fill-parts-label': { de: 'Geprüfte Teile:', en: 'Inspected Parts:' },
        'fill-operator-label': { de: 'Operator:', en: 'Operator:' },
        'fill-questions-title': { de: 'Fragen', en: 'Questions' },
        
        // Answer Options
        'answer-ok': { de: 'OK', en: 'OK' },
        'answer-nok': { de: 'NOK', en: 'NOK' },
        'answer-na': { de: 'N/A', en: 'N/A' },
        
        // Section Navigation
        'previous-section': { de: 'Vorherige', en: 'Previous' },
        'next-section': { de: 'Nächste', en: 'Next' },
        'finish-section': { de: 'Fertig', en: 'Finish' },
        'section-text': { de: 'Abschnitt', en: 'Section' },
        
        // Summary View
        'summary-title': { de: 'Zusammenfassung', en: 'Summary' },
        'summary-ok': { de: 'OK Teile', en: 'OK Parts' },
        'summary-nok': { de: 'NOK Teile', en: 'NOK Parts' },
        'back-to-edit': { de: 'Zurück zur Bearbeitung', en: 'Back to Edit' },
        'confirm-save': { de: 'Speichern bestätigen', en: 'Confirm Save' },
        
        // Grid View
        'back-text-grid': { de: 'Zurück', en: 'Back' },
        'grid-title': { de: 'Antworten Datenbank', en: 'Response Database' },
        'filter-from-label': { de: 'Von:', en: 'From:' },
        'filter-to-label': { de: 'Bis:', en: 'To:' },
        'apply-filter-text': { de: 'Filter anwenden', en: 'Apply Filter' },
        'select-all-text': { de: 'Alle auswählen', en: 'Select All' },
        'deselect-all-text': { de: 'Alle abwählen', en: 'Deselect All' },
        'generate-report-text': { de: '📊 Bericht generieren', en: '📊 Generate Report' },
        'no-records-selected': { de: 'Keine Datensätze ausgewählt. Bitte wählen Sie mindestens einen Datensatz aus.', en: 'No records selected. Please select at least one record.' },
        
        // Grid Columns
        'col-include': { de: 'Bericht', en: 'Report' },
        'col-timestamp': { de: 'Zeitstempel', en: 'Timestamp' },
        'col-operator': { de: 'Operator', en: 'Operator' },
        'col-inspected-parts': { de: 'Geprüfte Teile', en: 'Inspected Parts' },
        'col-io-parts': { de: 'IO Teile', en: 'IO Parts' },
        'col-nio-parts': { de: 'NIO Teile', en: 'NIO Parts' },
        
        // Report View
        'back-text-report': { de: 'Zurück', en: 'Back' },
        'report-title': { de: 'Bericht Generator', en: 'Report Generator' },
        'export-pdf-text': { de: '📄 PDF Exportieren', en: '📄 Export PDF' },
        
        // Report Labels
        'report-main-title': { de: 'Warenausgangskontrollbericht', en: 'Outgoing Goods Control Report' },
        'report-generated-on': { de: 'Bericht erstellt am:', en: 'Report generated on:' },
        'report-selected-range': { de: 'Ausgewählter Zeitraum:', en: 'Selected range:' },
        'report-inspected-parts': { de: 'Geprüfte Teile:', en: 'Inspected parts:' },
        'report-generated-by': { de: 'Erstellt von:', en: 'Generated by:' },
        'report-io-parts': { de: 'IO Teile:', en: 'IO Parts:' },
        'report-nio-parts': { de: 'NIO Teile:', en: 'NIO Parts:' },
        'report-checking-steps': { de: 'Prüfschritte', en: 'Checking Steps' },
        'report-ok-parts': { de: 'OK Teile', en: 'OK Parts' },
        'report-nok-parts': { de: 'NOK Teile', en: 'NOK Parts' },
        'report-percent-nok': { de: '% NOK', en: '% NOK' },
        'report-signature': { de: 'Unterschrift:', en: 'Signature:' },
        
        // Translations View
        'translations-title': { de: 'Übersetzungen bearbeiten', en: 'Edit Translations' },
        'save-translations-text': { de: '💾 Speichern', en: '💾 Save' },
        'translations-info-text': { 
            de: 'Hier können Sie die Übersetzungen für die Benutzeroberfläche bearbeiten.',
            en: 'Here you can edit the translations for the user interface.'
        },
        
        // New Checklist Modal
        'new-checklist-modal-title': { de: 'Neue Checkliste erstellen', en: 'Create New Checklist' },
        'new-checklist-id-label': { de: 'ID:', en: 'ID:' },
        'new-checklist-name-label': { de: 'Name:', en: 'Name:' },
        'new-checklist-desc-label': { de: 'Beschreibung:', en: 'Description:' },
        'cancel-new-checklist-text': { de: 'Abbrechen', en: 'Cancel' },
        'confirm-new-checklist-text': { de: 'Erstellen', en: 'Create' },
        
        // New User Modal
        'new-user-modal-title': { de: 'Neuer Benutzer', en: 'New User' },
        'new-user-name-label': { de: 'Name:', en: 'Name:' },
        'cancel-new-user-text': { de: 'Abbrechen', en: 'Cancel' },
        'confirm-new-user-text': { de: 'Hinzufügen', en: 'Add' },
        
        // Messages
        'success-save': { de: 'Erfolgreich gespeichert', en: 'Successfully saved' },
        'error-save': { de: 'Fehler beim Speichern', en: 'Error saving' },
        'confirm-delete': { de: 'Sind Sie sicher, dass Sie löschen möchten?', en: 'Are you sure you want to delete?' },
    };

    private currentLanguage: Language = 'de';

    constructor() {
        // Try to load translations from localStorage
        const saved = localStorage.getItem('translations');
        if (saved) {
            try {
                this.translations = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load translations from localStorage:', e);
            }
        }

        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang === 'de' || savedLang === 'en') {
            this.currentLanguage = savedLang;
        }
    }

    public setLanguage(lang: Language): void {
        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateUI();
    }

    public getLanguage(): Language {
        return this.currentLanguage;
    }

    public translate(key: string): string {
        const translation = this.translations[key];
        if (!translation) {
            return key;
        }
        return translation[this.currentLanguage] || key;
    }

    public getTranslations(): TranslationDictionary {
        return { ...this.translations };
    }

    public updateTranslation(key: string, de: string, en: string): void {
        this.translations[key] = { de, en };
    }

    public saveTranslations(): void {
        localStorage.setItem('translations', JSON.stringify(this.translations));
        this.updateUI();
    }

    public updateUI(): void {
        // Update all elements with IDs that match translation keys
        Object.keys(this.translations).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.classList.contains('tab-text')) {
                    element.textContent = this.translate(key);
                } else if (element.tagName === 'SPAN' || element.tagName === 'LABEL' || 
                           element.tagName === 'P' || element.tagName === 'H1' || 
                           element.tagName === 'H2' || element.tagName === 'H3') {
                    element.textContent = this.translate(key);
                }
            }
        });

        // Update language buttons
        document.querySelectorAll('.btn-lang').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.getElementById(`lang-${this.currentLanguage}`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }
}
