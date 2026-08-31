"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AccountStep } from "./AccountStep";
import { AuthCardHeader } from "./AuthCardHeader";
import { AuthCard } from "./AuthPrimitives";
import { AuthShell } from "./AuthShell";
import { OtpStep } from "./OtpStep";
import { clearProfileSetupToken, getAccessToken, getProfileSetupToken, subscribeAuthSession } from "../auth/authSession";
import { areProfileDetailsSubmitted, clearProfileSetupSession, isProfileSetupActive, subscribeProfileSetupSession, useProfileSetupUser } from "./profileSetupSession";
import { StudentFlow } from "./student/StudentFlow";
import type { SetupMode, SetupStepId, SignUpFlowStage, SignUpView } from "./types";
import { submitSsoReturn } from "../auth/ssoReturn";

type SignUpUrlState = {
  mode: SetupMode;
  stage: SignUpFlowStage;
  step: SetupStepId;
  view: SignUpView;
};

type AccountProfile = { email?: string; firstName?: string; lastName?: string };

function parseView(value: string | null): SignUpView {
  return value === "account" || value === "otp" || value === "flow" ? value : "account";
}

function parseStage(value: string | null): SignUpFlowStage {
  return value === "setup" ? "setup" : "overview";
}

function parseStep(value: string | null): SetupStepId {
  return value === "location" ? value : "personal";
}

function parseMode(value: string | null): SetupMode {
  return value === "review" || value === "success" ? value : "form";
}

function normalizeStep(step: SetupStepId): SetupStepId {
  return step;
}

function readUrlState(searchParams: URLSearchParams): SignUpUrlState {
  const view = parseView(searchParams.get("view"));

  let stage = parseStage(searchParams.get("stage"));
  if (view !== "flow") {
    stage = "overview";
  }

  const step = normalizeStep(parseStep(searchParams.get("step")));
  const mode = parseMode(searchParams.get("mode"));

  return {
    mode: stage === "setup" ? mode : "form",
    stage,
    step: stage === "setup" ? step : "personal",
    view,
  };
}

function useProfileSetupActive(): boolean {
  return useSyncExternalStore(
    subscribeProfileSetupSession,
    isProfileSetupActive,
    () => false,
  );
}

function useProfileSetupRouteReady(forceProfileSetup: boolean): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const unsubscribeAuth = subscribeAuthSession(onStoreChange);
      const unsubscribeProfile = subscribeProfileSetupSession(onStoreChange);
      return () => {
        unsubscribeAuth();
        unsubscribeProfile();
      };
    },
    () =>
      !forceProfileSetup ||
      Boolean(getProfileSetupToken()) ||
      (Boolean(getAccessToken()) && areProfileDetailsSubmitted()),
    () => !forceProfileSetup,
  );
}

export function SignUpFlow({ forceProfileSetup = false }: { forceProfileSetup?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlState = useMemo(() => readUrlState(new URLSearchParams(searchParams.toString())), [searchParams]);
  const profileSetupActive = useProfileSetupActive();
  const profileSetupUser = useProfileSetupUser();
  const [accountProfile, setAccountProfile] = useState<AccountProfile>({});
  const profileSetupRouteReady = useProfileSetupRouteReady(forceProfileSetup);
  const setupProfile = {
    email: accountProfile.email ?? profileSetupUser.email,
    firstName: accountProfile.firstName ?? profileSetupUser.firstName,
    lastName: accountProfile.lastName ?? profileSetupUser.lastName,
  };

  useEffect(() => {
    if (!forceProfileSetup) return;

    if (getProfileSetupToken()) return;

    if (getAccessToken()) {
      if (!areProfileDetailsSubmitted()) {
        router.replace("/students/dashboard");
      }
      return;
    }

    router.replace("/login");
  }, [forceProfileSetup, router]);

  const redirectToReturnTarget = (token: string) => {
    return submitSsoReturn({ searchParams, token }).status === "submitted";
  };

  const redirectToLoginAfterVerification = (email: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("email", email.trim());
    params.set("notice", "email_verified");
    params.delete("view");
    params.delete("stage");
    params.delete("step");
    params.delete("mode");
    params.delete("role");
    router.push(`/login?${params.toString()}`);
  };

  const writeUrlState = (nextState: Partial<SignUpUrlState>) => {
    const view = nextState.view ?? urlState.view;
    const stage = nextState.stage ?? urlState.stage;
    const step = normalizeStep(nextState.step ?? urlState.step);
    const mode = nextState.mode ?? urlState.mode;

    const params = new URLSearchParams(searchParams.toString());

    params.set("view", view);
    params.delete("role");

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

  const showProfileSetup = forceProfileSetup || profileSetupActive || urlState.view === "flow";

  if (forceProfileSetup && !profileSetupRouteReady) return null;

  if (showProfileSetup) {
    return (
      <StudentFlow
        accountProfile={setupProfile}
        onBackToAccount={() => {
          writeUrlState({ mode: "form", stage: "overview", step: "personal", view: "account" });
        }}
        onSetupStateChange={({ mode, stepId }) => {
          if (!forceProfileSetup && !profileSetupActive) {
            writeUrlState({ mode, stage: "setup", step: stepId, view: "flow" });
          }
        }}
        onStageChange={(stage) => {
          if ((forceProfileSetup || profileSetupActive) && stage === "overview") {
            clearProfileSetupToken();
            clearProfileSetupSession();
            router.push("/login");
            return;
          }
          if (!forceProfileSetup && !profileSetupActive) {
            writeUrlState({ mode: "form", stage, view: "flow" });
          }
        }}
        setupMode={urlState.mode}
        setupStepId={urlState.step}
        stage={forceProfileSetup || profileSetupActive ? "setup" : urlState.stage}
      />
    );
  }

  return (
    <AuthShell>
      <AuthCard className="rounded-[2em]" tone="gradient">
        {urlState.view !== "otp" ? <AuthCardHeader /> : null}
        {urlState.view === "account" ? (
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

              if (
                payload.token &&
                redirectToReturnTarget(payload.token)
              ) {
                return;
              }

              redirectToLoginAfterVerification(payload.email);
            }}
          />
        )}
      </AuthCard>
    </AuthShell>
  );
}



