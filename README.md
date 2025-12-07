# KnightChess Microservices

Complete microservices architecture for a chess platform.

## Services

- **API Gateway** (Port 3000): Routes requests to appropriate services
- **Auth Service** (Port 3001): Handles authentication and authorization
- **User Service** (Port 3002): Manages user data
- **Group Service** (Port 3003): Manages groups and group members
- **Game Service** (Port 3004): Manages chess games (online and offline)
- **Tournament Service** (Port 3005): Manages chess tournaments
- **Analysis Service** (Port 3006): Analyzes chess games
- **Rating Service** (Port 3007): Manages ELO ratings and leaderboards
- **Notification Service** (Port 3008): Handles notifications
- **Matchmaking Service** (Port 3009): Finds opponents for players
- **Statistics Service** (Port 3010): User and game statistics
- **Replay Service** (Port 3011): Game replays and PGN generation
- **Chat Service** (Port 3012): Messaging between users
- **Search Service** (Port 3013): Search across users, games, tournaments, groups
- **Real-time Service** (Port 3014): WebSocket for live game updates
- **File Service** (Port 3015): File uploads and media management
- **Friend Service** (Port 3016): Friend requests and social connections
- **Admin Service** (Port 3017): Platform administration
- **Activity Service** (Port 3018): User activity feed
- **Report Service** (Port 3019): Content moderation and reporting

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
cp tournament-service/.env.example tournament-service/.env
cp analysis-service/.env.example analysis-service/.env
cp rating-service/.env.example rating-service/.env
cp notification-service/.env.example notification-service/.env
cp matchmaking-service/.env.example matchmaking-service/.env
cp statistics-service/.env.example statistics-service/.env
cp replay-service/.env.example replay-service/.env
cp chat-service/.env.example chat-service/.env
cp search-service/.env.example search-service/.env
cp realtime-service/.env.example realtime-service/.env
cp file-service/.env.example file-service/.env
cp friend-service/.env.example friend-service/.env
cp admin-service/.env.example admin-service/.env
cp activity-service/.env.example activity-service/.env
cp report-service/.env.example report-service/.env
```

3. Configure environment variables in each `.env` file with your MongoDB connection strings and JWT secret.

4. Run services:
```bash
yarn dev:gateway
yarn dev:auth
yarn dev:user
yarn dev:group
yarn dev:game
yarn dev:tournament
yarn dev:analysis
yarn dev:rating
yarn dev:notification
yarn dev:matchmaking
yarn dev:statistics
yarn dev:replay
yarn dev:chat
yarn dev:search
yarn dev:realtime
yarn dev:file
yarn dev:friend
yarn dev:admin
yarn dev:activity
yarn dev:report
```

## Database

The services use MongoDB. Each service has its own database:
- Auth Service: `knightchess-auth`
- User Service: `knightchess-user`
- Group Service: `knightchess-group`
- Game Service: `knightchess-game`
- Tournament Service: `knightchess-tournament`
- Analysis Service: `knightchess-analysis`
- Rating Service: `knightchess-rating`
- Notification Service: `knightchess-notification`
- Matchmaking Service: `knightchess-matchmaking`
- Statistics Service: `knightchess-statistics`
- Replay Service: `knightchess-replay`
- Chat Service: `knightchess-chat`
- Search Service: `knightchess-search`
- Real-time Service: `knightchess-realtime`
- File Service: `knightchess-file`
- Friend Service: `knightchess-friend`
- Admin Service: `knightchess-admin`
- Activity Service: `knightchess-activity`
- Report Service: `knightchess-report`

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

### Tournaments
- `POST /api/tournaments` - Create tournament (body: { name, format, timeControl, maxParticipants, startDate, description?, prizePool? })
- `GET /api/tournaments` - Get all tournaments (optional query: ?status=active)
- `GET /api/tournaments/my` - Get user's tournaments (organized or participated)
- `GET /api/tournaments/:id` - Get tournament by ID
- `POST /api/tournaments/:id/join` - Join tournament
- `POST /api/tournaments/:id/leave` - Leave tournament
- `POST /api/tournaments/:id/start` - Start tournament (organizer only)

### Analysis
- `POST /api/analysis/analyze` - Analyze a finished game (body: { gameId })
- `GET /api/analysis/my` - Get user's game analyses
- `GET /api/analysis/:gameId` - Get analysis for a specific game

### Ratings
- `GET /api/ratings/leaderboard` - Get leaderboard (query: ?timeControl=rapid&limit=100)
- `GET /api/ratings/:userId?` - Get user rating (query: ?timeControl=rapid)
- `POST /api/ratings/record` - Record game result (body: { opponentId, result, opponentRating, timeControl })

### Notifications
- `GET /api/notifications` - Get notifications (query: ?read=true&limit=50)
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read/all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Matchmaking
- `POST /api/matchmaking/queue` - Join matchmaking queue (body: { timeControl })
- `DELETE /api/matchmaking/queue` - Leave queue
- `GET /api/matchmaking/queue/status` - Get queue status

### Statistics
- `GET /api/statistics/global` - Get global statistics
- `GET /api/statistics/:userId?` - Get user statistics

### Replay
- `GET /api/replay/my` - Get user's replays (query: ?limit=50)
- `GET /api/replay/:gameId` - Get replay for a game

### Chat
- `POST /api/chat` - Send message (body: { recipientId, content, type?, relatedId? })
- `GET /api/chat/conversations` - Get all conversations
- `GET /api/chat/conversations/:userId` - Get conversation with user (query: ?limit=50)
- `GET /api/chat/unread/count` - Get unread message count
- `PUT /api/chat/:messageId/read` - Mark message as read

### Search
- `GET /api/search` - Search all (query: ?q=term&type=users&limit=20)
- `GET /api/search/users` - Search users (query: ?q=term&limit=20)

### Files
- `POST /api/files` - Upload file (multipart/form-data: file, type, relatedId?)
- `GET /api/files/my` - Get my files (query: ?type=profile&limit=50)
- `GET /api/files/:id` - Get file by ID
- `DELETE /api/files/:id` - Delete file

### Friends
- `POST /api/friends/request` - Send friend request (body: { recipientId })
- `GET /api/friends/requests` - Get friend requests (query: ?type=sent|received)
- `PUT /api/friends/requests/:id/accept` - Accept friend request
- `DELETE /api/friends/requests/:id` - Reject friend request
- `GET /api/friends/list` - Get friends list (query: ?status=accepted)
- `DELETE /api/friends/:friendId` - Remove friend
- `POST /api/friends/block/:userId` - Block user

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `POST /api/admin` - Create admin (body: { userId, role, permissions? })
- `GET /api/admin` - Get admins (query: ?role=admin)
- `PUT /api/admin/:id` - Update admin
- `DELETE /api/admin/:id` - Remove admin

### Activity
- `GET /api/activity/my` - Get my activity (query: ?type=game_won&limit=50)
- `GET /api/activity/feed` - Get activity feed (query: ?limit=50)
- `GET /api/activity/user/:userId` - Get user activity (query: ?limit=50)

### Reports
- `POST /api/reports` - Create report (body: { reportedUserId?, reportedGameId?, type, reason, description })
- `GET /api/reports/my` - Get my reports
- `GET /api/reports` - Get all reports (query: ?status=pending&type=user)
- `PUT /api/reports/:id/status` - Update report status (body: { status, moderatorNotes? })

## Docker Deployment

All services include Dockerfiles. Use Docker Compose to run the entire stack:

```bash
docker-compose up -d
```

This will start:
- MongoDB container
- All 14 microservices
- API Gateway

To stop:
```bash
docker-compose down
```

## Production Considerations

- **Rate Limiting**: API Gateway includes rate limiting (100 requests/minute per IP)
- **Request ID Tracking**: All requests include X-Request-ID header
- **Health Checks**: All services have `/health` endpoints
- **Error Handling**: Centralized error handling across all services
- **Environment Variables**: All services use `.env` files for configuration

