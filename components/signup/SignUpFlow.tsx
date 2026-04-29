"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AccountStep } from "./AccountStep";
import { AuthCardHeader } from "./AuthCardHeader";
import { AuthShell } from "./AuthShell";
import { OtpStep } from "./OtpStep";
import { RoleStep } from "./RoleStep";
import { StudentFlow } from "./student/StudentFlow";
import { TutorFlow } from "./tutor/TutorFlow";
import type { SetupMode, SetupStepId, SignUpFlowStage, SignUpRole, SignUpView } from "./types";

type SignUpUrlState = {
  mode: SetupMode;
  role: SignUpRole | null;
  stage: SignUpFlowStage;
  step: SetupStepId;
  view: SignUpView;
};

type AccountProfile = { email?: string; firstName?: string; lastName?: string };

function parseRole(value: string | null): SignUpRole | null {
  return value === "student" || value === "tutor" ? value : null;
}

function parseView(value: string | null): SignUpView {
  return value === "role" || value === "account" || value === "otp" || value === "flow" ? value : "role";
}

function parseStage(value: string | null): SignUpFlowStage {
  return value === "setup" ? "setup" : "overview";
}

function parseStep(value: string | null): SetupStepId {
  return value === "identification" || value === "compensation" || value === "location" ? value : "personal";
}

function parseMode(value: string | null): SetupMode {
  return value === "review" || value === "success" ? value : "form";
}

function normalizeStepForRole(step: SetupStepId, role: SignUpRole | null): SetupStepId {
  if (role !== "tutor" && (step === "identification" || step === "compensation")) {
    return "personal";
  }
  return step;
}

function readUrlState(searchParams: URLSearchParams): SignUpUrlState {
  const role = parseRole(searchParams.get("role"));
  let view = parseView(searchParams.get("view"));

  if (!role && view !== "role") {
    view = "role";
  }

  let stage = parseStage(searchParams.get("stage"));
  if (view !== "flow") {
    stage = "overview";
  }

  const step = normalizeStepForRole(parseStep(searchParams.get("step")), role);
  const mode = parseMode(searchParams.get("mode"));

  return {
    mode: stage === "setup" ? mode : "form",
    role,
    stage,
    step: stage === "setup" ? step : "personal",
    view,
  };
}

export function SignUpFlow() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlState = useMemo(() => readUrlState(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [accountProfile, setAccountProfile] = useState<AccountProfile>({});

  const writeUrlState = (nextState: Partial<SignUpUrlState>) => {
    const role = nextState.role !== undefined ? nextState.role : urlState.role;
    const view = nextState.view ?? urlState.view;
    const stage = nextState.stage ?? urlState.stage;
    const step = normalizeStepForRole(nextState.step ?? urlState.step, role);
    const mode = nextState.mode ?? urlState.mode;

    const params = new URLSearchParams(searchParams.toString());

    params.set("view", view);

    if (role) {
      params.set("role", role);
    } else {
      params.delete("role");
    }

    if (view === "flow") {
      params.set("stage", stage);
      if (stage === "setup") {
        params.set("step", step);
        params.set("mode", mode);
      } else {
        params.delete("step");
        params.delete("mode");
      }
    } else {
      params.delete("stage");
      params.delete("step");
      params.delete("mode");
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  if (urlState.view === "flow" && urlState.role === "student") {
    return (
      <StudentFlow
        accountProfile={accountProfile}
        onBackToAccount={() => {
          writeUrlState({ mode: "form", stage: "overview", step: "personal", view: "account" });
        }}
        onSetupStateChange={({ mode, stepId }) => {
          writeUrlState({ mode, stage: "setup", step: stepId, view: "flow" });
        }}
        onStageChange={(stage) => {
          writeUrlState({ mode: "form", stage, view: "flow" });
        }}
        setupMode={urlState.mode}
        setupStepId={urlState.step}
        stage={urlState.stage}
      />
    );
  }

  if (urlState.view === "flow" && urlState.role === "tutor") {
    return (
      <TutorFlow
        accountProfile={accountProfile}
        onBackToAccount={() => {
          writeUrlState({ mode: "form", stage: "overview", step: "personal", view: "account" });
        }}
        onSetupStateChange={({ mode, stepId }) => {
          writeUrlState({ mode, stage: "setup", step: stepId, view: "flow" });
        }}
        onStageChange={(stage) => {
          writeUrlState({ mode: "form", stage, view: "flow" });
        }}
        setupMode={urlState.mode}
        setupStepId={urlState.step}
        stage={urlState.stage}
      />
    );
  }

  return (
    <AuthShell>
      <div className="auth-card relative rounded-[1.1rem] border border-[#d9dde8] bg-white/95 px-5 pb-6 pt-11 shadow-[0_9px_26px_rgba(23,30,63,0.09)] sm:px-7 sm:pb-7 sm:pt-12">
        {urlState.view !== "otp" ? <AuthCardHeader /> : null}
        {urlState.view === "role" ? (
          <RoleStep
            onSelect={(role) => {
              writeUrlState({ mode: "form", role, stage: "overview", step: "personal", view: "account" });
            }}
          />
        ) : urlState.view === "account" ? (
          <AccountStep
            onContinue={(payload) => {
              setAccountProfile(payload);
              writeUrlState({ mode: "form", stage: "overview", step: "personal", view: "otp" });
            }}
          />
        ) : (
          <OtpStep
            email={accountProfile.email ?? ""}
            onVerified={(payload) => {
              setAccountProfile((prev) => ({
                email: payload.email || prev.email,
                firstName: payload.firstName || prev.firstName,
                lastName: payload.lastName || prev.lastName,
              }));

              if (payload.role === "student" || payload.role === "tutor") {
                writeUrlState({ role: payload.role });
              }

              writeUrlState({ mode: "form", stage: "overview", step: "personal", view: "flow" });
            }}
          />
        )}
      </div>
    </AuthShell>
  );
}
