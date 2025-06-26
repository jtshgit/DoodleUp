const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { timeStamp, time } = require('console');
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const SECRET = process.env.JWT_SECRET;

function generateId(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return id;
}

const strokeSchema = new mongoose.Schema({
  boardId: String,
  x0: Number, y0: Number, x1: Number, y1: Number,
  color: { type: String, default: 'black' },
  width: { type: Number, default: 2 },
  timestamp: { type: Date, default: Date.now }
});

const Stroke = mongoose.model('Stroke', strokeSchema);
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// const users = new Map();
const users = new Map();
//   [
//     '2025-05-24T07:54:23.150Z',
//     {
//       username: 'jitesh',
//       lastOnline: new Date('2025-05-24T07:54:23.150Z')
//     }
//   ]
// ])
const usersInBoard = new Map();
//   [
//     'dpq3mc', {
//       users: new Map(),
//       timeStamp: new Date('2025-05-24T07:54:25.884Z'),
//       userId: '2025-05-24T07:54:23.150Z',
//       boardname: 'new'
//     }
//   ]
// ]);


const now = () => new Date();
function updateLastOnline(userId) {
  const user = users.get(userId);
  if (user) {
    user.lastOnline = now();
  }
}
function cleanInactiveUsers(days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  for (const [userId, user] of users) {
    if (user.lastOnline.getTime() < cutoff) {
      users.delete(userId);
    }
  }
  for (const [boardId, board] of usersInBoard) {
    if (board.timeStamp.getTime() < cutoff) {
      board.delete(boardId);
    }
  }
}
async function deleteOldStrokes() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const result = await Stroke.deleteMany({ timestamp: { $lt: sevenDaysAgo } });
  } catch (err) {
    console.error('Error deleting old strokes:', err);
  }
}

app.get('/strokes', async (req, res) => {
  const { boardId } = req.query;
  const strokes = await Stroke.find({ boardId }).sort({ timestamp: 1 }).lean();
  res.json(strokes);
});

io.on('connection', socket => {
  const { boardId, name, profile_p } = socket.handshake.query;
  if (!boardId || !name || !profile_p) {
    socket.disconnect();
    return;
  }

  const board = usersInBoard.get(boardId);
  if (!board) {
    return
  }
  board.users.set(socket.id, { id: socket.id, name, profile_p : profile_p });
  socket.join(boardId);
  const userList = [...board.users.values()];
  io.to(boardId).emit('userList', userList);

  // // Handle disconnect
  socket.on('disconnect', () => {
    const board = usersInBoard.get(boardId);
    board.users.delete(socket.id);

    io.to(boardId).emit('userList', [...board.users.values()]);

  }
  );

  // Drawing logic
  socket.on('stroke', async ({ stroke, uname }) => {
    socket.to(boardId).emit('stroke', { stroke, uname });
    await Stroke.create({ ...stroke, boardId });
  });

  socket.on('clear', async (uname) => {
    await Stroke.deleteMany({ boardId });
    io.to(boardId).emit('clear', uname);
  });
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  const userIdtime = now();
  const timestamp = userIdtime.toISOString();
  users.set(timestamp, {
    username: username,
    lastOnline: userIdtime,
    profile_p : process.env.APP+"/guest.png"
  });
  const token = jwt.sign({ username: username, id: timestamp,profile_p : process.env.APP+"/guest.png"}, SECRET, { expiresIn: '168h' });
  res.cookie('guestatdoodleup', token, {
    httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            domain: process.env.COOKIE_DOMAIN,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 6 months in milliseconds
  });
  res.json({ req: true, auth: false, message: 'Logged in', user: { username: username, id: timestamp, profile_p: process.env.APP+"/guest.png" } });
});

app.get('/protected', (req, res) => {
  const token = req.cookies.token;
  const guestatdoodleup = req.cookies.guestatdoodleup;
  if (!token && !guestatdoodleup) {
    res.status(401).json({ message: 'Unauthorized' });
    cleanInactiveUsers();
    deleteOldStrokes();
    return;
  }
  try {
    if (guestatdoodleup) {
      const decoded = jwt.verify(guestatdoodleup, SECRET);
      if (decoded.id) {
        if (users.get(decoded.id)) {
          updateLastOnline(decoded.id);
        } else {
          const userIdtime = now();
          users.set(decoded.id, {
            username: decoded.name,
            profile_p: decoded.profile_p,
            lastOnline: userIdtime
          });
        }
        res.json({ req: true, auth: false, message: 'Protected content', user: decoded });
        cleanInactiveUsers();
        deleteOldStrokes();
      } else {
        res.status(403).json({ req: false, message: 'Invalid token' });
        cleanInactiveUsers();
        deleteOldStrokes();
      }
    }

    if (token) {
      const decoded = jwt.verify(token, SECRET);
      if (decoded.id) {
        if (users.get(decoded.id)) {
          updateLastOnline(decoded.id);
        } else {
          const userIdtime = now();
          users.set(decoded.id, {
            username: decoded.firstName + " " + decoded.lastName,
            profile_p: decoded.profile_p,
            lastOnline: userIdtime
          });
        }
        res.json({ req: true, auth: true, message: 'Protected content', user: decoded });
        cleanInactiveUsers();
        deleteOldStrokes();
      } else {
        res.status(403).json({ req: false, message: 'Invalid token' });
        cleanInactiveUsers();
        deleteOldStrokes();
      }
    }
  } catch (err) {
    res.status(403).json({ req: false, message: 'Invalid token' });
  }
});

app.post('/createboard', (req, res) => {
  const { boardname } = req.body;
  const token = req.cookies.token;
  const guestatdoodleup = req.cookies.guestatdoodleup;
  if (!token && !guestatdoodleup) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    let userId = "";
    if(token){
      let decoded = jwt.verify(token, SECRET);
      if(decoded){
        userId = decoded.id;
      }else{
            res.status(401).json({ message: 'Unauthorized' });
      }
    }
    if(guestatdoodleup){
      let decoded = jwt.verify(guestatdoodleup, SECRET);
      if(decoded){
        userId = decoded.id;
      }else{
            res.status(401).json({ message: 'Unauthorized' });
      }
    }
    let genId = generateId();
    while (usersInBoard.has(genId)) {
      genId = generateId();
    }
    usersInBoard.set(genId, { users: new Map(), timeStamp: now(), userId: userId, boardname: boardname });
    res.json({ req: true, board: genId, boardname: boardname });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

});

app.post('/checkboard', (req, res) => {
  const { id } = req.body;
  if (!usersInBoard.get(id)) {
    res.json({ req: false });
  } else
console.log(users.get(usersInBoard.get(id).userId).username)
console.log(users)
console.log(usersInBoard)
    res.json({ req: true, boardowner: users.get(usersInBoard.get(id).userId).username, boardname: usersInBoard.get(id).boardname });
});
// Add this after app.post('/createboard', ...)
app.get('/boards', (req, res) => {
  const boardList = [];
  for (const [id, board] of usersInBoard.entries()) {
    const owner = users.get(board.userId);
    boardList.push({
      id,
      boardname: board.boardname,
      owner: owner ? owner.username : 'Unknown',
      createdAt: board.timeStamp,
    });
  }
  res.json({ req: true, boards: boardList });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
