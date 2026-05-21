import { Suspense } from "react";
import { SignUpFlow } from "../../components/signup/SignUpFlow";

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpFlow />
    </Suspense>
  );
}

