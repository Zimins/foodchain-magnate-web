"use client";

import React, { use } from "react";
import { useGame } from "@/lib/gameContext";
import WaitingRoom from "@/components/WaitingRoom";
import GameBoard from "@/components/GameBoard";
import PlayerDashboard from "@/components/PlayerDashboard";
import CompanyStructure from "@/components/CompanyStructure";
import PhaseIndicator from "@/components/PhaseIndicator";
import ActionPanel from "@/components/ActionPanel";
import GameLog from "@/components/GameLog";

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  return <GameContent roomId={roomId} />;
}

function GameContent({ roomId }: { roomId: string }) {
  const { gameState, roomInfo, myPlayerId, isMyTurn, sendAction, startGame, leaveRoom } = useGame();

  // Show waiting room if game hasn't started
  if (!gameState && roomInfo) {
    return (
      <WaitingRoom
        roomInfo={roomInfo}
        myPlayerId={myPlayerId}
        onStartGame={startGame}
        onLeave={leaveRoom}
      />
    );
  }

  // Loading state
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-teal-700 mb-2">Connecting...</h2>
          <p className="text-sm text-stone-500">Room: {roomId}</p>
        </div>
      </div>
    );
  }

  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  const otherPlayers = gameState.players.filter((p) => p.id !== myPlayerId);

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white shadow-sm border-b border-stone-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-teal-700">FCM</h1>
          <span className="text-xs text-stone-400">Room: {roomId}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500">Bank: ${gameState.bank}</span>
          {gameState.bankBrokenCount > 0 && (
            <span className="text-[10px] text-red-500 font-bold">BANK BROKEN x{gameState.bankBrokenCount}</span>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Left sidebar - Other players + Company Structure */}
        <div className="w-64 flex flex-col gap-2 overflow-y-auto shrink-0">
          {myPlayer && (
            <CompanyStructure player={myPlayer} />
          )}
          {otherPlayers.map((p) => (
            <PlayerDashboard key={p.id} player={p} isCurrentPlayer={false} />
          ))}
        </div>

        {/* Center - Phase + Board */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <PhaseIndicator
            currentPhase={gameState.phase}
            currentSubPhase={gameState.workingSubPhase}
            round={gameState.round}
          />
          <div className="flex-1 overflow-auto">
            <GameBoard
              mapTiles={gameState.mapTiles}
              mapRows={gameState.mapRows}
              mapCols={gameState.mapCols}
              houses={gameState.houses}
              campaigns={gameState.campaigns}
              players={gameState.players}
            />
          </div>
        </div>

        {/* Right sidebar - My Dashboard + Actions + Log */}
        <div className="w-72 flex flex-col gap-2 overflow-y-auto shrink-0">
          {myPlayer && (
            <PlayerDashboard player={myPlayer} isCurrentPlayer={true} />
          )}
          {myPlayerId && (
            <ActionPanel
              gameState={gameState}
              myPlayerId={myPlayerId}
              isMyTurn={isMyTurn}
              sendAction={sendAction}
            />
          )}
          <div className="flex-1 min-h-[200px]">
            <GameLog
              entries={gameState.log}
              players={gameState.players.map((p) => ({ id: p.id, name: p.name, color: p.color }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
