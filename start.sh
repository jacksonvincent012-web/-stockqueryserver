#!/bin/bash
echo "Starting Stock Query Server..."
echo ""

echo "[1/2] Starting Flask backend on http://localhost:5000"
cd "$(dirname "$0")/backend"
python server.py &
BACKEND_PID=$!

echo "[2/2] Starting React frontend on http://localhost:3000"
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers running."
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
