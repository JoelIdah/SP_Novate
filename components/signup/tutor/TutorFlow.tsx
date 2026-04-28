"use client";

import { ProfileSetupStep } from "../ProfileSetupStep";
import type { SetupMode, SetupStepId, SignUpFlowStage } from "../types";
import { TutorOnboardingOverview } from "./TutorOnboardingOverview";

export function TutorFlow({
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
        role="tutor"
      />
    );
  }

  return <TutorOnboardingOverview onCancel={onBackToAccount} onContinue={() => onStageChange("setup")} />;
}
