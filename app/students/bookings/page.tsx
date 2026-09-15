import BookingsPage from "../../../components/bookings/BookingsPage";

export default async function StudentsBookingsRoute({ searchParams }: { searchParams: Promise<{ view?: string; notice?: string }> }) {
  const params = await searchParams;
  return <BookingsPage initialView={params.view === "manage" ? "manage" : "explore"} notice={params.notice} />;
}
