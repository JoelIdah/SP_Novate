"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  HelpCircle,
  MapPin,
  PlayCircle,
  Star,
} from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import ResponsiveSheet from "../../../components/ui/ResponsiveSheet";

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

const bookingOptions = {
  department: ["Common entrance", "Academics", "IELTS", "WAEC", "JAMB"],
  subject: ["Mathematics", "English Language", "Physics", "Chemistry", "Biology"],
  weeks: ["1 week", "2 weeks", "3 weeks", "4 weeks", "6 weeks"],
  hoursPerDay: ["1 hour", "2 hours", "3 hours"],
  paymentOption: ["Full payment", "Part payment"],
  availability: ["Monday", "Wednesday", "Friday", "Saturday"],
};

type BookingForm = {
  department: string;
  subject: string;
  weeks: string;
  hoursPerDay: string;
  paymentOption: string;
  availability: string[];
};

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
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    department: "",
    subject: "",
    weeks: "",
    hoursPerDay: "",
    paymentOption: "",
    availability: [],
  });
  const openBookingPanel = () => {
    setBookingStep(1);
    setBookingForm({
      department: "",
      subject: "",
      weeks: "",
      hoursPerDay: "",
      paymentOption: "",
      availability: [],
    });
    setIsBookingOpen(true);
  };

  const closeBookingPanel = () => {
    setIsBookingOpen(false);
  };

  const isStepOneComplete =
    Boolean(bookingForm.department) &&
    Boolean(bookingForm.subject) &&
    Boolean(bookingForm.weeks) &&
    Boolean(bookingForm.hoursPerDay) &&
    Boolean(bookingForm.paymentOption);

  const isStepTwoComplete = isStepOneComplete && bookingForm.availability.length > 0;

  const updateField = (field: keyof BookingForm, value: string) => {
    setBookingForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAvailability = (day: string) => {
    setBookingForm((prev) => {
      const exists = prev.availability.includes(day);
      return {
        ...prev,
        availability: exists ? prev.availability.filter((item) => item !== day) : [...prev.availability, day],
      };
    });
  };

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

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_22rem]">
          <Card className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Avatar alt="Oluyinka Emmanuel" className="relative h-24 w-28 overflow-hidden rounded-xl" randomImage randomSeed="Oluyinka Emmanuel-profile">
                <div className="absolute bottom-1 left-1 inline-flex items-center gap-1 rounded-full bg-[#1b1848] px-2 py-0.5 text-[0.62rem] font-semibold text-white">
                  <Star className="h-3 w-3 text-[#f7c845]" fill="currentColor" strokeWidth={1} />
                  4.5
                </div>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[2.15rem] leading-none font-semibold text-[#30364a]">Oluyinka Emmanuel</h2>
                    <p className="mt-1 text-[1rem] text-[#6f7689]">Software engineer - B.sc, M.sc</p>
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
                  <span className="text-[#a2a9ba]">-</span>
                  <span className="font-semibold text-[#4d556b]">5km</span>
                  <span>from you</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
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
              <Button className="flex-1 py-2 text-[0.74rem] font-semibold" variant="secondary">
                Send message
              </Button>
              <Button className="flex-1 py-2 text-[0.74rem] font-semibold" onClick={openBookingPanel} variant="primary">
                Book a session
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[18rem_1fr]">
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
            <Card className="p-4">
              <h3 className="text-[0.82rem] font-semibold text-[#6f7891]">About tutor</h3>
              <p className="mt-2 text-[0.78rem] leading-5 text-[#5f667b]">
                I am a dedicated and results-driven educator with a passion for helping students achieve their academic goals.
                With a strong focus on clear communication and practical learning methods, I create engaging and supportive
                learning environments that encourage growth and confidence. I aim to simplify complex concepts, strengthen
                foundational knowledge, and guide students toward measurable progress in their studies.
              </p>
            </Card>

            <article>
              <h3 className="mb-2 text-[0.82rem] font-semibold text-[#6f7891]">Teaching category</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Card className="p-3">
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
                </Card>
                <Card className="p-3">
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
                </Card>
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
                  <Card key={index} className="min-h-[230px] p-4">
                    <p className="text-[0.74rem] leading-5 text-[#5d667c]">"{item}"</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-[#c8ccd6]" />
                      <div>
                        <p className="text-[0.74rem] font-semibold text-[#4f566b]">Obinnia Abajue</p>
                        <p className="text-[0.62rem] text-[#939bae]">Hygeia HMO</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <ResponsiveSheet open={isBookingOpen} onClose={closeBookingPanel}>
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#d8dde8] xl:hidden" />
            <h2 className="text-[1.65rem] font-semibold leading-none text-[#2f3547] xl:text-[2.05rem]">Book a session</h2>
            <p className="mt-2 text-[0.71rem] text-[#8b93a8]">
              A finder&apos;s fee is applied to each booking to help match you with the right tutor and support the platform.
            </p>

            <div className="mt-5 space-y-4 overflow-y-auto pb-3">
              {bookingStep === 1 ? (
                <>
                  <BookingField
                    hint="Select the department you'd like to learn from the tutor"
                    label="Department"
                    onChange={(value) => updateField("department", value)}
                    options={bookingOptions.department}
                    placeholder="Select department"
                    value={bookingForm.department}
                  />
                  <BookingField
                    hint="Select the subject you'd like to learn from the tutor"
                    label="Subject"
                    onChange={(value) => updateField("subject", value)}
                    options={bookingOptions.subject}
                    placeholder="Select subject"
                    value={bookingForm.subject}
                  />
                  <BookingField
                    label="Number of weeks"
                    onChange={(value) => updateField("weeks", value)}
                    options={bookingOptions.weeks}
                    placeholder="Select number of weeks"
                    value={bookingForm.weeks}
                  />
                  <BookingField
                    hint="Please specify your preferred hours for each available day. You will be charged on a pay-as-you-go basis for the hours you book."
                    label="Hours per day"
                    onChange={(value) => updateField("hoursPerDay", value)}
                    options={bookingOptions.hoursPerDay}
                    placeholder="Select hours per day"
                    value={bookingForm.hoursPerDay}
                  />
                  <BookingField
                    hint="Choose how you want to pay for your tutoring sessions"
                    label="Payment option"
                    onChange={(value) => updateField("paymentOption", value)}
                    options={bookingOptions.paymentOption}
                    placeholder="Pick recipient(s)"
                    value={bookingForm.paymentOption}
                  />
                </>
              ) : null}

              {bookingStep === 2 ? (
                <div>
                  <p className="mb-2 text-[0.78rem] font-semibold text-[#3f4760]">Availability</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingOptions.availability.map((day) => {
                      const selected = bookingForm.availability.includes(day);
                      return (
                        <button
                          key={day}
                          className={`rounded-lg border px-3 py-1.5 text-[0.76rem] font-medium ${
                            selected
                              ? "border-[#4b4ad7] bg-[#eff0ff] text-[#2b2d9b]"
                              : "border-[#d7dce8] bg-white text-[#687085]"
                          }`}
                          onClick={() => toggleAvailability(day)}
                          type="button"
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {bookingStep >= 2 ? (
                <article className="rounded-xl border border-[#e5e9f2] bg-[#f8f9fc] p-3">
                  <h3 className="text-[0.85rem] font-semibold text-[#3b4358]">Cost estimate</h3>
                  <div className="mt-2 space-y-1.5 text-[0.76rem] text-[#6b7389]">
                    <div className="flex items-center justify-between"><span>Tutor&apos;s fee</span><span>N3,500</span></div>
                    <div className="flex items-center justify-between"><span>Finder&apos;s fee</span><span>N500</span></div>
                    <div className="flex items-center justify-between"><span>VAT (7.5%)</span><span>N37.50</span></div>
                    <div className="mt-2 border-t border-[#e0e5f0] pt-2 text-[0.8rem] font-semibold text-[#2f3547]">
                      <div className="flex items-center justify-between"><span>Total</span><span>N4,037.50</span></div>
                    </div>
                  </div>
                </article>
              ) : null}

              {bookingStep === 3 ? (
                <article className="rounded-xl border border-[#e5e9f2] bg-white p-3">
                  <h3 className="text-[0.85rem] font-semibold text-[#3b4358]">Booking summary</h3>
                  <div className="mt-2 space-y-1.5 text-[0.76rem] text-[#5f667b]">
                    <div className="flex items-center justify-between"><span>Department type</span><span>{bookingForm.department}</span></div>
                    <div className="flex items-center justify-between"><span>Subject</span><span>{bookingForm.subject}</span></div>
                    <div className="flex items-center justify-between"><span>Period</span><span>Evening</span></div>
                    <div className="flex items-center justify-between"><span>Number of weeks</span><span>{bookingForm.weeks}</span></div>
                    <div className="flex items-center justify-between"><span>Hours per day</span><span>{bookingForm.hoursPerDay}</span></div>
                    <div className="flex items-center justify-between"><span>Payment option</span><span>{bookingForm.paymentOption}</span></div>
                    <div className="flex items-center justify-between"><span>Availability</span><span>{bookingForm.availability.join(", ") || "-"}</span></div>
                    <div className="flex items-center justify-between"><span>Tutor&apos;s fee</span><span>N3,500</span></div>
                  </div>
                </article>
              ) : null}
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-[#eef1f6] bg-white py-3 xl:border-t-0 xl:py-4">
              <button
                className="h-11 flex-1 rounded-full bg-[#ececef] text-[0.82rem] font-semibold text-[#4e576d]"
                onClick={closeBookingPanel}
                type="button"
              >
                Cancel
              </button>
              {bookingStep < 3 ? (
                <button
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#232066] text-[0.82rem] font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#a6a9c9]"
                  disabled={bookingStep === 1 ? !isStepOneComplete : !isStepTwoComplete}
                  onClick={() => setBookingStep((prev) => Math.min(prev + 1, 3))}
                  type="button"
                >
                  Continue
                </button>
              ) : (
                <button
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#232066] text-[0.82rem] font-semibold text-white"
                  onClick={closeBookingPanel}
                  type="button"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  Submit booking request
                </button>
              )}
            </div>
      </ResponsiveSheet>
    </main>
  );
}

function BookingField({
  label,
  placeholder,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  hint?: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.82rem] font-semibold text-[#3f4760]">{label}</span>
      <div className="relative">
        <select
          className="h-10 w-full appearance-none rounded-[10px] border border-[#d7dce8] bg-white px-3 pr-9 text-[0.84rem] text-[#55607a] outline-none focus:border-[#5f64d8]"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a3abba]" />
      </div>
      {hint ? <span className="mt-1 block text-[0.67rem] text-[#8b93a8]">{hint}</span> : null}
    </label>
  );
}

