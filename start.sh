#!/bin/bash
echo "Starting Stock Query Server (PDYNO Restructure)..."
echo ""

echo "[1/2] Starting Flask backend on http://localhost:5000"
cd "$(dirname "$0")/backend"
python api/server.py &
BACKEND_PID=$!

echo "[2/2] Starting React frontend on http://localhost:5173"
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers running."
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:5173"
echo "  Vanilla:  open frontend/vanilla/index.html"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
