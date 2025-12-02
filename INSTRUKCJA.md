# Checklist Manager - Instrukcja

## Sposób 1: Najprostszy (wymaga Python)

### Windows:
1. Kliknij dwukrotnie na **START.bat**
2. Otworzy się przeglądarka automatycznie
3. Gotowe!

### Linux/Mac:
1. Kliknij dwukrotnie na **START.sh**
2. Lub w terminalu: `./START.sh`
3. Otworzy się przeglądarka automatycznie
4. Gotowe!

## Sposób 2: Ręcznie

1. Otwórz terminal/wiersz poleceń w folderze aplikacji
2. Uruchom: `python -m http.server 8080` (Windows) lub `python3 -m http.server 8080` (Linux/Mac)
3. Otwórz przeglądarkę i wejdź na: http://localhost:8080

## Wymagania

- **Python** (zazwyczaj już zainstalowany na Linux/Mac)
- **Nowoczesna przeglądarka**: Chrome 86+, Edge 86+, Opera 72+

## Pliki do skopiowania

Skopiuj te pliki/foldery na swój dysk:
```
📁 Twój folder/
├── START.bat          ← Uruchom na Windows
├── START.sh           ← Uruchom na Linux/Mac
├── index.html
├── styles.css
├── dist/
│   └── bundle.js
└── lib/
    └── html2pdf.bundle.min.js
```

## Uwaga

Aplikacja działa **w 100% offline** - nie wymaga internetu!
