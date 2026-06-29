import { OnboardingChecklistStep } from "../shared/OnboardingChecklistStep";

export function StudentOnboardingOverview({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) {
  return (
    <OnboardingChecklistStep
      items={["Personal information", "Location access"]}
      onCancel={onCancel}
      onContinue={onContinue}
      stepLabel="Step 1/2"
      subtitle="Complete your profile to start finding and booking tutors near you."
    />
  );
}

