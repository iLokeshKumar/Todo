@echo off
echo Starting Backend...
start cmd /k "uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

echo Starting Frontend...
cd frontend
start cmd /k "npx expo start"
