#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo "Starting KnightChess Backend Services"
echo "=========================================="

# Check MongoDB
echo "Checking MongoDB..."
if ! mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "ERROR: MongoDB is not running!"
    echo "Please start MongoDB first: sudo systemctl start mongod"
    exit 1
fi
echo "✓ MongoDB is running"

# Stop any existing services
pkill -f "ts-node-dev.*src/index.ts" 2>/dev/null
sleep 2

# Common environment variables
export NODE_ENV=development
export JWT_SECRET="knightchess-secret-key-change-in-production-2024"

# Start API Gateway
echo ""
echo "Starting API Gateway (Port 3000)..."
cd api-gateway
yarn dev > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!
sleep 4

# Start Auth Service
echo "Starting Auth Service (Port 3001)..."
cd ../auth-service
MONGODB_URI="mongodb://localhost:27017/knightchess-auth" PORT=3001 yarn dev > /tmp/auth.log 2>&1 &
AUTH_PID=$!
sleep 3

# Start User Service
echo "Starting User Service (Port 3002)..."
cd ../user-service
MONGODB_URI="mongodb://localhost:27017/knightchess-user" PORT=3002 yarn dev > /tmp/user.log 2>&1 &
USER_PID=$!
sleep 3

# Start Game Service
echo "Starting Game Service (Port 3004)..."
cd ../game-service
MONGODB_URI="mongodb://localhost:27017/knightchess-game" PORT=3004 yarn dev > /tmp/game.log 2>&1 &
GAME_PID=$!
sleep 3

# Start Group Service
echo "Starting Group Service (Port 3003)..."
cd ../group-service
MONGODB_URI="mongodb://localhost:27017/knightchess-group" PORT=3003 yarn dev > /tmp/group.log 2>&1 &
GROUP_PID=$!
sleep 3

# Start Tournament Service
echo "Starting Tournament Service (Port 3005)..."
cd ../tournament-service
MONGODB_URI="mongodb://localhost:27017/knightchess-tournament" PORT=3005 yarn dev > /tmp/tournament.log 2>&1 &
TOURNAMENT_PID=$!
sleep 3

# Start Notification Service
echo "Starting Notification Service (Port 3008)..."
cd ../notification-service
MONGODB_URI="mongodb://localhost:27017/knightchess-notification" PORT=3008 yarn dev > /tmp/notification.log 2>&1 &
NOTIFICATION_PID=$!
sleep 3

# Start Chat Service
echo "Starting Chat Service (Port 3012)..."
cd ../chat-service
MONGODB_URI="mongodb://localhost:27017/knightchess-chat" PORT=3012 yarn dev > /tmp/chat.log 2>&1 &
CHAT_PID=$!
sleep 3

# Start Friend Service
echo "Starting Friend Service (Port 3016)..."
cd ../friend-service
MONGODB_URI="mongodb://localhost:27017/knightchess-friend" PORT=3016 yarn dev > /tmp/friend.log 2>&1 &
FRIEND_PID=$!
sleep 3

# Start Realtime Service
echo "Starting Realtime Service (Port 3014)..."
cd ../realtime-service
MONGODB_URI="mongodb://localhost:27017/knightchess-realtime" PORT=3014 CORS_ORIGIN="http://localhost:5173" yarn dev > /tmp/realtime.log 2>&1 &
REALTIME_PID=$!
sleep 3

echo ""
echo "=========================================="
echo "Waiting for services to initialize..."
echo "=========================================="
sleep 5

echo ""
echo "=== Service Status ==="
for port in 3000 3001 3002 3003 3004 3005 3008 3012 3014 3016; do
    if curl -s http://localhost:$port/health > /dev/null 2>&1; then
        echo "✓ Port $port: Running"
    else
        echo "✗ Port $port: Not responding"
    fi
done

echo ""
echo "=========================================="
echo "Backend Services Started!"
echo "=========================================="
echo "API Gateway: http://localhost:3000"
echo ""
echo "Service Logs:"
echo "  tail -f /tmp/gateway.log"
echo "  tail -f /tmp/auth.log"
echo "  tail -f /tmp/user.log"
echo ""
echo "To stop all services:"
echo "  pkill -f 'ts-node-dev.*src/index.ts'"
echo "=========================================="
