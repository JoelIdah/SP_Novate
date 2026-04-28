"use client";

import { useState } from "react";

import { ProfileSetupStep } from "../ProfileSetupStep";
import { TutorOnboardingOverview } from "./TutorOnboardingOverview";

type TutorStage = "overview" | "setup";

export function TutorFlow({ onBackToAccount }: { onBackToAccount: () => void }) {
  const [stage, setStage] = useState<TutorStage>("overview");

  if (stage === "setup") {
    return <ProfileSetupStep onBack={() => setStage("overview")} role="tutor" />;
  }

  return <TutorOnboardingOverview onCancel={onBackToAccount} onContinue={() => setStage("setup")} />;
}
