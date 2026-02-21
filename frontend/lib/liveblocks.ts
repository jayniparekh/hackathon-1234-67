import { createClient } from "@liveblocks/client";
import { createLiveblocksContext, createRoomContext } from "@liveblocks/react";
import type { Storage, UserMeta, RoomEvent } from "@/liveblocks.config";

const client = createClient({
  authEndpoint: async (roomId) => {
    const res = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: roomId }),
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.reason ?? "Auth failed");
    }
    return res.json();
  },
});

const { LiveblocksProvider } = createLiveblocksContext(client);

export type Presence = {
  cursorOffset: number | null;
  color: string;
};

const roomBundle = createRoomContext<
  Presence,
  Storage,
  UserMeta,
  RoomEvent
>(client);

export { LiveblocksProvider };
export const {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useStatus,
  useUpdateMyPresence,
} = roomBundle;
