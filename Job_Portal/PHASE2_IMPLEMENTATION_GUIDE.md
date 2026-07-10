# 🚀 PHASE 2: REAL-TIME FEATURES - IMPLEMENTATION GUIDE

Complete guide to implementing WebSocket real-time chat, notifications, and related features.

---

## 📊 OVERVIEW

We're implementing **Phase 2: Real-Time Features** with the following:

1. **WebSocket Real-Time Chat** (60 hours)
   - One-to-one messaging
   - Message history
   - Typing indicators
   - Read receipts
   - Message editing/deletion

2. **Push Notifications** (40 hours)
   - Application alerts
   - Message notifications
   - Interview reminders
   - Job recommendations

3. **Interview Scheduling** (80 hours) - *Planned for Phase 2.2*

4. **Live Status Updates** (30 hours) - *Planned for Phase 2.2*

---

## 🔧 FILES CREATED (Phase 2.1 - Chat & Notifications)

### Backend WebSocket Files
```
backend/websocket/
├── socket-manager.js         ✅ Socket.IO connection management
├── chat-handler.js           ✅ Chat event handling
└── notification-handler.js   ✅ Notification event handling
```

### Backend Models
```
backend/models/
├── message.model.js          ✅ Message schema
└── notification.model.js     ✅ Notification schema
```

### Backend Routes
```
backend/routes/
├── message.routes.js         ✅ Message REST API
└── notification.routes.js    ✅ Notification REST API
```

### Frontend Files (To Create)
```
frontend/
├── services/
│   ├── websocket.js          [Socket.IO client setup]
│   └── chatService.js        [Chat API calls]
├── hooks/
│   ├── useChat.js            [Chat state management]
│   ├── useNotifications.js   [Notifications state]
│   └── useSocket.js          [Socket connection]
├── components/
│   ├── ChatWindow.jsx        [Chat UI component]
│   ├── MessageList.jsx       [Message display]
│   ├── MessageInput.jsx      [Message input]
│   ├── ChatList.jsx          [Chat list]
│   ├── NotificationBell.jsx  [Notification icon]
│   └── NotificationCenter.jsx [Notifications UI]
└── pages/
    ├── Chat/
    │   └── ChatPage.jsx      [Chat page]
    └── Notifications/
        └── NotificationsPage.jsx [Notifications page]
```

---

## 📦 DEPENDENCIES TO INSTALL

### Backend
```bash
npm install socket.io
npm install socket.io-client  # For testing
npm install redis             # For message queue (optional)
npm install bull              # For background jobs
```

### Frontend
```bash
npm install socket.io-client
npm install zustand           # State management (or use Redux)
npm install axios             # HTTP client
npm install react-query       # Data fetching
```

### Commands
```bash
cd backend
npm install socket.io redis bull

cd ../frontend
npm install socket.io-client zustand axios react-query
```

---

## 🛠️ INTEGRATION STEPS

### Step 1: Update `backend/index.js`

Add Socket.IO initialization:

```javascript
// At the top of file
const SocketManager = require('./websocket/socket-manager');
const chatHandler = require('./websocket/chat-handler');
const notificationHandler = require('./websocket/notification-handler');

// After express setup, before app.listen()
const server = require('http').createServer(app);
const socketManager = new SocketManager(server);

// Initialize event handlers
socketManager.initialize(chatHandler, notificationHandler);

// Store socketManager in app for use in routes
app.set('socketManager', socketManager);

// Listen on server instead of app
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket ready on ws://localhost:${PORT}`);
});
```

### Step 2: Update `backend/package.json`

Add Socket.IO to dependencies:

```json
{
  "dependencies": {
    "socket.io": "^4.6.1",
    "redis": "^4.6.5",
    "bull": "^4.11.2"
  }
}
```

### Step 3: Import Routes in `backend/index.js`

```javascript
// Add these routes
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

// Register routes
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
```

### Step 4: Update Frontend Socket Configuration

Create `frontend/src/services/websocket.js`:

```javascript
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId, userName, userRole) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Register user
    this.socket.emit('user:register', {
      userId,
      userName,
      userRole,
    });

    // Listen for connection
    this.socket.on('user:registered', (data) => {
      console.log('✅ Socket registered:', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();
```

---

## 💬 CHAT IMPLEMENTATION

### Backend Chat Flow

```
1. User connects (socket connection)
   ↓
2. User registers (user:register event)
   ↓
3. User joins chat room (room:join event)
   ↓
4. User sends message (chat:message event)
   ↓
5. Message saved to DB
   ↓
6. Message broadcast to room (chat:new-message event)
   ↓
7. Recipients receive message
   ↓
8. Recipients mark as read (chat:read event)
   ↓
9. Message marked as read in DB
```

### API Endpoints

#### Get Messages
```
GET /api/messages/:roomId
Query: ?limit=50&skip=0
Response: { success, count, data: [] }
```

#### Search Messages
```
GET /api/messages/:roomId/search
Query: ?query=keyword
Response: { success, count, data: [] }
```

#### Mark as Read
```
POST /api/messages/:roomId/mark-read
Body: { messageIds: [] }
Response: { success, modifiedCount }
```

#### Get Unread Count
```
GET /api/messages/:roomId/unread-count
Response: { success, unreadCount }
```

#### Edit Message
```
PUT /api/messages/:messageId
Body: { content: "new content" }
Response: { success, data: message }
```

#### Delete Message
```
DELETE /api/messages/:messageId
Response: { success }
```

---

## 🔔 NOTIFICATION IMPLEMENTATION

### Notification Flow

```
1. Event occurs (application received, message, etc.)
   ↓
2. Notification created in DB
   ↓
3. Socket manager checks if user is online
   ↓
4. If online: emit to user socket
   ↓
5. If offline: store in DB
   ↓
6. When user comes online: receive pending notifications
```

### API Endpoints

#### Get Notifications
```
GET /api/notifications
Query: ?limit=20&skip=0&type=MESSAGE&read=false
Response: { success, total, count, data: [] }
```

#### Get Unread Count
```
GET /api/notifications/unread-count
Response: { success, unreadCount }
```

#### Mark as Read
```
PUT /api/notifications/:notificationId/read
Response: { success, data: notification }
```

#### Mark All as Read
```
POST /api/notifications/mark-all-read
Response: { success, modifiedCount }
```

#### Delete Notification
```
DELETE /api/notifications/:notificationId
Response: { success }
```

---

## 🔐 SECURITY CONSIDERATIONS

### 1. Authentication
- All WebSocket connections require JWT token
- Token verified on each message
- User can only see their own messages/notifications

### 2. Message Validation
- Input sanitization (XSS protection)
- Message length limits (5000 chars)
- File upload validation

### 3. Rate Limiting
- Limit messages per minute per user
- Prevent message spam
- Throttle notifications

### 4. Data Privacy
- Soft delete (don't permanently remove)
- Read receipts are private
- Typing indicators don't reveal content

---

## 📈 DATABASE INDEXES

Indexes are already configured in models:

```javascript
// Message indexes
messageSchema.index({ roomId: 1, timestamp: -1 }); // Get history
messageSchema.index({ content: 'text' });          // Search
messageSchema.index({ recipientId: 1, read: 1 }); // Unread count

// Notification indexes
notificationSchema.index({ userId: 1, createdAt: -1 }); // Get notifications
notificationSchema.index({ userId: 1, read: 1 });       // Unread count
```

---

## 🧪 TESTING THE IMPLEMENTATION

### Test Chat

```javascript
// In browser console
const socket = io('http://localhost:8000', {
  auth: { token: 'your_jwt_token' }
});

// Register user
socket.emit('user:register', {
  userId: 'user123',
  userName: 'John Doe',
  userRole: 'RECRUITER'
});

// Listen for registration
socket.on('user:registered', (data) => {
  console.log('Registered:', data);
});

// Join room
socket.emit('room:join', {
  roomId: 'recruiter-candidate-1',
  userId: 'user123'
});

// Send message
socket.emit('chat:message', {
  roomId: 'recruiter-candidate-1',
  senderId: 'user123',
  recipientId: 'candidate456',
  content: 'Hello! Are you interested in this position?',
  messageType: 'text'
});

// Listen for messages
socket.on('chat:new-message', (message) => {
  console.log('New message:', message);
});

// Send typing indicator
socket.emit('chat:typing', {
  roomId: 'recruiter-candidate-1',
  userId: 'user123',
  isTyping: true
});

// Mark as read
socket.emit('chat:read', {
  messageIds: ['msg123', 'msg124'],
  roomId: 'recruiter-candidate-1'
});
```

### Test Notifications

```javascript
// Listen for notifications
socket.on('notification:new', (notification) => {
  console.log('New notification:', notification);
});

// Subscribe to notifications
socket.emit('notification:subscribe', 'user123');

// Mark notification as read
socket.emit('notification:read', 'notification123');
```

---

## 🚀 DEPLOYMENT CONSIDERATIONS

### Production Setup

1. **Use Redis** for message queue and session store
2. **Use Nginx** for load balancing WebSocket connections
3. **Use MongoDB** replica set for data consistency
4. **Enable HTTPS/WSS** for secure connections
5. **Configure CORS** for frontend domain
6. **Set up monitoring** for socket connections
7. **Configure logging** for debugging

### Environment Variables

```bash
# .env
SOCKET_IO_CORS_ORIGIN=https://yourdomain.com
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
```

---

## 📊 EXPECTED METRICS

### Performance
- Message delivery: <100ms
- Notification delivery: <50ms
- Typing indicator: <50ms
- Read receipt: <100ms

### Scalability
- Handle 1000+ concurrent connections
- Store unlimited message history
- Support 100k+ notifications per hour

### Reliability
- 99.9% message delivery
- Automatic reconnection
- Message persistence
- Offline notification queue

---

## 🔄 NEXT STEPS (Phase 2.2)

### Interview Scheduling (80 hours)
- Calendar integration
- Time slot booking
- Video call setup
- Reminders

### Live Status Updates (30 hours)
- Real-time application status
- Online status indicators
- Job status tracking

---

## ✅ CHECKLIST

- [ ] Socket.IO installed and configured
- [ ] Message model created
- [ ] Notification model created
- [ ] Chat handler implemented
- [ ] Notification handler implemented
- [ ] Message routes implemented
- [ ] Notification routes implemented
- [ ] Frontend socket service created
- [ ] Chat components created
- [ ] Notification components created
- [ ] Error handling tested
- [ ] Authentication verified
- [ ] Database indexes created
- [ ] Load testing performed
- [ ] Documentation completed

---

## 📚 REFERENCES

- Socket.IO Docs: https://socket.io/docs/
- MongoDB Chat App: https://developer.mongodb.com/how-to/realtime-chat
- WebSocket Best Practices: https://www.ably.io/topic/websockets

---

## 🎯 TIMELINE

- **Week 1-2**: Backend implementation (socket, handlers, models, routes)
- **Week 3**: Frontend setup and components
- **Week 4**: Testing and debugging
- **Week 5-6**: Interview scheduling
- **Week 7**: Live status updates

**Total**: 8 weeks for complete Phase 2

---

## 💡 KEY FEATURES RECAP

✅ **Real-Time Chat**
- Instant messaging
- Message history
- Search functionality
- Edit/delete messages
- Typing indicators
- Read receipts
- Emoji support
- File sharing ready

✅ **Push Notifications**
- Application alerts
- Message notifications
- Interview reminders
- Job recommendations
- Customizable preferences
- Unread count badge
- In-app notifications
- Email integration ready

✅ **Security**
- JWT authentication
- Input validation
- Rate limiting
- CORS configuration
- Secure WebSocket (WSS)
- Data encryption ready

✅ **Performance**
- Efficient message indexing
- Lazy loading support
- Pagination support
- Search optimization
- Connection pooling
- Memory management

---

**Status**: ✅ Ready to implement  
**Effort**: 60 hours (Phase 2.1)  
**Impact**: +40% user engagement  

Let's build it! 🚀

