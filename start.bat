@echo off
REM Unified One-Command Demo for Journey Multi-Modal Transit System

echo ==========================================================
echo   Starting JOURNEY Multi-Modal Transit System
echo ==========================================================
echo   Unified App: http://localhost:8080 (API + Built SPA)
echo   H2 Console:  http://localhost:8080/h2-console
echo   Traveler:    traveler@journey.com / traveler123
echo   Admin:       admin@journey.com / admin123
echo ==========================================================

mvn spring-boot:run -f backend/pom.xml
pause
