import { Suspense } from "react";
import { LoginPageContent } from "../../components/login/LoginPageContent";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
