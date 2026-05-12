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

function StatusDot({ status }: { status: BookingRow["status"] }) {
  const color =
    status === "Completed" ? "bg-[#1ab26e]" : status === "Ongoing" ? "bg-[#9b57f6]" : "bg-[#2295ea]";
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />;
}

export function DashboardActionsSection() {
  return (
    <div>
      <h2 className="mb-2 text-[0.93rem] font-semibold text-[#616a82]">Actions</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-lg border border-[#b9dcf8] bg-[#f3f9ff] px-4 py-4">
          <h3 className="text-[1.7rem] leading-none text-[#2f8fd6]">*</h3>
          <p className="mt-1 text-[1.02rem] font-semibold text-[#2b3350]">Book a session</p>
          <p className="mt-0.5 text-[0.82rem] text-[#6d758e]">Find a tutor and schedule your session.</p>
        </article>
        <article className="rounded-lg border border-[#b4e5e4] bg-[#f4fcfc] px-4 py-4">
          <h3 className="text-[1.7rem] leading-none text-[#43b8b2]">*</h3>
          <p className="mt-1 text-[1.02rem] font-semibold text-[#2b3350]">Start a conversation</p>
          <p className="mt-0.5 text-[0.82rem] text-[#6d758e]">Go to your chat with the tutors</p>
        </article>
        <article className="rounded-lg border border-[#ecd8b2] bg-[#fcf8ef] px-4 py-4">
          <h3 className="text-[1.7rem] leading-none text-[#d8aa2c]">*</h3>
          <p className="mt-1 text-[1.02rem] font-semibold text-[#2b3350]">Check transactions</p>
          <p className="mt-0.5 text-[0.82rem] text-[#6d758e]">Add money to your main balance.</p>
        </article>
      </div>
    </div>
  );
}

export function DashboardLearningOverviewSection() {
  return (
    <div>
      <h2 className="mb-2 text-[0.93rem] font-semibold text-[#616a82]">Learning Overview</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Sessions booked", value: 8 },
          { label: "Sessions completed", value: 2 },
          { label: "Sessions ongoing", value: 4 },
          { label: "Sessions pending", value: 2 },
        ].map((item) => (
          <article key={item.label} className="rounded-lg border border-[#e4e8f1] bg-white px-4 py-4">
            <p className="text-[0.9rem] text-[#747d94]">{item.label}</p>
            <p className="mt-1 text-[2rem] font-bold leading-none text-[#1f2537]">{item.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function DashboardBookingsSection() {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[0.93rem] font-semibold text-[#616a82]">Managed Bookings</h2>
        <button className="text-[0.83rem] font-semibold text-[#5954c9]" type="button">Go to managed bookings &gt;</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e4e8f1] bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#f5f7fb] text-[0.82rem] text-[#616a82]">
            <tr>
              <th className="px-3 py-2 font-semibold">Tutor</th>
              <th className="px-3 py-2 font-semibold">Subject</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {bookingRows.map((row, idx) => (
              <tr key={`${row.tutor}-${idx}`} className="border-t border-[#edf0f6] text-[0.82rem] text-[#49516a]">
                <td className="px-3 py-2.5">{row.tutor}</td>
                <td className="px-3 py-2.5">{row.subject}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <StatusDot status={row.status} />
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-[#8088a0]">...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardMessagesSection() {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[0.93rem] font-semibold text-[#616a82]">Messages</h2>
        <button className="text-[0.83rem] font-semibold text-[#5954c9]" type="button">Go to chat &gt;</button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e4e8f1] bg-white">
        <p className="border-b border-[#edf0f6] px-3 py-2 text-[1.6rem] text-[#a4abbf]">Chat</p>
        <div>
          {messages.map((message) => (
            <article key={message.name} className="flex items-center gap-2 border-t border-[#edf0f6] px-3 py-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#276a63] text-[0.72rem] font-semibold text-white">
                {message.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.83rem] font-semibold text-[#2d3448]">{message.name}</p>
                <p className="truncate text-[0.74rem] text-[#7c849a]">{message.preview}</p>
              </div>
              <div className="text-right">
                <p className="text-[0.72rem] text-[#7c849a]">{message.time}</p>
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#4a49c6] text-[0.62rem] text-white">1</span>
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
      <h2 className="mb-2 text-[0.93rem] font-semibold text-[#616a82]">Resource &amp; Support</h2>
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]">
        <article className="relative overflow-hidden rounded-xl border border-[#c5dbed] bg-[#e5f2ff] p-4">
          <h3 className="text-[1.9rem] leading-none text-[#f3c53d]">o</h3>
          <p className="mt-1 text-[1.05rem] font-semibold text-[#2d3448]">Watch our demo video</p>
          <p className="mt-1 max-w-[250px] text-[0.83rem] text-[#5c6884]">Watch this intro video to learn how SP novate works.</p>
          <button className="mt-4 rounded-full border border-[#54607b] bg-white px-4 py-1.5 text-[0.82rem] font-semibold text-[#2d3448]" type="button">
            Watch video
          </button>
        </article>

        <article className="rounded-xl border border-[#e6decf] bg-[#f7f2e8] p-4">
          <p className="text-[1.7rem] leading-none text-[#caa33a]">o</p>
          <p className="mt-1 text-[1.05rem] font-semibold text-[#2d3448]">Learn about our tutors</p>
          <p className="mt-1 text-[0.83rem] text-[#5c6884]">Watch this intro video to learn more about our tutors</p>
          <button className="mt-4 rounded-full border border-[#54607b] bg-white px-4 py-1.5 text-[0.82rem] font-semibold text-[#2d3448]" type="button">
            Watch video
          </button>
        </article>

        <article className="rounded-xl border border-[#dfe4ed] bg-[#eef2f7] p-4">
          <p className="text-[1.7rem] leading-none text-[#9aa3b6]">o</p>
          <p className="mt-1 text-[1.05rem] font-semibold text-[#2d3448]">What is a finder&apos;s fee</p>
          <p className="mt-1 text-[0.83rem] text-[#5c6884]">Watch this intro video to learn about our finder&apos;s fee</p>
          <button className="mt-4 rounded-full border border-[#54607b] bg-white px-4 py-1.5 text-[0.82rem] font-semibold text-[#2d3448]" type="button">
            Watch video
          </button>
        </article>
      </div>
    </div>
  );
}
