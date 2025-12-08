# Starting Backend Services

## Quick Start

```bash
cd Services
./start-backend.sh
```

## Manual Start

Start MongoDB first (if not running):
```bash
sudo systemctl start mongod
# or
mongod --dbpath /data/db
```

Then start services:
```bash
cd Services
./start-backend.sh
```

## Service Ports

- API Gateway: http://localhost:3000
- Auth Service: http://localhost:3001
- User Service: http://localhost:3002
- Group Service: http://localhost:3003
- Game Service: http://localhost:3004
- Tournament Service: http://localhost:3005
- Notification Service: http://localhost:3008
- Chat Service: http://localhost:3012
- Realtime Service: http://localhost:3014
- Friend Service: http://localhost:3016

## View Logs

```bash
tail -f /tmp/gateway.log
tail -f /tmp/auth.log
tail -f /tmp/user.log
tail -f /tmp/game.log
```

## Stop Services

```bash
pkill -f 'ts-node-dev.*src/index.ts'
```

## Test API

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```
