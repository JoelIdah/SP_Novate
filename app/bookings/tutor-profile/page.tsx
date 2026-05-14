import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  HelpCircle,
  MapPin,
  PlayCircle,
  Star,
} from "lucide-react";

const guidelineItems = [
  "Communication outside the platform is at your own risk.",
  "The platform is not liable for any external arrangements.",
  "Please arrive 5 minutes before the scheduled time.",
  "Payment is required upfront to confirm the lesson. Tutors receive payment only after the session is completed satisfactorily.",
  "A 24-hour cancellation notice is required.",
];

const resources = [
  "Watch this intro video to learn how to set up and manage your payment providers.",
  "Watch this intro video to learn how to set up and manage your payment providers.",
  "Watch this intro video to learn how to set up and manage your payment providers.",
];

const testimonials = [
  "Oluyinka is an excellent tutor who explains difficult concepts in a very simple way. His teaching style is calm and structured, which helped me improve my understanding quickly.",
  "I prepared for my entrance exams with Oluyinka and the improvement in my confidence was amazing. He is patient, knowledgeable, and always willing to go the extra mile.",
  "The IELTS sessions were very helpful. Oluyinka gave practical tips and practice exercises that improved my score significantly. I highly recommend him.",
];

function WatchButton() {
  return (
    <button
      className="inline-flex items-center gap-1 rounded-full border border-[#9096a4] bg-white px-3 py-1.5 text-[0.72rem] font-medium text-[#555f72]"
      type="button"
    >
      <PlayCircle className="h-3.5 w-3.5" />
      Watch video
    </button>
  );
}

export default function TutorProfilePage() {
  return (
    <main className="min-h-dvh bg-white text-[#2f3547]">
      <header className="border-b border-[#e6e9f2] bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <Link
            className="inline-flex items-center gap-2 text-[0.75rem] font-medium text-[#6f7891]"
            href="/bookings"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#efeffa]">
              <ChevronLeft className="h-3.5 w-3.5 text-[#6d6bd6]" />
            </span>
            Bookings
          </Link>

          <button
            className="inline-flex items-center gap-1 rounded-full border border-[#e2e6ef] bg-[#f7f8fb] px-3 py-1.5 text-[0.76rem] font-semibold text-[#4f566c]"
            type="button"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            Need help
          </button>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1260px] px-5 py-3">
        <h1 className="text-[1.12rem] font-semibold text-[#2f3547]">Tutor Profile</h1>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_22rem]">
          <article className="rounded-xl border border-[#e3e7ef] bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative h-24 w-28 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#b78d65_0%,#d7b58f_100%)]">
                <div className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white">
                  <Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                  4.5
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[2.15rem] leading-none font-semibold text-[#30364a]">Oluyinka Emmanuel</h2>
                    <p className="mt-1 text-[1rem] text-[#6f7689]">Software engineer • B.sc, M.sc</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f8f0] px-2.5 py-1 text-[0.72rem] font-semibold text-[#27a56c]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Online
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["Mathematics", "Physics", "Further mathematics"].map((tag) => (
                    <span key={tag} className="rounded-md bg-[#ecf0f5] px-2 py-0.5 text-[0.68rem] font-medium text-[#5e677b]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.78rem] text-[#6c7488]">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#6366d7]" />
                    Oniru, Victoria Island
                  </span>
                  <span className="text-[#a2a9ba]">•</span>
                  <span className="font-semibold text-[#4d556b]">5km</span>
                  <span>from you</span>
                </div>
              </div>
            </div>
          </article>

          <aside className="rounded-xl border border-[#e3e7ef] bg-white p-4">
            <div className="mb-3 grid grid-cols-2 border-b border-[#eceff5] text-[0.98rem] font-semibold">
              <button className="border-b-2 border-[#4a49d7] px-3 py-2 text-left text-[#4a49d7]" type="button">
                Common Entrance
              </button>
              <button className="px-3 py-2 text-left text-[#7a8298]" type="button">
                IELTS
              </button>
            </div>
            <p className="text-[0.72rem] text-[#8e96aa]">Tutor fee:</p>
            <p className="text-[2.35rem] font-semibold leading-none text-[#3d3fd0]">N3,500/hr</p>
            <p className="mt-2 inline-flex items-center gap-1 text-[0.72rem] text-[#7f879a]">
              <CalendarDays className="h-3.5 w-3.5 text-[#5b60d7]" />
              Mondays Wednesdays Fridays
            </p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-full border border-[#e1e5ee] bg-[#f4f5f7] py-2 text-[0.74rem] font-semibold text-[#4f566b]" type="button">
                Send message
              </button>
              <button className="flex-1 rounded-full border border-[#2f2b88] bg-[#2b276f] py-2 text-[0.74rem] font-semibold text-white" type="button">
                ✓ Book a session
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[18rem_1fr]">
          <article className="rounded-xl border border-[#e3e7ef] bg-[#f4f5f7] p-4">
            <h3 className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#7a8298]">
              <AlertCircle className="h-3.5 w-3.5 text-[#6366d7]" />
              Important Guidelines
            </h3>
            <ul className="mt-3 space-y-2 text-[0.75rem] text-[#636b7f]">
              {guidelineItems.map((item) => (
                <li key={item} className="inline-flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#6d7488]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <div className="space-y-3">
            <article className="rounded-xl border border-[#e3e7ef] bg-white p-4">
              <h3 className="text-[0.82rem] font-semibold text-[#6f7891]">About tutor</h3>
              <p className="mt-2 text-[0.78rem] leading-5 text-[#5f667b]">
                I am a dedicated and results-driven educator with a passion for helping students achieve their academic goals.
                With a strong focus on clear communication and practical learning methods, I create engaging and supportive
                learning environments that encourage growth and confidence. I aim to simplify complex concepts, strengthen
                foundational knowledge, and guide students toward measurable progress in their studies.
              </p>
            </article>

            <article>
              <h3 className="mb-2 text-[0.82rem] font-semibold text-[#6f7891]">Teaching category</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#e3e7ef] bg-white p-3">
                  <p className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#4f566b]">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                    Common entrance
                  </p>
                  <div className="mt-2 border-t border-[#eceff5]" />
                  <p className="mt-2 inline-flex items-center gap-1 text-[0.72rem] text-[#838ba0]">
                    <Clock3 className="h-3.5 w-3.5 text-[#5b60d7]" />
                    Mondays Wednesdays Fridays
                  </p>
                  <p className="mt-1 text-[0.72rem] text-[#8e96aa]">Tutor fee:</p>
                  <p className="text-[2.05rem] font-semibold leading-none text-[#3d3fd0]">N3,500/hr</p>
                </div>
                <div className="rounded-xl border border-[#e3e7ef] bg-white p-3">
                  <p className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[#4f566b]">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                    Ielts General
                  </p>
                  <div className="mt-2 border-t border-[#eceff5]" />
                  <p className="mt-2 inline-flex items-center gap-1 text-[0.72rem] text-[#838ba0]">
                    <Clock3 className="h-3.5 w-3.5 text-[#5b60d7]" />
                    Mondays Wednesdays Fridays
                  </p>
                  <p className="mt-1 text-[0.72rem] text-[#8e96aa]">Tutor fee:</p>
                  <p className="text-[2.05rem] font-semibold leading-none text-[#3d3fd0]">N4,000/hr</p>
                </div>
              </div>
            </article>

            <article>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[0.82rem] font-semibold text-[#6f7891]">Resources</h3>
                <button className="inline-flex items-center gap-1 text-[0.74rem] font-semibold text-[#4f46e5]" type="button">
                  View all resources
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {resources.map((item, index) => (
                  <div key={index} className="min-h-[188px] rounded-xl border border-[#e3e7ef] bg-[#eef1f6] p-4">
                    <h4 className="text-[0.9rem] font-semibold text-[#454d62]">Watch our Demo Video</h4>
                    <p className="mt-2 text-[0.74rem] text-[#656d82]">{item}</p>
                    <div className="mt-4">
                      <WatchButton />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article>
              <h3 className="mb-2 text-[0.82rem] font-semibold text-[#6f7891]">Testimonials</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {testimonials.map((item, index) => (
                  <div key={index} className="min-h-[230px] rounded-xl border border-[#e3e7ef] bg-white p-4">
                    <p className="text-[0.74rem] leading-5 text-[#5d667c]">“{item}”</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-[#c8ccd6]" />
                      <div>
                        <p className="text-[0.74rem] font-semibold text-[#4f566b]">Obinnia Abajue</p>
                        <p className="text-[0.62rem] text-[#939bae]">Hygeia HMO</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
