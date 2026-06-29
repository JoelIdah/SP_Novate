export type StepIconKind = "personal" | "identification" | "compensation" | "location" | "default";

function PersonalInfoIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" fill="#4a53c3" r="9" />
      <circle cx="10" cy="7.3" fill="#fff" r="2.2" />
      <path d="M5.9 14.3C5.9 12.4 7.7 11 10 11C12.3 11 14.1 12.4 14.1 14.3V14.8H5.9V14.3Z" fill="#fff" />
    </svg>
  );
}

function IdentificationIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" fill="#4a53c3" r="9" />
      <rect fill="#fff" height="8.6" rx="1.2" width="10.8" x="4.6" y="5.7" />
      <circle cx="7.8" cy="9.2" fill="#4a53c3" r="1.1" />
      <path d="M9.9 8.4H13.2M9.9 10.1H13.2M6.7 12.1H13.2" stroke="#4a53c3" strokeLinecap="round" strokeWidth="0.9" />
    </svg>
  );
}

function CompensationIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" fill="#4a53c3" r="9" />
      <rect fill="#fff" height="6.8" rx="1.5" width="10.8" x="4.6" y="6.6" />
      <circle cx="12.8" cy="10" fill="#4a53c3" r="1.1" />
      <path d="M6.3 8.2H8M6.3 11.8H8" stroke="#4a53c3" strokeLinecap="round" strokeWidth="0.9" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" fill="#4a53c3" r="9" />
      <path d="M10 5.9C8.3 5.9 7 7.2 7 8.9C7 11.2 10 13.9 10 13.9C10 13.9 13 11.2 13 8.9C13 7.2 11.7 5.9 10 5.9Z" fill="#fff" />
      <circle cx="10" cy="8.8" fill="#4a53c3" r="1.2" />
    </svg>
  );
}

export function getStepIconKindFromLabel(label: string): StepIconKind {
  const key = label.toLowerCase();
  if (key.includes("personal")) return "personal";
  if (key.includes("identification")) return "identification";
  if (key.includes("compensation")) return "compensation";
  if (key.includes("location")) return "location";
  return "default";
}

export function StepItemIcon({ kind }: { kind: StepIconKind }) {
  if (kind === "personal") return <PersonalInfoIcon />;
  if (kind === "identification") return <IdentificationIcon />;
  if (kind === "compensation") return <CompensationIcon />;
  if (kind === "location") return <LocationIcon />;

  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" fill="#4a53c3" r="9" />
      <path d="M8 10.2L9.4 11.6L12.5 8.5" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
}

