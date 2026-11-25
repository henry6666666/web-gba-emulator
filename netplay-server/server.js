/**
 * EmulatorJS Netplay signaling server (LAN)
 * Based on EmulatorJS/EmulatorJS-Netplay
 */
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3000;
let rooms = {};

setInterval(() => {
  for (const sessionId in rooms) {
    if (Object.keys(rooms[sessionId].players).length === 0) {
      delete rooms[sessionId];
    }
  }
}, 60000);

app.get('/', (_req, res) => {
  res.type('text').send('Web GBA Netplay Server OK. Use with the emulator page.');
});

app.get('/list', (req, res) => {
  const gameId = req.query.game_id;
  const openRooms = Object.keys(rooms)
    .filter((sessionId) => {
      const room = rooms[sessionId];
      return (
        room &&
        Object.keys(room.players).length < room.maxPlayers &&
        String(room.gameId) === String(gameId)
      );
    })
    .reduce((acc, sessionId) => {
      const room = rooms[sessionId];
      const ownerPlayerId = Object.keys(room.players).find(
        (playerId) => room.players[playerId].socketId === room.owner
      );
      const playerName = ownerPlayerId
        ? room.players[ownerPlayerId].player_name
        : 'Unknown';
      acc[sessionId] = {
        room_name: room.roomName,
        current: Object.keys(room.players).length,
        max: room.maxPlayers,
        player_name: playerName,
        hasPassword: !!room.password,
      };
      return acc;
    }, {});
  res.json(openRooms);
});

io.on('connection', (socket) => {
  socket.on('open-room', (data, callback) => {
    let sessionId, playerId, roomName, gameId, maxPlayers, playerName, roomPassword;
    if (data && data.extra) {
      sessionId = data.extra.sessionid;
      playerId = data.extra.userid || data.extra.playerId;
      roomName = data.extra.room_name;
      gameId = data.extra.game_id;
      maxPlayers = data.maxPlayers || 4;
      playerName = data.extra.player_name || 'Host';
      roomPassword = data.extra.room_password || '';
    }
    if (!sessionId || !playerId) {
      if (typeof callback === 'function') callback('Invalid data');
      return;
    }
    if (rooms[sessionId]) {
      if (typeof callback === 'function') callback('Room already exists');
      return;
    }
    rooms[sessionId] = {
      owner: socket.id,
      players: {
        [playerId]: { ...(data.extra || {}), socketId: socket.id, player_name: playerName },
      },
      peers: [],
      roomName: roomName || `Room ${sessionId}`,
      gameId: gameId || 'default',
      maxPlayers: maxPlayers || 4,
      password: roomPassword && roomPassword !== 'none' ? roomPassword : '',
    };
    socket.join(sessionId);
    socket.sessionId = sessionId;
    socket.playerId = playerId;
    if (typeof callback === 'function') callback(null, rooms[sessionId].players);
    io.to(sessionId).emit('users-updated', rooms[sessionId].players);
  });

  socket.on('join-room', (data, callback) => {
    let sessionId, playerId, playerName, password;
    if (data && data.extra) {
      sessionId = data.extra.sessionid;
      playerId = data.extra.userid || data.extra.playerId;
      playerName = data.extra.player_name || 'Player';
      password = data.password || data.extra.room_password || '';
    }
    const room = rooms[sessionId];
    if (!room) {
      if (typeof callback === 'function') callback('Room not found');
      return;
    }
    if (room.password && room.password !== password) {
      if (typeof callback === 'function') callback('Incorrect password');
      return;
    }
    if (Object.keys(room.players).length >= room.maxPlayers) {
      if (typeof callback === 'function') callback('Room full');
      return;
    }
    room.players[playerId] = { ...(data.extra || {}), socketId: socket.id, player_name: playerName };
    socket.join(sessionId);
    socket.sessionId = sessionId;
    socket.playerId = playerId;
    io.to(sessionId).emit('users-updated', room.players);
    if (typeof callback === 'function') callback(null, room.players);
  });

  socket.on('leave-room', () => {
    cleanupPlayer(socket);
  });

  socket.on('webrtc-signal', (data) => {
    try {
      const { target, candidate, offer, answer, requestRenegotiate } = data || {};
      if (requestRenegotiate) {
        const targetSocket = io.sockets.sockets.get(target);
        if (targetSocket) {
          targetSocket.emit('webrtc-signal', {
            sender: socket.id,
            requestRenegotiate: true,
          });
        }
      } else if (target) {
        io.to(target).emit('webrtc-signal', {
          sender: socket.id,
          candidate,
          offer,
          answer,
        });
      }
    } catch (error) {
      console.error('WebRTC signal error:', error.message);
    }
  });

  socket.on('data-message', (data) => {
    if (socket.sessionId) socket.to(socket.sessionId).emit('data-message', data);
  });
  socket.on('snapshot', (data) => {
    if (socket.sessionId) socket.to(socket.sessionId).emit('snapshot', data);
  });
  socket.on('input', (data) => {
    if (socket.sessionId) socket.to(socket.sessionId).emit('input', data);
  });

  socket.on('disconnect', () => {
    cleanupPlayer(socket);
  });
});

function cleanupPlayer(socket) {
  const sessionId = socket.sessionId;
  const playerId = socket.playerId;
  if (!sessionId || !playerId || !rooms[sessionId]) return;

  delete rooms[sessionId].players[playerId];
  rooms[sessionId].peers = (rooms[sessionId].peers || []).filter(
    (peer) => peer.source !== socket.id && peer.target !== socket.id
  );
  io.to(sessionId).emit('users-updated', rooms[sessionId].players);

  if (Object.keys(rooms[sessionId].players).length === 0) {
    delete rooms[sessionId];
  } else if (socket.id === rooms[sessionId].owner) {
    const remaining = Object.keys(rooms[sessionId].players);
    if (remaining.length > 0) {
      rooms[sessionId].owner = rooms[sessionId].players[remaining[0]].socketId;
    }
  }
  socket.leave(sessionId);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  Web GBA Netplay Server running`);
  console.log(`  Local:   http://127.0.0.1:${PORT}`);
  console.log(`  LAN:     http://<your-lan-ip>:${PORT}`);
  console.log(`  Put this URL into the emulator Netplay Server field.\n`);
});
