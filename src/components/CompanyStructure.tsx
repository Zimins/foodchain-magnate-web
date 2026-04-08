"use client";

import React from "react";
import type { PlayerState, WorkSlotNode, EmployeeState } from "@/game/types";
import { EMPLOYEE_DEFINITIONS } from "@/game/constants";
import EmployeeCard from "./EmployeeCard";

interface CompanyStructureProps {
  player: PlayerState;
  onEmployeeClick?: (employeeId: string) => void;
}

export default function CompanyStructure({ player, onEmployeeClick }: CompanyStructureProps) {
  const structure = player.companyStructure;
  const employeeMap = new Map(player.employees.map((e) => [e.card.id, e]));
  const beachEmployees = player.employees.filter((e) => e.location === "on_the_beach");
  const workEmployees = player.employees.filter((e) => e.location === "work_slot");

  const getEmployee = (id: string | null): EmployeeState | undefined => {
    if (!id) return undefined;
    return employeeMap.get(id);
  };

  const renderSlot = (node: WorkSlotNode, depth: number): React.ReactNode => {
    const emp = getEmployee(node.employeeId);
    return (
      <div key={node.employeeId ?? `empty-${depth}-${Math.random()}`} className="flex flex-col items-center">
        <div
          className={`border-2 rounded-lg p-1 min-w-[80px] ${
            emp ? "border-teal-300 bg-teal-50" : "border-dashed border-stone-300 bg-stone-50"
          }`}
          onClick={() => emp && onEmployeeClick?.(emp.card.id)}
        >
          {emp ? (
            <EmployeeCard employeeType={emp.card.type} employeeId={emp.card.id} compact />
          ) : (
            <div className="text-[10px] text-stone-400 text-center py-1">Empty Slot</div>
          )}
        </div>
        {node.children.length > 0 && (
          <div className="flex flex-col items-center mt-1">
            <div className="w-px h-2 bg-stone-300" />
            <div className="flex gap-2">
              {node.children.map((child, i) => (
                <React.Fragment key={i}>{renderSlot(child, depth + 1)}</React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-3">
      <h3 className="text-sm font-bold text-teal-700 mb-3">Company Structure</h3>

      {structure ? (
        <div className="flex flex-col items-center gap-1 overflow-x-auto">
          {/* CEO */}
          <div className="border-2 border-yellow-400 bg-yellow-50 rounded-lg p-1">
            <EmployeeCard employeeType="ceo" employeeId={structure.ceoEmployeeId} compact />
          </div>
          {/* Slots under CEO */}
          {structure.ceoSlots.length > 0 && (
            <>
              <div className="w-px h-2 bg-stone-300" />
              <div className="flex gap-2 flex-wrap justify-center">
                {structure.ceoSlots.map((slot, i) => (
                  <React.Fragment key={i}>{renderSlot(slot, 0)}</React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center text-xs text-stone-400 py-4">
          No structure yet (restructure phase)
        </div>
      )}

      {/* On the Beach */}
      <div className="mt-4 pt-3 border-t border-stone-200">
        <h4 className="text-[10px] font-bold text-stone-500 mb-2">
          ON THE BEACH ({beachEmployees.length})
        </h4>
        {beachEmployees.length === 0 ? (
          <p className="text-[10px] text-stone-400">No benched employees</p>
        ) : (
          <div className="flex gap-1 flex-wrap">
            {beachEmployees.map((es) => (
              <EmployeeCard
                key={es.card.id}
                employeeType={es.card.type}
                employeeId={es.card.id}
                compact
                onClick={() => onEmployeeClick?.(es.card.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Work summary */}
      <div className="mt-3 pt-3 border-t border-stone-200">
        <h4 className="text-[10px] font-bold text-stone-500 mb-1">
          WORKING ({workEmployees.length})
        </h4>
        <div className="flex gap-1 flex-wrap">
          {workEmployees.map((es) => (
            <EmployeeCard
              key={es.card.id}
              employeeType={es.card.type}
              employeeId={es.card.id}
              compact
              onClick={() => onEmployeeClick?.(es.card.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
