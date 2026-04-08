import { v4 as uuidv4 } from 'uuid';
import type {
  GameConfig,
  GameState,
  GameAction,
  PlayerColor,
  RoomInfo,
  PlayerState,
} from '../game/types';
import { GameEngine, PlayerSetupInfo } from '../game/engine';
import { PLAYER_COLORS } from '../game/constants';
import { generateMapFromTemplates } from './mapGenerator';

export interface PlayerInfo {
  socketId: string;
  playerId: string;
  name: string;
  color: PlayerColor;
  isReady: boolean;
}

const engine = new GameEngine();

export class GameRoom {
  id: string;
  config: GameConfig;
  players: Map<string, PlayerInfo>;
  gameState: GameState | null;
  hostId: string;
  /** Maps playerId → socketId for reconnection support */
  private playerIdToSocket: Map<string, string>;

  constructor(id: string, config: GameConfig, hostSocketId: string) {
    this.id = id;
    this.config = config;
    this.players = new Map();
    this.gameState = null;
    this.hostId = hostSocketId;
    this.playerIdToSocket = new Map();
  }

  addPlayer(socketId: string, name: string): PlayerInfo | null {
    if (this.players.size >= this.config.playerCount) return null;
    if (this.gameState) return null;

    const color = PLAYER_COLORS[this.players.size];
    const playerId = uuidv4();
    const info: PlayerInfo = { socketId, playerId, name, color, isReady: false };
    this.players.set(socketId, info);
    this.playerIdToSocket.set(playerId, socketId);
    return info;
  }

  removePlayer(socketId: string): PlayerInfo | null {
    const player = this.players.get(socketId);
    if (!player) return null;

    if (this.gameState) {
      // Game in progress: mark disconnected rather than removing
      const ps = this.gameState.players.find((p) => p.id === player.playerId);
      if (ps) ps.isConnected = false;
      this.players.delete(socketId);
      // Keep playerIdToSocket so they can reconnect
      return player;
    }

    this.players.delete(socketId);
    this.playerIdToSocket.delete(player.playerId);

    // Reassign host if needed
    if (socketId === this.hostId && this.players.size > 0) {
      this.hostId = this.players.keys().next().value!;
    }

    return player;
  }

  reconnectPlayer(socketId: string, playerId: string): boolean {
    const oldSocketId = this.playerIdToSocket.get(playerId);
    if (!oldSocketId) return false;
    if (!this.gameState) return false;

    const ps = this.gameState.players.find((p) => p.id === playerId);
    if (!ps) return false;

    // Update mappings
    this.playerIdToSocket.set(playerId, socketId);
    const oldInfo = this.players.get(oldSocketId);
    if (oldInfo) this.players.delete(oldSocketId);

    const info: PlayerInfo = {
      socketId,
      playerId,
      name: ps.name,
      color: ps.color,
      isReady: true,
    };
    this.players.set(socketId, info);
    ps.isConnected = true;
    return true;
  }

  startGame(): GameState | null {
    if (this.gameState) return null;
    if (this.players.size < 2) return null;

    const playerInfos: PlayerSetupInfo[] = [];
    for (const [, p] of this.players) {
      playerInfos.push({ id: p.playerId, name: p.name, color: p.color });
    }

    // Try to use saved tile templates; fall back to standard map
    const mapFromTemplates = generateMapFromTemplates(playerInfos.length);
    this.gameState = engine.createGame(
      { ...this.config, playerCount: playerInfos.length },
      playerInfos,
      mapFromTemplates ?? undefined,
    );
    return this.gameState;
  }

  handleAction(playerId: string, action: GameAction): GameState | null {
    if (!this.gameState) return null;
    this.gameState = engine.processAction(this.gameState, playerId, action);
    return this.gameState;
  }

  getPlayerIdForSocket(socketId: string): string | null {
    return this.players.get(socketId)?.playerId ?? null;
  }

  /**
   * Returns game state filtered for a specific player.
   * Hides other players' hands and unrevealed bank reserve cards.
   */
  getStateForPlayer(playerId: string): GameState | null {
    if (!this.gameState) return null;
    const state = this.gameState;

    const filteredPlayers: PlayerState[] = state.players.map((p) => {
      if (p.id === playerId) return p;

      return {
        ...p,
        // Hide employees in hand (show count but not details)
        employees: p.employees.map((e) =>
          e.location === 'hand'
            ? { ...e, card: { id: 'hidden', type: 'ceo' as const } }
            : e,
        ),
        // Hide bank reserve card if not yet revealed
        bankReserveCard: state.bankReserveRevealed ? p.bankReserveCard : null,
      };
    });

    return { ...state, players: filteredPlayers };
  }

  getRoomInfo(): RoomInfo {
    const players = Array.from(this.players.values()).map((p) => ({
      id: p.playerId,
      name: p.name,
      color: p.color,
      isReady: p.isReady,
    }));

    return {
      id: this.id,
      config: this.config,
      players,
      hostId: this.players.get(this.hostId)?.playerId ?? '',
      gameStarted: this.gameState !== null,
    };
  }

  get isEmpty(): boolean {
    return this.players.size === 0;
  }
}
