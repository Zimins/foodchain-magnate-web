"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGame } from "@/lib/gameContext";

export default function DevJoinPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { joinRoom } = useGame();
  const attemptedRef = useRef(false);

  const room = params.get("room");
  const name = params.get("name") || "Dev Player";

  useEffect(() => {
    if (!room || attemptedRef.current) return;
    attemptedRef.current = true;

    joinRoom(room, name).then((result) => {
      if (result.success) {
        router.replace(`/game/${room}`);
      }
    });
  }, [room, name, joinRoom, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <p className="text-sm text-stone-500">
        Joining room <span className="font-mono font-bold">{room}</span> as{" "}
        <span className="font-bold">{name}</span>...
      </p>
    </div>
  );
}
