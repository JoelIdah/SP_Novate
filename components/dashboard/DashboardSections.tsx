type BookingRow = {
  tutor: string;
  subject: string;
  status: "Completed" | "Ongoing" | "Awaiting approval";
};

type MessageRow = {
  initials: string;
  name: string;
  preview: string;
  time: string;
};

const bookingRows: BookingRow[] = [
  { tutor: "Mr. Akin-akintaylor", subject: "Entrance Exams", status: "Completed" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Completed" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Completed" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Ongoing" },
  { tutor: "Mr. Oluyinka Alabi", subject: "Entrance Exams", status: "Awaiting approval" },
];

const messages: MessageRow[] = [
  { initials: "E", name: "Ekene Ezegbunam", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { initials: "A", name: "Akin-akintaylor Akinbowale", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
  { initials: "Q", name: "Quadri Ahmed", preview: "Hi Oluyinka, I would love to book a session.", time: "11:25" },
];

const visibleBookingRows = bookingRows.slice(0, 4);
const visibleMessages = messages.slice(0, 3);

function StatusDot({ status }: { status: BookingRow["status"] }) {
  const color =
    status === "Completed" ? "bg-[#1ab26e]" : status === "Ongoing" ? "bg-[#9b57f6]" : "bg-[#2295ea]";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function DashboardActionsSection() {
  return (
    <div>
      <h2 className="mb-[0.45em] text-[0.9em] font-semibold text-[#616a82]">Actions</h2>
      <div className="grid gap-[0.75em] md:grid-cols-3">
        <article className="flex min-h-[6.45em] flex-col rounded-[0.7em] border border-[#b9dcf8] bg-[#f3f9ff] px-[1em] py-[0.78em]">
          <span className="inline-block h-[0.8em] w-[0.8em] rounded-full bg-[#2f8fd6]" />
          <p className="mt-[0.45em] text-[1.06em] font-bold text-[#2b3350]">Book a session</p>
          <p className="mt-[0.2em] text-[0.78em] text-[#6d758e]">Find a tutor and schedule your session.</p>
        </article>
        <article className="flex min-h-[6.45em] flex-col rounded-[0.7em] border border-[#b4e5e4] bg-[#f4fcfc] px-[1em] py-[0.78em]">
          <span className="inline-block h-[0.8em] w-[0.8em] rounded-full bg-[#43b8b2]" />
          <p className="mt-[0.45em] text-[1.06em] font-bold text-[#2b3350]">Start a conversation</p>
          <p className="mt-[0.2em] text-[0.78em] text-[#6d758e]">Go to your chat with the tutors</p>
        </article>
        <article className="flex min-h-[6.45em] flex-col rounded-[0.7em] border border-[#ecd8b2] bg-[#fcf8ef] px-[1em] py-[0.78em]">
          <span className="inline-block h-[0.8em] w-[0.8em] rounded-full bg-[#d8aa2c]" />
          <p className="mt-[0.45em] text-[1.06em] font-bold text-[#2b3350]">Check transactions</p>
          <p className="mt-[0.2em] text-[0.78em] text-[#6d758e]">Add money to your main balance.</p>
        </article>
      </div>
    </div>
  );
}

export function DashboardLearningOverviewSection() {
  return (
    <div>
      <h2 className="mb-[0.35em] text-[0.86em] font-semibold text-[#616a82]">Learning Overview</h2>
      <div className="grid gap-[0.5em] sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sessions booked", value: 8 },
          { label: "Sessions completed", value: 2 },
          { label: "Sessions ongoing", value: 4 },
          { label: "Sessions pending", value: 2 },
        ].map((item) => (
          <article key={item.label} className="flex min-h-[4.35em] flex-col justify-center rounded-[0.65em] border border-[#e4e8f1] bg-white px-[0.8em] py-[0.48em]">
            <p className="text-[0.72em] text-[#747d94]">{item.label}</p>
            <p className="mt-[0.18em] text-[1.45em] font-bold leading-none text-[#1f2537]">{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DashboardBookingsSection() {
  return (
    <section className="flex min-h-0 flex-col">
      <div className="mb-[0.45em] flex items-center justify-between">
        <h2 className="text-[0.93em] font-semibold text-[#616a82]">Managed Bookings</h2>
        <button className="text-[0.73em] font-semibold text-[#6f74a7] hover:text-[#5954c9]" type="button">Go to managed bookings &gt;</button>
      </div>
      <div className="overflow-hidden rounded-[0.7em] border border-[#e4e8f1] bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#f7f9fc] text-[0.72em] text-[#6f7892]">
            <tr>
              <th className="px-[0.9em] py-[0.65em] font-semibold">Tutor</th>
              <th className="px-[0.9em] py-[0.65em] font-semibold">Subject</th>
              <th className="px-[0.9em] py-[0.65em] font-semibold">Status</th>
              <th className="px-[0.9em] py-[0.65em] font-semibold" />
            </tr>
          </thead>
        </table>
        <div>
          <table className="w-full text-left">
            <tbody>
            {visibleBookingRows.map((row, idx) => (
              <tr key={`${row.tutor}-${idx}`} className="border-t border-[#edf0f6] text-[0.78em] text-[#4f576f]">
                <td className="px-[0.9em] py-[0.76em]">{row.tutor}</td>
                <td className="px-[0.9em] py-[0.76em]">{row.subject}</td>
                <td className="px-[0.9em] py-[0.76em]">
                  <span className="inline-flex items-center gap-[0.5em]">
                    <StatusDot status={row.status} />
                    {row.status}
                  </span>
                </td>
                <td className="px-[0.9em] py-[0.76em] text-right">
                  <button
                    aria-label={`More actions for ${row.tutor}`}
                    className="text-[1.1em] leading-none text-[#8088a0]"
                    type="button"
                  >
                    &hellip;
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function DashboardMessagesSection() {
  return (
    <section className="flex min-h-0 flex-col">
      <div className="mb-[0.45em] flex items-center justify-between">
        <h2 className="text-[0.93em] font-semibold text-[#616a82]">Messages</h2>
        <button className="text-[0.73em] font-semibold text-[#6f74a7] hover:text-[#5954c9]" type="button">Go to chat &gt;</button>
      </div>
      <div className="overflow-hidden rounded-[0.7em] border border-[#e4e8f1] bg-white">
        <p className="border-b border-[#edf0f6] px-[0.9em] py-[0.42em] text-[0.92em] font-medium text-[#9aa3b8]">Chat</p>
        <div>
          {visibleMessages.map((message, idx) => (
            <article key={`${message.name}-${message.time}-${idx}`} className="flex items-center gap-[0.5em] border-t border-[#edf0f6] px-[0.9em] py-[0.72em]">
              <span className="inline-flex h-[2em] w-[2em] items-center justify-center rounded-[0.35em] bg-[#276a63] text-[0.72em] font-semibold text-white">
                {message.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.8em] font-semibold text-[#2d3448]">{message.name}</p>
                <p className="truncate text-[0.68em] leading-[1.2] text-[#7c849a]">{message.preview}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.66em] text-[#7c849a]">{message.time}</p>
                <span className="inline-flex h-[1.3em] w-[1.3em] items-center justify-center rounded-full bg-[#4a49c6] text-[0.62em] text-white">1</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DashboardResourcesSection() {
  return (
    <div>
      <h2 className="mb-[0.42em] text-[0.9em] font-semibold text-[#616a82]">Resource &amp; Support</h2>
      <div className="grid gap-[0.75em] lg:grid-cols-[2fr_1fr_1fr]">
        <article className="relative min-h-[6.95em] overflow-hidden rounded-[0.8em] border border-[#c5dbed] bg-[#e5f2ff] p-[0.8em]">
          <span className="inline-block h-[0.8em] w-[0.8em] rounded-full bg-[#f3c53d]" />
          <p className="mt-[0.45em] text-[1.05em] font-semibold text-[#2d3448]">Watch our demo video</p>
          <p className="mt-[0.28em] max-w-[18em] text-[0.8em] text-[#5c6884]">Watch this intro video to learn how SP novate works.</p>
          <button className="mt-[0.78em] rounded-full border border-[#54607b] bg-white px-[1em] py-[0.3em] text-[0.8em] font-semibold text-[#2d3448]" type="button">
            Watch video
          </button>
        </article>

        <article className="min-h-[6.95em] rounded-[0.8em] border border-[#e6decf] bg-[#f7f2e8] p-[0.8em]">
          <span className="inline-block h-[0.8em] w-[0.8em] rounded-full bg-[#caa33a]" />
          <p className="mt-[0.45em] text-[1.05em] font-semibold text-[#2d3448]">Learn about our tutors</p>
          <p className="mt-[0.28em] text-[0.8em] text-[#5c6884]">Watch this intro video to learn more about our tutors</p>
          <button className="mt-[0.78em] rounded-full border border-[#54607b] bg-white px-[1em] py-[0.3em] text-[0.8em] font-semibold text-[#2d3448]" type="button">
            Watch video
          </button>
        </article>

        <article className="min-h-[6.95em] rounded-[0.8em] border border-[#dfe4ed] bg-[#eef2f7] p-[0.8em]">
          <span className="inline-block h-[0.8em] w-[0.8em] rounded-full bg-[#9aa3b6]" />
          <p className="mt-[0.45em] text-[1.05em] font-semibold text-[#2d3448]">What is a finder&apos;s fee</p>
          <p className="mt-[0.28em] text-[0.8em] text-[#5c6884]">Watch this intro video to learn about our finder&apos;s fee</p>
          <button className="mt-[0.78em] rounded-full border border-[#54607b] bg-white px-[1em] py-[0.3em] text-[0.8em] font-semibold text-[#2d3448]" type="button">
            Watch video
          </button>
        </article>
      </div>
    </div>
  );
}
