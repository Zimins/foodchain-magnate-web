"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { GameState, GameAction, RoomInfo } from "@/game/types";
import { getSocket, connectSocket, disconnectSocket, removeAllListeners, type GameSocket } from "./socket";

interface GameContextValue {
  gameState: GameState | null;
  roomInfo: RoomInfo | null;
  myPlayerId: string | null;
  isMyTurn: boolean;
  error: string | null;
  sendAction: (action: GameAction) => Promise<{ success: boolean; error?: string }>;
  createRoom: (config: { playerCount: number; introductoryGame: boolean; useMilestones: boolean; useBankReserve: boolean }, playerName: string) => Promise<string | null>;
  joinRoom: (roomId: string, playerName: string) => Promise<{ success: boolean; error?: string }>;
  startGame: () => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  clearError: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<GameSocket | null>(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;
    if (!socket) return;

    socket.on("game_state", (state) => setGameState(state));
    socket.on("room_info", (info) => setRoomInfo(info));
    socket.on("game_error", (err) => setError(err.message));

    // Restore state if socket is already in a room (e.g. after page navigation)
    const requestRoomInfo = () => {
      socket.emit("get_room_info", (info, playerId) => {
        if (info && playerId) {
          setRoomInfo(info);
          setMyPlayerId(playerId);
        }
      });
    };
    if (socket.connected) {
      requestRoomInfo();
    } else {
      socket.on("connect", requestRoomInfo);
    }

    return () => {
      removeAllListeners();
    };
  }, []);

  const isMyTurn = !!(
    gameState &&
    myPlayerId &&
    gameState.players[gameState.activePlayerIndex]?.id === myPlayerId
  );

  const sendAction = useCallback(
    async (action: GameAction): Promise<{ success: boolean; error?: string }> => {
      const socket = socketRef.current;
      if (!socket) return { success: false, error: "Not connected" };
      return new Promise((resolve) => {
        socket.emit("game_action", action, (success, err) => {
          if (!success && err) setError(err);
          resolve({ success, error: err });
        });
      });
    },
    []
  );

  const createRoom = useCallback(
    async (config: { playerCount: number; introductoryGame: boolean; useMilestones: boolean; useBankReserve: boolean }, playerName: string): Promise<string | null> => {
      const socket = connectSocket();
      socketRef.current = socket;
      if (!socket) return null;
      return new Promise((resolve) => {
        socket.emit("create_room", config, playerName, (roomId, playerId) => {
          if (roomId && playerId) {
            setMyPlayerId(playerId);
            resolve(roomId);
          } else {
            setError("Failed to create room");
            resolve(null);
          }
        });
      });
    },
    []
  );

  const joinRoom = useCallback(
    async (roomId: string, playerName: string): Promise<{ success: boolean; error?: string }> => {
      const socket = connectSocket();
      socketRef.current = socket;
      if (!socket) return { success: false, error: "Not connected" };
      return new Promise((resolve) => {
        socket.emit("join_room", roomId, playerName, (success, err, playerId) => {
          if (success && playerId) {
            setMyPlayerId(playerId);
          } else if (err) {
            setError(err);
          }
          resolve({ success, error: err });
        });
      });
    },
    []
  );

  const startGame = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const socket = socketRef.current;
    if (!socket) return { success: false, error: "Not connected" };
    return new Promise((resolve) => {
      socket.emit("start_game", (success, err) => {
        if (!success && err) setError(err);
        resolve({ success, error: err });
      });
    });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("leave_room");
    setGameState(null);
    setRoomInfo(null);
    setMyPlayerId(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        roomInfo,
        myPlayerId,
        isMyTurn,
        error,
        sendAction,
        createRoom,
        joinRoom,
        startGame,
        leaveRoom,
        clearError,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
