#!/bin/bash
echo "================================================"
echo "  Starting Checklist Manager..."
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "[ERROR] Python 3 is not installed!"
    echo "Please install Python 3"
    exit 1
fi

echo "[OK] Python 3 found"
echo "[INFO] Starting web server on http://localhost:8080"
echo ""
echo "================================================"
echo "  Open your browser and go to:"
echo "  http://localhost:8080"
echo "================================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Open browser (works on Linux with xdg-open or Mac with open)
if command -v xdg-open &> /dev/null
then
    xdg-open http://localhost:8080 2>/dev/null &
elif command -v open &> /dev/null
then
    open http://localhost:8080 2>/dev/null &
fi

# Start server
python3 -m http.server 8080
