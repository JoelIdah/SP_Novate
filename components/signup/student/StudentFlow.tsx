"use client";

import { ProfileSetupStep } from "../ProfileSetupStep";
import type { SetupMode, SetupStepId, SignUpFlowStage } from "../types";
import { StudentOnboardingOverview } from "./StudentOnboardingOverview";

export function StudentFlow({
  onBackToAccount,
  onSetupStateChange,
  onStageChange,
  setupMode,
  setupStepId,
  stage,
}: {
  onBackToAccount: () => void;
  onSetupStateChange: (state: { mode: SetupMode; stepId: SetupStepId }) => void;
  onStageChange: (stage: SignUpFlowStage) => void;
  setupMode: SetupMode;
  setupStepId: SetupStepId;
  stage: SignUpFlowStage;
}) {
  if (stage === "setup") {
    return (
      <ProfileSetupStep
        initialMode={setupMode}
        initialStepId={setupStepId}
        onBack={() => onStageChange("overview")}
        onStateChange={onSetupStateChange}
        role="student"
      />
    );
  }

  return <StudentOnboardingOverview onCancel={onBackToAccount} onContinue={() => onStageChange("setup")} />;
}
