import { createServer } from 'http';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import type { ServerToClientEvents, ClientToServerEvents } from './src/game/types';
import { RoomManager } from './src/server/roomManager';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const roomManager = new RoomManager();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: dev ? '*' : undefined,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // ---- Create Room ----
    socket.on('create_room', (config, playerName, callback) => {
      const name = playerName || 'Player 1';
      const room = roomManager.createRoom(config, socket.id, name);
      socket.join(room.id);
      const hostPlayer = room.players.get(socket.id);
      callback(room.id, hostPlayer?.playerId ?? '');
      socket.emit('room_info', room.getRoomInfo());
    });

    // ---- Join Room ----
    socket.on('join_room', (roomId, playerName, callback) => {
      console.log(`[socket] join_room: ${socket.id} -> ${roomId} as "${playerName}"`);
      const result = roomManager.joinRoom(roomId, socket.id, playerName);
      if (!result.success || !result.room) {
        callback(false, result.error);
        return;
      }

      const room = result.room;
      socket.join(room.id);

      const player = room.players.get(socket.id);
      callback(true, undefined, player?.playerId);

      if (player) {
        socket.to(room.id).emit('player_joined', {
          id: player.playerId,
          name: player.name,
        });
      }

      // Send room info to all players
      io.to(room.id).emit('room_info', room.getRoomInfo());
    });

    // ---- Start Game ----
    socket.on('start_game', (callback) => {
      console.log(`[socket] start_game: ${socket.id}`);
      const room = roomManager.getRoomForSocket(socket.id);
      if (!room) {
        callback(false, 'Not in a room');
        return;
      }

      const result = roomManager.startGame(room.id, socket.id);
      if (!result.success || !result.room) {
        callback(false, result.error);
        return;
      }

      callback(true);
      io.to(room.id).emit('game_started');

      // Send filtered state to each player
      for (const [sid, playerInfo] of room.players) {
        const state = room.getStateForPlayer(playerInfo.playerId);
        if (state) {
          io.to(sid).emit('game_state', state);
        }
      }
    });

    // ---- Game Action ----
    socket.on('game_action', (action, callback) => {
      const room = roomManager.getRoomForSocket(socket.id);
      if (!room) {
        callback(false, 'Not in a room');
        return;
      }

      const result = roomManager.processAction(room.id, socket.id, action);
      if (!result.success || !result.room) {
        callback(false, result.error);
        socket.emit('game_error', { message: result.error || 'Unknown error' });
        return;
      }

      callback(true);

      // Send filtered state to each player
      for (const [sid, playerInfo] of room.players) {
        const state = room.getStateForPlayer(playerInfo.playerId);
        if (state) {
          io.to(sid).emit('game_state', state);
        }
      }
    });

    // ---- Get Room Info (for reconnect after navigation) ----
    socket.on('get_room_info', (callback) => {
      const room = roomManager.getRoomForSocket(socket.id);
      if (!room) {
        callback(null, null);
        return;
      }
      const playerInfo = room.players.get(socket.id);
      callback(room.getRoomInfo(), playerInfo?.playerId ?? null);
      // Also send game state if game is in progress
      if (room.gameState && playerInfo) {
        const state = room.getStateForPlayer(playerInfo.playerId);
        if (state) {
          socket.emit('game_state', state);
        }
      }
    });

    // ---- Leave Room ----
    socket.on('leave_room', () => {
      handleLeave(socket);
    });

    // ---- Disconnect ----
    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      handleLeave(socket);
    });

    function handleLeave(sock: typeof socket) {
      console.log(`[socket] handleLeave: ${sock.id}`);
      const result = roomManager.leaveRoom(sock.id);
      if (!result) return;

      const { room, playerId } = result;
      sock.leave(room.id);
      io.to(room.id).emit('player_left', playerId);
      io.to(room.id).emit('room_info', room.getRoomInfo());
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Server ready on http://${hostname}:${port}`);
  });
});
