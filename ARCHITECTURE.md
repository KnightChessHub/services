# KnightChess Microservices Architecture

## Complete Service List

### Core Services
1. **API Gateway** (3000) - Single entry point, routing, rate limiting
2. **Auth Service** (3001) - Authentication, JWT token management
3. **User Service** (3002) - User profile management

### Game Services
4. **Game Service** (3004) - Chess game logic with chess.js
5. **Tournament Service** (3005) - Tournament management with pairing
6. **Analysis Service** (3006) - Game analysis and evaluation
7. **Replay Service** (3011) - Game replays and PGN generation

### Social Services
8. **Group Service** (3003) - User groups and communities
9. **Chat Service** (3012) - Direct messaging

### Competitive Services
10. **Rating Service** (3007) - ELO ratings and leaderboards
11. **Matchmaking Service** (3009) - Find opponents
12. **Statistics Service** (3010) - User and game statistics

### Utility Services
13. **Notification Service** (3008) - Push notifications
14. **Search Service** (3013) - Platform-wide search

## Technology Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (separate DB per service)
- **Authentication**: JWT
- **Chess Engine**: chess.js
- **Containerization**: Docker & Docker Compose
- **Package Manager**: Yarn

## Architecture Principles

- **Service Independence**: Each service has its own database
- **API Gateway Pattern**: Single entry point for all requests
- **JWT Authentication**: Stateless authentication across services
- **Health Checks**: All services expose `/health` endpoints
- **Error Handling**: Centralized error handling middleware
- **Rate Limiting**: API Gateway includes rate limiting
- **Request Tracking**: Request ID tracking for debugging

## Deployment

### Development
```bash
yarn install:all
yarn dev:gateway
yarn dev:auth
# ... etc
```

### Production (Docker)
```bash
docker-compose up -d
```

## Database Schema

Each service maintains its own MongoDB database:
- Independent data models
- No cross-service database dependencies
- Service-specific indexes for performance

## Service Communication

- **Synchronous**: HTTP/REST via API Gateway
- **Service-to-Service**: Direct HTTP calls with axios
- **Authentication**: JWT tokens passed through headers

## Security

- JWT-based authentication
- Rate limiting (100 req/min per IP)
- Input validation middleware
- CORS enabled
- Environment-based configuration

