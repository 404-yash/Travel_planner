#!/bin/bash
# Journey — Smart Multi-Modal Transit Engine & Travel Planner
# Unified One-Command Demo (Serves API + React SPA directly on port 8080)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "  🚀 Starting JOURNEY Multi-Modal Transit Companion"
echo "=========================================================="
echo "  Unified Service: http://localhost:8080 (API + Built SPA)"
echo "  H2 DB Console:   http://localhost:8080/h2-console (sa / empty)"
echo "----------------------------------------------------------"
echo "  Demo Credentials:"
echo "    Traveler: traveler@journey.com / traveler123"
echo "    Admin:    admin@journey.com / admin123"
echo "=========================================================="

if [ "$1" == "--dev" ]; then
    echo "Starting in dual-server developer mode..."
    mvn spring-boot:run -f backend/pom.xml &
    BACKEND_PID=$!
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
    wait
else
    echo "Starting unified Spring Boot server (Frontend pre-built into static)..."
    mvn spring-boot:run -f backend/pom.xml
fi
