import { Checklist, Question, ResponseRow, User, Language, ReportData, ReportCheckingStep } from './types.js';
import { DataManager } from './dataManager.js';
import { TranslationManager } from './translations.js';

export class ChecklistApp {
    private dataManager: DataManager;
    private translationManager: TranslationManager;
    private currentChecklist: Checklist | null = null;
    private currentUser: User | null = null;
    private users: User[] = [];
    private responses: ResponseRow[] = [];
    private filteredResponses: ResponseRow[] = [];
    private currentSectionIndex: number = 0;
    private sections: Question[][] = [];
    private currentAnswers: Record<string, string> = {}; // Store answers as we go through sections

    constructor() {
        this.dataManager = new DataManager();
        this.translationManager = new TranslationManager();
        this.init();
    }

    private async init(): Promise<void> {
        // Load users
        this.users = await this.dataManager.loadUsers();
        this.populateUserSelect();

        // Set default user
        if (this.users.length > 0) {
            this.currentUser = this.users[0];
            const userSelect = document.getElementById('user-select') as HTMLSelectElement;
            if (userSelect) {
                userSelect.value = this.currentUser.id;
            }
        }

        // Setup event listeners
        this.setupEventListeners();

        // Update UI with translations
        this.translationManager.updateUI();

        // Show checklist list view
        this.showView('checklist-list');
    }

    private setupEventListeners(): void {
        // Language buttons
        document.getElementById('lang-de')?.addEventListener('click', () => {
            this.translationManager.setLanguage('de');
        });
        document.getElementById('lang-en')?.addEventListener('click', () => {
            this.translationManager.setLanguage('en');
        });

        // User selector
        document.getElementById('user-select')?.addEventListener('change', (e) => {
            const select = e.target as HTMLSelectElement;
            this.currentUser = this.users.find(u => u.id === select.value) || null;
        });

        document.getElementById('add-user-btn')?.addEventListener('click', () => {
            this.showAddUserModal();
        });

        // Folder selection
        document.getElementById('folder-select-btn')?.addEventListener('click', async () => {
            await this.selectFolder();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const view = target.getAttribute('data-view');
                if (view && !target.hasAttribute('disabled')) {
                    this.showView(view);
                }
            });
        });

        // Checklist list actions
        document.getElementById('create-checklist-btn')?.addEventListener('click', () => {
            this.showCreateChecklistModal();
        });

        // Editor actions
        document.getElementById('back-to-list-from-editor')?.addEventListener('click', () => {
            this.showView('checklist-list');
        });
        document.getElementById('save-checklist-btn')?.addEventListener('click', () => {
            this.saveCurrentChecklist();
        });
        document.getElementById('add-question-btn')?.addEventListener('click', () => {
            this.addQuestion();
        });

        // Fill actions
        document.getElementById('back-to-list-from-fill')?.addEventListener('click', () => {
            this.currentAnswers = {}; // Clear answers on back
            this.currentSectionIndex = 0;
            this.showView('checklist-list');
        });
        document.getElementById('submit-checklist-btn')?.addEventListener('click', () => {
            // Save current section and show summary
            this.saveCurrentSectionAnswers();
            this.showSummary();
        });

        // Grid actions
        document.getElementById('back-to-list-from-grid')?.addEventListener('click', () => {
            this.showView('checklist-list');
        });
        document.getElementById('apply-filter-btn')?.addEventListener('click', () => {
            this.applyFilter();
        });
        document.getElementById('select-all-btn')?.addEventListener('click', () => {
            this.selectAll();
        });
        document.getElementById('deselect-all-btn')?.addEventListener('click', () => {
            this.deselectAll();
        });

        // Report actions
        document.getElementById('back-to-list-from-report')?.addEventListener('click', () => {
            this.showView('checklist-list');
        });
        document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
            this.exportPDF();
        });

        // Translations actions
        document.getElementById('save-translations-btn')?.addEventListener('click', () => {
            this.saveTranslations();
        });

        // Modal actions
        document.getElementById('cancel-new-checklist')?.addEventListener('click', () => {
            this.hideModal('new-checklist-modal');
        });
        document.getElementById('confirm-new-checklist')?.addEventListener('click', () => {
            this.createNewChecklist();
        });

        document.getElementById('cancel-new-user')?.addEventListener('click', () => {
            this.hideModal('new-user-modal');
        });
        document.getElementById('confirm-new-user')?.addEventListener('click', () => {
            this.addNewUser();
        });
    }

    private showView(viewId: string): void {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const view = document.getElementById(`view-${viewId}`);
        if (view) {
            view.classList.add('active');
        }

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === viewId) {
                btn.classList.add('active');
            }
        });

        // Load view-specific data
        if (viewId === 'checklist-list') {
            this.loadChecklistList();
        } else if (viewId === 'response-grid') {
            this.loadResponseGrid();
        } else if (viewId === 'report-generator') {
            this.generateReport();
        } else if (viewId === 'translations') {
            this.loadTranslationsEditor();
        }
    }

    private async selectFolder(): Promise<void> {
        const folder = await this.dataManager.selectFolder();
        if (folder) {
            document.getElementById('folder-info')?.classList.remove('hidden');
            const folderPath = document.getElementById('folder-path');
            if (folderPath) {
                folderPath.textContent = folder.name;
            }

            document.getElementById('create-checklist-btn')?.removeAttribute('disabled');
            
            await this.loadChecklistList();
        }
    }

    private async loadChecklistList(): Promise<void> {
        const container = document.getElementById('checklist-container');
        if (!container) return;

        const checklistIds = await this.dataManager.listChecklists();
        
        if (checklistIds.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${this.translationManager.translate('empty-state-text')}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        for (const id of checklistIds) {
            const checklist = await this.dataManager.loadChecklist(id);
            if (!checklist) continue;

            const csvInfo = await this.dataManager.checkCSVExists(id);

            const card = document.createElement('div');
            card.className = 'checklist-card';
            card.innerHTML = `
                <h3>${checklist.name}</h3>
                <p>${checklist.description}</p>
                <div class="checklist-card-footer">
                    <small>${csvInfo.exists ? `${this.translationManager.translate('csv-exists')} ${csvInfo.rowCount} ${this.translationManager.translate('rows')}` : 'CSV: -'}</small>
                    <div class="checklist-card-actions">
                        <button class="btn-secondary btn-edit" data-id="${id}">${this.translationManager.translate('open-editor')}</button>
                        <button class="btn-primary btn-fill" data-id="${id}">${this.translationManager.translate('open-fill')}</button>
                    </div>
                </div>
            `;

            card.querySelector('.btn-edit')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditor(id);
            });

            card.querySelector('.btn-fill')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openFill(id);
            });

            container.appendChild(card);
        }
    }

    private showCreateChecklistModal(): void {
        this.showModal('new-checklist-modal');
        (document.getElementById('new-checklist-id') as HTMLInputElement).value = '';
        (document.getElementById('new-checklist-name') as HTMLInputElement).value = '';
        (document.getElementById('new-checklist-desc') as HTMLTextAreaElement).value = '';
    }

    private async createNewChecklist(): Promise<void> {
        const id = (document.getElementById('new-checklist-id') as HTMLInputElement).value.trim();
        const name = (document.getElementById('new-checklist-name') as HTMLInputElement).value.trim();
        const description = (document.getElementById('new-checklist-desc') as HTMLTextAreaElement).value.trim();

        if (!id || !name) {
            alert('Please enter ID and Name');
            return;
        }

        const newChecklist: Checklist = {
            id,
            name,
            description,
            questions: []
        };

        const saved = await this.dataManager.saveChecklist(newChecklist);
        if (saved) {
            this.hideModal('new-checklist-modal');
            await this.loadChecklistList();
            this.openEditor(id);
        } else {
            alert('Error creating checklist');
        }
    }

    private async openEditor(checklistId: string): Promise<void> {
        const checklist = await this.dataManager.loadChecklist(checklistId);
        if (!checklist) {
            alert('Error loading checklist');
            return;
        }

        this.currentChecklist = checklist;
        
        // Enable editor tab
        const editorTab = document.getElementById('tab-editor');
        if (editorTab) {
            editorTab.removeAttribute('disabled');
        }

        // Load checklist data into editor
        (document.getElementById('checklist-name') as HTMLInputElement).value = checklist.name;
        (document.getElementById('checklist-description') as HTMLTextAreaElement).value = checklist.description;

        this.renderQuestions();
        this.showView('checklist-editor');
    }

    private renderQuestions(): void {
        const container = document.getElementById('questions-list');
        if (!container || !this.currentChecklist) return;

        container.innerHTML = '';

        // Sort questions by order
        const questions = [...this.currentChecklist.questions].sort((a, b) => a.order - b.order);

        questions.forEach((question, index) => {
            const item = this.createQuestionItem(question, index);
            container.appendChild(item);
        });
    }

    private createQuestionItem(question: Question, index: number): HTMLElement {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.setAttribute('data-question-id', question.id);

        div.innerHTML = `
            <div class="question-header">
                <span class="question-number">${this.translationManager.translate('questions-title')} ${index + 1}</span>
                <div class="question-actions">
                    <button class="btn-secondary btn-move-up" ${index === 0 ? 'disabled' : ''}>${this.translationManager.translate('move-up')}</button>
                    <button class="btn-secondary btn-move-down" ${index === this.currentChecklist!.questions.length - 1 ? 'disabled' : ''}>${this.translationManager.translate('move-down')}</button>
                    <button class="btn-secondary btn-duplicate">${this.translationManager.translate('duplicate')}</button>
                    <button class="btn-secondary btn-delete">${this.translationManager.translate('delete')}</button>
                </div>
            </div>
            <div class="question-content">
                <div class="form-group">
                    <label>${this.translationManager.translate('question-text-de')}</label>
                    <input type="text" class="form-input q-text-de" value="${question.textDe}">
                </div>
                <div class="form-group">
                    <label>${this.translationManager.translate('question-text-en')}</label>
                    <input type="text" class="form-input q-text-en" value="${question.textEn}">
                </div>
                <div class="question-row">
                    <div class="form-group">
                        <label>${this.translationManager.translate('question-type')}</label>
                        <select class="form-input q-type">
                            <option value="bool_ok_nok_na" ${question.type === 'bool_ok_nok_na' ? 'selected' : ''}>${this.translationManager.translate('type-bool_ok_nok_na')}</option>
                            <option value="single_choice" ${question.type === 'single_choice' ? 'selected' : ''}>${this.translationManager.translate('type-single_choice')}</option>
                            <option value="scale" ${question.type === 'scale' ? 'selected' : ''}>${this.translationManager.translate('type-scale')}</option>
                            <option value="short_text" ${question.type === 'short_text' ? 'selected' : ''}>${this.translationManager.translate('type-short_text')}</option>
                            <option value="long_text" ${question.type === 'long_text' ? 'selected' : ''}>${this.translationManager.translate('type-long_text')}</option>
                            <option value="header" ${question.type === 'header' ? 'selected' : ''}>${this.translationManager.translate('type-header')}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>${this.translationManager.translate('vda-code')}</label>
                        <input type="text" class="form-input q-vda-code" value="${question.vdaCode || ''}">
                    </div>
                </div>
                <div class="question-row">
                    <div class="form-group">
                        <label>${this.translationManager.translate('weight')}</label>
                        <input type="number" class="form-input q-weight" value="${question.weight || ''}">
                    </div>
                    <div class="form-group">
                        <label>${this.translationManager.translate('max-points')}</label>
                        <input type="number" class="form-input q-max-points" value="${question.maxPoints || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" class="q-include-io-nio" ${question.includeInIoNio ? 'checked' : ''}>
                        ${this.translationManager.translate('include-in-io-nio')}
                    </label>
                </div>
                <div class="form-group">
                    <label>${this.translationManager.translate('question-image') || 'Bild hinzuf\u00fcgen'}</label>
                    <input type="file" class="form-input q-image" accept="image/*">
                    ${question.imageBase64 ? `
                        <div class="image-preview">
                            <img src="${question.imageBase64}" alt="${question.imageName || 'Preview'}" />
                            <button type="button" class="btn-secondary btn-remove-image">\u00d7 ${this.translationManager.translate('remove-image') || 'Entfernen'}</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Event listeners
        div.querySelector('.btn-move-up')?.addEventListener('click', () => this.moveQuestion(question.id, -1));
        div.querySelector('.btn-move-down')?.addEventListener('click', () => this.moveQuestion(question.id, 1));
        div.querySelector('.btn-duplicate')?.addEventListener('click', () => this.duplicateQuestion(question.id));
        div.querySelector('.btn-delete')?.addEventListener('click', () => this.deleteQuestion(question.id));
        
        // Image upload
        const imageInput = div.querySelector('.q-image') as HTMLInputElement;
        imageInput?.addEventListener('change', async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const base64 = await this.fileToBase64(file);
                question.imageBase64 = base64;
                question.imageName = file.name;
                this.renderQuestions();
            }
        });
        
        // Remove image
        div.querySelector('.btn-remove-image')?.addEventListener('click', () => {
            question.imageBase64 = undefined;
            question.imageName = undefined;
            this.renderQuestions();
        });

        // Auto-save on change
        div.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('change', () => this.updateQuestionFromUI(question.id));
        });

        return div;
    }

    private updateQuestionFromUI(questionId: string): void {
        if (!this.currentChecklist) return;

        const question = this.currentChecklist.questions.find(q => q.id === questionId);
        if (!question) return;

        const item = document.querySelector(`[data-question-id="${questionId}"]`);
        if (!item) return;

        question.textDe = (item.querySelector('.q-text-de') as HTMLInputElement).value;
        question.textEn = (item.querySelector('.q-text-en') as HTMLInputElement).value;
        question.type = (item.querySelector('.q-type') as HTMLSelectElement).value as any;
        question.vdaCode = (item.querySelector('.q-vda-code') as HTMLInputElement).value;
        question.weight = parseFloat((item.querySelector('.q-weight') as HTMLInputElement).value) || undefined;
        question.maxPoints = parseFloat((item.querySelector('.q-max-points') as HTMLInputElement).value) || undefined;
        question.includeInIoNio = (item.querySelector('.q-include-io-nio') as HTMLInputElement).checked;
    }

    private addQuestion(): void {
        if (!this.currentChecklist) return;

        const newQuestion: Question = {
            id: `q_${Date.now()}`,
            textDe: 'Neue Frage',
            textEn: 'New Question',
            type: 'bool_ok_nok_na',
            includeInIoNio: true,
            order: this.currentChecklist.questions.length
        };

        this.currentChecklist.questions.push(newQuestion);
        this.renderQuestions();
    }

    private moveQuestion(questionId: string, direction: number): void {
        if (!this.currentChecklist) return;

        const index = this.currentChecklist.questions.findIndex(q => q.id === questionId);
        if (index === -1) return;

        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= this.currentChecklist.questions.length) return;

        // Swap
        [this.currentChecklist.questions[index], this.currentChecklist.questions[newIndex]] = 
        [this.currentChecklist.questions[newIndex], this.currentChecklist.questions[index]];

        // Update orders
        this.currentChecklist.questions.forEach((q, i) => q.order = i);

        this.renderQuestions();
    }

    private duplicateQuestion(questionId: string): void {
        if (!this.currentChecklist) return;

        const question = this.currentChecklist.questions.find(q => q.id === questionId);
        if (!question) return;

        const duplicate: Question = {
            ...question,
            id: `q_${Date.now()}`,
            order: this.currentChecklist.questions.length
        };

        this.currentChecklist.questions.push(duplicate);
        this.renderQuestions();
    }

    private deleteQuestion(questionId: string): void {
        if (!this.currentChecklist) return;

        if (!confirm(this.translationManager.translate('confirm-delete'))) return;

        this.currentChecklist.questions = this.currentChecklist.questions.filter(q => q.id !== questionId);
        
        // Update orders
        this.currentChecklist.questions.forEach((q, i) => q.order = i);

        this.renderQuestions();
    }

    private async saveCurrentChecklist(): Promise<void> {
        if (!this.currentChecklist) return;

        // Update metadata
        this.currentChecklist.name = (document.getElementById('checklist-name') as HTMLInputElement).value;
        this.currentChecklist.description = (document.getElementById('checklist-description') as HTMLTextAreaElement).value;

        // Update all questions from UI
        this.currentChecklist.questions.forEach(q => this.updateQuestionFromUI(q.id));

        const saved = await this.dataManager.saveChecklist(this.currentChecklist);
        if (saved) {
            alert(this.translationManager.translate('success-save'));
            
            // Log audit
            await this.dataManager.logAudit({
                timestamp: new Date().toISOString(),
                userName: this.currentUser?.name || 'Unknown',
                checklistId: this.currentChecklist.id,
                recordId: '-',
                fieldName: 'checklist_definition',
                oldValue: '-',
                newValue: 'updated',
                actionType: 'UPDATE'
            });
        } else {
            alert(this.translationManager.translate('error-save'));
        }
    }

    private async openFill(checklistId: string): Promise<void> {
        const checklist = await this.dataManager.loadChecklist(checklistId);
        if (!checklist) {
            alert('Error loading checklist');
            return;
        }

        this.currentChecklist = checklist;

        // Enable fill tab
        const fillTab = document.getElementById('tab-fill');
        if (fillTab) {
            fillTab.removeAttribute('disabled');
        }

        // Set default values
        const now = new Date();
        const datetimeInput = document.getElementById('fill-datetime') as HTMLInputElement;
        if (datetimeInput) {
            datetimeInput.value = now.toISOString().slice(0, 16);
        }

        const operatorInput = document.getElementById('fill-operator') as HTMLInputElement;
        if (operatorInput) {
            operatorInput.value = this.currentUser?.name || '';
        }

        this.currentSectionIndex = 0; // Reset to first section
        this.renderFillQuestions();
        this.showView('fill-checklist');
    }

    private renderFillQuestions(): void {
        const container = document.getElementById('fill-questions-list');
        if (!container || !this.currentChecklist) return;

        // Split questions into sections
        this.sections = [];
        const lang = this.translationManager.getLanguage();
        const questions = [...this.currentChecklist.questions].sort((a, b) => a.order - b.order);
        
        let currentSection: Question[] = [];
        questions.forEach(question => {
            if (question.type === 'header' && currentSection.length > 0) {
                this.sections.push(currentSection);
                currentSection = [question];
            } else {
                currentSection.push(question);
            }
        });
        if (currentSection.length > 0) {
            this.sections.push(currentSection);
        }

        // Render current section
        this.renderCurrentSection();
    }

    private renderCurrentSection(): void {
        const container = document.getElementById('fill-questions-list');
        if (!container || this.sections.length === 0) return;

        const lang = this.translationManager.getLanguage();
        const section = this.sections[this.currentSectionIndex];
        
        container.innerHTML = '';

        section.forEach(question => {
            const div = document.createElement('div');
            div.className = question.type === 'header' ? 'fill-section-header' : 'fill-question-item';
            div.setAttribute('data-question-id', question.id);

            const questionText = lang === 'de' ? question.textDe : question.textEn;

            if (question.type === 'header') {
                div.innerHTML = `<h3 class="section-title">${questionText}</h3>`;
            } else {
                let imageHtml = '';
                if (question.imageBase64) {
                    imageHtml = `<div class="question-image"><img src="${question.imageBase64}" alt="${question.imageName || 'Question image'}" /></div>`;
                }
                div.innerHTML = `
                    <div class="fill-question-text">${questionText}</div>
                    ${imageHtml}
                    ${this.createAnswerControl(question)}
                `;
            }

            container.appendChild(div);
        });

        // Add event listeners for answer buttons
        this.setupAnswerButtonListeners();

        // Restore previously saved answers
        this.restoreSectionAnswers();

        // Update navigation buttons
        this.updateSectionNavigation();
    }

    private setupAnswerButtonListeners(): void {
        document.querySelectorAll('.answer-control-bool .answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const parent = target.parentElement;
                parent?.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected', 'ok', 'nok'));
                target.classList.add('selected');
                const value = target.getAttribute('data-value');
                if (value === 'OK') target.classList.add('ok');
                if (value === 'NOK') target.classList.add('nok');
            });
        });
    }

    private updateSectionNavigation(): void {
        const navContainer = document.getElementById('section-navigation');
        if (!navContainer) {
            // Create navigation container
            const fillContainer = document.querySelector('.fill-questions');
            if (fillContainer) {
                const nav = document.createElement('div');
                nav.id = 'section-navigation';
                nav.className = 'section-navigation';
                fillContainer.appendChild(nav);
            }
        }

        const nav = document.getElementById('section-navigation');
        if (!nav) return;

        const isFirstSection = this.currentSectionIndex === 0;
        const isLastSection = this.currentSectionIndex === this.sections.length - 1;

        nav.innerHTML = `
            <button id="prev-section-btn" class="btn-secondary" ${isFirstSection ? 'disabled' : ''}>
                ← ${this.translationManager.translate('previous-section') || 'Vorherige'}
            </button>
            <span class="section-indicator">
                ${this.translationManager.translate('section-text') || 'Abschnitt'} ${this.currentSectionIndex + 1} / ${this.sections.length}
            </span>
            <button id="next-section-btn" class="btn-primary" ${isLastSection ? 'disabled' : ''}>
                ${this.translationManager.translate('next-section') || 'Nächste'} →
            </button>
        `;

        // Add event listeners
        const prevBtn = document.getElementById('prev-section-btn');
        const nextBtn = document.getElementById('next-section-btn');

        prevBtn?.addEventListener('click', () => {
            if (this.currentSectionIndex > 0) {
                this.saveCurrentSectionAnswers();
                this.currentSectionIndex--;
                this.renderCurrentSection();
            }
        });

        nextBtn?.addEventListener('click', () => {
            this.saveCurrentSectionAnswers();
            if (this.currentSectionIndex < this.sections.length - 1) {
                this.currentSectionIndex++;
                this.renderCurrentSection();
            } else {
                // Last section - show summary
                this.showSummary();
            }
        });
    }

    private saveCurrentSectionAnswers(): void {
        if (!this.sections[this.currentSectionIndex]) return;

        const section = this.sections[this.currentSectionIndex];
        
        section.forEach(question => {
            if (question.type === 'header') return;

            const item = document.querySelector(`[data-question-id="${question.id}"]`);
            if (!item) return;

            let answer = '';

            if (question.type === 'bool_ok_nok_na') {
                const selected = item.querySelector('.answer-btn.selected');
                answer = selected ? (selected as HTMLElement).getAttribute('data-value') || '' : '';
            } else if (question.type === 'scale') {
                const checked = item.querySelector('input[type="radio"]:checked') as HTMLInputElement;
                answer = checked ? checked.value : '';
            } else if (question.type === 'single_choice') {
                answer = (item.querySelector('.answer-select') as HTMLSelectElement).value;
            } else if (question.type === 'short_text' || question.type === 'long_text') {
                answer = (item.querySelector('.answer-text') as HTMLInputElement | HTMLTextAreaElement).value;
            }

            if (answer) {
                this.currentAnswers[question.id] = answer;
            }
        });
    }

    private restoreSectionAnswers(): void {
        if (!this.sections[this.currentSectionIndex]) return;

        const section = this.sections[this.currentSectionIndex];
        
        // Wait for DOM to be ready
        setTimeout(() => {
            section.forEach(question => {
                if (question.type === 'header' || !this.currentAnswers[question.id]) return;

                const item = document.querySelector(`[data-question-id="${question.id}"]`);
                if (!item) return;

                const answer = this.currentAnswers[question.id];

                if (question.type === 'bool_ok_nok_na') {
                    const buttons = item.querySelectorAll('.answer-btn');
                    buttons.forEach(btn => {
                        if ((btn as HTMLElement).getAttribute('data-value') === answer) {
                            btn.classList.add('selected');
                            if (answer === 'OK') btn.classList.add('ok');
                            if (answer === 'NOK') btn.classList.add('nok');
                        }
                    });
                } else if (question.type === 'scale') {
                    const radio = item.querySelector(`input[value="${answer}"]`) as HTMLInputElement;
                    if (radio) radio.checked = true;
                } else if (question.type === 'single_choice') {
                    const select = item.querySelector('.answer-select') as HTMLSelectElement;
                    if (select) select.value = answer;
                } else if (question.type === 'short_text' || question.type === 'long_text') {
                    const input = item.querySelector('.answer-text') as HTMLInputElement | HTMLTextAreaElement;
                    if (input) input.value = answer;
                }
            });
        }, 100);
    }

    private createAnswerControl(question: Question): string {
        switch (question.type) {
            case 'bool_ok_nok_na':
                return `
                    <div class="answer-control-bool">
                        <button type="button" class="answer-btn" data-value="OK">${this.translationManager.translate('answer-ok')}</button>
                        <button type="button" class="answer-btn" data-value="NOK">${this.translationManager.translate('answer-nok')}</button>
                        <button type="button" class="answer-btn" data-value="N/A">${this.translationManager.translate('answer-na')}</button>
                    </div>
                `;
            
            case 'scale':
                const min = question.scaleMin || 1;
                const max = question.scaleMax || 5;
                let html = '<div class="answer-control-scale">';
                for (let i = min; i <= max; i++) {
                    html += `
                        <div>
                            <input type="radio" name="q_${question.id}" id="q_${question.id}_${i}" value="${i}">
                            <label for="q_${question.id}_${i}">${i}</label>
                        </div>
                    `;
                }
                html += '</div>';
                return html;

            case 'single_choice':
                let select = `<select class="form-input answer-select"><option value="">--</option>`;
                (question.options || []).forEach(opt => {
                    select += `<option value="${opt}">${opt}</option>`;
                });
                select += '</select>';
                return select;

            case 'short_text':
                return `<input type="text" class="form-input answer-text">`;

            case 'long_text':
                return `<textarea class="form-input answer-text" rows="3"></textarea>`;

            default:
                return '';
        }
    }

    private showSummary(): void {
        if (!this.currentChecklist) return;

        const container = document.getElementById('fill-questions-list');
        const nav = document.getElementById('section-navigation');
        if (!container) return;

        const lang = this.translationManager.getLanguage();
        let ioParts = 0;
        let nioParts = 0;

        // Calculate IO/NIO
        this.currentChecklist.questions.forEach(question => {
            if (question.type === 'header' || !question.includeInIoNio) return;
            const answer = this.currentAnswers[question.id];
            if (answer === 'OK') ioParts++;
            else if (answer === 'NOK') nioParts++;
        });

        // Build summary HTML
        let summaryHtml = `
            <div class="summary-container">
                <h2 class="summary-title">${this.translationManager.translate('summary-title') || 'Zusammenfassung'}</h2>
                <div class="summary-stats">
                    <div class="stat-box stat-ok">
                        <div class="stat-label">✓ ${this.translationManager.translate('summary-ok') || 'OK'}</div>
                        <div class="stat-value">${ioParts}</div>
                    </div>
                    <div class="stat-box stat-nok">
                        <div class="stat-label">✗ ${this.translationManager.translate('summary-nok') || 'NOK'}</div>
                        <div class="stat-value">${nioParts}</div>
                    </div>
                </div>
                <div class="summary-questions">
        `;

        this.currentChecklist.questions.forEach(question => {
            if (question.type === 'header') {
                const questionText = lang === 'de' ? question.textDe : question.textEn;
                summaryHtml += `<h3 class="summary-section-header">${questionText}</h3>`;
                return;
            }

            const answer = this.currentAnswers[question.id] || '-';
            const questionText = lang === 'de' ? question.textDe : question.textEn;
            const isNok = answer === 'NOK';
            const isOk = answer === 'OK';

            summaryHtml += `
                <div class="summary-question-item ${isNok ? 'item-nok' : ''} ${isOk ? 'item-ok' : ''}">
                    <div class="summary-question-text">${questionText}</div>
                    <div class="summary-answer ${isNok ? 'answer-nok' : ''} ${isOk ? 'answer-ok' : ''}">${answer}</div>
                </div>
            `;
        });

        summaryHtml += `
                </div>
                <div class="summary-actions">
                    <button id="back-to-edit-btn" class="btn-secondary">
                        ← ${this.translationManager.translate('back-to-edit') || 'Zurück zur Bearbeitung'}
                    </button>
                    <button id="confirm-save-btn" class="btn-primary">
                        ✓ ${this.translationManager.translate('confirm-save') || 'Speichern bestätigen'}
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = summaryHtml;
        if (nav) nav.style.display = 'none';

        // Event listeners
        document.getElementById('back-to-edit-btn')?.addEventListener('click', () => {
            this.currentSectionIndex = this.sections.length - 1;
            this.renderCurrentSection();
            if (nav) nav.style.display = 'flex';
        });

        document.getElementById('confirm-save-btn')?.addEventListener('click', () => {
            this.saveToDatabase();
        });
    }

    private async saveToDatabase(): Promise<void> {
        if (!this.currentChecklist || !this.currentUser) return;

        const datetime = (document.getElementById('fill-datetime') as HTMLInputElement).value;
        const inspectedParts = (document.getElementById('fill-inspected-parts') as HTMLInputElement).value;

        let ioParts = 0;
        let nioParts = 0;

        // Calculate IO/NIO
        this.currentChecklist.questions.forEach(question => {
            if (question.type === 'header' || !question.includeInIoNio) return;
            const answer = this.currentAnswers[question.id];
            if (answer === 'OK') ioParts++;
            else if (answer === 'NOK') nioParts++;
        });

        const response: ResponseRow = {
            timestamp: new Date().toISOString(),
            reportDateTime: datetime,
            inspectedParts,
            generatedBy: this.currentUser.name,
            ioParts,
            nioParts,
            includeInReport: false,
            answers: { ...this.currentAnswers }
        };

        const saved = await this.dataManager.appendResponse(this.currentChecklist.id, response);
        if (saved) {
            alert(this.translationManager.translate('success-save'));

            // Log audit
            await this.dataManager.logAudit({
                timestamp: new Date().toISOString(),
                userName: this.currentUser.name,
                checklistId: this.currentChecklist.id,
                recordId: response.timestamp,
                fieldName: 'new_response',
                oldValue: '-',
                newValue: 'created',
                actionType: 'CREATE'
            });

            // Enable grid and report tabs
            document.getElementById('tab-grid')?.removeAttribute('disabled');
            document.getElementById('tab-report')?.removeAttribute('disabled');

            // Clear answers
            this.currentAnswers = {};
            this.currentSectionIndex = 0;

            this.showView('checklist-list');
        } else {
            alert(this.translationManager.translate('error-save'));
        }
    }

    private async loadResponseGrid(): Promise<void> {
        if (!this.currentChecklist) return;

        this.responses = await this.dataManager.loadResponses(this.currentChecklist.id);
        this.filteredResponses = [...this.responses];

        this.renderResponseGrid();
    }

    private applyFilter(): void {
        const fromDate = (document.getElementById('filter-date-from') as HTMLInputElement).value;
        const toDate = (document.getElementById('filter-date-to') as HTMLInputElement).value;

        this.filteredResponses = this.responses.filter(row => {
            const rowDate = row.timestamp.split('T')[0];
            
            if (fromDate && rowDate < fromDate) return false;
            if (toDate && rowDate > toDate) return false;
            
            return true;
        });

        this.renderResponseGrid();
    }

    private renderResponseGrid(): void {
        const container = document.getElementById('response-grid');
        if (!container || !this.currentChecklist) return;

        if (this.filteredResponses.length === 0) {
            container.innerHTML = '<p>No responses found.</p>';
            return;
        }

        const questionIds = this.currentChecklist.questions
            .filter(q => q.type !== 'header')
            .sort((a, b) => a.order - b.order)
            .map(q => q.id);

        let table = '<table><thead><tr>';
        table += `<th>${this.translationManager.translate('col-include')}</th>`;
        table += `<th>${this.translationManager.translate('col-timestamp')}</th>`;
        table += `<th>${this.translationManager.translate('col-operator')}</th>`;
        table += `<th>${this.translationManager.translate('col-inspected-parts')}</th>`;
        table += `<th>${this.translationManager.translate('col-io-parts')}</th>`;
        table += `<th>${this.translationManager.translate('col-nio-parts')}</th>`;

        const lang = this.translationManager.getLanguage();
        questionIds.forEach(qId => {
            const q = this.currentChecklist!.questions.find(qu => qu.id === qId);
            const text = q ? (lang === 'de' ? q.textDe : q.textEn) : qId;
            table += `<th>${text}</th>`;
        });

        table += '</tr></thead><tbody>';

        this.filteredResponses.forEach((row, rowIndex) => {
            table += '<tr>';
            table += `<td><input type="checkbox" data-row="${rowIndex}" ${row.includeInReport ? 'checked' : ''}></td>`;
            table += `<td>${row.timestamp}</td>`;
            table += `<td>${row.generatedBy}</td>`;
            table += `<td>${row.inspectedParts}</td>`;
            table += `<td>${row.ioParts}</td>`;
            table += `<td>${row.nioParts}</td>`;

            questionIds.forEach(qId => {
                table += `<td data-row="${rowIndex}" data-field="${qId}">${row.answers[qId] || ''}</td>`;
            });

            table += '</tr>';
        });

        table += '</tbody></table>';
        container.innerHTML = table;

        // Add event listeners
        container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                const rowIndex = parseInt(target.getAttribute('data-row') || '0');
                this.filteredResponses[rowIndex].includeInReport = target.checked;
                
                // Save back to full responses array
                const originalIndex = this.responses.findIndex(r => r.timestamp === this.filteredResponses[rowIndex].timestamp);
                if (originalIndex !== -1) {
                    this.responses[originalIndex].includeInReport = target.checked;
                }

                this.dataManager.saveResponses(this.currentChecklist!.id, this.responses);
            });
        });

        container.querySelectorAll('td[data-field]').forEach(cell => {
            cell.addEventListener('click', () => this.editCell(cell as HTMLElement));
        });
    }

    private editCell(cell: HTMLElement): void {
        const rowIndex = parseInt(cell.getAttribute('data-row') || '0');
        const field = cell.getAttribute('data-field') || '';
        const currentValue = cell.textContent || '';

        cell.classList.add('editing');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
        cell.textContent = '';
        cell.appendChild(input);
        input.focus();

        const save = async () => {
            const newValue = input.value;
            cell.classList.remove('editing');
            cell.textContent = newValue;

            this.filteredResponses[rowIndex].answers[field] = newValue;

            // Save back to full responses array
            const originalIndex = this.responses.findIndex(r => r.timestamp === this.filteredResponses[rowIndex].timestamp);
            if (originalIndex !== -1) {
                this.responses[originalIndex].answers[field] = newValue;
            }

            await this.dataManager.saveResponses(this.currentChecklist!.id, this.responses);

            // Log audit
            await this.dataManager.logAudit({
                timestamp: new Date().toISOString(),
                userName: this.currentUser?.name || 'Unknown',
                checklistId: this.currentChecklist!.id,
                recordId: this.filteredResponses[rowIndex].timestamp,
                fieldName: field,
                oldValue: currentValue,
                newValue: newValue,
                actionType: 'UPDATE'
            });
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') {
                cell.classList.remove('editing');
                cell.textContent = currentValue;
            }
        });
    }

    private selectAll(): void {
        this.filteredResponses.forEach(row => row.includeInReport = true);
        this.updateResponsesAndSave();
        this.renderResponseGrid();
    }

    private deselectAll(): void {
        this.filteredResponses.forEach(row => row.includeInReport = false);
        this.updateResponsesAndSave();
        this.renderResponseGrid();
    }

    private updateResponsesAndSave(): void {
        if (!this.currentChecklist) return;

        this.filteredResponses.forEach(filteredRow => {
            const index = this.responses.findIndex(r => r.timestamp === filteredRow.timestamp);
            if (index !== -1) {
                this.responses[index] = filteredRow;
            }
        });

        this.dataManager.saveResponses(this.currentChecklist.id, this.responses);
    }

    private generateReport(): void {
        if (!this.currentChecklist) return;

        const selected = this.responses.filter(r => r.includeInReport);

        if (selected.length === 0) {
            const container = document.getElementById('report-content');
            if (container) {
                container.innerHTML = '<p>No responses selected for report. Please select responses in the Response Database view.</p>';
            }
            return;
        }

        const reportData = this.calculateReportData(selected);
        this.renderReport(reportData);
    }

    private calculateReportData(selected: ResponseRow[]): ReportData {
        const lang = this.translationManager.getLanguage();
        const now = new Date();

        // Calculate date range
        const timestamps = selected.map(r => new Date(r.timestamp));
        const minDate = new Date(Math.min(...timestamps.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...timestamps.map(d => d.getTime())));

        const reportData: ReportData = {
            title: this.translationManager.translate('report-main-title'),
            generatedOn: now.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US'),
            selectedRange: `${minDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')} - ${maxDate.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US')}`,
            inspectedParts: selected.reduce((sum, r) => sum + parseInt(r.inspectedParts || '0'), 0),
            generatedBy: this.currentUser?.name || '',
            ioParts: selected.reduce((sum, r) => sum + r.ioParts, 0),
            nioParts: selected.reduce((sum, r) => sum + r.nioParts, 0),
            checkingSteps: []
        };

        // Calculate per question
        this.currentChecklist!.questions
            .filter(q => q.type !== 'header')
            .sort((a, b) => a.order - b.order)
            .forEach(question => {
                let okCount = 0;
                let nokCount = 0;
                let naCount = 0;

                selected.forEach(row => {
                    const answer = row.answers[question.id];
                    if (answer === 'OK') okCount++;
                    else if (answer === 'NOK') nokCount++;
                    else if (answer === 'N/A') naCount++;
                });

                const total = okCount + nokCount + naCount;
                const percentNok = total > 0 ? (nokCount / total) * 100 : 0;

                reportData.checkingSteps.push({
                    questionText: lang === 'de' ? question.textDe : question.textEn,
                    okParts: okCount,
                    nokParts: nokCount,
                    naParts: naCount,
                    percentNok: parseFloat(percentNok.toFixed(2)),
                    weight: question.weight,
                    maxPoints: question.maxPoints
                });
            });

        return reportData;
    }

    private renderReport(data: ReportData): void {
        const container = document.getElementById('report-content');
        if (!container) return;

        container.innerHTML = `
            <div class="report-header">
                <div class="report-info">
                    <h1 class="report-title" contenteditable="true">${data.title}</h1>
                    <div class="report-field">
                        <span class="report-field-label">${this.translationManager.translate('report-generated-on')}</span>
                        <span class="report-field-value" contenteditable="true">${data.generatedOn}</span>
                    </div>
                    <div class="report-field">
                        <span class="report-field-label">${this.translationManager.translate('report-selected-range')}</span>
                        <span class="report-field-value" contenteditable="true">${data.selectedRange}</span>
                    </div>
                    <div class="report-field">
                        <span class="report-field-label">${this.translationManager.translate('report-inspected-parts')}</span>
                        <span class="report-field-value" contenteditable="true">${data.inspectedParts}</span>
                    </div>
                    <div class="report-field">
                        <span class="report-field-label">${this.translationManager.translate('report-generated-by')}</span>
                        <span class="report-field-value" contenteditable="true">${data.generatedBy}</span>
                    </div>
                    <div class="report-field">
                        <span class="report-field-label">${this.translationManager.translate('report-io-parts')}</span>
                        <span class="report-field-value" contenteditable="true">${data.ioParts}</span>
                    </div>
                    <div class="report-field">
                        <span class="report-field-label">${this.translationManager.translate('report-nio-parts')}</span>
                        <span class="report-field-value" contenteditable="true">${data.nioParts}</span>
                    </div>
                </div>
                <div class="report-logo">LOGO</div>
            </div>

            <h2 class="report-section-title">${this.translationManager.translate('report-checking-steps')}</h2>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th>${this.translationManager.translate('report-checking-steps')}</th>
                        <th>${this.translationManager.translate('report-ok-parts')}</th>
                        <th>${this.translationManager.translate('report-nok-parts')}</th>
                        <th>${this.translationManager.translate('report-percent-nok')}</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.checkingSteps.map(step => `
                        <tr>
                            <td contenteditable="true">${step.questionText}</td>
                            <td contenteditable="true">${step.okParts}</td>
                            <td contenteditable="true">${step.nokParts}</td>
                            <td contenteditable="true">${step.percentNok}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="report-footer">
                <div class="signature-line">
                    ${this.translationManager.translate('report-signature')} ________________________________
                </div>
            </div>
        `;
    }

    private async exportPDF(): Promise<void> {
        const element = document.getElementById('report-content');
        if (!element || !this.currentChecklist) return;

        try {
            // @ts-ignore - html2pdf library
            const opt = {
                margin: 10,
                filename: `${this.currentChecklist.id}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // @ts-ignore
            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Error generating PDF');
        }
    }

    private loadTranslationsEditor(): void {
        const container = document.getElementById('translations-list');
        if (!container) return;

        const translations = this.translationManager.getTranslations();

        container.innerHTML = '';

        Object.keys(translations).forEach(key => {
            const item = document.createElement('div');
            item.className = 'translation-item';
            
            item.innerHTML = `
                <div class="translation-key">${key}</div>
                <input type="text" class="form-input trans-de" value="${translations[key].de}" data-key="${key}" data-lang="de">
                <input type="text" class="form-input trans-en" value="${translations[key].en}" data-key="${key}" data-lang="en">
            `;

            container.appendChild(item);
        });
    }

    private saveTranslations(): void {
        const container = document.getElementById('translations-list');
        if (!container) return;

        container.querySelectorAll('.form-input[data-key]').forEach(input => {
            const inp = input as HTMLInputElement;
            const key = inp.getAttribute('data-key') || '';
            const lang = inp.getAttribute('data-lang') as 'de' | 'en';
            const value = inp.value;

            const translations = this.translationManager.getTranslations();
            if (translations[key]) {
                translations[key][lang] = value;
                this.translationManager.updateTranslation(key, translations[key].de, translations[key].en);
            }
        });

        this.translationManager.saveTranslations();
        alert(this.translationManager.translate('success-save'));
    }

    private showAddUserModal(): void {
        this.showModal('new-user-modal');
        (document.getElementById('new-user-name') as HTMLInputElement).value = '';
    }

    private async addNewUser(): Promise<void> {
        const name = (document.getElementById('new-user-name') as HTMLInputElement).value.trim();
        
        if (!name) {
            alert('Please enter a name');
            return;
        }

        const newUser: User = {
            id: `user_${Date.now()}`,
            name
        };

        this.users.push(newUser);
        await this.dataManager.saveUsers(this.users);

        this.hideModal('new-user-modal');
        this.populateUserSelect();

        // Select the new user
        const select = document.getElementById('user-select') as HTMLSelectElement;
        if (select) {
            select.value = newUser.id;
            this.currentUser = newUser;
        }
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    private populateUserSelect(): void {
        const select = document.getElementById('user-select') as HTMLSelectElement;
        if (!select) return;

        select.innerHTML = '';

        this.users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            select.appendChild(option);
        });
    }

    private showModal(modalId: string): void {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    private hideModal(modalId: string): void {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    private populateUsers(): void {
        const select = document.getElementById('user-select') as HTMLSelectElement;
        if (!select) return;

        select.innerHTML = this.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ChecklistApp();
    });
} else {
    new ChecklistApp();
}
