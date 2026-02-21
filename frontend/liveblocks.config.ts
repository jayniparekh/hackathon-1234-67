import type { LiveObject } from "@liveblocks/client";

export type Storage = {
  document: LiveObject<{ content: string }>;
};

export type UserMeta = {
  info: {
    name: string;
  };
};

export type RoomEvent = Record<string, never>;
