import { OnboardingChecklistStep } from "../shared/OnboardingChecklistStep";

export function StudentOnboardingOverview({ onCancel, onContinue, profile }: { onCancel: () => void; onContinue: () => void; profile?: { email?: string; firstName?: string } }) {
  return (
    <OnboardingChecklistStep
      items={["Personal information", "Location access"]}
      onCancel={onCancel}
      onContinue={onContinue}
      profile={profile}
      subtitle="Complete your profile to start finding and booking tutors near you."
    />
  );
}

