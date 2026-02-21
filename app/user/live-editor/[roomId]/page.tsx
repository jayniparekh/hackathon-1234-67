import { LiveEditorRoom } from "./live-editor-room";

export default async function LiveEditorRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <LiveEditorRoom roomId={roomId} />;
}
