"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/lib/gameContext";

const isDev = process.env.NODE_ENV === "development";

export default function HomePage() {
  return <HomeContent />;
}

function HomeContent() {
  const router = useRouter();
  const { createRoom, joinRoom, error, clearError } = useGame();
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [playerCount, setPlayerCount] = useState(2);
  const [introGame, setIntroGame] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devRoomId, setDevRoomId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    const roomId = await createRoom(
      { playerCount, introductoryGame: introGame, useMilestones: !introGame, useBankReserve: !introGame },
      playerName.trim()
    );
    setLoading(false);
    if (roomId) router.push(`/game/${roomId}`);
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setLoading(true);
    const result = await joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    setLoading(false);
    if (result.success) router.push(`/game/${roomCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-teal-700 mb-2 tracking-tight">
          Food Chain Magnate
        </h1>
        <p className="text-lg text-teal-600 font-medium">Online</p>
        <div className="mt-2 h-1 w-24 mx-auto bg-red-500 rounded" />
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm w-full">
          <div className="flex justify-between items-center">
            <p className="text-xs text-red-600">{error}</p>
            <button onClick={clearError} className="text-red-400 text-xs hover:text-red-600">dismiss</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
        {mode === "menu" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              Create Game
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full py-3 border-2 border-teal-600 text-teal-700 font-bold rounded-lg hover:bg-teal-50 transition-colors text-sm"
            >
              Join Game
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-teal-700">Create Game</h2>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
            />
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1">Players</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPlayerCount(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold ${
                      playerCount === n
                        ? "bg-teal-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={introGame}
                onChange={(e) => setIntroGame(e.target.checked)}
                className="accent-teal-600"
              />
              <span className="text-sm text-stone-600">Introductory Game</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !playerName.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-teal-700">Join Game</h2>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-teal-500"
            />
            <input
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono tracking-widest focus:outline-none focus:border-teal-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setMode("menu")}
                className="flex-1 py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-50"
              >
                Back
              </button>
              <button
                onClick={handleJoin}
                disabled={loading || !playerName.trim() || !roomCode.trim()}
                className="flex-1 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-xs text-stone-400">A board game by Jeroen Doumen & Joris Wiersinga</p>

      {isDev && (
        <a
          href="/admin/map-editor"
          className="mt-2 text-xs text-orange-500 hover:text-orange-600 hover:underline"
        >
          Map Editor (Admin)
        </a>
      )}

      {isDev && (
        <div className="mt-6 bg-orange-50 border-2 border-dashed border-orange-300 rounded-2xl p-6 max-w-lg w-full">
          <h3 className="text-sm font-bold text-orange-600 mb-3">Dev Tools</h3>

          {/* Quick create */}
          <div className="mb-3">
            <p className="text-xs text-orange-500 mb-2">Quick Create (auto-name &quot;Dev 1&quot;)</p>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    const roomId = await createRoom(
                      { playerCount: n, introductoryGame: false, useMilestones: true, useBankReserve: true },
                      "Dev 1"
                    );
                    setLoading(false);
                    if (roomId) {
                      setDevRoomId(roomId);
                      router.push(`/game/${roomId}`);
                    }
                  }}
                  className="flex-1 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {n}P
                </button>
              ))}
            </div>
          </div>

          {/* Join as Dev 2~5 */}
          {devRoomId && (
            <div className="mb-3">
              <p className="text-xs text-orange-500 mb-2">
                Room: <span className="font-mono font-bold">{devRoomId}</span> — Open as another player (new tab)
              </p>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      window.open(
                        `/dev-join?room=${devRoomId}&name=Dev+${n}`,
                        `_blank`
                      );
                    }}
                    className="flex-1 py-2 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Dev {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick join by room code */}
          <div>
            <p className="text-xs text-orange-500 mb-2">Quick Join existing room</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-orange-300 rounded-lg text-xs font-mono tracking-widest focus:outline-none focus:border-orange-500"
              />
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  disabled={loading || !roomCode.trim()}
                  onClick={async () => {
                    setLoading(true);
                    const result = await joinRoom(roomCode.trim(), `Dev ${n}`);
                    setLoading(false);
                    if (result.success) router.push(`/game/${roomCode.trim()}`);
                  }}
                  className="px-3 py-2 bg-teal-500 text-white text-xs font-bold rounded-lg hover:bg-teal-600 disabled:opacity-50 transition-colors"
                >
                  Dev {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
