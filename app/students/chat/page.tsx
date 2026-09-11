import ChatPage from "../../../components/chat/ChatPage";

export default async function StudentsChatRoute({ searchParams }: { searchParams: Promise<{ contact?: string }> }) {
  const params = await searchParams;
  const recipientPublicId = params.contact?.trim();
  return <ChatPage initialRecipientPublicId={recipientPublicId || undefined} />;
}
