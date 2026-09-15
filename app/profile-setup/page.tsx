import { Suspense } from "react";
import { SignUpFlow } from "../../components/signup/SignUpFlow";

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={null}>
      <SignUpFlow forceProfileSetup />
    </Suspense>
  );
}
