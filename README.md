# KnightChess Microservices

Microservices architecture with API Gateway, Auth Service, User Service, Group Service, and Game Service.

## Services

- **API Gateway** (Port 3000): Routes requests to appropriate services
- **Auth Service** (Port 3001): Handles authentication and authorization
- **User Service** (Port 3002): Manages user data
- **Group Service** (Port 3003): Manages groups and group members
- **Game Service** (Port 3004): Manages chess games (online and offline)

## Setup

1. Install dependencies:
```bash
yarn install:all
```

2. Copy environment files:
```bash
cp .env.example .env
cp api-gateway/.env.example api-gateway/.env
cp auth-service/.env.example auth-service/.env
cp user-service/.env.example user-service/.env
cp group-service/.env.example group-service/.env
cp game-service/.env.example game-service/.env
```

3. Configure environment variables in each `.env` file with your MongoDB connection strings and JWT secret.

4. Run services:
```bash
yarn dev:gateway
yarn dev:auth
yarn dev:user
yarn dev:group
yarn dev:game
```

## Database

The services use MongoDB. Each service has its own database:
- Auth Service: `knightchess-auth`
- User Service: `knightchess-user`
- Group Service: `knightchess-group`
- Game Service: `knightchess-game`

Make sure MongoDB is running before starting the services.

## API Endpoints

All endpoints are accessed through the API Gateway at `http://localhost:3000/api/`

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/me` - Update current user

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member to group
- `GET /api/groups/:id/members` - Get group members
- `DELETE /api/groups/:id/members/:userId` - Remove member from group

### Games
- `POST /api/games` - Create new game (online or offline)
- `GET /api/games` - Get user's games (optional query: ?status=active)
- `GET /api/games/:id` - Get game by ID
- `POST /api/games/:id/move` - Make a move (body: { from, to, promotion? })
- `POST /api/games/:id/resign` - Resign from game
- `POST /api/games/:id/join` - Join an online game (for black player)

