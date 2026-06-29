"use client";

import { ProfileSetupStep } from "../ProfileSetupStep";
import type { SetupMode, SetupStepId, SignUpFlowStage } from "../types";
import { TutorOnboardingOverview } from "./TutorOnboardingOverview";

export function TutorFlow({
  accountProfile,
  onBackToAccount,
  onSetupStateChange,
  onStageChange,
  setupMode,
  setupStepId,
  stage,
}: {
  accountProfile?: { email?: string; firstName?: string; lastName?: string };
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
        initialProfile={accountProfile}
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

