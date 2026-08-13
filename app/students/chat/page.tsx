import ChatPage from "../../../components/chat/ChatPage";

export default async function StudentsChatRoute({ searchParams }: { searchParams: Promise<{ contact?: string }> }) {
  const params = await searchParams;
  const contactId = Number(params.contact);
  return <ChatPage initialContactId={Number.isInteger(contactId) && contactId > 0 ? contactId : undefined} />;
}
