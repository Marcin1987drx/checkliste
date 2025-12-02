# Schnellanleitung / Quick Guide (DE/PL)

## 🇩🇪 DEUTSCHE VERSION

### Installation und Start

1. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

2. **Projekt kompilieren**
   ```bash
   npm run build
   ```

3. **Anwendung starten**
   ```bash
   npm run dev
   ```
   
4. **Browser öffnen**: `http://localhost:8080`

### Erste Schritte

1. **Arbeitsordner auswählen**: Klicken Sie auf "📁 Ordner wählen" im Header
2. **Neue Checkliste erstellen**: Button "➕ Neue Checkliste"
3. **Checkliste bearbeiten**: 
   - Fragen hinzufügen mit "➕ Frage hinzufügen"
   - Fragetyp auswählen (OK/NOK/N/A, Skala, Text, etc.)
   - VDA-Parameter eingeben (Code, Gewicht, Max. Punkte)
   - Speichern mit "💾 Speichern"

4. **Checkliste ausfüllen**:
   - Metadaten eingeben (Datum, geprüfte Teile, Operator)
   - Alle Fragen beantworten
   - Speichern - IO/NIO werden automatisch berechnet

5. **Antworten ansehen und bearbeiten**:
   - Tab "Antworten" öffnen
   - Zellen direkt anklicken und bearbeiten
   - Nach Datum filtern
   - Zeilen für Bericht auswählen

6. **Bericht generieren**:
   - Tab "Bericht" öffnen
   - Alle Felder sind editierbar
   - "📄 PDF Exportieren" klicken

### Fragetypen

- **OK/NOK/N/A**: 3-Zustands-Auswahl
- **Einfachauswahl**: Dropdown-Menü
- **Skala**: Bewertung 1-5 (oder andere Bereiche)
- **Kurzer Text**: Einzeilige Eingabe
- **Langer Text**: Mehrzeilige Eingabe
- **Überschrift**: Nur Titel, keine Antwort

### VDA-Unterstützung

Jede Frage kann VDA-Parameter haben:
- **VDA Code**: z.B. "P2.1"
- **Gewicht**: Wichtigkeitsfaktor
- **Max. Punkte**: Maximale Punktzahl

Der Bericht berechnet automatisch:
- Gewichtete Scores pro Frage
- Gesamt-Compliance-Prozentsatz
- IO/NIO Statistiken

### Benutzer verwalten

- Klicken Sie auf "+" neben der Benutzerauswahl
- Neuen Namen eingeben
- Der Benutzer wird in localStorage gespeichert

### Sprache wechseln

- Klicken Sie auf "DE" oder "EN" im Header
- Standard: Deutsch

### Übersetzungen bearbeiten

- Tab "Übersetzungen" öffnen
- Deutsche und englische Texte bearbeiten
- Mit "💾 Speichern" speichern

---

## 🇵🇱 POLSKA WERSJA

### Instalacja i uruchomienie

1. **Zainstaluj zależności**
   ```bash
   npm install
   ```

2. **Skompiluj projekt**
   ```bash
   npm run build
   ```

3. **Uruchom aplikację**
   ```bash
   npm run dev
   ```
   
4. **Otwórz przeglądarkę**: `http://localhost:8080`

### Pierwsze kroki

1. **Wybierz folder roboczy**: Kliknij "📁 Ordner wählen" w nagłówku
2. **Utwórz nową checklistę**: Przycisk "➕ Neue Checkliste"
3. **Edytuj checklistę**: 
   - Dodaj pytania przyciskiem "➕ Frage hinzufügen"
   - Wybierz typ pytania (OK/NOK/N/A, skala, tekst, itp.)
   - Wprowadź parametry VDA (kod, waga, max punkty)
   - Zapisz przyciskiem "💾 Speichern"

4. **Wypełnij checklistę**:
   - Wprowadź metadane (data, sprawdzone części, operator)
   - Odpowiedz na wszystkie pytania
   - Zapisz - IO/NIO zostaną automatycznie przeliczone

5. **Zobacz i edytuj odpowiedzi**:
   - Otwórz zakładkę "Antworten"
   - Kliknij komórkę aby ją edytować
   - Filtruj po dacie
   - Zaznacz wiersze do raportu

6. **Generuj raport**:
   - Otwórz zakładkę "Bericht"
   - Wszystkie pola można edytować
   - Kliknij "📄 PDF Exportieren"

### Typy pytań

- **OK/NOK/N/A**: Wybór 3-stanowy
- **Einfachauswahl**: Menu rozwijane
- **Skala**: Ocena 1-5 (lub inne zakresy)
- **Kurzer Text**: Pole jednoliniowe
- **Langer Text**: Pole wieloliniowe
- **Überschrift**: Tylko tytuł, bez odpowiedzi

### Obsługa VDA

Każde pytanie może mieć parametry VDA:
- **VDA Code**: np. "P2.1"
- **Gewicht**: Współczynnik ważności
- **Max. Punkte**: Maksymalna liczba punktów

Raport automatycznie oblicza:
- Wyniki ważone dla każdego pytania
- Ogólny procent zgodności
- Statystyki IO/NIO

### Zarządzanie użytkownikami

- Kliknij "+" obok wyboru użytkownika
- Wprowadź nowe imię
- Użytkownik zostanie zapisany w localStorage

### Zmiana języka

- Kliknij "DE" lub "EN" w nagłówku
- Domyślnie: Niemiecki

### Edycja tłumaczeń

- Otwórz zakładkę "Übersetzungen"
- Edytuj niemieckie i angielskie teksty
- Zapisz przyciskiem "💾 Speichern"

---

## 📋 Struktura plików / Dateistruktur / File Structure

```
Twój folder roboczy / Ihr Arbeitsordner / Your working folder:
├── {ChecklistId}.json          → Definicja checklisty / Checklisten-Definition
├── {ChecklistId}_data.csv      → Odpowiedzi / Antworten
├── {ChecklistId}_Report_*.pdf  → Wygenerowane raporty / Generierte Berichte
└── audit_log.csv               → Dziennik zmian / Änderungsprotokoll
```

---

## ⚙️ Wymagania / Anforderungen / Requirements

### Przeglądarka / Browser / Navegador:
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ⚠️ Safari (ograniczone / eingeschränkt / limited)
- ⚠️ Firefox (ograniczone / eingeschränkt / limited)

### System:
- Node.js 14+ (tylko do kompilacji / nur für Kompilierung / only for compilation)
- Nowoczesna przeglądarka / Moderner Browser / Modern browser

---

## 🆘 Pomoc / Hilfe / Help

### Problem: "File System Access API is not supported"
**DE**: Verwenden Sie Chrome, Edge oder Opera (neueste Version)  
**PL**: Użyj Chrome, Edge lub Opera (najnowsza wersja)  
**EN**: Use Chrome, Edge, or Opera (latest version)

### Problem: Pliki nie zapisują się / Dateien werden nicht gespeichert
**DE**: Überprüfen Sie die Browserberechtigungen für Dateisystemzugriff  
**PL**: Sprawdź uprawnienia przeglądarki do dostępu do systemu plików  
**EN**: Check browser permissions for file system access

### Problem: PDF nie generuje się / PDF wird nicht generiert
**DE**: Stellen Sie sicher, dass html2pdf.js geladen ist (Browser-Konsole überprüfen)  
**PL**: Upewnij się, że html2pdf.js został załadowany (sprawdź konsolę przeglądarki)  
**EN**: Ensure html2pdf.js is loaded (check browser console)

---

## 📞 Kontakt / Contact

Bei Problemen oder Fragen öffnen Sie ein Issue im Repository.  
W przypadku problemów lub pytań otwórz issue w repozytorium.  
For issues or questions, open an issue in the repository.

---

**Viel Erfolg! / Powodzenia! / Good luck!** 🚀
