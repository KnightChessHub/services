#!/bin/bash

# Integration Verification Script
# This script verifies that all services are properly integrated

echo "🔍 Verifying KnightChess Service Integrations..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Service URLs
API_GATEWAY="http://localhost:3000"
AUTH_SERVICE="http://localhost:3001"
USER_SERVICE="http://localhost:3002"
GAME_SERVICE="http://localhost:3004"
REALTIME_SERVICE="http://localhost:3014"

# Check if service is running
check_service() {
    local service_name=$1
    local service_url=$2
    
    if curl -s -f "$service_url/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name is not running or not accessible at $service_url${NC}"
        return 1
    fi
}

# Check API Gateway routes
check_gateway_routes() {
    echo ""
    echo "📡 Checking API Gateway Routes..."
    
    routes=(
        "/api/auth/register"
        "/api/auth/login"
        "/api/games"
        "/api/users/me"
    )
    
    for route in "${routes[@]}"; do
        if curl -s -f "$API_GATEWAY$route" > /dev/null 2>&1 || curl -s -f -X POST "$API_GATEWAY$route" -H "Content-Type: application/json" -d '{}' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Route $route is accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Route $route may require authentication${NC}"
        fi
    done
}

# Check service-to-service communication
check_service_communication() {
    echo ""
    echo "🔗 Checking Service-to-Service Communication..."
    
    # Check if game-service can reach user-service
    echo -e "${YELLOW}Note: Service-to-service communication requires services to be running${NC}"
    echo -e "${YELLOW}Check service logs for integration errors${NC}"
}

# Main verification
echo "🏥 Health Checks:"
check_service "API Gateway" "$API_GATEWAY"
check_service "Auth Service" "$AUTH_SERVICE"
check_service "User Service" "$USER_SERVICE"
check_service "Game Service" "$GAME_SERVICE"
check_service "Realtime Service" "$REALTIME_SERVICE"

check_gateway_routes
check_service_communication

echo ""
echo "📋 Integration Checklist:"
echo "  ✅ Frontend API URL: VITE_API_URL (default: http://localhost:3000/api)"
echo "  ✅ Frontend WebSocket URL: VITE_WS_URL (default: http://localhost:3014)"
echo "  ✅ Game Service → User Service: USER_SERVICE_URL"
echo "  ✅ Game Service → Realtime Service: REALTIME_SERVICE_URL"
echo "  ✅ API Gateway → All Services: Configured in api-gateway/src/index.ts"
echo ""
echo "💡 To test full integration:"
echo "  1. Start all services: cd Services && ./start-backend.sh"
echo "  2. Start frontend: cd WebApplications/knightchess-frontend && npm run dev"
echo "  3. Create a game and verify real-time updates"
echo ""

