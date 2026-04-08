import type { GameConfig, GameAction } from '../game/types';
import { GameRoom } from './gameRoom';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  /** Maps socketId → roomId for quick lookup */
  private socketToRoom: Map<string, string> = new Map();

  createRoom(config: GameConfig, hostSocketId: string, hostName: string): GameRoom {
    let roomId: string;
    do {
      roomId = generateRoomCode();
    } while (this.rooms.has(roomId));

    const room = new GameRoom(roomId, config, hostSocketId);
    room.addPlayer(hostSocketId, hostName);
    this.rooms.set(roomId, room);
    this.socketToRoom.set(hostSocketId, roomId);
    return room;
  }

  joinRoom(
    roomId: string,
    socketId: string,
    playerName: string,
  ): { success: boolean; error?: string; room?: GameRoom } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    if (room.gameState) return { success: false, error: 'Game already in progress' };
    if (room.players.size >= room.config.playerCount) {
      return { success: false, error: 'Room is full' };
    }

    const player = room.addPlayer(socketId, playerName);
    if (!player) return { success: false, error: 'Could not join room' };

    this.socketToRoom.set(socketId, roomId.toUpperCase());
    return { success: true, room };
  }

  leaveRoom(socketId: string): { room: GameRoom; playerId: string } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.removePlayer(socketId);
    this.socketToRoom.delete(socketId);

    if (!player) return null;

    // Clean up empty rooms (only if no game in progress)
    if (room.isEmpty && !room.gameState) {
      this.rooms.delete(roomId);
    }

    return { room, playerId: player.playerId };
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  getRoomForSocket(socketId: string): GameRoom | undefined {
    const roomId = this.socketToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  startGame(roomId: string, socketId: string): { success: boolean; error?: string; room?: GameRoom } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    if (room.hostId !== socketId) return { success: false, error: 'Only the host can start the game' };
    if (room.players.size < 2) return { success: false, error: 'Need at least 2 players' };

    const state = room.startGame();
    if (!state) return { success: false, error: 'Could not start game' };

    return { success: true, room };
  }

  processAction(
    roomId: string,
    socketId: string,
    action: GameAction,
  ): { success: boolean; error?: string; room?: GameRoom } {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) return { success: false, error: 'Room not found' };
    if (!room.gameState) return { success: false, error: 'Game not started' };

    const playerId = room.getPlayerIdForSocket(socketId);
    if (!playerId) return { success: false, error: 'Player not in room' };

    const state = room.handleAction(playerId, action);
    if (!state) return { success: false, error: 'Could not process action' };

    return { success: true, room };
  }
}
