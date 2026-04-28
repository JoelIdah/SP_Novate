"use client";

import { useState } from "react";

import { AccountStep } from "./AccountStep";
import { AuthCardHeader } from "./AuthCardHeader";
import { AuthShell } from "./AuthShell";
import { RoleStep } from "./RoleStep";
import { StudentFlow } from "./student/StudentFlow";
import { TutorFlow } from "./tutor/TutorFlow";
import type { SignUpRole, SignUpView } from "./types";

export function SignUpFlow() {
  const [selectedRole, setSelectedRole] = useState<SignUpRole | null>(null);
  const [view, setView] = useState<SignUpView>("role");

  if (view === "flow" && selectedRole === "student") {
    return <StudentFlow onBackToAccount={() => setView("account")} />;
  }

  if (view === "flow" && selectedRole === "tutor") {
    return <TutorFlow onBackToAccount={() => setView("account")} />;
  }

  return (
    <AuthShell>
      <div className="relative rounded-[1.1rem] border border-[#d9dde8] bg-white/95 px-5 pb-7 pt-12 shadow-[0_9px_26px_rgba(23,30,63,0.09)] sm:px-8 sm:pb-8 sm:pt-13">
        <AuthCardHeader />
        {view === "role" ? (
          <RoleStep
            onSelect={(role) => {
              setSelectedRole(role);
              setView("account");
            }}
          />
        ) : (
          <AccountStep onContinue={() => setView("flow")} />
        )}
      </div>
    </AuthShell>
  );
}
