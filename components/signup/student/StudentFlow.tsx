"use client";

import { useState } from "react";

import { ProfileSetupStep } from "../ProfileSetupStep";
import { StudentOnboardingOverview } from "./StudentOnboardingOverview";

type StudentStage = "overview" | "setup";

export function StudentFlow({ onBackToAccount }: { onBackToAccount: () => void }) {
  const [stage, setStage] = useState<StudentStage>("overview");

  if (stage === "setup") {
    return <ProfileSetupStep onBack={() => setStage("overview")} role="student" />;
  }

  return <StudentOnboardingOverview onCancel={onBackToAccount} onContinue={() => setStage("setup")} />;
}
