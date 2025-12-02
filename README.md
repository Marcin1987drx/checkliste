# Checklist Offline App

100% offline web application for creating, editing and filling checklists with PDF reports. Works entirely in the browser without any server, API or external services.

## Features

- ✅ **Offline First**: All data stored locally, no server required
- 📝 **Checklist Management**: Create, edit and manage multiple checklists
- 📋 **Form Filling**: Fill checklists with various question types (OK/NOK/N/A, scale, text, etc.)
- 📊 **Response Database**: View and edit all responses in a grid view
- 📄 **PDF Reports**: Generate professional PDF reports client-side
- 🌍 **Multi-language**: German (default) and English with editable translations
- 🔍 **VDA Support**: VDA codes, weights, and scoring
- 📜 **Audit Trail**: Complete audit log of all changes

## Technology Stack

- **TypeScript** - Type-safe JavaScript
- **HTML/CSS** - Modern, clean UI inspired by MS Forms
- **html2pdf.js** - Client-side PDF generation
- **File System Access API** - Local file operations
- **Rollup** - Module bundler

## Requirements

- Modern browser with File System Access API support:
  - Google Chrome 86+
  - Microsoft Edge 86+
  - Opera 72+
  - (Safari and Firefox have limited support)

## Installation & Setup

1. **Clone or download the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   
   Or use any static file server:
   ```bash
   npx http-server -c-1 -p 8080
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:8080`

## Quick Start

Sample files are included in the repository:
- `EXAMPLE_QA.json` - Sample checklist with various question types
- `EXAMPLE_QA_data.csv` - Sample response data with 4 filled entries

To use them:

1. Open the application in your browser
2. Click "📁 Ordner wählen" (Select Folder)
3. Select the `checkliste` folder (the root project folder)
4. You will see "EXAMPLE_QA" checklist with 4 responses
5. Try:
   - **Editing**: Click "Bearbeiten" to see the checklist editor
   - **Filling**: Click "Ausfüllen" to fill a new entry
   - **Responses**: Open "Antworten" tab to see and edit the 4 sample responses
   - **Report**: Open "Bericht" tab to generate a PDF report

## Usage Guide

### 1. Select Working Folder

Click the "📁 Ordner wählen" (Select Folder) button in the header to choose a folder where your checklists and data will be stored.

### 2. Create a Checklist

1. Click "➕ Neue Checkliste" (New Checklist)
2. Enter ID, Name, and Description
3. Click "Erstellen" (Create)

### 3. Edit Checklist

1. Click "Bearbeiten" (Edit) on a checklist card
2. Add questions using "➕ Frage hinzufügen" (Add Question)
3. Configure each question:
   - Question text (DE/EN)
   - Question type (OK/NOK/N/A, scale, text, etc.)
   - VDA parameters (code, weight, max points)
   - Include in IO/NIO calculations
4. Use arrow buttons to reorder questions
5. Click "💾 Speichern" (Save)

### 4. Fill Checklist

1. Click "Ausfüllen" (Fill) on a checklist card
2. Fill in meta information (date, inspected parts, operator)
3. Answer all questions
4. Click "💾 Speichern" (Save)
   - Response is saved to CSV
   - IO/NIO totals are calculated automatically

### 5. View Response Database

1. Open "Antworten" (Responses) tab
2. View all responses in a grid
3. Filter by date range
4. Edit cells directly (click to edit)
5. Check/uncheck rows for report inclusion
6. Use "Alle auswählen" (Select All) / "Alle abwählen" (Deselect All)

### 6. Generate Report

1. Open "Bericht" (Report) tab
2. Report is generated from selected responses
3. Edit any field in the report preview
4. Click "📄 PDF Exportieren" (Export PDF)
5. Choose save location

### 7. Manage Users

1. Click the "+" button next to user dropdown
2. Enter user name
3. Click "Hinzufügen" (Add)

### 8. Edit Translations

1. Open "Übersetzungen" (Translations) tab
2. Edit German and English text for any UI element
3. Click "💾 Speichern" (Save)

### 9. Switch Language

Click "DE" or "EN" buttons in the header to switch language.

## File Structure

```
working-folder/
├── {ChecklistId}.json          # Checklist definition
├── {ChecklistId}_data.csv      # Responses for checklist
├── {ChecklistId}_Report_{date}.pdf  # Generated reports
└── audit_log.csv               # Audit trail of all changes
```

### Checklist JSON Format

```json
{
  "id": "QA_001",
  "name": "Quality Control",
  "description": "Standard quality control checklist",
  "questions": [
    {
      "id": "q1",
      "textDe": "Ist das Produkt vollständig?",
      "textEn": "Is the product complete?",
      "type": "bool_ok_nok_na",
      "vdaCode": "P2.1",
      "weight": 10,
      "maxPoints": 100,
      "includeInIoNio": true,
      "order": 1
    }
  ]
}
```

### Response CSV Format

```csv
timestamp,reportDateTime,inspectedParts,generatedBy,ioParts,nioParts,includeInReport,q_q1,q_q2,...
2025-12-02T10:30:00,2025-12-02T10:30:00,100,Operator 1,95,5,true,OK,NOK,...
```

### Audit Log Format

```csv
timestamp,userName,checklistId,recordId,fieldName,oldValue,newValue,actionType
2025-12-02T10:30:00,Operator 1,QA_001,0,q_q1,OK,NOK,UPDATE
```

## Question Types

- **bool_ok_nok_na**: OK / NOK / N/A selector
- **single_choice**: Dropdown with predefined options
- **scale**: Scale rating (e.g., 1-5)
- **short_text**: Single line text input
- **long_text**: Multi-line text area
- **header**: Section header (no answer)

## VDA Support

Each question can have VDA parameters:
- **VDA Code**: e.g., "P2.1"
- **Weight**: Importance factor
- **Max Points**: Maximum achievable points

Reports calculate:
- Weighted scores per question
- Overall compliance percentage
- IO (In Order) / NIO (Not In Order) statistics

## Development

### Scripts

- `npm run build` - Compile TypeScript and bundle with Rollup
- `npm run watch` - Watch mode for TypeScript compilation
- `npm run dev` - Build and start dev server

### Project Structure

```
checkliste/
├── src/
│   ├── main.ts           # Main application logic
│   ├── dataManager.ts    # File I/O operations
│   ├── translations.ts   # Translation management
│   └── types.ts          # TypeScript type definitions
├── lib/
│   └── html2pdf.bundle.min.js  # PDF generation library
├── dist/                 # Compiled JavaScript (generated)
├── index.html            # Main HTML file
├── styles.css            # Application styles
├── tsconfig.json         # TypeScript configuration
├── rollup.config.js      # Rollup configuration
└── package.json          # NPM dependencies

```

## Browser Compatibility

The application uses the **File System Access API** which has the following browser support:

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 86+ | ✅ Full support |
| Edge | 86+ | ✅ Full support |
| Opera | 72+ | ✅ Full support |
| Safari | - | ⚠️ Limited/no support |
| Firefox | - | ⚠️ Limited/no support |

For browsers without File System Access API support, the application will show an alert message.

## Troubleshooting

### "File System Access API is not supported"
- Use a compatible browser (Chrome, Edge, or Opera)
- Make sure you're using the latest version

### Files not saving
- Check browser permissions for file system access
- Make sure the selected folder has write permissions

### PDF generation fails
- Ensure html2pdf.js is loaded (check browser console)
- Check if the lib/html2pdf.bundle.min.js file exists

### Compilation errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `dist` folders, then run `npm install` and `npm run build` again

## License

MIT License

## Additional Documentation

- **QUICKSTART.md** - Quick start guide in German and Polish
- **IMPLEMENTATION.md** - Detailed implementation summary
- **instruction.md** - Original specification
- **EXAMPLE_QA.json** - Sample checklist file

## Author

Created for offline quality control and inspection workflows.

## Version

**v1.0.0** - Complete implementation with all features from specification
