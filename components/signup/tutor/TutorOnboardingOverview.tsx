import { OnboardingChecklistStep } from "../shared/OnboardingChecklistStep";

export function TutorOnboardingOverview({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  return (
    <OnboardingChecklistStep
      items={["Personal information", "Identification verification", "Compensation details", "Location access"]}
      onCancel={onCancel}
      onContinue={onContinue}
      stepLabel="Step 1/3"
      subtitle="Complete your verification to start receiving bookings and payments."
    />
  );
}
