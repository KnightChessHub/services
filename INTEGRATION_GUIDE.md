# KnightChess Integration Guide

## Overview

This document describes all integrations between services in the KnightChess platform.

## Service Architecture

```
Frontend (React)
    ↓ HTTP/WebSocket
API Gateway (Port 3000)
    ↓ HTTP
    ├── Auth Service (3001)
    ├── User Service (3002)
    ├── Game Service (3004)
    │   ├── → User Service (for usernames)
    │   └── → Realtime Service (for broadcasts)
    ├── Tournament Service (3005)
    ├── Realtime Service (3014) ← WebSocket
    └── ... (other services)
```

## Frontend Integration

### API Configuration
- **Base URL**: `VITE_API_URL` (default: `http://localhost:3000/api`)
- **WebSocket URL**: `VITE_WS_URL` (default: `http://localhost:3014`)

### Environment Variables
Create `.env` file in `WebApplications/knightchess-frontend/`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3014
```

## Service-to-Service Integration

### Game Service → User Service
**Purpose**: Fetch usernames for game players

**Configuration**:
- Environment Variable: `USER_SERVICE_URL` (default: `http://localhost:3002`)
- Endpoint: `GET /{userId}`
- Headers: `Authorization: Bearer {token}`

**Usage**:
```typescript
// In game.controller.ts
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const response = await axios.get(`${USER_SERVICE_URL}/${userId}`, {
  headers: { Authorization: req.headers.authorization }
});
```

### Game Service → Realtime Service
**Purpose**: Broadcast game updates via WebSocket

**Configuration**:
- Environment Variable: `REALTIME_SERVICE_URL` (default: `http://localhost:3014`)
- Endpoint: `POST /broadcast/game/:gameId/move`
- Payload: `{ game: {...}, move: {...} }`

**Usage**:
```typescript
// In game.controller.ts
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || 'http://localhost:3014';
await axios.post(`${REALTIME_SERVICE_URL}/broadcast/game/${gameId}/move`, {
  game: gameData,
  move: moveData
});
```

## WebSocket Integration

### Event Names

**Frontend → Backend**:
- `game:join` - Join a game room
- `game:leave` - Leave a game room
- `make_move` - Send a move (deprecated, use HTTP API)

**Backend → Frontend**:
- `game:move` - Move made in game
- `game_update` - Game state updated
- `game_finished` - Game finished
- `game:player-joined` - Player joined game
- `game:player-left` - Player left game

### WebSocket Authentication
The frontend sends the JWT token in the connection handshake:
```typescript
const socket = io(WS_URL, {
  auth: { token: localStorage.getItem('token') }
});
```

## API Gateway Integration

### Service URLs Configuration
All service URLs are configured in `api-gateway/src/index.ts`:

```typescript
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || 'http://localhost:3014';
// ... etc
```

### Request Forwarding
The API Gateway forwards requests to appropriate services:
- `/api/auth/*` → Auth Service
- `/api/users/*` → User Service
- `/api/games/*` → Game Service
- WebSocket connections → Realtime Service (direct)

## Error Handling

### Service-to-Service Communication
All service-to-service calls use helper functions with error handling:

```typescript
// Helper function with timeout and error handling
async function fetchUsername(userId: string, authHeader: string): Promise<string | undefined> {
  try {
    const response = await axiosInstance.get(`${USER_SERVICE_URL}/${userId}`, {
      headers: authHeader ? { Authorization: authHeader } : {},
    });
    return response.data?.data?.username;
  } catch (error) {
    console.error(`Failed to fetch username:`, error);
    return undefined; // Non-critical, continue without username
  }
}
```

### Frontend Error Handling
The frontend API service includes:
- Retry logic with exponential backoff
- Network error handling
- 5xx error retry (up to 2 retries)
- User-friendly error messages

## Verification

Run the integration verification script:
```bash
cd Services
./verify-integrations.sh
```

This will check:
- ✅ All services are running
- ✅ Health endpoints are accessible
- ✅ API Gateway routes are configured
- ✅ Service-to-service communication setup

## Troubleshooting

### Issue: WebSocket not connecting
1. Check `VITE_WS_URL` environment variable
2. Verify Realtime Service is running on port 3014
3. Check browser console for connection errors
4. Verify JWT token is valid

### Issue: Usernames not showing
1. Check `USER_SERVICE_URL` in game-service
2. Verify User Service is running
3. Check game-service logs for username fetch errors
4. Verify Authorization header is being forwarded

### Issue: Real-time updates not working
1. Check `REALTIME_SERVICE_URL` in game-service
2. Verify Realtime Service is running
3. Check WebSocket connection in browser DevTools
4. Verify game-service is calling broadcast endpoint
5. Check realtime-service logs for broadcast errors

### Issue: API Gateway not routing
1. Check service URLs in `api-gateway/src/index.ts`
2. Verify services are running on expected ports
3. Check API Gateway logs for routing errors
4. Verify CORS is configured correctly

## Environment Variables Summary

### Frontend
- `VITE_API_URL` - API Gateway URL
- `VITE_WS_URL` - WebSocket/Realtime Service URL

### Game Service
- `USER_SERVICE_URL` - User Service URL
- `REALTIME_SERVICE_URL` - Realtime Service URL
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret for token verification

### API Gateway
- `AUTH_SERVICE_URL` - Auth Service URL
- `USER_SERVICE_URL` - User Service URL
- `GAME_SERVICE_URL` - Game Service URL
- `REALTIME_SERVICE_URL` - Realtime Service URL
- `JWT_SECRET` - JWT secret for token verification
- ... (all other service URLs)

### Realtime Service
- `JWT_SECRET` - JWT secret for socket authentication
- `CORS_ORIGIN` - CORS origin (default: `*`)
- `MONGODB_URI` - MongoDB connection string

## Best Practices

1. **Always use environment variables** for service URLs
2. **Handle errors gracefully** in service-to-service calls
3. **Use helper functions** for common operations (username fetching, broadcasting)
4. **Log integration errors** but don't fail critical operations
5. **Test integrations** after any service changes
6. **Use timeouts** for all HTTP requests (default: 5 seconds)
7. **Forward Authorization headers** when calling other services

