#!/bin/bash
cd "$(dirname "$0")"

echo "Starting all backend services..."

# Export common env vars
export NODE_ENV=development
export JWT_SECRET="knightchess-secret-key-change-in-production-2024"

# Start API Gateway
cd api-gateway && yarn dev > /tmp/gateway.log 2>&1 &
echo "API Gateway: http://localhost:3000 (PID: $!)"
sleep 3

# Start Auth Service
cd ../auth-service
MONGODB_URI="mongodb://localhost:27017/knightchess-auth" PORT=3001 yarn dev > /tmp/auth.log 2>&1 &
echo "Auth Service: http://localhost:3001 (PID: $!)"
sleep 2

# Start User Service
cd ../user-service
MONGODB_URI="mongodb://localhost:27017/knightchess-user" PORT=3002 yarn dev > /tmp/user.log 2>&1 &
echo "User Service: http://localhost:3002 (PID: $!)"
sleep 2

# Start Game Service
cd ../game-service
MONGODB_URI="mongodb://localhost:27017/knightchess-game" PORT=3004 yarn dev > /tmp/game.log 2>&1 &
echo "Game Service: http://localhost:3004 (PID: $!)"
sleep 2

# Start Group Service
cd ../group-service
MONGODB_URI="mongodb://localhost:27017/knightchess-group" PORT=3003 yarn dev > /tmp/group.log 2>&1 &
echo "Group Service: http://localhost:3003 (PID: $!)"
sleep 2

# Start Tournament Service
cd ../tournament-service
MONGODB_URI="mongodb://localhost:27017/knightchess-tournament" PORT=3005 yarn dev > /tmp/tournament.log 2>&1 &
echo "Tournament Service: http://localhost:3005 (PID: $!)"
sleep 2

# Start Notification Service
cd ../notification-service
MONGODB_URI="mongodb://localhost:27017/knightchess-notification" PORT=3008 yarn dev > /tmp/notification.log 2>&1 &
echo "Notification Service: http://localhost:3008 (PID: $!)"
sleep 2

# Start Chat Service
cd ../chat-service
MONGODB_URI="mongodb://localhost:27017/knightchess-chat" PORT=3012 yarn dev > /tmp/chat.log 2>&1 &
echo "Chat Service: http://localhost:3012 (PID: $!)"
sleep 2

# Start Friend Service
cd ../friend-service
MONGODB_URI="mongodb://localhost:27017/knightchess-friend" PORT=3016 yarn dev > /tmp/friend.log 2>&1 &
echo "Friend Service: http://localhost:3016 (PID: $!)"
sleep 2

# Start Realtime Service
cd ../realtime-service
MONGODB_URI="mongodb://localhost:27017/knightchess-realtime" PORT=3014 CORS_ORIGIN="http://localhost:5173" yarn dev > /tmp/realtime.log 2>&1 &
echo "Realtime Service: http://localhost:3014 (PID: $!)"
sleep 2

echo ""
echo "=========================================="
echo "All services started!"
echo "=========================================="
echo "API Gateway: http://localhost:3000"
echo ""
echo "To view logs: tail -f /tmp/*.log"
echo "To stop: pkill -f 'ts-node-dev.*src/index.ts'"
echo "=========================================="
