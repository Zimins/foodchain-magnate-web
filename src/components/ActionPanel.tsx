"use client";

import React, { useState } from "react";
import type {
  GameState,
  GameAction,
  EmployeeType,
  EmployeeState,
  WorkingSubPhase,
} from "@/game/types";
import { EMPLOYEE_DEFINITIONS } from "@/game/constants";
import EmployeeCard from "./EmployeeCard";

interface ActionPanelProps {
  gameState: GameState;
  myPlayerId: string;
  isMyTurn: boolean;
  sendAction: (action: GameAction) => Promise<{ success: boolean; error?: string }>;
}

export default function ActionPanel({ gameState, myPlayerId, isMyTurn, sendAction }: ActionPanelProps) {
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);
  if (!myPlayer) return null;

  const { phase, workingSubPhase } = gameState;

  if (phase === "setup") {
    return (
      <SetupPanel
        gameState={gameState}
        myPlayer={myPlayer}
        isMyTurn={isMyTurn}
        sendAction={sendAction}
      />
    );
  }
  if (phase === "restructuring") return <RestructuringPanel player={myPlayer} sendAction={sendAction} isReady={myPlayer.isReady} />;
  if (phase === "order_of_business") return <OrderPanel gameState={gameState} isMyTurn={isMyTurn} sendAction={sendAction} />;
  if (phase === "working_9_to_5" && workingSubPhase) {
    return (
      <WorkingPanel
        subPhase={workingSubPhase}
        gameState={gameState}
        myPlayer={myPlayer}
        isMyTurn={isMyTurn}
        sendAction={sendAction}
      />
    );
  }
  if (phase === "dinnertime") return <InfoPanel title="Dinnertime" message="Customers are choosing restaurants..." />;
  if (phase === "payday") return <PaydayPanel player={myPlayer} isMyTurn={isMyTurn} sendAction={sendAction} />;
  if (phase === "marketing") return <InfoPanel title="Marketing" message="Campaigns are generating demand..." />;
  if (phase === "cleanup") return <InfoPanel title="Cleanup" message="Preparing for next round..." />;
  if (phase === "game_over") {
    const winner = gameState.players.find((p) => p.id === gameState.winnerId);
    return <InfoPanel title="Game Over!" message={winner ? `${winner.name} wins with $${winner.cash}!` : "Game ended"} />;
  }

  return <InfoPanel title="Waiting" message="Waiting for game to progress..." />;
}

function SetupPanel({
  gameState,
  myPlayer,
  isMyTurn,
  sendAction,
}: {
  gameState: GameState;
  myPlayer: { id: string; isReady: boolean; restaurants: { id: string }[]; bankReserveCard: { value: number } | null };
  isMyTurn: boolean;
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  if (myPlayer.isReady) {
    return <InfoPanel title="Setup" message="Waiting for other players to place restaurants..." />;
  }

  const hasRestaurant = myPlayer.restaurants.length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">Setup</h3>

      {/* Bank Reserve selection */}
      {gameState.config.useBankReserve && (
        <div className="mb-4">
          <p className="text-[10px] text-stone-500 mb-2">Bank Reserve Card (current: ${myPlayer.bankReserveCard?.value ?? "none"})</p>
          <div className="flex gap-2">
            {([100, 200, 300] as const).map((val) => (
              <button
                key={val}
                onClick={() => sendAction({ type: "choose_bank_reserve", value: val })}
                className={`flex-1 py-1.5 text-xs font-bold rounded border transition-colors ${
                  myPlayer.bankReserveCard?.value === val
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-stone-200 text-stone-600 hover:border-teal-300"
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Restaurant placement */}
      {!hasRestaurant ? (
        <div>
          <p className="text-[10px] text-stone-500 mb-2">Click an empty spot on the map to place your starting restaurant, or pass.</p>
          <button
            onClick={() => sendAction({ type: "pass_starting_restaurant" })}
            className="w-full py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors"
          >
            Pass (no restaurant)
          </button>
        </div>
      ) : (
        <InfoPanel title="" message="Restaurant placed. Waiting for others..." />
      )}
    </div>
  );
}

function InfoPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">{title}</h3>
      <p className="text-xs text-stone-600">{message}</p>
    </div>
  );
}

function RestructuringPanel({
  player,
  sendAction,
  isReady,
}: {
  player: { employees: EmployeeState[] };
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
  isReady: boolean;
}) {
  const allEmployees = player.employees.filter((e) => e.card.type !== "ceo");
  const [workIds, setWorkIds] = useState<Set<string>>(
    new Set(allEmployees.filter((e) => e.location === "work_slot").map((e) => e.card.id))
  );

  const toggleEmployee = (id: string) => {
    setWorkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = () => {
    const workEmployeeIds = Array.from(workIds);
    const beachEmployeeIds = allEmployees
      .filter((e) => !workIds.has(e.card.id))
      .map((e) => e.card.id);
    sendAction({ type: "submit_restructuring", workEmployeeIds, beachEmployeeIds });
  };

  if (isReady) {
    return <InfoPanel title="Restructuring" message="Waiting for other players..." />;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">Restructuring</h3>
      <p className="text-[10px] text-stone-500 mb-3">Click employees to toggle Work/Beach</p>
      <div className="space-y-2 mb-4">
        {allEmployees.map((es) => {
          const isWorking = workIds.has(es.card.id);
          return (
            <div
              key={es.card.id}
              onClick={() => toggleEmployee(es.card.id)}
              className={`flex items-center gap-2 p-1.5 rounded cursor-pointer border ${
                isWorking ? "border-teal-300 bg-teal-50" : "border-stone-200 bg-stone-50"
              }`}
            >
              <EmployeeCard employeeType={es.card.type} employeeId={es.card.id} compact />
              <span className={`text-[10px] ml-auto font-bold ${isWorking ? "text-teal-600" : "text-stone-400"}`}>
                {isWorking ? "WORK" : "BEACH"}
              </span>
            </div>
          );
        })}
      </div>
      <button
        onClick={submit}
        className="w-full py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition-colors"
      >
        Submit Structure
      </button>
    </div>
  );
}

function OrderPanel({
  gameState,
  isMyTurn,
  sendAction,
}: {
  gameState: GameState;
  isMyTurn: boolean;
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  if (!isMyTurn) return <InfoPanel title="Order of Business" message="Waiting for your turn..." />;

  const positions = gameState.turnOrderTrack.map((playerId, idx) => ({
    position: idx + 1,
    taken: playerId !== null,
    playerId,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">Choose Turn Order</h3>
      <div className="grid grid-cols-3 gap-2">
        {positions.map((pos) => (
          <button
            key={pos.position}
            disabled={pos.taken}
            onClick={() => sendAction({ type: "choose_turn_order", position: pos.position })}
            className={`py-2 rounded-lg text-sm font-bold ${
              pos.taken
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-teal-100 text-teal-700 hover:bg-teal-200"
            }`}
          >
            #{pos.position}
          </button>
        ))}
      </div>
    </div>
  );
}

function WorkingPanel({
  subPhase,
  gameState,
  myPlayer,
  isMyTurn,
  sendAction,
}: {
  subPhase: WorkingSubPhase;
  gameState: GameState;
  myPlayer: { id: string; employees: EmployeeState[] };
  isMyTurn: boolean;
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  if (!isMyTurn) return <InfoPanel title="Working 9-5" message="Waiting for your turn..." />;

  switch (subPhase) {
    case "hire":
      return <HirePanel gameState={gameState} sendAction={sendAction} />;
    case "train":
      return <TrainPanel player={myPlayer} sendAction={sendAction} />;
    case "launch_campaigns":
      return <SkipPanel title="Campaigns" skipAction={{ type: "skip_campaigns" }} sendAction={sendAction} />;
    case "prep_food_drinks":
      return <SkipPanel title="Prep Food & Drinks" skipAction={{ type: "skip_prep" }} sendAction={sendAction} />;
    case "place_houses_gardens":
      return <SkipPanel title="Place Houses" skipAction={{ type: "skip_houses" }} sendAction={sendAction} />;
    case "place_move_restaurants":
      return <SkipPanel title="Place Restaurants" skipAction={{ type: "skip_restaurants" }} sendAction={sendAction} />;
    case "open_drive_ins":
      return <InfoPanel title="Drive-Ins" message="Opening drive-ins..." />;
    default:
      return <InfoPanel title="Working" message="Processing..." />;
  }
}

function HirePanel({
  gameState,
  sendAction,
}: {
  gameState: GameState;
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  const available = (Object.entries(gameState.employeeSupply) as [EmployeeType, number][])
    .filter(([type, count]) => count > 0 && EMPLOYEE_DEFINITIONS[type].isEntryLevel);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">Hire Employee</h3>
      <div className="space-y-1 mb-3">
        {available.map(([type, count]) => (
          <button
            key={type}
            onClick={() => sendAction({ type: "hire_employee", employeeType: type })}
            className="w-full flex items-center justify-between p-2 rounded border border-stone-200 hover:border-teal-300 hover:bg-teal-50 transition-colors"
          >
            <EmployeeCard employeeType={type} compact />
            <span className="text-[10px] text-stone-400">x{count}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => sendAction({ type: "skip_hire" })}
        className="w-full py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}

function TrainPanel({
  player,
  sendAction,
}: {
  player: { employees: EmployeeState[] };
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  const trainable = player.employees.filter((es) => {
    const def = EMPLOYEE_DEFINITIONS[es.card.type];
    return es.location === "on_the_beach" && def.trainingOptions.length > 0;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">Train Employee</h3>
      {trainable.length === 0 ? (
        <p className="text-xs text-stone-400 mb-3">No employees available for training</p>
      ) : (
        <div className="space-y-2 mb-3">
          {trainable.map((es) => {
            const def = EMPLOYEE_DEFINITIONS[es.card.type];
            return (
              <div key={es.card.id} className="border border-stone-200 rounded p-2">
                <EmployeeCard employeeType={es.card.type} employeeId={es.card.id} compact />
                <div className="flex gap-1 mt-1 flex-wrap">
                  {def.trainingOptions.map((target) => (
                    <button
                      key={target}
                      onClick={() => sendAction({ type: "train_employee", employeeId: es.card.id, targetType: target })}
                      className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                    >
                      → {EMPLOYEE_DEFINITIONS[target].displayName}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <button
        onClick={() => sendAction({ type: "skip_train" })}
        className="w-full py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}

function SkipPanel({
  title,
  skipAction,
  sendAction,
}: {
  title: string;
  skipAction: GameAction;
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">{title}</h3>
      <p className="text-xs text-stone-500 mb-3">Select on the map or skip</p>
      <button
        onClick={() => sendAction(skipAction)}
        className="w-full py-2 border border-stone-300 text-stone-600 text-sm rounded-lg hover:bg-stone-50 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}

function PaydayPanel({
  player,
  isMyTurn,
  sendAction,
}: {
  player: { employees: EmployeeState[]; id: string };
  isMyTurn: boolean;
  sendAction: (a: GameAction) => Promise<{ success: boolean; error?: string }>;
}) {
  const [selectedToFire, setSelectedToFire] = useState<Set<string>>(new Set());
  const salariedEmployees = player.employees.filter(
    (es) => EMPLOYEE_DEFINITIONS[es.card.type].hasSalary && es.location !== "hand"
  );

  const toggleFire = (id: string) => {
    setSelectedToFire((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isMyTurn) return <InfoPanel title="Payday" message="Waiting..." />;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-bold text-teal-700 mb-2">Payday - Fire Before Paying?</h3>
      <p className="text-[10px] text-stone-500 mb-2">
        Salary: ${salariedEmployees.length * 5} ({salariedEmployees.length} employees)
      </p>
      <div className="space-y-1 mb-3 max-h-40 overflow-y-auto">
        {salariedEmployees.map((es) => (
          <div
            key={es.card.id}
            onClick={() => toggleFire(es.card.id)}
            className={`flex items-center gap-2 p-1 rounded cursor-pointer text-xs ${
              selectedToFire.has(es.card.id) ? "bg-red-50 border border-red-300" : "border border-stone-200"
            }`}
          >
            <EmployeeCard employeeType={es.card.type} compact />
            {selectedToFire.has(es.card.id) && <span className="text-red-500 text-[10px] ml-auto">FIRE</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {selectedToFire.size > 0 && (
          <button
            onClick={() => sendAction({ type: "fire_employees", employeeIds: Array.from(selectedToFire) })}
            className="flex-1 py-2 bg-red-500 text-white text-sm rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            Fire ({selectedToFire.size})
          </button>
        )}
        <button
          onClick={() => sendAction({ type: "done_firing" })}
          className="flex-1 py-2 bg-teal-600 text-white text-sm rounded-lg font-bold hover:bg-teal-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
