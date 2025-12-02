# Offline Checklist App – AI Implementation Guide

## Goal

Create a 100% offline web application for creating, editing and filling checklists and generating PDF summary reports similar to the attached “Warenausgangsprotokoll” screenshot. The app must work only in the browser (TypeScript/HTML/CSS), without any server, API or external cloud. PDF generation must also be client side. [1]

## Tech stack and constraints

- Frontend only: TypeScript + HTML + CSS (no backend, no external services).  
- Allowed: local JS libraries for PDF generation (e.g. html2pdf.js or similar, bundled locally, no CDN). [1]
- No data leaves the user’s machine; all storage is via local files (JSON/CSV) in user selected folders.  
- UI style: simple, modern, similar to Microsoft Forms (list of questions, options, clean layout), without drag & drop.

## File and data model

Per checklist there is one working folder chosen by the user. In that folder the app stores:

- `{ChecklistId}.json` – checklist definition.  
- `{ChecklistId}_data.csv` – all responses for that checklist (one row = one filled form).  
- Any generated PDF reports.

Checklist definition JSON should contain:

- `id`, `name`, `description`.  
- `questions`: array of questions; each question has:
  - `id` (unique string),  
  - `textEn`, `textDe`,  
  - `type`: one of  
    - `bool_ok_nok_na` (OK/NOK/N/A),  
    - `single_choice`,  
    - `scale`,  
    - `short_text`,  
    - `long_text`,  
    - `header` (section title, no answer),  
  - VDA metadata: e.g. `vdaCode` (like “P2.1”), `weight`, `maxPoints`,  
  - `includeInIoNio` (boolean – whether it counts into IO/NIO statistics).

Responses CSV structure:

- One row per filled checklist.  
- Columns include:
  - `timestamp` (date/time of completion),  
  - `reportDateTime` (if needed),  
  - `inspectedParts`,  
  - `generatedBy` (user name),  
  - `ioParts`, `nioParts` (totals for the whole checklist),  
  - one column per question (`q_<questionId>` with value OK/NOK/N/A or other types),  
  - optional VDA related scores (calculated fields).

Additionally, an `audit_log.csv` in the same folder logs changes:

- Columns: `timestamp`, `userName`, `checklistId`, `recordId`, `fieldName`, `oldValue`, `newValue`, `actionType` (CREATE/UPDATE/DELETE).

## Screens / views

Implement the app as a single page UI with 5 main views (tabs or sections).

### 1. Checklist list

- User selects a working folder using file/folder picker.  
- Display all `{ChecklistId}.json` files in that folder.  
- Actions:
  - Create new checklist.  
  - Open checklist in editor.  
  - Open checklist for filling.  
  - Show existence and basic stats for corresponding CSV (rows count).

### 2. Checklist editor (MS Forms like)

- List of questions with controls:
  - Add question, delete, duplicate, move up/down.  
  - Change type (bool_ok_nok_na, single_choice, scale, etc.).  
  - Edit `textEn` and `textDe`.  
  - Edit VDA properties: `vdaCode`, `weight`, `maxPoints`.  
  - Toggle `includeInIoNio`.  
  - Mark as `header` (section with no answer).  
- Save button writes updated JSON file back to disk.

### 3. Fill checklist

- Header section (meta data) at top:
  - date/time, inspected parts, user selection, etc. – based on JSON configuration.  
- Below: questions rendered like MS Forms:
  - For bool_ok_nok_na: 3 state control (OK / NOK / N/A).  
  - For scale: row of radio buttons.  
  - For single_choice: dropdown.  
  - For text: input/textarea.  
- Save button:
  - Validates required fields.  
  - Calculates IO/NIO totals for this fill based on questions with `includeInIoNio`.  
  - Appends a row to the CSV file.  
  - Adds an entry to `audit_log.csv` (actionType = CREATE).

### 4. Response database view (grid editor)

- Tabular view of all rows from `{ChecklistId}_data.csv`.  
- Columns:
  - checkmark column `includeInReport`,  
  - `timestamp`, `operator/generatedBy`, `inspectedParts`, `ioParts`, `nioParts`,  
  - one column per question answer,  
  - optional VDA score columns.  
- Features:
  - In place editing of any cell (including changing OK↔NOK, text, etc.).  
  - After each edit:
    - recalculate any dependent totals if needed,  
    - write back to CSV file,  
    - write entry to `audit_log.csv` (actionType = UPDATE).  
  - Filter by date range (from to); optionally by user.  
  - Buttons:
    - “Select all in current filter”, “Unselect all”.  

### 5. Report generator and preview

- Based on:
  - current date filter,  
  - and rows where `includeInReport` is checked.  
- Aggregation logic:
  - Global IO/NIO:
    - Sum `ioParts` and `nioParts` over selected rows.  
  - Per question:
    - count OK, NOK, N/A over selected rows,  
    - compute %NOK, %OK, and VDA weighted score (weight * result), if applicable.  
- HTML report view mirroring the layout of the “Warenausgangsprotokoll” screenshot:
  - Top area with key fields:
    - “Report generated on: …” (editable),  
    - “Selected range: … – …” (based on filter, editable),  
    - “Inspected parts: …” (sum across selected rows, editable),  
    - “Generated by: …” (taken from current user, editable),  
    - “IO Parts: …” and “NIO Parts: …” (calculated totals, editable),  
    - company logo placeholder on the right.  
  - Section title “Checking steps”.  
  - Table:
    - Columns:  
      - Checking steps (question text in current language),  
      - OK Parts,  
      - NOK Parts,  
      - optionally %NOK, weight, points.  
    - Each row corresponds to one question from the checklist.  
- All text fields and numeric outputs in the report must be editable by the user directly in the preview (e.g. contentEditable cells).  
- Button “Export to PDF”:
  - Converts the HTML report into a PDF file (client side). [1]
  - Lets the user save it into the same folder.  
- Optional: text field or line under the table for a signature line (“Signature: ______”).

## Users and localization

- No login system; instead:
  - At the top level UI there is a user selector (dropdown).  
  - “+” button lets the user add a new name to the list; names are stored locally (JSON or localStorage).  
  - Selected user is used as `generatedBy` in responses and in the audit log.  
- UI language:
  - Global language toggle EN/DE (DE as default).  
  - All interface strings plus report labels should come from a small translation dictionary that can be edited via a simple “Translations” panel (key → EN/DE).  

## Non functional requirements

- Keep code organized (modules or classes) so it is easy to extend.  
- Use clear TypeScript types/interfaces for:
  - Checklist, Question, ResponseRow, AuditLogEntry, etc.  
- Handle typical error cases gracefully:
  - Missing CSV file (create new),  
  - Malformed row (show warning, but don’t crash),  
  - User cancelling file/folder selection.  
- Make layout responsive enough to work on laptops and larger screens (no need for mobile optimization).

***
